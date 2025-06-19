import express from 'express';
const router = express.Router();

// Welcome page
router.get('/', (req, res) => res.render('welcome'));

// Search page
router.get('/search', (req, res) => res.render('search'));

// Statistics page
router.get('/stats', (req, res) => res.render('stats'));

// Features page
router.get('/feature', (req, res) => res.redirect('https://github.com/Albert0i/mariadb-vss-chinese/blob/main/README.md'));

export default router;