const pool = require('../config/database');
const { executeStandingOrders: executeCronJob } = require('../services/cronJobs');

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
        toAccountId || null,
        toAccountNumber || null,
        recipientName,
        amount,
        frequency,
        startDate,
        endDate || null,
        nextExecutionDate,
        description || null,
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
      [
        amount || null,
        frequency || null,
        endDate || null,
        description || null,
        status || null,
        standingOrderId,
        req.userId,
      ]
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

// Manual execution endpoint (for testing/demo)
const executeStandingOrders = async (req, res) => {
  try {
    const result = await executeCronJob();
    res.json({
      message: 'Standing orders execution completed',
      executed: result.executed,
      failed: result.failed,
    });
  } catch (error) {
    console.error('Execute standing orders error:', error);
    res.status(500).json({ error: 'Server error executing standing orders' });
  }
};

module.exports = {
  getStandingOrders,
  createStandingOrder,
  updateStandingOrder,
  cancelStandingOrder,
  executeStandingOrders,
};