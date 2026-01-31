const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { analyzeSolution, matchSkills } = require('../controllers/aiController');

router.post('/analyze-solution', authMiddleware, analyzeSolution);
router.post('/match-skills', authMiddleware, matchSkills);
router.get('/recommendations', authMiddleware, require('../controllers/aiController').recommendProblems);

module.exports = router;
