const express = require('express');
const {
  getBeneficiaries,
  addBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
} = require('../controllers/beneficiaryController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getBeneficiaries);
router.post('/', auth, addBeneficiary);
router.put('/:beneficiaryId', auth, updateBeneficiary);
router.delete('/:beneficiaryId', auth, deleteBeneficiary);

module.exports = router;