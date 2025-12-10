import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import logo from '../../images/logo.png';
import './TopBarWithLogo.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

async function getUserData() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    return result.data.name;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return "Unknown";
  }
}

function TopBarWithLogo({ title }) {
  const [userName, setUserName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleClickOutside = (e) => {
    if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const name = await getUserData();
      const firstName = name.split(' ')[0];
      setUserName(firstName);
    }
    fetchData();

    // Note: The original listener logic had stale closure issues if not updated. 
    // Since we only have one dropdown now, we can try to fix it or leave as is.
    // For now, I'll attach the listener but be aware of the stale closure if I don't use a ref for state or update dependency.
    // To match original behavior (buggy or not) but cleaner:
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownOpen]); // Added dropdownOpen to dependency to fix stale closure for handleClickOutside

  return (
    <>
      <div className="topbar-with-logo">
        <div className="logo-title-container">
          {/* Sidebar toggle removed */}
          <img src={logo} alt="Logo" className="topbar-logo" />
          <span className="topbar-title">{title}</span>
        </div>
        <div className="user-info1" ref={dropdownRef}>
          <div className="dropdown1" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <p className="pnm1">{userName}</p>
            {dropdownOpen && (
              <div className="dropdown-content1">
                {/* <button onClick={handleProfile}>
                  <FaUserCircle className="icon1" /> Profile
                </button> */}
                <button onClick={handleLogout}>
                  <FaSignOutAlt className="icon1" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
export default TopBarWithLogo;