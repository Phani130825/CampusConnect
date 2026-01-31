const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { register, login, logout, getMe, getInvestors } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);
router.get('/investors', authMiddleware, getInvestors);
router.put('/profile', authMiddleware, require('../controllers/authController').updateProfile);

module.exports = router;
