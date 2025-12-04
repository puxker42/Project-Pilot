import React, { useState } from 'react';
import logo from '../../images/logo.png';
import { useNavigate } from 'react-router-dom';
import { FaInfoCircle, FaEnvelope, FaArrowLeft, FaKey, FaPaperPlane } from 'react-icons/fa';
import './ForgotPassword.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function ForgotPassword() {
  const [userID, setUserID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Password reset instructions sent!');
        navigate('/');
      } else {
        alert(data.error || 'Invalid User ID or server error.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        {/* Left Section */}
        <div className="left-section">
          {/* College Logo */}
          <div className="logo-container">
            <img src={logo} alt="Walchand College Logo" className="college-logo" />
          </div>

          {/* College Name */}
          <h1 className="college-name">
            Walchand College of<br />Engineering, Sangli
          </h1>

          <div className="department-info">
            <p className="department-name">Department of Electronics Engineering</p>
            <p className="tool-name">Project Management Tool</p>
          </div>

          {/* Info Icon */}
          <div className="info-icon-container">
            <FaInfoCircle className="info-icon" size={80} color="#8B2E2E" />
            <p className="info-text">Enter your User ID to receive password reset instructions</p>
          </div>

          {/* Contact Info */}
          <div className="contact-info">
            <p className="contact-title">Need Help?</p>
            <div className="email-container">
              <FaEnvelope size={16} color="#666" />
              <span className="email-text">support@walchandsangli.ac.in</span>
            </div>
          </div>

          {/* Decorative Element */}
          <div className="decorative-stripe"></div>
        </div>

        {/* Right Section - Reset Form */}
        <div className="right-section">
          {/* Back Button */}
          <button
            className="back-button"
            onClick={() => navigate('/')}
            type="button"
          >
            <FaArrowLeft size={16} />
            Back to Login
          </button>

          <div className="reset-icon">
            <FaKey size={60} color="#8B2E2E" />
          </div>

          <h2 className="form-title">Forgot Password?</h2>
          <p className="form-subtitle">
            Don't worry! Enter your User ID and we'll send you instructions to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="reset-form">
            {/* User ID Field */}
            <div className="input-group">
              <label className="input-label">User ID</label>
              <input
                type="text"
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
                className="form-input"
                placeholder="Enter your User ID"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane size={18} />
                  Request Reset Link
                </>
              )}
            </button>

            {/* Help Text */}
            <div className="help-text">
              <FaInfoCircle size={16} color="#666" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                If you don't receive an email within 5 minutes, please check your spam folder or contact support.
              </span>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;