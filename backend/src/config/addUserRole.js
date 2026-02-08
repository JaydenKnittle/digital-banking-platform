const pool = require('./database');

const addUserRole = async () => {
  try {
    // Add role column to users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' 
      CHECK (role IN ('user', 'admin'));
    `);

    // Create an admin user (email: admin@nexbank.com, password: Admin123!)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    await pool.query(`
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES ('admin@nexbank.com', $1, 'System Administrator', 'admin')
      ON CONFLICT (email) DO UPDATE SET role = 'admin';
    `, [hashedPassword]);

    console.log('✅ User roles added successfully');
    console.log('📧 Admin login: admin@nexbank.com / Admin123!');
  } catch (error) {
    console.error('❌ Error adding user roles:', error);
    throw error;
  }
};

module.exports = addUserRole;