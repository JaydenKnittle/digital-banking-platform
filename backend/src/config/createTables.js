const pool = require('./database');

const createTables = async () => {
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20),
        date_of_birth DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        account_number VARCHAR(20) UNIQUE NOT NULL,
        account_type VARCHAR(20) CHECK (account_type IN ('checking', 'savings')) NOT NULL,
        balance DECIMAL(15, 2) DEFAULT 0.00,
        currency VARCHAR(3) DEFAULT 'NAD',
        status VARCHAR(20) CHECK (status IN ('active', 'frozen', 'closed')) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        from_account_id UUID REFERENCES accounts(id),
        to_account_id UUID REFERENCES accounts(id),
        amount DECIMAL(15, 2) NOT NULL,
        transaction_type VARCHAR(20) CHECK (transaction_type IN ('transfer', 'deposit', 'withdrawal')) NOT NULL,
        description TEXT,
        status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_account_user ON accounts(user_id);
      CREATE INDEX IF NOT EXISTS idx_account_number ON accounts(account_number);
      CREATE INDEX IF NOT EXISTS idx_transaction_from ON transactions(from_account_id);
      CREATE INDEX IF NOT EXISTS idx_transaction_to ON transactions(to_account_id);
    `);

    console.log('✅ Tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

module.exports = createTables;