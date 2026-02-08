import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { accountAPI, depositWithdrawalAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';

function DepositWithdraw() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [mode, setMode] = useState('deposit'); // 'deposit' or 'withdraw'
  const [formData, setFormData] = useState({
    accountId: '',
    amount: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await accountAPI.getAccounts();
      setAccounts(response.data.accounts);
    } catch (err) {
      setError('Failed to fetch accounts');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'deposit') {
        await depositWithdrawalAPI.deposit(formData);
        setSuccess('Deposit successful!');
      } else {
        await depositWithdrawalAPI.withdraw(formData);
        setSuccess('Withdrawal successful!');
      }

      setFormData({
        accountId: '',
        amount: '',
        description: '',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || `${mode === 'deposit' ? 'Deposit' : 'Withdrawal'} failed`);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedAccount = () => {
    return accounts.find((acc) => acc.id === formData.accountId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 mb-8 transition font-semibold group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </button>

        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-10 border border-gray-200 dark:border-neutral-800 animate-scale-in">
          <div className="mb-10">
            <h1 className="text-5xl font-black text-black dark:text-white mb-3">Cash Operations</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Deposit or withdraw funds</p>
          </div>

          {/* Mode Selector */}
<div className="flex gap-4 mb-8">
  <button
    onClick={() => {
      setMode('deposit');
      setError('');
      setSuccess('');
    }}
    className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all inline-flex items-center justify-center gap-3 ${
      mode === 'deposit'
        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
        : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
    }`}
  >
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
    </svg>
    Deposit
  </button>
  <button
    onClick={() => {
      setMode('withdraw');
      setError('');
      setSuccess('');
    }}
    className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all inline-flex items-center justify-center gap-3 ${
      mode === 'withdraw'
        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
        : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
    }`}
  >
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" transform="rotate(180 10 10)" />
    </svg>
    Withdraw
  </button>
</div>

          {/* Info Banner */}
<div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 px-6 py-4 rounded-lg mb-8">
  <div className="flex items-center gap-3">
    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
    <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold">
      <span className="font-black">Portfolio Demo:</span> This simulates cash deposits/withdrawals. 
      In production, this would integrate with payment gateways or bank transfers.
    </p>
  </div>
</div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg mb-8 flex items-center gap-3 animate-fade-in">
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 px-6 py-4 rounded-lg mb-8 flex items-center gap-3 animate-fade-in">
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Account Selection */}
            <div>
              <label className="block text-sm font-bold text-black dark:text-white mb-4 uppercase tracking-wider">
                Select Account
              </label>
              <div className="grid gap-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => setFormData({ ...formData, accountId: account.id })}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.accountId === account.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20 shadow-lg'
                        : 'border-gray-200 dark:border-neutral-800 hover:border-amber-300 dark:hover:border-amber-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                          {account.account_type}
                        </p>
                        <p className="text-sm font-mono font-bold text-black dark:text-white mb-2">
                          {account.account_number}
                        </p>
                        <p className="text-2xl font-black text-black dark:text-white">
                          {formatCurrency(account.balance)}
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        formData.accountId === account.id
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-gray-300 dark:border-neutral-700'
                      }`}>
                        {formData.accountId === account.id && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            {formData.accountId && (
              <div className="animate-slide-up">
                <label className="block text-sm font-bold text-black dark:text-white mb-4 uppercase tracking-wider">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 text-3xl font-black">N$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0.01"
                    className="w-full pl-24 pr-6 py-6 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 text-black dark:text-white transition text-4xl font-black"
                    placeholder="0.00"
                  />
                </div>
                {mode === 'withdraw' && getSelectedAccount() && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 font-semibold">
                    Available: <span className="text-amber-600 dark:text-amber-400">{formatCurrency(getSelectedAccount().balance)}</span>
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            {formData.amount && (
              <div className="animate-slide-up">
                <label className="block text-sm font-bold text-black dark:text-white mb-4 uppercase tracking-wider">
                  Note (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 text-black dark:text-white transition resize-none"
                  placeholder={`Add a note for this ${mode}...`}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.accountId || !formData.amount}
              className={`w-full ${
                mode === 'deposit' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
              } text-white font-black py-6 rounded-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl text-xl`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                `Complete ${mode === 'deposit' ? 'Deposit' : 'Withdrawal'}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DepositWithdraw;