import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { accountAPI, virtualCardAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';

function VirtualCards() {
  const navigate = useNavigate();
  const [virtualCards, setVirtualCards] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [qrData, setQRData] = useState(null);
  const [formData, setFormData] = useState({
    accountId: '',
    cardHolderName: '',
    spendingLimit: 10000,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cardsRes, accountsRes] = await Promise.all([
        virtualCardAPI.getVirtualCards(),
        accountAPI.getAccounts(),
      ]);
      setVirtualCards(cardsRes.data.virtualCards);
      setAccounts(accountsRes.data.accounts);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await virtualCardAPI.createVirtualCard(formData);
      setSuccess('Virtual card created successfully!');
      setShowCreateModal(false);
      setFormData({ accountId: '', cardHolderName: '', spendingLimit: 10000 });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create virtual card');
    }
  };

  const handleGenerateQR = async (card) => {
    try {
      const response = await virtualCardAPI.generateQRToken(card.id);
      setQRData(response.data);
      setSelectedCard(card);
      setShowQRModal(true);
    } catch (err) {
      setError('Failed to generate QR code');
    }
  };

  const handleFreezeCard = async (cardId) => {
    try {
      await virtualCardAPI.updateVirtualCard(cardId, { status: 'frozen' });
      setSuccess('Card frozen successfully');
      fetchData();
    } catch (err) {
      setError('Failed to freeze card');
    }
  };

  const handleUnfreezeCard = async (cardId) => {
    try {
      await virtualCardAPI.updateVirtualCard(cardId, { status: 'active' });
      setSuccess('Card activated successfully');
      fetchData();
    } catch (err) {
      setError('Failed to activate card');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card? This cannot be undone.')) {
      return;
    }

    try {
      await virtualCardAPI.deleteVirtualCard(cardId);
      setSuccess('Card deleted successfully');
      fetchData();
    } catch (err) {
      setError('Failed to delete card');
    }
  };

  const formatCardNumber = (number) => {
    return number.match(/.{1,4}/g).join(' ');
  };

  const formatExpiryDate = (date) => {
    const d = new Date(date);
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400',
      frozen: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400',
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
            <p className="text-black dark:text-white font-medium">Loading virtual cards...</p>
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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black text-black dark:text-white mb-2">Virtual Cards</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Contactless payment cards for secure transactions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:scale-105"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Virtual Card
          </button>
        </div>

        {error && !showCreateModal && !showQRModal && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 px-6 py-4 rounded-lg mb-8">
            {success}
          </div>
        )}

        {virtualCards.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl p-16 text-center border border-gray-200 dark:border-neutral-800">
            <div className="w-24 h-24 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-black dark:text-white mb-3">No virtual cards yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Create a virtual debit card for secure online and contactless payments
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-3 rounded-xl transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Your First Card
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {virtualCards.map((card, index) => (
              <div
                key={card.id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Card Display */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-6 shadow-2xl border border-gray-700 mb-4 relative overflow-hidden">
                  {/* Card Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600 rounded-full blur-3xl"></div>
                  </div>

                  <div className="relative z-10">
                    {/* Chip */}
                    <div className="w-12 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg mb-8"></div>

                    {/* Card Number */}
                    <p className="text-white text-xl font-mono mb-6 tracking-wider">
                      {formatCardNumber(card.card_number)}
                    </p>

                    {/* Card Details */}
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Card Holder</p>
                        <p className="text-white font-bold">{card.card_holder_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Expires</p>
                        <p className="text-white font-bold font-mono">{formatExpiryDate(card.expiry_date)}</p>
                      </div>
                    </div>

                    {/* CVV (Hidden by default) */}
                    <div className="mt-4 flex justify-between items-center">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${getStatusColor(card.status)}`}>
                        {card.status}
                      </span>
                      <p className="text-gray-400 text-sm">CVV: ***</p>
                    </div>
                  </div>
                </div>

                {/* Card Info & Actions */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-neutral-800">
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Linked Account</p>
                    <p className="text-sm font-mono font-bold text-black dark:text-white">{card.account_number}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Spending Limit</p>
                      <p className="text-sm font-black text-black dark:text-white">{formatCurrency(card.spending_limit)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Spent</p>
                      <p className="text-sm font-black text-black dark:text-white">{formatCurrency(card.current_spent)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleGenerateQR(card)}
                      disabled={card.status !== 'active'}
                      className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Show QR to Pay
                    </button>

                    <div className="flex gap-2">
                      {card.status === 'active' ? (
                        <button
                          onClick={() => handleFreezeCard(card.id)}
                          className="flex-1 px-4 py-2 bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 font-bold rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-950/50 transition text-sm"
                        >
                          Freeze
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnfreezeCard(card.id)}
                          className="flex-1 px-4 py-2 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 font-bold rounded-lg hover:bg-green-200 dark:hover:bg-green-950/50 transition text-sm"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="flex-1 px-4 py-2 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-950/50 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Card Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-200 dark:border-neutral-800 animate-scale-in my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-black dark:text-white">Create Virtual Card</h2>
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

            <form onSubmit={handleCreateCard} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Link to Account <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition font-semibold"
                >
                  <option value="">Select an account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_type.toUpperCase()} - {account.account_number} ({formatCurrency(account.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Card Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.cardHolderName}
                  onChange={(e) => setFormData({ ...formData, cardHolderName: e.target.value })}
                  required
                  minLength={2}
                  maxLength={50}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition uppercase"
                  placeholder="JOHN DOE"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Name as it will appear on the card
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Daily Spending Limit (N$) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 text-lg font-bold">N$</span>
                  </div>
                  <input
                    type="number"
                    value={formData.spendingLimit}
                    onChange={(e) => setFormData({ ...formData, spendingLimit: e.target.value })}
                    required
                    min="100"
                    max="100000"
                    step="100"
                    className="w-full pl-16 pr-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition text-lg font-semibold"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Maximum amount that can be spent per day
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 px-4 py-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <span className="font-bold">Contactless Payments:</span> Use this card for QR code payments at stores. Your card will be created instantly!
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
                  disabled={!formData.accountId || !formData.cardHolderName}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedCard && qrData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-200 dark:border-neutral-800 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-black dark:text-white">Scan to Pay</h2>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setQRData(null);
                  setSelectedCard(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-center mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Show this QR code to the merchant
              </p>
              <p className="text-2xl font-black text-black dark:text-white">
                {selectedCard.card_holder_name}
              </p>
            </div>

            {/* QR Code Display */}
            <div className="bg-white p-8 rounded-2xl shadow-inner mb-6 flex items-center justify-center">
              <QRCodeSVG
                value={qrData.token}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Expiry Timer */}
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 font-semibold">
                  QR code expires in 5 minutes
                </p>
              </div>
            </div>

            {/* Card Info */}
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Card Number</p>
                  <p className="font-mono font-bold text-black dark:text-white">
                    **** {selectedCard.card_number.slice(-4)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Available</p>
                  <p className="font-bold text-black dark:text-white">
                    {formatCurrency(parseFloat(selectedCard.spending_limit) - parseFloat(selectedCard.current_spent))}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowQRModal(false);
                setQRData(null);
                setSelectedCard(null);
              }}
              className="w-full mt-6 px-6 py-3 bg-gray-200 dark:bg-neutral-800 text-black dark:text-white font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-neutral-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VirtualCards;