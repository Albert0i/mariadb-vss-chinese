import 'dotenv/config'
import express from 'express';
import { findSimilarDocuments, addDocument } from '../embedder.js';

import { getStatus, getDocument, findDocuments, countDocuments } from '../mariadbHelper.js'

const router = express.Router();

/*
   Vector Semantic Search (MariaDB)
*/
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
  res.status(200).json(await getStatus())
});

// GET /api/v1/details?id=xxx
router.get('/details', async (req, res) => {
  const id = parseInt(req.query.id, 10);

  res.status(200).json(await getDocument(id))
});

/*
   Fulltext Search (MariaDB)
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
   Fulltext Search (Redis)
*/
// POST /api/v1/ftsredis
router.post('/ftsredis', async (req, res) => {  
  const { query } = req.body;
  console.log('query =', query)
  res.status(200).json([
                        { textChi: '夏天的海灘充滿歡笑與快樂', id: '31', score: 14 },
                        { textChi: '夏天的冰淇淋讓人感到無比清涼', id: '88', score: 14 },
                        { textChi: '夏天的微風讓人感覺舒適', id: '67', score: 14 },
                        { textChi: '夏天的海灘充滿活力', id: '246', score: 14 },
                        { textChi: '夏天的微風帶來涼爽的感受', id: '392', score: 7 }
                      ])
})

// GET /api/v1/ftcheckredis
router.get('/ftcheckredis', async (req, res) => {  
  const { query } = req.query
  console.log('query =', query)
  res.status(200).json({ success: true, count: 5 })
})

// GET /api/v1/stats
router.get('/statsredis', async (req, res) => {
  res.status(200).json(await getStatus())
});

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