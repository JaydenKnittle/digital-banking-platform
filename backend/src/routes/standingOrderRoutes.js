const express = require('express');
const {
  getStandingOrders,
  createStandingOrder,
  updateStandingOrder,
  cancelStandingOrder,
  executeStandingOrders,
} = require('../controllers/standingOrderController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getStandingOrders);
router.post('/', auth, createStandingOrder);
router.put('/:standingOrderId', auth, updateStandingOrder);
router.delete('/:standingOrderId', auth, cancelStandingOrder);
router.post('/execute', executeStandingOrders); // This would be called by cron job

module.exports = router;