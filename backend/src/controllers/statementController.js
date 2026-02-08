const pool = require('../config/database');
const PDFDocument = require('pdfkit');

const generateStatement = async (req, res) => {
  const { accountId } = req.params;

  try {
    // Verify account belongs to user
    const accountResult = await pool.query(
      'SELECT a.*, u.full_name, u.email FROM accounts a JOIN users u ON a.user_id = u.id WHERE a.id = $1 AND a.user_id = $2',
      [accountId, req.userId]
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const account = accountResult.rows[0];

    // Get transactions
    const transactionsResult = await pool.query(
      'SELECT * FROM transactions WHERE from_account_id = $1 OR to_account_id = $1 ORDER BY created_at DESC LIMIT 100',
      [accountId]
    );

    const transactions = transactionsResult.rows;

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=statement-${account.account_number}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('NexBank', { align: 'center' });
    doc.fontSize(16).font('Helvetica').text('Account Statement', { align: 'center' });
    doc.moveDown();

    // Account Information
    doc.fontSize(12).font('Helvetica-Bold').text('Account Holder:', 50, doc.y);
    doc.font('Helvetica').text(account.full_name, 200, doc.y - 12);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').text('Account Number:', 50, doc.y);
    doc.font('Helvetica').text(account.account_number, 200, doc.y - 12);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').text('Account Type:', 50, doc.y);
    doc.font('Helvetica').text(account.account_type.toUpperCase(), 200, doc.y - 12);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').text('Current Balance:', 50, doc.y);
    doc.font('Helvetica').text(`N$${parseFloat(account.balance).toFixed(2)}`, 200, doc.y - 12);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').text('Statement Date:', 50, doc.y);
    doc.font('Helvetica').text(new Date().toLocaleDateString(), 200, doc.y - 12);
    doc.moveDown(2);

    // Transactions Table
    doc.fontSize(14).font('Helvetica-Bold').text('Transaction History', { underline: true });
    doc.moveDown(1);

    if (transactions.length === 0) {
      doc.fontSize(12).font('Helvetica').text('No transactions found.');
    } else {
      // Table headers
      const tableTop = doc.y;
      const dateX = 50;
      const descX = 130;
      const typeX = 280;
      const amountX = 360;
      const statusX = 470;

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Date', dateX, tableTop);
      doc.text('Description', descX, tableTop);
      doc.text('Type', typeX, tableTop);
      doc.text('Amount', amountX, tableTop);
      doc.text('Status', statusX, tableTop);
      
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      
      let currentY = tableTop + 25;

      // Table rows
      doc.font('Helvetica');
      transactions.forEach((transaction) => {
        // Check if we need a new page
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
          
          // Redraw headers on new page
          doc.fontSize(10).font('Helvetica-Bold');
          doc.text('Date', dateX, currentY);
          doc.text('Description', descX, currentY);
          doc.text('Type', typeX, currentY);
          doc.text('Amount', amountX, currentY);
          doc.text('Status', statusX, currentY);
          doc.moveTo(50, currentY + 15).lineTo(550, currentY + 15).stroke();
          currentY += 25;
          doc.font('Helvetica');
        }

        const date = new Date(transaction.created_at).toLocaleDateString();
        const isDebit = transaction.from_account_id === accountId;
        const type = isDebit ? 'Debit' : 'Credit';
        const amount = `${isDebit ? '-' : '+'}N$${parseFloat(transaction.amount).toFixed(2)}`;
        const description = transaction.description.length > 20 
          ? transaction.description.substring(0, 20) + '...' 
          : transaction.description;

        doc.fontSize(9);
        doc.text(date, dateX, currentY);
        doc.text(description, descX, currentY);
        doc.text(type, typeX, currentY);
        doc.text(amount, amountX, currentY);
        doc.text(transaction.status, statusX, currentY);
        
        currentY += 20;
      });
    }

    // Footer
    doc.moveDown(3);
    doc.fontSize(8).font('Helvetica').text(
      'This is a computer-generated statement and does not require a signature.',
      50,
      doc.y,
      { align: 'center', width: 500 }
    );

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Generate statement error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error generating statement' });
    }
  }
};

module.exports = { generateStatement };