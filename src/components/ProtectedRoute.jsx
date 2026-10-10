import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, token } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: '#9CA3AF'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="pulse-dot" style={{ width: '20px', height: '20px', margin: '0 auto 12px auto' }}></div>
          <p>Verifying authentication session...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If user role is not allowed on this route, redirect to their role dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'DONOR') return <Navigate to="/donor" replace />;
    if (user.role === 'NGO') return <Navigate to="/ngo" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
