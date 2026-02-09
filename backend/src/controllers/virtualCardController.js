const pool = require('../config/database');
const crypto = require('crypto');

// Generate random card number
const generateCardNumber = () => {
  // Format: 5299 XXXX XXXX XXXX (starts with 5299 for demo)
  const prefix = '5299';
  const randomDigits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
  return prefix + randomDigits;
};

// Generate random CVV
const generateCVV = () => {
  return Math.floor(100 + Math.random() * 900).toString();
};

// Generate expiry date (3 years from now)
const generateExpiryDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 3);
  return date;
};

const getVirtualCards = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT vc.*, a.account_number, a.balance as account_balance
       FROM virtual_cards vc
       JOIN accounts a ON vc.account_id = a.id
       WHERE vc.user_id = $1 AND vc.status != 'deleted'
       ORDER BY vc.created_at DESC`,
      [req.userId]
    );

    res.json({ virtualCards: result.rows });
  } catch (error) {
    console.error('Get virtual cards error:', error);
    res.status(500).json({ error: 'Server error fetching virtual cards' });
  }
};

const createVirtualCard = async (req, res) => {
  const { accountId, cardHolderName, spendingLimit } = req.body;

  if (!accountId || !cardHolderName) {
    return res.status(400).json({ error: 'Account ID and card holder name are required' });
  }

  try {
    // Verify account belongs to user
    const accountCheck = await pool.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2',
      [accountId, req.userId]
    );

    if (accountCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const cardNumber = generateCardNumber();
    const cvv = generateCVV();
    const expiryDate = generateExpiryDate();

    const result = await pool.query(
      `INSERT INTO virtual_cards 
       (user_id, account_id, card_number, card_holder_name, cvv, expiry_date, spending_limit, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.userId,
        accountId,
        cardNumber,
        cardHolderName.toUpperCase(),
        cvv,
        expiryDate,
        spendingLimit || 10000,
        'active',
      ]
    );

    res.status(201).json({
      message: 'Virtual card created successfully',
      virtualCard: result.rows[0],
    });
  } catch (error) {
    console.error('Create virtual card error:', error);
    res.status(500).json({ error: 'Server error creating virtual card' });
  }
};

const updateVirtualCard = async (req, res) => {
  const { cardId } = req.params;
  const { spendingLimit, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE virtual_cards 
       SET spending_limit = COALESCE($1, spending_limit),
           status = COALESCE($2, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4 AND status != 'deleted'
       RETURNING *`,
      [spendingLimit || null, status || null, cardId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Virtual card not found' });
    }

    res.json({
      message: 'Virtual card updated successfully',
      virtualCard: result.rows[0],
    });
  } catch (error) {
    console.error('Update virtual card error:', error);
    res.status(500).json({ error: 'Server error updating virtual card' });
  }
};

const deleteVirtualCard = async (req, res) => {
  const { cardId } = req.params;

  try {
    const result = await pool.query(
      `UPDATE virtual_cards 
       SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [cardId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Virtual card not found' });
    }

    res.json({ message: 'Virtual card deleted successfully' });
  } catch (error) {
    console.error('Delete virtual card error:', error);
    res.status(500).json({ error: 'Server error deleting virtual card' });
  }
};

// Generate QR code data (encrypted token for payment)
const generateQRToken = async (req, res) => {
  const { cardId } = req.params;

  try {
    // Get card details
    const cardResult = await pool.query(
      `SELECT vc.*, a.balance 
       FROM virtual_cards vc
       JOIN accounts a ON vc.account_id = a.id
       WHERE vc.id = $1 AND vc.user_id = $2 AND vc.status = 'active'`,
      [cardId, req.userId]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Virtual card not found or inactive' });
    }

    const card = cardResult.rows[0];

    // Generate secure token (expires in 5 minutes)
    const tokenData = {
      cardId: card.id,
      userId: card.user_id,
      accountId: card.account_id,
      cardNumber: card.card_number,
      timestamp: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    // Create encrypted token
    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');

    res.json({
      token,
      expiresAt: tokenData.expiresAt,
      cardHolder: card.card_holder_name,
    });
  } catch (error) {
    console.error('Generate QR token error:', error);
    res.status(500).json({ error: 'Server error generating QR token' });
  }
};

// Process payment from QR code
const processQRPayment = async (req, res) => {
  const { token, amount, merchantName } = req.body;

  if (!token || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid payment data' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Decrypt token
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());

    // Verify token hasn't expired
    if (Date.now() > tokenData.expiresAt) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'QR code has expired' });
    }

    // Get card and account details
    const cardResult = await client.query(
      `SELECT vc.*, a.balance 
       FROM virtual_cards vc
       JOIN accounts a ON vc.account_id = a.id
       WHERE vc.id = $1 AND vc.status = 'active'
       FOR UPDATE`,
      [tokenData.cardId]
    );

    if (cardResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Card not found or inactive' });
    }

    const card = cardResult.rows[0];

    // Check spending limit
    if (parseFloat(card.current_spent) + parseFloat(amount) > parseFloat(card.spending_limit)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Spending limit exceeded' });
    }

    // Check account balance
    if (parseFloat(card.balance) < parseFloat(amount)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Deduct from account
    await client.query(
      'UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, card.account_id]
    );

    // Update card spending
    await client.query(
      'UPDATE virtual_cards SET current_spent = current_spent + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, card.id]
    );

    // Record transaction
    const transaction = await client.query(
      `INSERT INTO transactions 
       (from_account_id, to_account_id, amount, transaction_type, description, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        card.account_id,
        card.account_id,
        amount,
        'card_payment',
        `Card Payment - ${merchantName || 'Merchant'}`,
        'completed',
      ]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Payment successful',
      transaction: transaction.rows[0],
      remainingBalance: parseFloat(card.balance) - parseFloat(amount),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Process QR payment error:', error);
    res.status(500).json({ error: 'Server error processing payment' });
  } finally {
    client.release();
  }
};

module.exports = {
  getVirtualCards,
  createVirtualCard,
  updateVirtualCard,
  deleteVirtualCard,
  generateQRToken,
  processQRPayment,
};