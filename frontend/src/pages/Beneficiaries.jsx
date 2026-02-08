import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { beneficiaryAPI } from '../services/api';

function Beneficiaries() {
  const navigate = useNavigate();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);
  const [formData, setFormData] = useState({
    beneficiary_name: '',
    account_number: '',
    bank_name: 'NexBank',
    nickname: '',
  });

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      const response = await beneficiaryAPI.getBeneficiaries();
      setBeneficiaries(response.data.beneficiaries);
    } catch (err) {
      setError('Failed to fetch beneficiaries');
    } finally {
      setLoading(false);
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

    try {
      if (editingBeneficiary) {
        await beneficiaryAPI.updateBeneficiary(editingBeneficiary.id, formData);
      } else {
        await beneficiaryAPI.addBeneficiary(formData);
      }
      
      setFormData({
        beneficiary_name: '',
        account_number: '',
        bank_name: 'NexBank',
        nickname: '',
      });
      setShowAddModal(false);
      setEditingBeneficiary(null);
      fetchBeneficiaries();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save beneficiary');
    }
  };

  const handleEdit = (beneficiary) => {
    setEditingBeneficiary(beneficiary);
    setFormData({
      beneficiary_name: beneficiary.beneficiary_name,
      account_number: beneficiary.account_number,
      bank_name: beneficiary.bank_name,
      nickname: beneficiary.nickname || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (beneficiaryId) => {
    if (!window.confirm('Are you sure you want to delete this beneficiary?')) {
      return;
    }

    try {
      await beneficiaryAPI.deleteBeneficiary(beneficiaryId);
      fetchBeneficiaries();
    } catch (err) {
      setError('Failed to delete beneficiary');
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingBeneficiary(null);
    setFormData({
      beneficiary_name: '',
      account_number: '',
      bank_name: 'NexBank',
      nickname: '',
    });
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-black dark:text-white font-medium">Loading beneficiaries...</p>
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
            <h1 className="text-5xl font-black text-black dark:text-white mb-2">Beneficiaries</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Manage your saved transfer recipients</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:scale-105"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Beneficiary
          </button>
        </div>

        {error && !showAddModal && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {beneficiaries.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl p-16 text-center border border-gray-200 dark:border-neutral-800">
            <div className="w-24 h-24 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-black dark:text-white mb-3">No beneficiaries yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Save people you transfer to frequently for quick and easy future transfers
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-3 rounded-xl transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Your First Beneficiary
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beneficiaries.map((beneficiary, index) => (
              <div
                key={beneficiary.id}
                className="group bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all hover:shadow-2xl animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(beneficiary)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition"
                    >
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(beneficiary.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                    >
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  {beneficiary.nickname && (
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                      {beneficiary.nickname}
                    </p>
                  )}
                  <h3 className="text-xl font-black text-black dark:text-white mb-1">
                    {beneficiary.beneficiary_name}
                  </h3>
                  <p className="text-sm font-mono font-bold text-gray-600 dark:text-gray-400">
                    {beneficiary.account_number}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-neutral-800">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-500">
                    {beneficiary.bank_name}
                  </span>
                  <button
                    onClick={() => navigate('/transfer', { state: { beneficiary } })}
                    className="text-amber-600 dark:text-amber-400 font-bold text-sm hover:text-amber-700 dark:hover:text-amber-500 transition"
                  >
                    Send Money →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-gray-200 dark:border-neutral-800 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-black dark:text-white">
                {editingBeneficiary ? 'Edit Beneficiary' : 'Add Beneficiary'}
              </h2>
              <button
                onClick={closeModal}
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
                  Full Name *
                </label>
                <input
                  type="text"
                  name="beneficiary_name"
                  value={formData.beneficiary_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black dark:text-white transition"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleChange}
                  required
                  disabled={editingBeneficiary}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black dark:text-white transition disabled:opacity-50"
                  placeholder="1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black dark:text-white transition"
                  placeholder="NexBank"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Nickname (Optional)
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black dark:text-white transition"
                  placeholder="Mom, Best Friend, etc."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-neutral-700 text-black dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition shadow-lg"
                >
                  {editingBeneficiary ? 'Update' : 'Add'} Beneficiary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Beneficiaries;