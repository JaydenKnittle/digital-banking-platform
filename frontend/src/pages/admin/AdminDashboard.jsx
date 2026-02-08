import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { adminAPI } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data.stats);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError('Failed to fetch statistics');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-black dark:text-white font-medium">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-black text-black dark:text-white mb-3">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">System Overview & Management</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 transition animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-950/30 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">Total Users</p>
              <p className="text-4xl font-black text-black dark:text-white">{stats.totalUsers}</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-neutral-800 hover:border-green-500 dark:hover:border-green-500 transition animate-scale-in" style={{ animationDelay: '50ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-950/30 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">Total Accounts</p>
              <p className="text-4xl font-black text-black dark:text-white">{stats.totalAccounts}</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-neutral-800 hover:border-purple-500 dark:hover:border-purple-500 transition animate-scale-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-950/30 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">Total Transactions</p>
              <p className="text-4xl font-black text-black dark:text-white">{stats.totalTransactions}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-2xl p-6 shadow-2xl md:col-span-2 animate-scale-in" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-amber-950 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-amber-950/80 text-sm font-bold mb-3 uppercase tracking-wider">System Total Balance</p>
              <p className="text-6xl font-black text-amber-950">{formatCurrency(stats.totalBalance)}</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-neutral-800 hover:border-orange-500 dark:hover:border-orange-500 transition animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-950/30 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">Active Standing Orders</p>
              <p className="text-4xl font-black text-black dark:text-white">{stats.activeStandingOrders}</p>
            </div>
          </div>
        )}

        {/* Management Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => navigate('/admin/users')}
            className="group bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500 transition text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <svg className="w-6 h-6 text-gray-400 group-hover:text-amber-600 transition" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-black dark:text-white mb-2">Manage Users</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">View all registered users</p>
          </button>

          <button
            onClick={() => navigate('/admin/accounts')}
            className="group bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500 transition text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <svg className="w-6 h-6 text-gray-400 group-hover:text-amber-600 transition" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-black dark:text-white mb-2">Manage Accounts</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Freeze/unfreeze accounts</p>
          </button>

          <button
            onClick={() => navigate('/admin/transactions')}
            className="group bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500 transition text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                </svg>
              </div>
              <svg className="w-6 h-6 text-gray-400 group-hover:text-amber-600 transition" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-black dark:text-white mb-2">View Transactions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monitor all system transfers</p>
          </button>

          <button
            onClick={() => navigate('/admin/standing-orders')}
            className="group bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500 transition text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <svg className="w-6 h-6 text-gray-400 group-hover:text-amber-600 transition" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-black dark:text-white mb-2">Standing Orders</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">View all recurring payments</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;