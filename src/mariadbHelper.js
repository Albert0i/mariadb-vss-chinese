/* 
   MariaDB Helper Functins 
*/
import 'dotenv/config'
import { PrismaClient } from './generated/prisma/index.js'; 

const prisma = new PrismaClient();

export async function getStatus() {
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
    return { 
                version,
                model, 
                documents,
                size, 
                visited, 
                results
        };
}

export async function getDocument(id) {
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
    return doc
}

/*
   Fulltext Search Support
*/
export async function findDocuments(query, mode, expand, limit = 5) {
    // Find documents 
    const sqlStmt = ` SELECT textChi,
                             MATCH(textChiSeg) AGAINST (? 
                                   ${ mode==='boolean' ? 'IN BOOLEAN MODE': '' }
                                   ${ expand==='on' ? 'WITH QUERY EXPANSION': '' } ) AS score,
                             id
                      FROM documents
                      HAVING score > 0
                      ORDER BY score DESC
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

export async function countDocuments(query, mode, expand) {
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
/*
    AI: 
    Why use $queryRawUnsafe?
    Because WITH QUERY EXPANSION isn't compatible with Prisma’s standard query builder, 
    and you're injecting raw SQL features. Be sure to properly sanitize any dynamic input 
    if you interpolate it—although using placeholders like ? here is already good practice.
*/
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