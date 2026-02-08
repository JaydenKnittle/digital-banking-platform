const pool = require('../config/database');

const getStandingOrders = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM standing_orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    res.json({ standingOrders: result.rows });
  } catch (error) {
    console.error('Get standing orders error:', error);
    res.status(500).json({ error: 'Server error fetching standing orders' });
  }
};

const createStandingOrder = async (req, res) => {
  const {
    fromAccountId,
    toAccountId,
    toAccountNumber,
    recipientName,
    amount,
    frequency,
    startDate,
    endDate,
    description,
  } = req.body;

  if (!fromAccountId || !amount || !frequency || !startDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!toAccountId && !toAccountNumber) {
    return res.status(400).json({ error: 'Either recipient account ID or account number is required' });
  }

  try {
    // Verify from account belongs to user
    const accountCheck = await pool.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2',
      [fromAccountId, req.userId]
    );

    if (accountCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Source account not found' });
    }

    // Calculate next execution date
    const nextExecutionDate = new Date(startDate);

    const result = await pool.query(
      `INSERT INTO standing_orders 
       (user_id, from_account_id, to_account_id, to_account_number, recipient_name, amount, frequency, start_date, end_date, next_execution_date, description, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [
        req.userId,
        fromAccountId,
        toAccountId,
        toAccountNumber,
        recipientName,
        amount,
        frequency,
        startDate,
        endDate,
        nextExecutionDate,
        description,
        'active',
      ]
    );

    res.status(201).json({
      message: 'Standing order created successfully',
      standingOrder: result.rows[0],
    });
  } catch (error) {
    console.error('Create standing order error:', error);
    res.status(500).json({ error: 'Server error creating standing order' });
  }
};

const updateStandingOrder = async (req, res) => {
  const { standingOrderId } = req.params;
  const { amount, frequency, endDate, description, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE standing_orders 
       SET amount = COALESCE($1, amount), 
           frequency = COALESCE($2, frequency), 
           end_date = COALESCE($3, end_date), 
           description = COALESCE($4, description), 
           status = COALESCE($5, status),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 AND user_id = $7 
       RETURNING *`,
      [amount, frequency, endDate, description, status, standingOrderId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Standing order not found' });
    }

    res.json({
      message: 'Standing order updated successfully',
      standingOrder: result.rows[0],
    });
  } catch (error) {
    console.error('Update standing order error:', error);
    res.status(500).json({ error: 'Server error updating standing order' });
  }
};

const cancelStandingOrder = async (req, res) => {
  const { standingOrderId } = req.params;

  try {
    const result = await pool.query(
      `UPDATE standing_orders 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [standingOrderId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Standing order not found' });
    }

    res.json({
      message: 'Standing order cancelled successfully',
      standingOrder: result.rows[0],
    });
  } catch (error) {
    console.error('Cancel standing order error:', error);
    res.status(500).json({ error: 'Server error cancelling standing order' });
  }
};

// This would be called by a cron job in production
const executeStandingOrders = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get all active standing orders that are due
    const standingOrders = await client.query(
      `SELECT so.*, a.balance 
       FROM standing_orders so 
       JOIN accounts a ON so.from_account_id = a.id 
       WHERE so.status = 'active' 
       AND so.next_execution_date <= CURRENT_DATE`
    );

    const executed = [];
    const failed = [];

    for (const order of standingOrders.rows) {
      try {
        // Check if account has sufficient funds
        if (parseFloat(order.balance) < parseFloat(order.amount)) {
          failed.push({ order: order.id, reason: 'Insufficient funds' });
          continue;
        }

        // Get recipient account
        let toAccountId = order.to_account_id;
        if (!toAccountId && order.to_account_number) {
          const recipientAccount = await client.query(
            'SELECT id FROM accounts WHERE account_number = $1 AND status = $2',
            [order.to_account_number, 'active']
          );

          if (recipientAccount.rows.length === 0) {
            failed.push({ order: order.id, reason: 'Recipient account not found' });
            continue;
          }

          toAccountId = recipientAccount.rows[0].id;
        }

        // Execute transfer
        await client.query(
          'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
          [order.amount, order.from_account_id]
        );

        await client.query(
          'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
          [order.amount, toAccountId]
        );

        // Record transaction
        await client.query(
          `INSERT INTO transactions 
           (from_account_id, to_account_id, amount, transaction_type, description, status) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            order.from_account_id,
            toAccountId,
            order.amount,
            'standing_order',
            order.description || 'Standing Order Payment',
            'completed',
          ]
        );

        // Calculate next execution date
        let nextDate = new Date(order.next_execution_date);
        switch (order.frequency) {
          case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        }

        // Check if we've reached end date
        let newStatus = 'active';
        if (order.end_date && nextDate > new Date(order.end_date)) {
          newStatus = 'completed';
        }

        // Update standing order
        await client.query(
          `UPDATE standing_orders 
           SET next_execution_date = $1, status = $2, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $3`,
          [nextDate, newStatus, order.id]
        );

        executed.push(order.id);
      } catch (err) {
        failed.push({ order: order.id, reason: err.message });
      }
    }

    await client.query('COMMIT');

    res.json({
      message: 'Standing orders execution completed',
      executed: executed.length,
      failed: failed.length,
      details: { executed, failed },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Execute standing orders error:', error);
    res.status(500).json({ error: 'Server error executing standing orders' });
  } finally {
    client.release();
  }
};

module.exports = {
  getStandingOrders,
  createStandingOrder,
  updateStandingOrder,
  cancelStandingOrder,
  executeStandingOrders,
};