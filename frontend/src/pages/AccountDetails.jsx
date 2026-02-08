import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { accountAPI, statementAPI, transactionAPI } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

function AccountDetails() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  useEffect(() => {
    fetchAccountDetails();
    fetchTransactions();
  }, [accountId]);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, filterType, startDate, endDate, minAmount, maxAmount]);

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

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search by description
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type (sent/received)
    if (filterType !== 'all') {
      filtered = filtered.filter(t => {
        const isSent = t.from_account_id === accountId;
        return filterType === 'sent' ? isSent : !isSent;
      });
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(t => new Date(t.created_at) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(t => new Date(t.created_at) <= new Date(endDate));
    }

    // Filter by amount range
    if (minAmount) {
      filtered = filtered.filter(t => parseFloat(t.amount) >= parseFloat(minAmount));
    }
    if (maxAmount) {
      filtered = filtered.filter(t => parseFloat(t.amount) <= parseFloat(maxAmount));
    }

    setFilteredTransactions(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  const handleDownloadStatement = async () => {
    try {
      const response = await statementAPI.downloadStatement(accountId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `statement-${account.account_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download statement');
    }
  };

  const getTransactionType = (transaction) => {
    if (transaction.from_account_id === accountId) {
      return { 
        type: 'Sent', 
        color: 'text-red-600 dark:text-red-400', 
        bg: 'bg-red-50 dark:bg-red-950/20',
        sign: '-', 
        icon: '↑' 
      };
    } else {
      return { 
        type: 'Received', 
        color: 'text-green-600 dark:text-green-400', 
        bg: 'bg-green-50 dark:bg-green-950/20',
        sign: '+', 
        icon: '↓' 
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-black dark:text-white font-medium">Loading account details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 mb-8 transition font-semibold group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </button>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Account Header Card */}
        {account && (
          <div className="relative bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-3xl p-10 mb-10 shadow-2xl overflow-hidden animate-slide-up group">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div>
                  <p className="text-amber-950/80 text-sm font-bold uppercase tracking-widest mb-2">
                    {account.account_type} Account
                  </p>
                  <p className="text-2xl font-mono font-black text-amber-950">{account.account_number}</p>
                </div>
                <span className="bg-amber-950 text-amber-50 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider shadow-lg">
                  {account.status}
                </span>
              </div>
              
              <div>
                <p className="text-amber-950/80 text-sm font-bold mb-3 uppercase tracking-widest">Current Balance</p>
                <p className="text-6xl md:text-7xl font-black text-amber-950 tracking-tight">
                  {formatCurrency(account.balance)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Download Statement Button */}
        {account && (
          <div className="mb-6">
            <button
              onClick={handleDownloadStatement}
              className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              Download Statement (PDF)
            </button>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl p-6 mb-6 border border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-black dark:text-white">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-500 transition"
            >
              Clear All
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                Search Description
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black dark:text-white transition"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                Transaction Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black dark:text-white transition"
              >
                <option value="all">All</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black dark:text-white transition"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black dark:text-white transition"
              />
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                Min Amount
              </label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black dark:text-white transition"
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                Max Amount
              </label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black dark:text-white transition"
              />
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-neutral-800 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-black dark:text-white">Transaction History</h2>
            {filteredTransactions.length > 0 && (
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800 px-4 py-2 rounded-full">
                {filteredTransactions.length} {filteredTransactions.length === 1 ? 'Transaction' : 'Transactions'}
              </span>
            )}
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                {transactions.length === 0 ? 'No transactions yet' : 'No matching transactions'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {transactions.length === 0 
                  ? 'Your transaction history will appear here'
                  : 'Try adjusting your filters to see more results'}
              </p>
              {transactions.length === 0 && (
                <button
                  onClick={() => navigate('/transfer')}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-3 rounded-xl transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                  </svg>
                  Make Your First Transfer
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction, index) => {
                const { type, color, bg, sign, icon } = getTransactionType(transaction);
                return (
                  <div
                    key={transaction.id}
                    className="group p-6 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-2xl hover:border-amber-500 dark:hover:border-amber-500 transition-all hover:shadow-lg animate-scale-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <span className={`text-2xl font-black ${color}`}>{icon}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-black dark:text-white text-lg mb-1">{type}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold truncate">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-medium">
                            {formatDateTime(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <p className={`text-3xl font-black ${color} mb-2`}>
                          {sign}{formatCurrency(transaction.amount)}
                        </p>
                        <span className={`inline-block text-xs px-3 py-1.5 rounded-full font-black uppercase tracking-wider ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400'
                            : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
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