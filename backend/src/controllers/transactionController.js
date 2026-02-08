const pool = require('../config/database');

const transferMoney = async (req, res) => {
  const { fromAccountId, toAccountId, toAccountNumber, amount, description } = req.body;

  if (!fromAccountId || (!toAccountId && !toAccountNumber) || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid transfer details' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const fromAccount = await client.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [fromAccountId, req.userId]
    );

    if (fromAccount.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Source account not found' });
    }

    if (fromAccount.rows[0].status !== 'active') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Source account is not active' });
    }

    if (parseFloat(fromAccount.rows[0].balance) < parseFloat(amount)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    let toAccount;
    if (toAccountId) {
      toAccount = await client.query(
        'SELECT * FROM accounts WHERE id = $1 FOR UPDATE',
        [toAccountId]
      );
    } else if (toAccountNumber) {
      toAccount = await client.query(
        'SELECT * FROM accounts WHERE account_number = $1 FOR UPDATE',
        [toAccountNumber]
      );
    }

    if (toAccount.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Destination account not found' });
    }

    if (toAccount.rows[0].status !== 'active') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Destination account is not active' });
    }

    const finalToAccountId = toAccount.rows[0].id;

    await client.query(
      'UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, fromAccountId]
    );

    await client.query(
      'UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, finalToAccountId]
    );

    const transaction = await client.query(
      'INSERT INTO transactions (from_account_id, to_account_id, amount, transaction_type, description, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [fromAccountId, finalToAccountId, amount, 'transfer', description || 'Transfer', 'completed']
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Transfer successful',
      transaction: transaction.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Server error during transfer' });
  } finally {
    client.release();
  }
};

const getTransactions = async (req, res) => {
  const { accountId } = req.params;

  try {
    const accountCheck = await pool.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2',
      [accountId, req.userId]
    );

    if (accountCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const result = await pool.query(
      'SELECT * FROM transactions WHERE from_account_id = $1 OR to_account_id = $1 ORDER BY created_at DESC LIMIT 50',
      [accountId]
    );

    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error fetching transactions' });
  }
};

module.exports = { transferMoney, getTransactions };