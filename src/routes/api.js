import 'dotenv/config'
import express from 'express';
const router = express.Router();
import { findSimilarDocuments, addDocument } from '../embedder.js';

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

export default router;
