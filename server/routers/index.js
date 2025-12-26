const router = require('express').Router();
const { getAnalizData } = require('../controllers/analizController');

// Single endpoint for analysis dashboard
// GET /api/analiz
router.get('/analiz', getAnalizData);

module.exports = router;
