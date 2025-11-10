import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './styles/main.css';

// Add viewport meta tag for mobile
const ViewportMeta = () => {
  useEffect(() => {
    // Ensure viewport meta tag exists
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(viewport);
    }
  }, []);
  
  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots text-blue-600 mx-auto mb-4">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="text-gray-600">Loading MediGuide...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots text-blue-600 mx-auto mb-4">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="text-gray-600">Loading MediGuide...</p>
        </div>
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  const { user, login, logout, isLoading, isAuthenticated } = useAuth();
  
  // ✅ CRITICAL FIX: Force re-render when auth state changes
  const [authKey, setAuthKey] = useState(0);

  useEffect(() => {
    console.log('App: Auth state changed - isAuthenticated:', isAuthenticated, 'User:', user);
    // Force re-render by changing key when auth state changes
    setAuthKey(prev => prev + 1);
  }, [isAuthenticated, user]);

  // ✅ FIX: Handle login properly
  const handleLogin = async (phoneNumber) => {
    console.log('App: Login attempt with:', phoneNumber);
    const result = await login(phoneNumber);
    console.log('App: Login result - success:', result.success);
    return result;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Router>
      {/* Add Viewport Meta */}
      <ViewportMeta />
      
      {/* ✅ KEY FIX: Add key to force re-render */}
      <div key={authKey} className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login onLogin={handleLogin} />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
