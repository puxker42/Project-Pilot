import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/UserDashboard.css';
import logo from '../images/logo.png';
import { FiSearch } from 'react-icons/fi';

const UserDashboard = () => {
  const navigate = useNavigate();

  const features = [
    { name: 'Projects Associated', path: '/projects' },
    { name: 'Create Project', path: '/create-project' },
    { name: 'Update Project', path: '/update-project' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };
  return (
    <div className="user-dashboard">
      {/* Navbar */}
      <div className="navbar">
        <img src={logo} alt="Logo" className="navbar-logo" />
        <h3>Welcome to Electronics Projects Portal</h3>
        <div className="nav-buttons">
          {features.map((feature, index) => (
            <button
              key={index}
              className="nav-button"
              onClick={() => handleNavigation(feature.path)}
            >
              {feature.name}
            </button>
          ))}
        </div>
      </div>


    </div>
  );
  //  return (
  //    <div className="app-container">
  //      <Sidebar />
  //      <div className="main-section">
  //        <Topbar />
  //        <Dashboard />
  //      </div>
  //    </div>
  //  );
};

export default UserDashboard;
