const pool = require('./database');

const addStandingOrdersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS standing_orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        from_account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
        to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
        to_account_number VARCHAR(20),
        recipient_name VARCHAR(255),
        amount DECIMAL(15, 2) NOT NULL,
        frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
        start_date DATE NOT NULL,
        end_date DATE,
        next_execution_date DATE NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_standing_orders_user ON standing_orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_standing_orders_from_account ON standing_orders(from_account_id);
      CREATE INDEX IF NOT EXISTS idx_standing_orders_next_execution ON standing_orders(next_execution_date, status);
    `);

    console.log('✅ Standing orders table created successfully');
  } catch (error) {
    console.error('❌ Error creating standing orders table:', error);
    throw error;
  }
};

module.exports = addStandingOrdersTable;