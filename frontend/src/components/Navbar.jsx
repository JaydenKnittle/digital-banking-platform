import { useNavigate } from 'react-router-dom';
import { useTheme } from '../utils/ThemeContext';

function Navbar() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div onClick={() => navigate('/dashboard')} className="cursor-pointer">
            <h1 className="text-3xl font-black text-amber-600">NexBank</h1>
          </div>

          <div className="flex items-center gap-6">
            <div 
              className="text-right hidden sm:block cursor-pointer" 
              onClick={() => navigate('/profile')}
            >
              <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back,</p>
              <p className="text-sm font-bold text-black dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition">
                {user.full_name}
              </p>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
            >
              {isDark ? (
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;