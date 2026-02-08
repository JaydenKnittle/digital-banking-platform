const express = require('express');
const {
  getStats,
  getAllUsers,
  getAllAccounts,
  getAllTransactions,
  getAllStandingOrders,
  freezeAccount,
  unfreezeAccount,
  createAccountForUser,
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.get('/stats', auth, adminAuth, getStats);
router.get('/users', auth, adminAuth, getAllUsers);
router.get('/accounts', auth, adminAuth, getAllAccounts);
router.get('/transactions', auth, adminAuth, getAllTransactions);
router.get('/standing-orders', auth, adminAuth, getAllStandingOrders);
router.put('/accounts/:accountId/freeze', auth, adminAuth, freezeAccount);
router.put('/accounts/:accountId/unfreeze', auth, adminAuth, unfreezeAccount);
router.post('/accounts/create', auth, adminAuth, createAccountForUser); // Add this

module.exports = router;