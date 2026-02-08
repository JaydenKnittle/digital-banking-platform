const express = require('express');
const { getAccounts, getAccountById, verifyAccountByNumber } = require('../controllers/accountController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getAccounts);
router.get('/:accountId', auth, getAccountById);
router.post('/verify', auth, verifyAccountByNumber);

module.exports = router;