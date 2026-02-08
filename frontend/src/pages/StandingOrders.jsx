import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { accountAPI, standingOrderAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';

function StandingOrders() {
  const navigate = useNavigate();
  const [standingOrders, setStandingOrders] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountNumber: '',
    recipientName: '',
    amount: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
  });
  const [editFormData, setEditFormData] = useState({
    amount: '',
    frequency: '',
    endDate: '',
    description: '',
  });

  useEffect(() => {
    fetchStandingOrders();
    fetchAccounts();
  }, []);

  const fetchStandingOrders = async () => {
    try {
      const response = await standingOrderAPI.getStandingOrders();
      setStandingOrders(response.data.standingOrders);
    } catch (err) {
      setError('Failed to fetch standing orders');
    } finally {
      setLoading(false);
    }
  };

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

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await standingOrderAPI.createStandingOrder(formData);
      setSuccess('Standing order created successfully!');
      setShowCreateModal(false);
      setFormData({
        fromAccountId: '',
        toAccountNumber: '',
        recipientName: '',
        amount: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: '',
      });
      fetchStandingOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create standing order');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await standingOrderAPI.updateStandingOrder(editingOrder.id, editFormData);
      setSuccess('Standing order updated successfully!');
      setShowEditModal(false);
      setEditingOrder(null);
      fetchStandingOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update standing order');
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setEditFormData({
      amount: order.amount,
      frequency: order.frequency,
      endDate: order.end_date ? order.end_date.split('T')[0] : '',
      description: order.description || '',
    });
    setShowEditModal(true);
  };

  const handleCancel = async (standingOrderId) => {
    if (!window.confirm('Are you sure you want to cancel this standing order?')) {
      return;
    }

    try {
      await standingOrderAPI.cancelStandingOrder(standingOrderId);
      setSuccess('Standing order cancelled successfully!');
      fetchStandingOrders();
    } catch (err) {
      setError('Failed to cancel standing order');
    }
  };

  const handlePause = async (standingOrderId) => {
    try {
      await standingOrderAPI.updateStandingOrder(standingOrderId, { status: 'paused' });
      setSuccess('Standing order paused successfully!');
      fetchStandingOrders();
    } catch (err) {
      setError('Failed to pause standing order');
    }
  };

  const handleResume = async (standingOrderId) => {
    try {
      await standingOrderAPI.updateStandingOrder(standingOrderId, { status: 'active' });
      setSuccess('Standing order resumed successfully!');
      fetchStandingOrders();
    } catch (err) {
      setError('Failed to resume standing order');
    }
  };

  const getFrequencyDisplay = (frequency) => {
    const map = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
    };
    return map[frequency] || frequency;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400',
      paused: 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400',
      cancelled: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400',
      completed: 'bg-gray-100 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400',
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
            <p className="text-black dark:text-white font-medium">Loading standing orders...</p>
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
            <h1 className="text-5xl font-black text-black dark:text-white mb-2">Standing Orders</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Manage your recurring payments</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:scale-105"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Standing Order
          </button>
        </div>

        {error && !showCreateModal && !showEditModal && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg mb-8 animate-fade-in">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 px-6 py-4 rounded-lg mb-8 animate-fade-in">
            {success}
          </div>
        )}

        {standingOrders.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl p-16 text-center border border-gray-200 dark:border-neutral-800">
            <div className="w-24 h-24 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-black dark:text-white mb-3">No standing orders yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Set up automatic recurring payments for rent, subscriptions, or regular transfers
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-3 rounded-xl transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Your First Standing Order
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {standingOrders.map((order, index) => (
              <div
                key={order.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-black dark:text-white mb-1">
                        {order.recipient_name || order.to_account_number}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {order.description || 'Recurring payment'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                        <span className="font-semibold">
                          Next: {new Date(order.next_execution_date).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="font-semibold">{getFrequencyDisplay(order.frequency)}</span>
                        {order.end_date && (
                          <>
                            <span>•</span>
                            <span className="font-semibold">
                              Until: {new Date(order.end_date).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-black text-black dark:text-white mb-2">
                      {formatCurrency(order.amount)}
                    </p>
                    <span className={`inline-block text-xs px-3 py-1.5 rounded-full font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {order.status === 'active' || order.status === 'paused' ? (
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-neutral-800">
                    <button
                      onClick={() => handleEdit(order)}
                      className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-200 dark:hover:bg-blue-950/50 transition"
                    >
                      Edit
                    </button>
                    {order.status === 'active' ? (
                      <button
                        onClick={() => handlePause(order.id)}
                        className="flex-1 px-4 py-2 bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 font-bold rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-950/50 transition"
                      >
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => handleResume(order.id)}
                        className="flex-1 px-4 py-2 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 font-bold rounded-lg hover:bg-green-200 dark:hover:bg-green-950/50 transition"
                      >
                        Resume
                      </button>
                    )}
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="flex-1 px-4 py-2 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-950/50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-2xl w-full p-8 border border-gray-200 dark:border-neutral-800 animate-scale-in my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-black dark:text-white">Create Standing Order</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError('');
                  setFormData({
                    fromAccountId: '',
                    toAccountNumber: '',
                    recipientName: '',
                    amount: '',
                    frequency: 'monthly',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    description: '',
                  });
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  From Account <span className="text-red-500">*</span>
                </label>
                <select
                  name="fromAccountId"
                  value={formData.fromAccountId}
                  onChange={handleChange}
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
                {accounts.length === 0 && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">No accounts available</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Recipient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Recipient Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="toAccountNumber"
                  value={formData.toAccountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, toAccountNumber: value });
                  }}
                  required
                  minLength={10}
                  maxLength={20}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition font-mono text-lg"
                  placeholder="1234567890"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {formData.toAccountNumber.length}/10 characters minimum
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">
                    Amount (N$) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-lg font-bold">N$</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="1.00"
                      max="1000000"
                      className="w-full pl-16 pr-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition text-lg font-semibold"
                      placeholder="0.00"
                    />
                  </div>
                  {formData.amount && parseFloat(formData.amount) > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {getFrequencyDisplay(formData.frequency)}: {formatCurrency(formData.amount)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition font-semibold"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    First payment on {new Date(formData.startDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">
                    End Date <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition"
                  />
                  {formData.endDate ? (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Last payment on {new Date(formData.endDate).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Leave blank for indefinite payments
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Description <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  maxLength={200}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition resize-none"
                  placeholder="e.g., Monthly rent payment"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-right">
                  {formData.description.length}/200 characters
                </p>
              </div>

              {formData.fromAccountId && formData.amount && formData.recipientName && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 animate-fade-in">
                  <h4 className="font-black text-black dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400 font-semibold">To:</span>
                      <span className="text-black dark:text-white font-bold">{formData.recipientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400 font-semibold">Amount:</span>
                      <span className="text-black dark:text-white font-bold">{formatCurrency(formData.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400 font-semibold">Frequency:</span>
                      <span className="text-black dark:text-white font-bold">{getFrequencyDisplay(formData.frequency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400 font-semibold">Starting:</span>
                      <span className="text-black dark:text-white font-bold">
                        {new Date(formData.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    {formData.endDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400 font-semibold">Ending:</span>
                        <span className="text-black dark:text-white font-bold">
                          {new Date(formData.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                    setFormData({
                      fromAccountId: '',
                      toAccountNumber: '',
                      recipientName: '',
                      amount: '',
                      frequency: 'monthly',
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: '',
                      description: '',
                    });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-neutral-700 text-black dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.fromAccountId || !formData.amount || !formData.recipientName || !formData.toAccountNumber || formData.toAccountNumber.length < 10}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Standing Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-2xl w-full p-8 border border-gray-200 dark:border-neutral-800 animate-scale-in my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-black dark:text-white">Edit Standing Order</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingOrder(null);
                  setError('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-black dark:text-white mb-3">Payment Details (Cannot be changed)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Recipient:</span>
                  <span className="text-black dark:text-white font-semibold">{editingOrder.recipient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Account Number:</span>
                  <span className="text-black dark:text-white font-mono font-semibold">{editingOrder.to_account_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                  <span className="text-black dark:text-white font-semibold">
                    {new Date(editingOrder.start_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">
                    Amount (N$) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-lg font-bold">N$</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      value={editFormData.amount}
                      onChange={handleEditChange}
                      required
                      step="0.01"
                      min="1.00"
                      max="1000000"
                      className="w-full pl-16 pr-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition text-lg font-semibold"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="frequency"
                    value={editFormData.frequency}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition font-semibold"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  End Date <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={editFormData.endDate}
                  onChange={handleEditChange}
                  min={new Date(editingOrder.start_date).toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition"
                />
                {editFormData.endDate ? (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Last payment on {new Date(editFormData.endDate).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Leave blank for indefinite payments
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Description <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  rows="3"
                  maxLength={200}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition resize-none"
                  placeholder="e.g., Monthly rent payment"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-right">
                  {editFormData.description.length}/200 characters
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingOrder(null);
                    setError('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-neutral-700 text-black dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StandingOrders;