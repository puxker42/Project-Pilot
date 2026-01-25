import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBarWithLogo from './TopBarWithLogo';
import { toast } from 'react-toastify';
import { FaUserPlus, FaUsers, FaChartLine, FaCogs } from 'react-icons/fa';
import './AdminDashboard.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [showManageUsersModal, setShowManageUsersModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [filterYear, setFilterYear] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Helper mapping for Batch
  const getBatchLabel = (batchNum) => {
    const batches = { 1: 'EN1', 2: 'EN2', 3: 'EN3', 4: 'EN4', 5: 'EN5', 6: 'EN6' };
    return batches[batchNum] || batchNum;
  };

  // Helper mapping for Year
  const getYearLabel = (yearNum) => {
    const years = { 1: '1st', 2: '2nd', 3: '3rd', 4: 'Final' };
    return years[yearNum] ? `${years[yearNum]} Year` : yearNum;
  };

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

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(`${BASE_URL}/get-all-users`);
      const result = await response.json();
      if (result.success) {
        // Filter out 'Developer' role
        const filteredUsers = result.data.filter(user => user.accountType !== "Developer");
        setUsers(filteredUsers);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenManageUsers = () => {
    setShowManageUsersModal(true);
    setFilterYear(''); // Reset filters on open
    setFilterBatch('');
    setFilterRole('');
    fetchUsers();
  };

  // Filter logic
  const getFilteredUsers = () => {
    return users.filter(user => {
      // Role Filter
      if (filterRole && user.accountType !== filterRole) return false;

      // If a filter is set, user must match it. 
      // Non-students (who don't have year/batch) will naturally fail these checks if they are undefined/null,
      // creating an implicit "Show only Students" effect when these filters are active.
      if (filterYear && user.year !== parseInt(filterYear)) return false;
      if (filterBatch && user.batch !== parseInt(filterBatch)) return false;
      return true;
    });
  };

  const displayedUsers = getFilteredUsers();

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
      action: handleOpenManageUsers
    },
    {
      name: 'System Reports',
      icon: <FaChartLine />,
      color: '#36b9cc',
      action: () => navigate('/generate-reports')
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


        {/* Manage Users Modal */}
        {showManageUsersModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content" style={{ maxWidth: '1000px' }}>
              <button
                className="admin-close-button"
                onClick={() => setShowManageUsersModal(false)}
              >
                &times;
              </button>
              <h3 style={{ marginTop: 0, color: '#1a004b', marginBottom: '20px' }}>Manage Users</h3>

              {loadingUsers ? (
                <p>Loading users...</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  {/* Filters */}
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <select
                      className="admin-form-input"
                      style={{ width: 'auto' }}
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      <option value="">All Roles</option>
                      <option value="Student">Student</option>
                      <option value="Instructor">Faculty (Instructor)</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                    </select>

                    <select
                      className="admin-form-input"
                      style={{ width: 'auto' }}
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                    >
                      <option value="">All Years</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">Final Year</option>
                    </select>

                    <select
                      className="admin-form-input"
                      style={{ width: 'auto' }}
                      value={filterBatch}
                      onChange={(e) => setFilterBatch(e.target.value)}
                    >
                      <option value="">All Batches</option>
                      <option value="1">EN1</option>
                      <option value="2">EN2</option>
                      <option value="3">EN3</option>
                      <option value="4">EN4</option>
                      <option value="5">EN5</option>
                      <option value="6">EN6</option>
                    </select>

                    {(filterYear || filterBatch || filterRole) && (
                      <button
                        className="admin-submit-btn"
                        style={{ width: 'auto', marginTop: 0, padding: '10px 20px', backgroundColor: '#858796' }}
                        onClick={() => { setFilterYear(''); setFilterBatch(''); setFilterRole(''); }}
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <table className="admin-users-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>User ID</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Contact</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedUsers.length > 0 ? (
                        displayedUsers.map((user) => (
                          <tr key={user._id}>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.userID}</td>
                            <td>
                              <span className={`user-role-badge role-${user.accountType.toLowerCase()}`}>
                                {user.accountType}
                              </span>
                            </td>
                            <td>{user.email}</td>
                            <td>{user.contactNumber}</td>
                            <td>
                              {user.accountType === 'Student' && (
                                <span>
                                  {user.year ? getYearLabel(user.year) : ''}
                                  {user.batch ? ` (${getBatchLabel(user.batch)})` : ''}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center' }}>No users found matching filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
