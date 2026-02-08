const pool = require('../config/database');

const getStats = async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const accountsCount = await pool.query('SELECT COUNT(*) FROM accounts');
    const transactionsCount = await pool.query('SELECT COUNT(*) FROM transactions');
    const totalBalance = await pool.query('SELECT SUM(balance) FROM accounts');
    const activeStandingOrders = await pool.query("SELECT COUNT(*) FROM standing_orders WHERE status = 'active'");

    res.json({
      stats: {
        totalUsers: parseInt(usersCount.rows[0].count),
        totalAccounts: parseInt(accountsCount.rows[0].count),
        totalTransactions: parseInt(transactionsCount.rows[0].count),
        totalBalance: parseFloat(totalBalance.rows[0].sum || 0),
        activeStandingOrders: parseInt(activeStandingOrders.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error fetching statistics' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, phone_number, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
};

const getAllAccounts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.full_name, u.email 
       FROM accounts a 
       JOIN users u ON a.user_id = u.id 
       ORDER BY a.created_at DESC`
    );

    res.json({ accounts: result.rows });
  } catch (error) {
    console.error('Get all accounts error:', error);
    res.status(500).json({ error: 'Server error fetching accounts' });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, 
              fa.account_number as from_account_number,
              ta.account_number as to_account_number,
              fu.full_name as from_user_name,
              tu.full_name as to_user_name
       FROM transactions t
       LEFT JOIN accounts fa ON t.from_account_id = fa.id
       LEFT JOIN accounts ta ON t.to_account_id = ta.id
       LEFT JOIN users fu ON fa.user_id = fu.id
       LEFT JOIN users tu ON ta.user_id = tu.id
       ORDER BY t.created_at DESC
       LIMIT 100`
    );

    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ error: 'Server error fetching transactions' });
  }
};

const getAllStandingOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT so.*, u.full_name, u.email, a.account_number as from_account_number
       FROM standing_orders so
       JOIN users u ON so.user_id = u.id
       JOIN accounts a ON so.from_account_id = a.id
       ORDER BY so.created_at DESC`
    );

    res.json({ standingOrders: result.rows });
  } catch (error) {
    console.error('Get all standing orders error:', error);
    res.status(500).json({ error: 'Server error fetching standing orders' });
  }
};

const freezeAccount = async (req, res) => {
  const { accountId } = req.params;

  try {
    const result = await pool.query(
      "UPDATE accounts SET status = 'frozen', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [accountId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({
      message: 'Account frozen successfully',
      account: result.rows[0],
    });
  } catch (error) {
    console.error('Freeze account error:', error);
    res.status(500).json({ error: 'Server error freezing account' });
  }
};

const unfreezeAccount = async (req, res) => {
  const { accountId } = req.params;

  try {
    const result = await pool.query(
      "UPDATE accounts SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [accountId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({
      message: 'Account unfrozen successfully',
      account: result.rows[0],
    });
  } catch (error) {
    console.error('Unfreeze account error:', error);
    res.status(500).json({ error: 'Server error unfreezing account' });
  }
};

const createAccountForUser = async (req, res) => {
  const { userId, accountType } = req.body;

  if (!userId || !accountType) {
    return res.status(400).json({ error: 'User ID and account type are required' });
  }

  if (!['checking', 'savings'].includes(accountType)) {
    return res.status(400).json({ error: 'Invalid account type' });
  }

  try {
    // Verify user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate unique account number
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // Create account with initial balance of 0
    const result = await pool.query(
      `INSERT INTO accounts (user_id, account_number, account_type, balance, status) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [userId, accountNumber, accountType, 0, 'active']
    );

    res.status(201).json({
      message: 'Account created successfully',
      account: result.rows[0],
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Server error creating account' });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  getAllAccounts,
  getAllTransactions,
  getAllStandingOrders,
  freezeAccount,
  unfreezeAccount,
  createAccountForUser,
};