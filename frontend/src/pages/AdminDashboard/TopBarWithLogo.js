import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const sidebarActions = [
    { name: 'Team Creator Wizard', path: '/create-team' },
    { name: 'Project Creator Wizard', path: '/create-project?new=true' },
    { name: 'My Projects', path: '/my-projects' },
    { name: 'Teams', path: '/my-teams' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleClickOutside = (e) => {
    if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setSidebarOpen(false);
    }

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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
// onClick={() => navigate(localStorage.getItem('homepath'))}
  return (
    <>
      <div className="topbar-with-logo">
        <div className="logo-title-container">
          <FaBars className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)} />
          <img  src={logo} alt="Logo" className="topbar-logo" />
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

      <div ref={sidebarRef} className={`sidebar-collapse ${sidebarOpen ? 'open' : ''}`}>
        {sidebarActions.map((action, index) => (
          <button key={index} onClick={() => navigate(action.path)}>
            {action.name}
          </button>
        ))}
      </div>
    </>
  );
}
export default TopBarWithLogo;