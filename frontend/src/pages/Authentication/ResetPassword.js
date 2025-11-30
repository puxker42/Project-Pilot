import React, { useState } from 'react';
import logo from '../../images/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaShieldAlt, FaEnvelope, FaArrowLeft, FaKey, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle, FaCheck } from 'react-icons/fa';
import './ResetPassword.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Get token from query params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Password has been reset successfully!');
        navigate('/');
      } else {
        alert(data.error || 'Token expired or invalid.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
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

          {/* Security Icon */}
          <div className="security-icon-container">
            <FaShieldAlt className="security-icon" size={80} color="#8B2E2E" />
            <p className="security-text">Create a strong password to secure your account</p>
          </div>

          {/* Password Requirements */}
          <div className="requirements-box">
            <p className="requirements-title">Password Requirements:</p>
            <ul className="requirements-list">
              <li>At least 6 characters long</li>
              <li>Mix of letters and numbers recommended</li>
              <li>Avoid common passwords</li>
            </ul>
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

          <div className="key-icon">
            <FaKey size={60} color="#8B2E2E" />
          </div>

          <h2 className="form-title">Reset Your Password</h2>
          <p className="form-subtitle">
            Enter your new password below. Make sure it's strong and secure.
          </p>

          <form onSubmit={handleSubmit} className="reset-form">
            {/* New Password Field */}
            <div className="input-group">
              <label className="input-label">New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="Re-enter new password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Password Match Indicator */}
            {newPassword && confirmPassword && (
              <div className={`password-match ${newPassword === confirmPassword ? 'match' : 'no-match'}`}>
                {newPassword === confirmPassword ? (
                  <FaCheckCircle size={16} />
                ) : (
                  <FaTimesCircle size={16} />
                )}
                <span>
                  {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Resetting...
                </>
              ) : (
                <>
                  <FaCheck size={18} />
                  Reset Password
                </>
              )}
            </button>
          </form>

          {/* Copyright */}
          <footer className="reset-footer">
            © 2025 Walchand College of Engineering, Sangli. All rights reserved.<br />
            Designed, Developed & Implemented by <strong>Pushkar Nashikkar</strong>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;