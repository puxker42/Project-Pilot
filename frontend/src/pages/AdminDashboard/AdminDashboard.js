import React, { useState } from 'react';
import TopBarWithLogo from './TopBarWithLogo';
import { toast } from 'react-toastify';
import { FaUserPlus, FaUsers, FaChartLine, FaCogs } from 'react-icons/fa';
import './AdminDashboard.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdminDashboard = () => {
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [formData, setFormData] = useState({
    prefix: 'Dr.',
    firstName: '',
    lastName: '',
    userID: '',
    contactNumber: '',
    email: '',
    password: '',
    cPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.cPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const payload = {
        ...formData,
        firstName: `${formData.prefix} ${formData.firstName}`.trim()
      };

      const response = await fetch(`${BASE_URL}/create-instructor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Instructor added successfully!");
        setShowAddFacultyModal(false);
        setFormData({
          prefix: 'Dr.',
          firstName: '',
          lastName: '',
          userID: '',
          contactNumber: '',
          email: '',
          password: '',
          cPassword: ''
        });
      } else {
        toast.error(result.message || "Failed to add instructor");
      }
    } catch (error) {
      console.error("Error adding instructor:", error);
      toast.error("Something went wrong!");
    }
  };

  const features = [
    {
      name: 'Add Faculty',
      icon: <FaUserPlus />,
      color: '#4e73df',
      action: () => setShowAddFacultyModal(true)
    },
    // Placeholders for future admin features
    {
      name: 'Manage Users',
      icon: <FaUsers />,
      color: '#1cc88a',
      action: () => toast.info("Feature coming soon!")
    },
    {
      name: 'System Reports',
      icon: <FaChartLine />,
      color: '#36b9cc',
      action: () => toast.info("Feature coming soon!")
    },
    {
      name: 'Settings',
      icon: <FaCogs />,
      color: '#f6c23e',
      action: () => toast.info("Feature coming soon!")
    }
  ];

  return (
    <div className="admin-dashboard">
      <TopBarWithLogo title='Admin Dashboard' />

      <div className="admin-content-wrapper" style={{ marginTop: '60px' }}>
        {/* Welcome Section */}
        <div className="admin-welcome-banner">
          <h1>Welcome, Admin</h1>
          <p>Manage users, settings, and system configurations from here.</p>
        </div>

        {/* Quick Actions Grid */}
        <h2 className="admin-section-title">Quick Actions</h2>
        <div className="admin-features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="admin-feature-card"
              onClick={feature.action}
              style={{ borderTop: `4px solid ${feature.color}` }}
            >
              <div className="admin-feature-icon" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="admin-feature-name">{feature.name}</h3>
            </div>
          ))}
        </div>

        {/* Add Faculty Modal */}
        {showAddFacultyModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <button
                className="admin-close-button"
                onClick={() => setShowAddFacultyModal(false)}
              >
                &times;
              </button>
              <h3 style={{ marginTop: 0, color: '#1a004b', marginBottom: '20px' }}>Add New Faculty Member</h3>
              <form onSubmit={handleSubmit}>
                {/* Row 1: Prefix, First Name, Last Name */}
                <div className="admin-form-row">
                  <div className="admin-form-group admin-form-group-small">
                    <label style={{ display: 'block', marginBottom: '5px', color: '#1a004b', fontWeight: 'bold' }}>Prefix</label>
                    <select
                      name="prefix"
                      value={formData.prefix}
                      onChange={handleChange}
                      className="admin-form-input"
                    >
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label style={{ display: 'block', marginBottom: '5px', color: '#1a004b', fontWeight: 'bold' }}>First Name</label>
                    <input type="text" name="firstName" placeholder="Enter First Name" value={formData.firstName} onChange={handleChange} required className="admin-form-input" />
                  </div>
                  <div className="admin-form-group">
                    <label style={{ display: 'block', marginBottom: '5px', color: '#1a004b', fontWeight: 'bold' }}>Last Name</label>
                    <input type="text" name="lastName" placeholder="Enter Last Name" value={formData.lastName} onChange={handleChange} required className="admin-form-input" />
                  </div>
                </div>

                {/* Row 2: Faculty ID, Contact Number */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label style={{ display: 'block', marginBottom: '5px', color: '#1a004b', fontWeight: 'bold' }}>Faculty ID</label>
                    <input type="number" name="userID" placeholder="Enter Faculty ID" value={formData.userID} onChange={handleChange} required className="admin-form-input" />
                  </div>
                  <div className="admin-form-group">
                    <label style={{ display: 'block', marginBottom: '5px', color: '#1a004b', fontWeight: 'bold' }}>Contact Number</label>
                    <input type="text" name="contactNumber" placeholder="Enter Contact Number" value={formData.contactNumber} onChange={handleChange} required className="admin-form-input" />
                  </div>
                </div>

                {/* Row 3: Email (Full Width) */}
                <div className="admin-form-row">
                  <div className="admin-form-group admin-form-group-full">
                    <label style={{ display: 'block', marginBottom: '5px', color: '#1a004b', fontWeight: 'bold' }}>Email Address</label>
                    <input type="email" name="email" placeholder="Enter Email Address" value={formData.email} onChange={handleChange} required className="admin-form-input" />
                  </div>
                </div>

                {/* Row 4: Password, Confirm Password */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label style={{ display: 'block', marginBottom: '5px', color: '#1a004b', fontWeight: 'bold' }}>Password</label>
                    <input type="password" name="password" placeholder="Enter Password" value={formData.password} onChange={handleChange} required className="admin-form-input" />
                  </div>
                  <div className="admin-form-group">
                    <label style={{ display: 'block', marginBottom: '5px', color: '#1a004b', fontWeight: 'bold' }}>Confirm Password</label>
                    <input type="password" name="cPassword" placeholder="Re-enter Password" value={formData.cPassword} onChange={handleChange} required className="admin-form-input" />
                  </div>
                </div>

                <button type="submit" className="admin-submit-btn">Create Faculty Account</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
