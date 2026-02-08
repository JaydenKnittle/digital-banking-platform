const pool = require('../config/database');

const deposit = async (req, res) => {
  const { accountId, amount, description } = req.body;

  if (!accountId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid account ID and amount are required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verify account belongs to user
    const accountResult = await client.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [accountId, req.userId]
    );

    if (accountResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Account not found' });
    }

    const account = accountResult.rows[0];

    if (account.status !== 'active') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Account is not active' });
    }

    // Add to balance
    await client.query(
      'UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, accountId]
    );

    // Record transaction
    const transaction = await client.query(
      'INSERT INTO transactions (from_account_id, to_account_id, amount, transaction_type, description, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [accountId, accountId, amount, 'deposit', description || 'Deposit', 'completed']
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Deposit successful',
      transaction: transaction.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Server error during deposit' });
  } finally {
    client.release();
  }
};

const withdraw = async (req, res) => {
  const { accountId, amount, description } = req.body;

  if (!accountId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid account ID and amount are required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verify account belongs to user
    const accountResult = await client.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [accountId, req.userId]
    );

    if (accountResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Account not found' });
    }

    const account = accountResult.rows[0];

    if (account.status !== 'active') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Account is not active' });
    }

    if (parseFloat(account.balance) < parseFloat(amount)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Deduct from balance
    await client.query(
      'UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, accountId]
    );

    // Record transaction
    const transaction = await client.query(
      'INSERT INTO transactions (from_account_id, to_account_id, amount, transaction_type, description, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [accountId, accountId, amount, 'withdrawal', description || 'Withdrawal', 'completed']
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Withdrawal successful',
      transaction: transaction.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Server error during withdrawal' });
  } finally {
    client.release();
  }
};

module.exports = { deposit, withdraw };