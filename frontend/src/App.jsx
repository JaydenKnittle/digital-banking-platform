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

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;