import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { accountAPI, transactionAPI } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

function AccountDetails() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccountDetails();
    fetchTransactions();
  }, [accountId]);

  const fetchAccountDetails = async () => {
    try {
      const response = await accountAPI.getAccountById(accountId);
      setAccount(response.data.account);
    } catch (err) {
      setError('Failed to fetch account details');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getTransactions(accountId);
      setTransactions(response.data.transactions);
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionType = (transaction) => {
    if (transaction.from_account_id === accountId) {
      return { type: 'Sent', color: 'text-red-500', sign: '-', icon: '↑' };
    } else {
      return { type: 'Received', color: 'text-green-500', sign: '+', icon: '↓' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading account details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 mb-6 transition"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {account && (
          <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl shadow-2xl p-8 mb-8 text-black">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-medium opacity-90 uppercase tracking-wide mb-1">
                  {account.account_type} Account
                </p>
                <p className="text-xl font-mono font-semibold">{account.account_number}</p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold ${
                  account.status === 'active'
                    ? 'bg-black text-white'
                    : 'bg-gray-900 text-gray-300'
                }`}
              >
                {account.status}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 opacity-90">Current Balance</p>
              <p className="text-5xl font-bold">
                {formatCurrency(account.balance)}
              </p>
            </div>
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Transaction History</h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 text-lg">No transactions yet</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const { type, color, sign, icon } = getTransactionType(transaction);
                return (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center p-5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl hover:border-gold-500 dark:hover:border-gold-500 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full ${color} bg-opacity-10 flex items-center justify-center text-2xl font-bold`}>
                        {icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{type}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatDateTime(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${color}`}>
                        {sign}{formatCurrency(transaction.amount)}
                      </p>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold mt-2 inline-block ${
                          transaction.status === 'completed'
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                            : 'bg-red-500/20 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccountDetails;