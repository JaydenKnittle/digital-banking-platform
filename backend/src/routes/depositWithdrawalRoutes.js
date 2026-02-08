const express = require('express');
const { deposit, withdraw } = require('../controllers/depositWithdrawalController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/deposit', auth, deposit);
router.post('/withdraw', auth, withdraw);

module.exports = router;