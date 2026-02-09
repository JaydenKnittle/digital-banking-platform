const pool = require('./database');

const addVirtualCardsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS virtual_cards (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
        card_number VARCHAR(16) UNIQUE NOT NULL,
        card_holder_name VARCHAR(255) NOT NULL,
        cvv VARCHAR(3) NOT NULL,
        expiry_date DATE NOT NULL,
        spending_limit DECIMAL(15, 2) DEFAULT 10000.00,
        current_spent DECIMAL(15, 2) DEFAULT 0.00,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'deleted')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_virtual_cards_user ON virtual_cards(user_id);
      CREATE INDEX IF NOT EXISTS idx_virtual_cards_account ON virtual_cards(account_id);
      CREATE INDEX IF NOT EXISTS idx_virtual_cards_number ON virtual_cards(card_number);
    `);

    console.log('✅ Virtual cards table created successfully');
  } catch (error) {
    console.error('❌ Error creating virtual cards table:', error);
    throw error;
  }
};

module.exports = addVirtualCardsTable;