const pool = require('./database');

const updateAccountStatus = async () => {
  try {
    // Drop old constraint
    await pool.query(`
      ALTER TABLE accounts 
      DROP CONSTRAINT IF EXISTS accounts_status_check;
    `);

    // Add new constraint with 'frozen' status
    await pool.query(`
      ALTER TABLE accounts 
      ADD CONSTRAINT accounts_status_check 
      CHECK (status IN ('active', 'inactive', 'frozen'));
    `);

    console.log('✅ Account status constraint updated successfully');
  } catch (error) {
    console.error('❌ Error updating account status:', error);
    throw error;
  }
};

module.exports = updateAccountStatus;