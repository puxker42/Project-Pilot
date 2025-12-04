import React, { useState } from 'react';
import logo from '../../images/logo.png';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Login() {
  const [userID, setuserID] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const bodyData = JSON.stringify({ userID, password });

      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyData,
      });

      const data = await res.json();
      if (res.ok) {
        console.log(data);
        localStorage.setItem('token', data.token);
        const tokenParam = `?token=${encodeURIComponent(data.token)}`;
        localStorage.setItem('user', JSON.stringify(data.user));

        switch (data.user.role) {
          case 'Admin':
            navigate(`/admin-dashboard${tokenParam}`);
            localStorage.setItem('homePath', `/admin-dashboard${tokenParam}`);
            break;
          case 'Manager':
            navigate(`/manager-dashboard${tokenParam}`);
            localStorage.setItem('homePath', `/manager-dashboard${tokenParam}`);
            break;
          case 'Instructor':
            navigate(`/instructor-dashboard${tokenParam}`);
            localStorage.setItem('homePath', `/instructor-dashboard${tokenParam}`);
            break;
          default:
            navigate(`/student-dashboard${tokenParam}`);
            localStorage.setItem('homePath', `/student-dashboard${tokenParam}`);
            break;
        }
      } else {
        console.log('Login failed:', data);
        navigate('/log-fail');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Something went wrong. Please try again!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setuserID('');
    setPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Left Section */}
        <div className="left-section">
          {/* College Logo */}
          <div className="logo-container">
            <img src={logo} alt="Walchand College Logo" className="college-logo" width="100" height="100" />
          </div>

          {/* College Name */}
          <h1 className="college-name">
            Walchand College of<br />Engineering, Sangli
          </h1>

          <div className="department-info">
            <p className="department-name">Department of Electronics Engineering</p>
            <p className="tool-name">Project Management Tool</p>
          </div>

          {/* Powered By
          <p className="powered-by-text">Powered by</p>
          <div className="cas-logo">
            <div className="cas-text">Prj. Pilot</div>
            <div className="erp-text">v1.0</div>
          </div> */}

          {/* Contact Info */}
          <div className="contact-info">
            <p className="contact-title">Need Help?</p>
            <div className="email-container">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#666">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span className="email-text">projectpiloteg@gmail.com</span>
            </div>
          </div>

          {/* Decorative Element */}
          <div className="decorative-stripe"></div>
        </div>

        {/* Right Section - Login Form */}
        <div className="right-section">
          <h2 className="form-title">Project Management System</h2>
          <p className="form-subtitle">Please log in to your account</p>

          <form onSubmit={handleSubmit} className="login-form">
            {/* User ID Field */}
            <div className="input-group">
              <label className="input-label">UserID</label>
              <input
                type="text"
                value={userID}
                onChange={(e) => setuserID(e.target.value)}
                className="form-input"
                placeholder="Enter your User ID"
                required
              />
            </div>

            {/* Password Field */}
            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your Password"
                required
              />
            </div>

            {/* reCAPTCHA */}


            {/* Buttons */}
            <div className="button-container">
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <button
                type="button"
                className="reset-button"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </button>
            </div>

            {/* Forgot Password */}
            <a href="/auth/forgot-pass" className="forgot-password">
              Forgot Password?
            </a>
          </form>

        </div>
      </div>
    </div>
  );
}

export default Login;