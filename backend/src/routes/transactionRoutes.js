const express = require('express');
const { transferMoney, getTransactions } = require('../controllers/transactionController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/transfer', auth, transferMoney);
router.get('/:accountId', auth, getTransactions);

module.exports = router;