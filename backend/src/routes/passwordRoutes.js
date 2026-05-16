const express = require('express');
const { getPasswords, createPassword, updatePassword, deletePassword } = require('../controllers/passwordController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // All password routes are protected

router.route('/')
  .get(getPasswords)
  .post(createPassword);

router.route('/:id')
  .put(updatePassword)
  .delete(deletePassword);

module.exports = router;
