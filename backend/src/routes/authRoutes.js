const express = require('express');
const { register, login, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);

module.exports = router;