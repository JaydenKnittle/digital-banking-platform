const pool = require('./database');

const updateTransactionTypes = async () => {
  try {
    // Drop the old constraint
    await pool.query(`
      ALTER TABLE transactions 
      DROP CONSTRAINT IF EXISTS transactions_transaction_type_check;
    `);

    // Add new constraint with 'standing_order' included
    await pool.query(`
      ALTER TABLE transactions 
      ADD CONSTRAINT transactions_transaction_type_check 
      CHECK (transaction_type IN ('transfer', 'deposit', 'withdrawal', 'standing_order'));
    `);

    console.log('✅ Transaction types updated successfully');
  } catch (error) {
    console.error('❌ Error updating transaction types:', error);
    throw error;
  }
};

module.exports = updateTransactionTypes;