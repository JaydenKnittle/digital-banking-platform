import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { accountAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';

function Dashboard() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await accountAPI.getAccounts();
      setAccounts(response.data.accounts);
    } catch (err) {
      setError('Failed to fetch accounts');
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-black dark:text-white font-medium">Loading your accounts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-6 py-4 rounded-xl mb-8 animate-fade-in">
            {error}
          </div>
        )}

        {/* Total Balance Card */}
        <div className="relative bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-3xl p-12 mb-12 shadow-2xl overflow-hidden animate-slide-up group hover:shadow-amber-500/20 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <p className="text-amber-950/80 text-sm font-bold uppercase tracking-widest mb-3">Total Balance</p>
            <p className="text-7xl font-black text-amber-950 mb-8 tracking-tight">{formatCurrency(getTotalBalance())}</p>
            <div className="flex flex-wrap gap-4 mt-6">
  <button
    onClick={() => navigate('/transfer')}
    className="group/btn bg-amber-950 text-amber-50 px-8 py-4 rounded-xl font-bold hover:bg-amber-900 transition-all inline-flex items-center gap-3 shadow-xl hover:scale-105 transform duration-200"
  >
    <svg className="w-6 h-6 group-hover/btn:rotate-90 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
      <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
    </svg>
    Transfer Money
  </button>
  
  <button
    onClick={() => navigate('/beneficiaries')}
    className="bg-white/20 hover:bg-white/30 text-amber-950 px-8 py-4 rounded-xl font-bold transition-all inline-flex items-center gap-3 backdrop-blur-sm hover:scale-105 transform duration-200"
  >
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
    Beneficiaries
  </button>

  <button
    onClick={() => navigate('/deposit-withdraw')}
    className="bg-white/20 hover:bg-white/30 text-amber-950 px-8 py-4 rounded-xl font-bold transition-all inline-flex items-center gap-3 backdrop-blur-sm hover:scale-105 transform duration-200"
  >
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
    </svg>
    Deposit/Withdraw
  </button>

  <button
    onClick={() => navigate('/standing-orders')}
    className="bg-white/20 hover:bg-white/30 text-amber-950 px-8 py-4 rounded-xl font-bold transition-all inline-flex items-center gap-3 backdrop-blur-sm hover:scale-105 transform duration-200"
  >
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
    Standing Orders
  </button>

  <button
  onClick={() => navigate('/virtual-cards')}
  className="bg-white/20 hover:bg-white/30 text-amber-950 px-8 py-4 rounded-xl font-bold transition-all inline-flex items-center gap-3 backdrop-blur-sm hover:scale-105 transform duration-200"
>
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
  </svg>
  Virtual Cards
</button>
</div>
          </div>
        </div>

        {/* Accounts */}
        <h2 className="text-4xl font-black text-black dark:text-white mb-8 animate-fade-in">Your Accounts</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {accounts.map((account, index) => (
            <div
              key={account.id}
              onClick={() => navigate(`/account/${account.id}`)}
              className="group bg-white dark:dark:bg-neutral-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-2">
                    {account.account_type}
                  </p>
                  <p className="text-sm font-mono font-bold text-black dark:text-white">{account.account_number}</p>
                </div>
                <span className="bg-amber-500 text-amber-950 px-4 py-2 rounded-lg text-xs font-black uppercase group-hover:scale-110 transition-transform duration-200">
                  {account.status}
                </span>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-3">Balance</p>
                <div className="flex justify-between items-end">
                  <p className="text-5xl font-black text-black dark:text-white">
                    {formatCurrency(account.balance)}
                  </p>
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-sm group-hover:translate-x-2 transition-transform duration-200 inline-flex items-center gap-1">
                    View
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;