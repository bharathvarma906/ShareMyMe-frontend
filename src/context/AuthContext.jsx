import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sharemymeal_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount: if token exists, verify and load user profile
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session invalid, logging out:', err?.response?.data?.message || err.message);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);  // run once on mount only

  // Register a new account
  const register = async (userData) => {
    setError(null);
    try {
      const res = await API.post('/auth/register', userData);
      if (res.data.success) {
        const { token: newToken, ...userInfo } = res.data.data;
        _setSession(newToken, userInfo);
        return { success: true, message: res.data.message, user: userInfo };
      }

      const msg = res.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      return { success: false, message: msg };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Login with email + password
  const login = async (credentials) => {
    setError(null);
    try {
      const res = await API.post('/auth/login', credentials);
      if (res.data.success) {
        const { token: newToken, ...userInfo } = res.data.data;
        _setSession(newToken, userInfo);
        return { success: true, message: res.data.message, user: userInfo };
      }

      const msg = res.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, message: msg };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Internal helper to save token + user state
  const _setSession = (newToken, userInfo) => {
    localStorage.setItem('sharemymeal_token', newToken);
    setToken(newToken);
    setUser(userInfo);
  };

  // Clear session
  const logout = () => {
    localStorage.removeItem('sharemymeal_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Determine redirect path after login based on role
  const getDashboardPath = (roleOrUser) => {
    const role = typeof roleOrUser === 'string' ? roleOrUser : roleOrUser?.role;
    switch (role) {
      case 'DONOR': return '/donor';
      case 'NGO':   return '/ngo';
      case 'ADMIN': return '/admin';
      default:      return '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        setError,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
