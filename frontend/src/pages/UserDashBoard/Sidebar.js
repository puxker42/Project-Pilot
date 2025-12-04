import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import logo from '../../images/logo.png';

// Async function to get user data
async function getUserData() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('User data:', result);
    return result.name;

  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return "Unknown User";
  }
}

function Sidebar() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  // Fetch user data on component mount
  useEffect(() => {
    async function fetchData() {
      const name = await getUserData();
      setUserName(name);
    }
    fetchData();
  }, []);

  // Navigation handlers
  const handleTeamCreator = () => navigate('/create-team');
  const handleProjectCreator = () => navigate('/create-project?new=true');
  const handleMyProjects = () => navigate('/my-projects');
  const handleTeam = () => navigate('/my-teams');

  // Logout handler
  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Something went wrong while logging out.');
    }
  };

  return (
    <div className="sidebar">
      <div>
        <div className="logo-section">
          <img src={logo} alt="WCE" className="logo-img" />
          <h3 className="logo-text">WCE</h3>
        </div>

        <h4 className="dashboard-title">Student Dashboard</h4>

        <div className="sidebar-buttons">
          <button onClick={handleTeamCreator}>Team Creator Wizard</button>
          <hr />
          <button onClick={handleProjectCreator}>Project Creator Wizard</button>
          <hr />
          <button onClick={handleMyProjects}>My Projects</button>
          <hr />
          <button onClick={handleTeam}>Teams</button>
          <hr />
        </div>
      </div>

      {/* <div className="profile-card">
        {/* <p className="profile-name">{userName}</p> */}
      {/* <button className="profile-btn" onClick={handleProfile}>Profile</button> */}
      {/* <button className="logout-btn" onClick={handleLogout}>Logout</button> */}
      {/* </div> */}
    </div>
  );
}

export default Sidebar;
