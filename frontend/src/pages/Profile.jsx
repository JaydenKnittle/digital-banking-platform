import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authAPI } from '../services/api';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileData, setProfileData] = useState({
    full_name: '',
    phone_number: '',
    date_of_birth: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data.user);
      setProfileData({
        full_name: response.data.user.full_name,
        phone_number: response.data.user.phone_number || '',
        date_of_birth: response.data.user.date_of_birth ? response.data.user.date_of_birth.split('T')[0] : '',
      });
    } catch (err) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data.user);
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...response.data.user }));
      
      setSuccess('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    try {
      await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setSuccess('Password changed successfully');
      setChangingPassword(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-black dark:text-white font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 mb-8 transition font-semibold group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-5xl font-black text-black dark:text-white mb-3">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Manage your account information</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg mb-8 animate-fade-in">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 px-6 py-4 rounded-lg mb-8 animate-fade-in">
            {success}
          </div>
        )}

        <div className="grid gap-8">
          {/* Profile Information Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-neutral-800 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-black dark:text-white">Personal Information</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-500 font-bold transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={profileData.full_name}
                    onChange={handleProfileChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black dark:text-white transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-800 rounded-xl text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={profileData.phone_number}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black dark:text-white transition"
                    placeholder="+264 81 234 5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={profileData.date_of_birth}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black dark:text-white transition"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setProfileData({
                        full_name: user.full_name,
                        phone_number: user.phone_number || '',
                        date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
                      });
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
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-xl font-black text-black dark:text-white">{user?.full_name}</p>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-xl font-black text-black dark:text-white">{user?.email}</p>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                  <p className="text-xl font-black text-black dark:text-white">{user?.phone_number || 'Not set'}</p>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Date of Birth</p>
                  <p className="text-xl font-black text-black dark:text-white">{formatDate(user?.date_of_birth)}</p>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Member Since</p>
                  <p className="text-xl font-black text-black dark:text-white">{formatDate(user?.created_at)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-neutral-800 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-black dark:text-white">Security</h2>
              {!changingPassword && (
                <button
                  onClick={() => setChangingPassword(true)}
                  className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-500 font-bold transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
                </button>
              )}
            </div>

            {changingPassword ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">Current Password</label>
                  <input
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black dark:text-white transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">New Password</label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black dark:text-white transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black dark:text-white transition"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setChangingPassword(false);
                      setPasswordData({
                        current_password: '',
                        new_password: '',
                        confirm_password: '',
                      });
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-neutral-700 text-black dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition shadow-lg"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Keep your account secure by using a strong password and changing it regularly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;