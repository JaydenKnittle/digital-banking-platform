const express = require('express');
const cors = require('cors');
require('dotenv').config();

const createTables = require('./src/config/createTables');
const addBeneficiariesTable = require('./src/config/addBeneficiariesTable');
const addStandingOrdersTable = require('./src/config/addStandingOrdersTable');
const updateTransactionTypes = require('./src/config/updateTransactionTypes');
const addUserRole = require('./src/config/addUserRole');
const authRoutes = require('./src/routes/authRoutes');
const accountRoutes = require('./src/routes/accountRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const beneficiaryRoutes = require('./src/routes/beneficiaryRoutes');
const statementRoutes = require('./src/routes/statementRoutes');
const depositWithdrawalRoutes = require('./src/routes/depositWithdrawalRoutes');
const standingOrderRoutes = require('./src/routes/standingOrderRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const { startCronJobs } = require('./src/services/cronJobs');
const updateAccountStatus = require('./src/config/updateAccountStatus');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/statements', statementRoutes);
app.use('/api/operations', depositWithdrawalRoutes);
app.use('/api/standing-orders', standingOrderRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Digital Banking Platform API' });
});

const startServer = async () => {
  try {
    await createTables();
    await addBeneficiariesTable();
    await addStandingOrdersTable();
    await updateTransactionTypes();
    await addUserRole();
    await updateAccountStatus();
    console.log('Database tables initialized');

    // Start cron jobs
    startCronJobs();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();