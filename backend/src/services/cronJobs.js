const cron = require('node-cron');
const pool = require('../config/database');

const executeStandingOrders = async () => {
  const client = await pool.connect();

  try {
    console.log('🔄 Running standing orders execution...');
    
    await client.query('BEGIN');

    // Get all active standing orders that are due
    const standingOrders = await client.query(
      `SELECT so.*, a.balance 
       FROM standing_orders so 
       JOIN accounts a ON so.from_account_id = a.id 
       WHERE so.status = 'active' 
       AND so.next_execution_date <= CURRENT_DATE`
    );

    let executed = 0;
    let failed = 0;

    for (const order of standingOrders.rows) {
      try {
        // Check if account has sufficient funds
        if (parseFloat(order.balance) < parseFloat(order.amount)) {
          console.log(`❌ Order ${order.id}: Insufficient funds`);
          failed++;
          continue;
        }

        // Get recipient account
        let toAccountId = order.to_account_id;
        if (!toAccountId && order.to_account_number) {
          const recipientAccount = await client.query(
            'SELECT id FROM accounts WHERE account_number = $1 AND status = $2',
            [order.to_account_number, 'active']
          );

          if (recipientAccount.rows.length === 0) {
            console.log(`❌ Order ${order.id}: Recipient account not found`);
            failed++;
            continue;
          }

          toAccountId = recipientAccount.rows[0].id;
        }

        // Execute transfer
        await client.query(
          'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
          [order.amount, order.from_account_id]
        );

        await client.query(
          'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
          [order.amount, toAccountId]
        );

        // Record transaction
        await client.query(
          `INSERT INTO transactions 
           (from_account_id, to_account_id, amount, transaction_type, description, status) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            order.from_account_id,
            toAccountId,
            order.amount,
            'standing_order',
            order.description || 'Standing Order Payment',
            'completed',
          ]
        );

        // Calculate next execution date
        let nextDate = new Date(order.next_execution_date);
        switch (order.frequency) {
          case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        }

        // Check if we've reached end date
        let newStatus = 'active';
        if (order.end_date && nextDate > new Date(order.end_date)) {
          newStatus = 'completed';
        }

        // Update standing order
        await client.query(
          `UPDATE standing_orders 
           SET next_execution_date = $1, status = $2, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $3`,
          [nextDate, newStatus, order.id]
        );

        console.log(`✅ Order ${order.id}: Executed successfully`);
        executed++;
      } catch (err) {
        console.error(`❌ Order ${order.id}: ${err.message}`);
        failed++;
      }
    }

    await client.query('COMMIT');
    console.log(`✅ Standing orders execution completed: ${executed} executed, ${failed} failed`);

    return { executed, failed };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Standing orders execution error:', error);
    throw error;
  } finally {
    client.release();
  }
};

const startCronJobs = () => {
  // Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Cron job triggered: Executing standing orders...');
    try {
      await executeStandingOrders();
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });

   //For testing: Run every minute (comment out in production)
//    cron.schedule('* * * * *', async () => {
//      console.log('⏰ TEST: Executing standing orders...');
//      try {
//        await executeStandingOrders();
//      } catch (error) {
//        console.error('Cron job error:', error);
//      }
//    });

  console.log('✅ Cron jobs started: Standing orders will execute daily at midnight');
};

module.exports = { startCronJobs, executeStandingOrders };