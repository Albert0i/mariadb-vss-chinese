import 'dotenv/config'
import express from 'express';
import { findSimilarDocuments, addDocument } from '../embedder.js';

const router = express.Router();

// Prisma 
import { PrismaClient } from '../generated/prisma/index.js'; 
const prisma = new PrismaClient();

// POST /api/v1/search
router.post('/search', async (req, res) => {
  const { query } = req.body;
  const results = await findSimilarDocuments(query, process.env.MAX_FIND)  

  res.status(200).json(results)
});

// POST /api/v1/add
router.post('/add', async (req, res) => {
  const { textChi } = req.body;

  if (!textChi || textChi.trim() === '') {
    return res.json({ success: false, message: '❌ 請輸入有效內容。' });
  }

  const created = await addDocument(textChi)
  switch (created) {
    case 1: 
        res.status(201).json({ success: true, message:'✅ 新增成功' });
        break;        
    case 2:
        res.status(200).json({ success: true, message:'❌ 重複內容' });
        break;
    default: 
        res.status(500).json({ success: true, message:'❌ 伺服器錯誤' });
  }  
});

// GET /api/v1/stats
router.get('/stats', async (req, res) => {
  const [{ version }] = await prisma.$queryRaw`SELECT VERSION() AS version`;
  const model = process.env.MODEL_NAME
  const documents = await prisma.documents.count()
  const [{ _, size }] = await await prisma.$queryRaw`
                            SELECT table_name AS 'table',
                                    ROUND((data_length + index_length) / 1024 / 1024, 2) AS 'size'
                            FROM information_schema.tables
                            WHERE table_schema = 'vss' AND table_name = 'documents';
                            `;
  const visited = await prisma.documents.count({ 
    where: {
      visited: { gt: 0 }
    }
  })
  /*
     SELECT id, textChi, visited 
     FROM documents 
     WHERE visited > 0 
     ORDER BY visited DESC, updatedAt DESC
     LIMIT 100 OFFSET 0;
  */  
  const results = await prisma.documents.findMany({
    select: {
      id: true,
      textChi: true,
      visited: true,
    },
    where: {
      visited: { gt: 0 }
    },
    orderBy: [
      { visited: 'desc' },
      { updatedAt: 'desc' }
    ],
    skip: 0, 
    take: parseInt(process.env.MAX_RETURN, 10)
  })
  res.status(200).json({ 
    version,
    model, 
    documents,
    size, 
    visited, 
    results
  });
});

// GET /api/v1/details?id=xxx
router.get('/details', async (req, res) => {
  const id = parseInt(req.query.id, 10);
  /*
     SELECT id, textChi, visited, createdAT, updatedAt, updateIdent 
     FROM documents 
     WHERE id=xxx
  */
  const doc = await prisma.documents.findUnique({ 
    select: {
      id: true,
      textChi: true,
      visited: true,
      createdAt: true,
      updatedAt: true,
      updateIdent: true
    },
    where: { id }
  })
  res.status(200).json(doc);
});

/*
   Fulltext Search Support
*/
// POST /api/v1/ftsearch
router.post('/ftsearch', async (req, res) => {
  const { query, mode, expand } = req.body;
  const results = await findDocuments(query, mode, expand, process.env.MAX_FIND)
  
  res.status(200).json(results)
});

// GET /api/v1/ftcheck
router.get('/ftcheck', async (req, res) => {  
  const { query, mode, expand } = req.query
  const count = await countDocuments(query, mode, expand)

  res.status(200).json({ success: true, count })
});

/*
    AI: 
    Why use $queryRawUnsafe?
    Because WITH QUERY EXPANSION isn't compatible with Prisma’s standard query builder, 
    and you're injecting raw SQL features. Be sure to properly sanitize any dynamic input 
    if you interpolate it—although using placeholders like ? here is already good practice.
*/
async function findDocuments(query, mode, expand, limit = 5) {
    // Find documents 
    const sqlStmt = ` SELECT textChi,
                             MATCH(textChiSeg) AGAINST (? 
                                   ${ mode==='boolean' ? 'IN BOOLEAN MODE': '' }
                                   ${ expand==='on' ? 'WITH QUERY EXPANSION': '' } ) AS distance,
                             id
                      FROM documents
                      HAVING distance > 0
                      ORDER BY distance DESC
                      LIMIT ${limit} OFFSET 0
                    `
    const docs = await prisma.$queryRawUnsafe(`${sqlStmt}`, query);

    // Update `visited` field 
    const promises = [];    // Collect promises 
    docs.forEach(doc => { 
            promises.push(prisma.$executeRaw`
                            UPDATE documents 
                            SET visited = visited + 1, 
                                updatedAt = Now(), 
                                updateIdent = updateIdent + 1
                            WHERE id=${doc.id}
                          `
              )
        })
    await Promise.all(promises); // Resolve all at once

    return docs 
}

async function countDocuments(query, mode, expand) {
  // Count documents 
  const sqlStmt = ` SELECT count(*) AS count
                    FROM documents
                    WHERE MATCH(textChiSeg) AGAINST (? 
                                 ${ mode==='boolean' ? 'IN BOOLEAN MODE': '' }
                                 ${ expand==='on' ? 'WITH QUERY EXPANSION': '' } )
                  `
  // [ { count: 3n } ]
  const [ { count } ] = await prisma.$queryRawUnsafe(`${sqlStmt}`, query);

  return count.toString() 
}

export default router;

/*
-- Natural mode 
SELECT textChi, 
		 MATCH(textChiSeg) AGAINST('太陽' ) AS distance, 
		 id 
FROM documents
HAVING distance > 0
ORDER BY distance DESC
LIMIT 10 OFFSET 0 

-- Natural mode with query expansion
SELECT textChi, 
		 MATCH(textChiSeg) AGAINST('太陽' WITH QUERY EXPANSION) AS distance, 
		 id 
FROM documents
HAVING distance > 0
ORDER BY distance DESC
LIMIT 10 OFFSET 0 

-- Boolean mode 
SELECT textChi, 
		 MATCH(textChiSeg) AGAINST('+太陽 +東' IN BOOLEAN MODE) AS distance, 
		 id 
FROM documents
HAVING distance > 0
ORDER BY distance DESC
LIMIT 10 OFFSET 0 
*/