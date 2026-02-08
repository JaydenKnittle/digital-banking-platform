import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { accountAPI, transactionAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';

function Transfer() {
  const navigate = useNavigate();
  const location = useLocation();
  const beneficiary = location.state?.beneficiary;

  const [accounts, setAccounts] = useState([]);
  const [transferMode, setTransferMode] = useState(beneficiary ? 'external' : 'own'); // 'own' or 'external'
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    toAccountNumber: beneficiary?.account_number || '',
    amount: '',
    description: '',
  });
  const [verifiedAccount, setVerifiedAccount] = useState(beneficiary ? {
    account_number: beneficiary.account_number,
    full_name: beneficiary.beneficiary_name,
    account_type: ''
  } : null);
  const [verifying, setVerifying] = useState(false);
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

  const handleVerifyAccount = async () => {
    if (!formData.toAccountNumber || formData.toAccountNumber.length < 10) {
      setError('Please enter a valid account number');
      return;
    }

    setVerifying(true);
    setError('');
    setVerifiedAccount(null);

    try {
      const response = await accountAPI.verifyAccount(formData.toAccountNumber);
      setVerifiedAccount(response.data.account);
    } catch (err) {
      setError(err.response?.data?.error || 'Account not found');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation for own account transfers
    if (transferMode === 'own') {
      if (formData.fromAccountId === formData.toAccountId) {
        setError('Cannot transfer to the same account');
        return;
      }
    }

    // Validation for external transfers
    if (transferMode === 'external' && !verifiedAccount) {
      setError('Please verify the recipient account first');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      const transferData = {
        fromAccountId: formData.fromAccountId,
        amount: formData.amount,
        description: formData.description,
      };

      if (transferMode === 'own') {
        transferData.toAccountId = formData.toAccountId;
      } else {
        transferData.toAccountNumber = formData.toAccountNumber;
      }

      await transactionAPI.transfer(transferData);
      setSuccess('Transfer successful!');
      setFormData({
        fromAccountId: '',
        toAccountId: '',
        toAccountNumber: '',
        amount: '',
        description: '',
      });
      setVerifiedAccount(null);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedAccountBalance = () => {
    const account = accounts.find((acc) => acc.id === formData.fromAccountId);
    return account ? account.balance : 0;
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
            <h1 className="text-5xl font-black text-black dark:text-white mb-3">Transfer Money</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Send money instantly</p>
          </div>

          {/* Transfer Mode Selector */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => {
                setTransferMode('own');
                setFormData({ ...formData, toAccountId: '', toAccountNumber: '' });
                setVerifiedAccount(null);
              }}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all ${
                transferMode === 'own'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg'
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
            >
              Between My Accounts
            </button>
            <button
              onClick={() => {
                setTransferMode('external');
                setFormData({ ...formData, toAccountId: '' });
              }}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all ${
                transferMode === 'external'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg'
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
            >
              To Another Person
            </button>
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
            {/* From Account - Card Selection */}
            <div>
              <label className="block text-sm font-bold text-black dark:text-white mb-4 uppercase tracking-wider">
                From Account
              </label>
              <div className="grid gap-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => setFormData({ ...formData, fromAccountId: account.id })}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.fromAccountId === account.id
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
                        formData.fromAccountId === account.id
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-gray-300 dark:border-neutral-700'
                      }`}>
                        {formData.fromAccountId === account.id && (
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

            {/* Arrow Separator */}
            {formData.fromAccountId && (
              <div className="flex justify-center animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v10.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}

            {/* To Account - Own Accounts Mode */}
            {formData.fromAccountId && transferMode === 'own' && (
              <div className="animate-slide-up">
                <label className="block text-sm font-bold text-black dark:text-white mb-4 uppercase tracking-wider">
                  To Account
                </label>
                <div className="grid gap-4">
                  {accounts
                    .filter((acc) => acc.id !== formData.fromAccountId)
                    .map((account) => (
                      <div
                        key={account.id}
                        onClick={() => setFormData({ ...formData, toAccountId: account.id })}
                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                          formData.toAccountId === account.id
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
                            formData.toAccountId === account.id
                              ? 'border-amber-500 bg-amber-500'
                              : 'border-gray-300 dark:border-neutral-700'
                          }`}>
                            {formData.toAccountId === account.id && (
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
            )}

            {/* To Account - External Mode */}
            {formData.fromAccountId && transferMode === 'external' && (
              <div className="animate-slide-up">
                <label className="block text-sm font-bold text-black dark:text-white mb-4 uppercase tracking-wider">
                  Recipient Account Number
                </label>
                
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="toAccountNumber"
                    value={formData.toAccountNumber}
                    onChange={handleChange}
                    placeholder="Enter account number"
                    className="flex-1 px-6 py-4 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black dark:text-white transition font-mono font-bold text-lg"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyAccount}
                    disabled={verifying || !formData.toAccountNumber}
                    className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifying ? 'Verifying...' : 'Verify'}
                  </button>
                </div>

                {/* Verified Account Display */}
                {verifiedAccount && (
                  <div className="mt-6 p-6 bg-green-50 dark:bg-green-950/20 border-2 border-green-500 rounded-2xl animate-scale-in">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                          Account Verified
                        </p>
                        <p className="text-2xl font-black text-green-900 dark:text-green-300">
                          {verifiedAccount.full_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-green-700 dark:text-green-400">Account Number:</span>
                      <span className="font-mono font-bold text-green-900 dark:text-green-300">{verifiedAccount.account_number}</span>
                    </div>
                    {verifiedAccount.account_type && (
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="font-semibold text-green-700 dark:text-green-400">Account Type:</span>
                        <span className="font-bold text-green-900 dark:text-green-300 uppercase">{verifiedAccount.account_type}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Amount Input */}
            {((transferMode === 'own' && formData.toAccountId) || (transferMode === 'external' && verifiedAccount)) && (
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
                {formData.fromAccountId && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 font-semibold">
                    Available: <span className="text-amber-600 dark:text-amber-400">{formatCurrency(getSelectedAccountBalance())}</span>
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
                  placeholder="Add a note to remember this transfer..."
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                loading || 
                !formData.fromAccountId || 
                (transferMode === 'own' && !formData.toAccountId) ||
                (transferMode === 'external' && !verifiedAccount) ||
                !formData.amount
              }
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black py-6 rounded-2xl hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl text-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing Transfer...
                </span>
              ) : (
                'Complete Transfer'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Transfer;