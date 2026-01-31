const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createProblem, getAllProblems, getMyProblems } = require('../controllers/problemController');

// For Students to browse
router.get('/', authMiddleware, getAllProblems);

// For Entrepreneurs to manage
router.post('/', authMiddleware, createProblem);
router.get('/my', authMiddleware, getMyProblems);

module.exports = router;
