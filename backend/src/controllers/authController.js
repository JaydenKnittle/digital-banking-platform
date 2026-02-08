const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const generateAccountNumber = require('../utils/generateAccountNumber');

const register = async (req, res) => {
  const { email, password, full_name, phone_number, date_of_birth } = req.body;

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, phone_number, date_of_birth) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name',
      [email, hashedPassword, full_name, phone_number, date_of_birth]
    );

    const userId = newUser.rows[0].id;

    const checkingAccountNumber = generateAccountNumber();
    const savingsAccountNumber = generateAccountNumber();

    await pool.query(
      'INSERT INTO accounts (user_id, account_number, account_type, balance) VALUES ($1, $2, $3, $4)',
      [userId, checkingAccountNumber, 'checking', 1000.00]
    );

    await pool.query(
      'INSERT INTO accounts (user_id, account_number, account_type, balance) VALUES ($1, $2, $3, $4)',
      [userId, savingsAccountNumber, 'savings', 500.00]
    );

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser.rows[0],
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

module.exports = { register, login };