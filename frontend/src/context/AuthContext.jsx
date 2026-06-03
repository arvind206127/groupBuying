import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          handleLogout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (error) {
        console.error('User refresh failed:', error);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const isAdmin = user?.portal === 'admin' || user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
  const isDeveloper = user?.portal === 'developer';
  const isRM = user?.role === 'RM';
  const isBuyer = user?.portal === 'user' || user?.role === 'BUYER';
  
  const hasActiveSubscription = user?._count?.subscriptions > 0 || user?.subscriptions?.some(s => s.status === 'ACTIVE');
  const activeSubscription = user?.subscriptions?.find(s => s.status === 'ACTIVE');
  const subscriptionTier = activeSubscription?.plan?.toUpperCase() || 'EXPLORER';

  return (
    <AuthContext.Provider value={{ 
      user, token, loading, handleLogin, handleLogout, isAdmin, isDeveloper, isRM, isBuyer, 
      setUser, hasActiveSubscription, subscriptionTier, refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
