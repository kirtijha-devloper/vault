const express = require('express');
const { getDocuments, uploadDocument, deleteDocument } = require('../controllers/documentController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.use(protect); // All document routes are protected

router.route('/')
  .get(getDocuments)
  .post(upload.single('file'), uploadDocument);

router.route('/:id')
  .delete(deleteDocument);

module.exports = router;
