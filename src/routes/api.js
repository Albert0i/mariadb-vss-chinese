import express from 'express';
const router = express.Router();

// GET /api/v1/details?id=xxx
router.get('/details', (req, res) => {
  const id = parseInt(req.query.id, 10);

  // Simulated mock data (replace with DB lookup in production)
  const mockData = {
    id,
    textChi: '打掃房子是保持整潔的好方法',
    visited: 1,
    createdAt: '2025-06-18 16:42:06.000',
    updatedAt: '2025-06-19 12:44:47.000',
    updateIdent: 1
  };

  res.json(mockData);
});


// GET /api/v1/stats
router.get('/stats', (req, res) => {
  res.status(200).json({
    version: "11.7.2-MariaDB",
    documents: 1200,
    matched: 456,
    results: [
        { textChi: '時間流逝，珍惜當下才是最重要的。', visited: 3, id: 127 },
        { textChi: '找到適合自己的道路，勇往直前。', visited: 3, id: 194 },
        { textChi: '珍惜身邊的人，讓生活更有意義。', visited: 2, id: 200 },
        { textChi: '人生旅途充滿挑戰，但也帶來成長。', visited: 2, id: 158 },
        { textChi: '生活需要熱情與希望。', visited: 1, id: 191 }
    ]
  });
});

// POST /api/v1/search
router.post('/search', (req, res) => {
  const { query } = req.body;
  console.log('Received search query:', query);
  // res.json({ message: `Search for "${query}" received.` });
  res.status(200).json( 
            [
                { textChi: '時間流逝，珍惜當下才是最重要的。', distance: 0.07051803387014799, id: 127 },
                { textChi: '找到適合自己的道路，勇往直前。', distance: 0.07872054752784197, id: 194 },
                { textChi: '珍惜身邊的人，讓生活更有意義。', distance: 0.08874166667257355, id: 200 },
                { textChi: '人生旅途充滿挑戰，但也帶來成長。', distance: 0.09129302193130606, id: 158 },
                { textChi: '生活需要熱情與希望。', distance: 0.09197816264352066, id: 191 }
            ]
    );
});

export default router;

/*
{
id: 10,
textChi: "打掃房子是保持整潔的好方法",
visited:	1,
createdAt: "2025-06-18 16:42:06.000",	
updatedAt: "2025-06-19 12:44:47.000",	
updateIdent: 1
}

[
    { textChi: '時間流逝，珍惜當下才是最重要的。', distance: 0.07051803387014799, id: 127 },
    { textChi: '找到適合自己的道路，勇往直前。', distance: 0.07872054752784197, id: 194 },
    { textChi: '珍惜身邊的人，讓生活更有意義。', distance: 0.08874166667257355, id: 200 },
    { textChi: '人生旅途充滿挑戰，但也帶來成長。', distance: 0.09129302193130606, id: 158 },
    { textChi: '生活需要熱情與希望。', distance: 0.09197816264352066, id: 191 }
]
*/