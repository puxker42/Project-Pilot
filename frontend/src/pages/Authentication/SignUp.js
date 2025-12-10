import React, { useState } from 'react';
import logo from '../../images/logo.png';
import './signup.css';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function SignUp() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const passingYears = Array.from({ length: 5 }, (_, i) => currentYear + i);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userID: '',
    contactNumber: '',
    email: '',
    password: '',
    cPassword: '',
    accountType: '',
    batch: '',
    passingYear: '',
    academicYear: '',
    otp: ''
  });

  const [error, setError] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'accountType' && value !== 'Student') {
      setFormData((prev) => ({
        ...prev,
        accountType: value,
        batch: '',
        passingYear: '',
        academicYear: '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      setError("Please enter your email first.");
      return;
    }
    console.log(BASE_URL);
    try {
      const res = await fetch(`${BASE_URL}/auth/sendotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const result = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setShowOtpInput(true);
        setError('');
      } else {
        setError(result.message || "Failed to send OTP.");
      }
    } catch (err) {
      setError("Something went wrong while sending OTP.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        navigate('/sign-suc');
      } else {
        navigate('/sign-fail');
      }
    } catch (err) {
      setError('Something went wrong!');
    }
  };

  return (
    <div className='signup-container'>
      <div className='signup-card'>
        {/* Left Section */}
        <div className='left-section'>
          <div className='logo-container'>
            <img src={logo} alt='Walchand College Logo' className='college-logo' width='100' height='100' />
          </div>

          <h1 className='college-name'>
            Walchand College of<br />Engineering, Sangli
          </h1>

          <div className='department-info'>
            <p className='department-name'>Department of Electronics Engineering</p>
            <p className='tool-name'>Project Management Tool</p>
          </div>

          <div className='contact-info'>
            <p className='contact-title'>Need Help?</p>
            <div className='email-container'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='#666'>
                <path d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' />
              </svg>
              <span className='email-text'>projectpiloteg@gmail.com</span>
            </div>
          </div>

          <div className='decorative-stripe'></div>
        </div>

        {/* Right Section */}
        <div className='right-section'>
          <h2 className='form-title'>Create Account</h2>
          <p className='form-subtitle'>Join the Project Management System</p>

          <form className='signup-form' onSubmit={handleSubmit}>
            {[{ label: 'First Name', name: 'firstName', type: 'text' },
            { label: 'Last Name', name: 'lastName', type: 'text' },
            { label: 'User ID', name: 'userID', type: 'number' },
            { label: 'Contact Number', name: 'contactNumber', type: 'text' },
            { label: 'Email', name: 'email', type: 'email' },
            { label: 'Password', name: 'password', type: 'password' },
            { label: 'Confirm Password', name: 'cPassword', type: 'password' }
            ].map((field) => (
              <div className='input-group' key={field.name}>
                <label className='input-label'>{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className='form-input'
                  placeholder={`Enter your ${field.label}`}
                  required
                />
              </div>
            ))}

            <div className='input-group'>
              <label className='input-label'>Account Type</label>
              <select name='accountType' value={formData.accountType} onChange={handleChange} className='form-input' required>
                <option value=''>-- Select Role --</option>
                <option value='Student'>Student</option>
                {/* <option value='Instructor'>Instructor</option> */}
                {/* <option value='Admin'>Admin</option>
                <option value='Manager'>Manager</option> */}
              </select>
            </div>

            {formData.accountType === 'Student' && (
              <>
                <div className='input-group'>
                  <label className='input-label'>Batch (EN-)</label>
                  <select name='batch' value={formData.batch} onChange={handleChange} className='form-input' required>
                    <option value=''>-- Select Batch --</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <option key={num} value={`EN-${num}`}>{`EN-${num}`}</option>
                    ))}
                  </select>
                </div>

                <div className='input-group'>
                  <label className='input-label'>Passing Year</label>
                  <select name='passingYear' value={formData.passingYear} onChange={handleChange} className='form-input' required>
                    <option value=''>-- Select Year --</option>
                    {passingYears.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className='input-group'>
                  <label className='input-label'>Academic Year</label>
                  <select name='academicYear' value={formData.academicYear} onChange={handleChange} className='form-input' required>
                    <option value=''>-- Select Academic Year --</option>
                    {[1, 2, 3, 4].map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {showOtpInput && (
              <>
                <p className='otp-success-msg'>OTP sent successfully! Please check your email.</p>
                <div className='input-group'>
                  <label className='input-label'>Enter OTP</label>
                  <input
                    type='text'
                    name='otp'
                    maxLength='6'
                    value={formData.otp}
                    onChange={handleChange}
                    className='form-input'
                    placeholder='6-character OTP'
                    required
                  />
                </div>
              </>
            )}

            {error && <p className='error-text'>{error}</p>}

            {!otpSent ? (
              <button type='button' className='signup-button' onClick={handleSendOTP}>
                Verify Email
              </button>
            ) : (
              <input type='submit' value='Verify & Register' className='signup-button' />
            )}
          </form>


        </div>
      </div>
    </div>
  );
}

export default SignUp;
