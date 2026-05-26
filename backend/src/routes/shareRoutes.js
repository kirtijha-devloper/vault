const express = require('express');
const { createShare, getSharedItem, getMyShares, revokeShare } = require('../controllers/shareController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected routes for managing shares
router.post('/create', protect, createShare);
router.get('/', protect, getMyShares);
router.delete('/revoke/:id', protect, revokeShare);

// Public route for accessing shared items
router.post('/:token', getSharedItem);

module.exports = router;
