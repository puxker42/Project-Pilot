import React, { useState } from 'react';
import logo from '../../images/logo.png';
import './land.css';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Landing() {
  const [userID, setuserID] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bodyData = JSON.stringify({ userID, password });

      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: bodyData,
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        const tokenParam = `?token=${encodeURIComponent(data.token)}`;
        localStorage.setItem('user', JSON.stringify(data.user));
        switch (data.user.role) {
          case 'Admin':
            navigate(`/admin-dashboard${tokenParam}`);
            break;
          case 'Manager':
            navigate(`/manager-dashboard${tokenParam}`);
            break;
          case 'Instructor':
            navigate(`/instructor-dashboard${tokenParam}`);
            break;
          default:
            navigate(`/student-dashboard${tokenParam}`);
            break;
        }
      } else {
        console.log('Login failed:', data);
        navigate('/log-fail');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Something went wrong. Please try again!');
    }
  };

  return (
    <div className='pr'>
      <div className='top'>
        <img className='logo1' src={logo} alt='logo' />
        <h1>DKTE, Sangli</h1>
        <h2>Department Of Electronics Engineering</h2>
        <h3>Project Management Tool</h3>
      </div>
      <div>
        <form className='form' onSubmit={handleSubmit}>
          <div className='abc'>
            <label>User ID:</label>
            <input
              type='text'
              value={userID}
              onChange={(e) => setuserID(e.target.value)}
              required
            />
          </div>
          <div className='abc'>
            <label>Password:</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Forgot Password Link */}
          <div className='forgot-password'>
            <a href='/forgot-password'>Forgot Password?</a>
          </div>

          <input type='submit' value='Login' />
        </form>
      </div>

    </div>
  );
}

export default Landing;
