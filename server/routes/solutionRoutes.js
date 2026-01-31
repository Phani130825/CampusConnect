const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createSolution, getSolutionsForProblem, forwardSolution, getForwardedSolutions } = require('../controllers/solutionController');

// For Students
router.post('/', authMiddleware, createSolution);

// For Entrepreneurs
router.get('/problem/:problemId', authMiddleware, getSolutionsForProblem);
router.post('/:solutionId/forward', authMiddleware, forwardSolution);

// For Investors
router.get('/forwarded', authMiddleware, getForwardedSolutions);

module.exports = router;
