const pool = require('./database');

const addBeneficiariesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS beneficiaries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        beneficiary_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(20) NOT NULL,
        bank_name VARCHAR(255) DEFAULT 'NexBank',
        nickname VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, account_number)
      );

      CREATE INDEX IF NOT EXISTS idx_beneficiary_user ON beneficiaries(user_id);
    `);

    console.log('✅ Beneficiaries table created successfully');
  } catch (error) {
    console.error('❌ Error creating beneficiaries table:', error);
    throw error;
  }
};

module.exports = addBeneficiariesTable;