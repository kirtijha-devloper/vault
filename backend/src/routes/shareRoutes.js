const express = require('express');
const { createShare, getSharedItem, getMyShares, revokeShare } = require('../controllers/shareController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public route for accessing shared items
router.post('/:token', getSharedItem);

// Protected routes for managing shares
router.use(protect);
router.post('/create', createShare);
router.get('/', getMyShares);
router.delete('/revoke/:id', revokeShare);

module.exports = router;
