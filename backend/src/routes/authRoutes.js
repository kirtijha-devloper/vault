const express = require('express');
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { loginLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
