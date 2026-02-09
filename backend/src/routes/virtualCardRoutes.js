const express = require('express');
const {
  getVirtualCards,
  createVirtualCard,
  updateVirtualCard,
  deleteVirtualCard,
  generateQRToken,
  processQRPayment,
} = require('../controllers/virtualCardController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getVirtualCards);
router.post('/', auth, createVirtualCard);
router.put('/:cardId', auth, updateVirtualCard);
router.delete('/:cardId', auth, deleteVirtualCard);
router.post('/:cardId/generate-qr', auth, generateQRToken);
router.post('/process-payment', processQRPayment); // No auth - public endpoint for merchants

module.exports = router;