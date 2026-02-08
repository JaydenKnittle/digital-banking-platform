const pool = require('../config/database');

const getAccounts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, account_number, account_type, balance, currency, status, created_at FROM accounts WHERE user_id = $1 ORDER BY created_at ASC',
      [req.userId]
    );

    res.json({ accounts: result.rows });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Server error fetching accounts' });
  }
};

const getAccountById = async (req, res) => {
  const { accountId } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, account_number, account_type, balance, currency, status, created_at FROM accounts WHERE id = $1 AND user_id = $2',
      [accountId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ account: result.rows[0] });
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Server error fetching account' });
  }
};

const verifyAccountByNumber = async (req, res) => {
  const { account_number } = req.body;

  if (!account_number) {
    return res.status(400).json({ error: 'Account number is required' });
  }

  try {
    const result = await pool.query(
      `SELECT a.id, a.account_number, a.account_type, u.full_name 
       FROM accounts a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.account_number = $1 AND a.status = 'active'`,
      [account_number]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found or inactive' });
    }

    res.json({ 
      account: result.rows[0],
      message: 'Account verified successfully' 
    });
  } catch (error) {
    console.error('Verify account error:', error);
    res.status(500).json({ error: 'Server error verifying account' });
  }
};

module.exports = { getAccounts, getAccountById, verifyAccountByNumber };