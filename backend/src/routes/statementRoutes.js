const express = require('express');
const { generateStatement } = require('../controllers/statementController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:accountId', auth, generateStatement);

module.exports = router;