import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { adminAPI } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

function AdminAccounts() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    accountType: 'checking',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, usersRes] = await Promise.all([
        adminAPI.getAllAccounts(),
        adminAPI.getAllUsers(),
      ]);
      setAccounts(accountsRes.data.accounts);
      setUsers(usersRes.data.users);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleFreeze = async (accountId) => {
    if (!window.confirm('Are you sure you want to freeze this account?')) {
      return;
    }

    try {
      await adminAPI.freezeAccount(accountId);
      setSuccess('Account frozen successfully');
      fetchData();
    } catch (err) {
      setError('Failed to freeze account');
    }
  };

  const handleUnfreeze = async (accountId) => {
    try {
      await adminAPI.unfreezeAccount(accountId);
      setSuccess('Account unfrozen successfully');
      fetchData();
    } catch (err) {
      setError('Failed to unfreeze account');
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await adminAPI.createAccountForUser(formData);
      setSuccess('Account created successfully!');
      setShowCreateModal(false);
      setFormData({ userId: '', accountType: 'checking' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400',
      frozen: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400',
      inactive: 'bg-gray-100 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400',
    };
    return colors[status] || colors.active;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-black dark:text-white font-medium">Loading accounts...</p>
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
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 mb-8 transition font-semibold group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Admin Dashboard
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black text-black dark:text-white mb-2">Account Management</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">All system accounts ({accounts.length})</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:scale-105"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Account
          </button>
        </div>

        {error && !showCreateModal && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 px-6 py-4 rounded-lg mb-8">
            {success}
          </div>
        )}

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                {accounts.map((account, index) => (
                  <tr
                    key={account.id}
                    className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-mono font-bold text-black dark:text-white">
                        {account.account_number}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-bold text-black dark:text-white">{account.full_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{account.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 dark:text-gray-100 font-semibold uppercase">
                        {account.account_type}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-black text-black dark:text-white">
                        {formatCurrency(account.balance)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block text-xs px-3 py-1.5 rounded-full font-black uppercase tracking-wider ${getStatusColor(account.status)}`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {account.status === 'frozen' ? (
                        <button
                          onClick={() => handleUnfreeze(account.id)}
                          className="px-4 py-2 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 font-bold rounded-lg hover:bg-green-200 dark:hover:bg-green-950/50 transition text-sm"
                        >
                          Unfreeze
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFreeze(account.id)}
                          className="px-4 py-2 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-950/50 transition text-sm"
                        >
                          Freeze
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-200 dark:border-neutral-800 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-black dark:text-white">Create Account</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Select User <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition font-semibold"
                >
                  <option value="">Choose a user...</option>
                  {users
                    .filter(u => u.role !== 'admin')
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Account Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition font-semibold"
                >
                  <option value="checking">Checking Account</option>
                  <option value="savings">Savings Account</option>
                </select>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 px-4 py-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <span className="font-bold">Note:</span> Account will be created with N$ 0.00 balance. Admin can deposit funds after creation.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-neutral-700 text-black dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.userId}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAccounts;