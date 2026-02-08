const pool = require('../config/database');

const getBeneficiaries = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM beneficiaries WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    res.json({ beneficiaries: result.rows });
  } catch (error) {
    console.error('Get beneficiaries error:', error);
    res.status(500).json({ error: 'Server error fetching beneficiaries' });
  }
};

const addBeneficiary = async (req, res) => {
  const { beneficiary_name, account_number, bank_name, nickname } = req.body;

  if (!beneficiary_name || !account_number) {
    return res.status(400).json({ error: 'Beneficiary name and account number are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO beneficiaries (user_id, beneficiary_name, account_number, bank_name, nickname) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.userId, beneficiary_name, account_number, bank_name || 'NexBank', nickname]
    );

    res.status(201).json({
      message: 'Beneficiary added successfully',
      beneficiary: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Beneficiary already exists' });
    }
    console.error('Add beneficiary error:', error);
    res.status(500).json({ error: 'Server error adding beneficiary' });
  }
};

const updateBeneficiary = async (req, res) => {
  const { beneficiaryId } = req.params;
  const { beneficiary_name, nickname } = req.body;

  try {
    const result = await pool.query(
      'UPDATE beneficiaries SET beneficiary_name = $1, nickname = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *',
      [beneficiary_name, nickname, beneficiaryId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    res.json({
      message: 'Beneficiary updated successfully',
      beneficiary: result.rows[0],
    });
  } catch (error) {
    console.error('Update beneficiary error:', error);
    res.status(500).json({ error: 'Server error updating beneficiary' });
  }
};

const deleteBeneficiary = async (req, res) => {
  const { beneficiaryId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM beneficiaries WHERE id = $1 AND user_id = $2 RETURNING *',
      [beneficiaryId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    res.json({ message: 'Beneficiary deleted successfully' });
  } catch (error) {
    console.error('Delete beneficiary error:', error);
    res.status(500).json({ error: 'Server error deleting beneficiary' });
  }
};

module.exports = {
  getBeneficiaries,
  addBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
};