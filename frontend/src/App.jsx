import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AccountDetails from './pages/AccountDetails';
import Beneficiaries from './pages/Beneficiaries';
import Dashboard from './pages/Dashboard';
import DepositWithdraw from './pages/DepositWithdraw';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Register from './pages/Register';
import StandingOrders from './pages/StandingOrders';
import Transfer from './pages/Transfer';
import AdminAccounts from './pages/admin/AdminAccounts';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStandingOrders from './pages/admin/AdminStandingOrders';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminUsers from './pages/admin/AdminUsers';

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  const isAdmin = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin';
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  const AdminRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    if (!isAdmin()) {
      return <Navigate to="/dashboard" />;
    }
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/:accountId"
            element={
              <ProtectedRoute>
                <AccountDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transfer"
            element={
              <ProtectedRoute>
                <Transfer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/beneficiaries"
            element={
              <ProtectedRoute>
                <Beneficiaries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposit-withdraw"
            element={
              <ProtectedRoute>
                <DepositWithdraw />
              </ProtectedRoute>
            }
          />
          <Route
            path="/standing-orders"
            element={
              <ProtectedRoute>
                <StandingOrders />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/accounts"
            element={
              <AdminRoute>
                <AdminAccounts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <AdminRoute>
                <AdminTransactions />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/standing-orders"
            element={
              <AdminRoute>
                <AdminStandingOrders />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;