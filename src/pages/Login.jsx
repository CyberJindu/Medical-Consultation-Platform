import React, { useState } from 'react';
import { Smartphone, Shield, ArrowRight } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Login: Attempting login with:', phoneNumber);
      
      // ✅ FIX: Call onLogin and wait for result
      const result = await onLogin(phoneNumber);
      console.log('Login: Received result:', result);
      
      if (!result.success) {
        setError(result.error || 'Login failed. Please try again.');
      }
      // ✅ If successful, React Router will automatically redirect
      // because the auth state changes and triggers re-render
      
    } catch (err) {
      console.error('Login: Error occurred:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Header */}
        <div className="login-header">
          <h1>MediGuide</h1>
          <p>Your AI-Powered Health Assistant</p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-icon">
              <Smartphone size={32} />
            </div>
            <h2>Welcome Back</h2>
            <p>Enter your phone number to continue</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="phone">
                Phone Number
              </label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value.replace(/\D/g, ''));
                    setError(null); // Clear error when user types
                  }}
                  placeholder="Enter your phone number"
                  className="phone-input"
                  required
                  pattern="[0-9]{10,15}"
                  maxLength={15}
                />
                <Smartphone className="input-icon" size={20} />
              </div>
              <p className="input-help">
                We'll automatically register you if this is your first time
              </p>
            </div>

            <button
              type="submit"
              disabled={!phoneNumber.trim() || isLoading}
              className="login-button"
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="security-note">
            <Shield size={18} />
            <div>
              <p>Your privacy is protected</p>
              <p>
                We use industry-standard security measures to protect your health data and conversations.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;