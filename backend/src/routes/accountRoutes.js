const express = require('express');
const { getAccounts, getAccountById } = require('../controllers/accountController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getAccounts);
router.get('/:accountId', auth, getAccountById);

module.exports = router;