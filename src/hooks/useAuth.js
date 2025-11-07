import { useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('useAuth: Checking initial authentication state');
    // Check if user is already logged in on app start
    const token = localStorage.getItem('mediguide_token');
    const userData = localStorage.getItem('mediguide_user');
    
    if (token && userData) {
      try {
        console.log('useAuth: Found existing user data');
        setUser(JSON.parse(userData));
        
        // Verify token is still valid by fetching profile
        authAPI.getProfile().then(response => {
          console.log('useAuth: Token verified, updating user:', response.data.data.user);
          setUser(response.data.data.user);
        }).catch((error) => {
          console.log('useAuth: Token invalid, logging out:', error);
          // Token invalid, logout
          logout();
        });
      } catch (err) {
        console.error('useAuth: Error parsing user data:', err);
        logout();
      }
    } else {
      console.log('useAuth: No existing authentication found');
    }
    setIsLoading(false);
  }, []);

  const login = async (phoneNumber) => {
    try {
      console.log('useAuth: Starting login process for:', phoneNumber);
      setIsLoading(true);
      setError(null);
      
      // Validate phone number
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        throw new Error('Please enter a valid phone number');
      }

      console.log('useAuth: Calling backend API...');
      const response = await authAPI.login(cleanPhone);
      console.log('useAuth: Backend response received:', response.data);
      
      const { token, user: userData } = response.data.data;
      
      // Store in localStorage
      localStorage.setItem('mediguide_token', token);
      localStorage.setItem('mediguide_user', JSON.stringify(userData));
      
      // ✅ CRITICAL: Update state to trigger re-render
      console.log('useAuth: Setting user state and storing token');
      setUser(userData);
      
      return { success: true, user: userData };
      
    } catch (err) {
      console.error('useAuth: Login error:', err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      console.log('useAuth: Login process completed');
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('useAuth: Logging out user');
    localStorage.removeItem('mediguide_token');
    localStorage.removeItem('mediguide_user');
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    clearError,
    isAuthenticated: !!user
  };
};