import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import NgoDashboard from './pages/NgoDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Smart redirect: sends user to their role-specific dashboard after login
const RoleRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
          <div className="pulse-dot" style={{ width: '18px', height: '18px', margin: '0 auto 10px' }}></div>
          <p style={{ fontSize: '0.9rem' }}>Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'DONOR': return <Navigate to="/donor" replace />;
    case 'NGO':   return <Navigate to="/ngo" replace />;
    case 'ADMIN': return <Navigate to="/admin" replace />;
    default:      return <Navigate to="/login" replace />;
  }
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Root redirects to role dashboard */}
      <Route path="/" element={<RoleRedirect />} />

      {/* Donor Dashboard — DONOR only */}
      <Route
        path="/donor"
        element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <DonorDashboard />
          </ProtectedRoute>
        }
      />

      {/* NGO Dashboard — NGO only */}
      <Route
        path="/ngo"
        element={
          <ProtectedRoute allowedRoles={['NGO']}>
            <NgoDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard — ADMIN only */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1, paddingBottom: '40px' }}>
            <AppRoutes />
          </main>
          <footer style={{
            textAlign: 'center',
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            color: '#4B5563',
            fontSize: '0.8rem',
          }}>
            © 2026 ShareMyMeal — Surplus Food Rescue Network • MERN Stack
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
