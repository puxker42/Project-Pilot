import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBarWithLogo from './TopBarWithLogo';
import Dashboard from './Dashboard';
import './StudentDashboard.css';
import {
  FaProjectDiagram,
  FaCheckCircle,
  FaHourglassHalf,
  FaPlus,
  FaUsers,
  FaRocket,
  FaInfoCircle,
  FaTimes
} from 'react-icons/fa';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function StudentDashboard() {
  const [user, setUser] = useState({ name: 'Student' });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        };

        // Fetch User Data
        const userRes = await fetch(`${BASE_URL}/me`, { headers });
        const userData = await userRes.json();
        if (userRes.ok) setUser(userData.data || { name: 'Student' });

        // Fetch Projects
        const projectRes = await fetch(`${BASE_URL}/projects-me`, { headers });
        const projectData = await projectRes.json();
        if (projectRes.ok) setProjects(projectData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate Stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => !p.isCompleted).length;
  const completedProjects = projects.filter(p => p.isCompleted).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="student-dashboard-container">
      <TopBarWithLogo title="Student Dashboard" />

      <div className="dashboard-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-text">
            <h1>{getGreeting()}, {user.name.split(' ')[0]}! 👋</h1>
            <p>Here's what's happening with your projects today.</p>
          </div>
          <div className="date-badge">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon"><FaProjectDiagram /></div>
            <div className="stat-info">
              <h3>{totalProjects}</h3>
              <p>Total Projects</p>
            </div>
          </div>
          <div className="stat-card active">
            <div className="stat-icon"><FaHourglassHalf /></div>
            <div className="stat-info">
              <h3>{activeProjects}</h3>
              <p>In Progress</p>
            </div>
          </div>
          <div className="stat-card completed">
            <div className="stat-icon"><FaCheckCircle /></div>
            <div className="stat-info">
              <h3>{completedProjects}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="main-dashboard-grid">

          {/* Left Column: Projects */}
          <div className="projects-section">
            <div className="section-header">
              <h2><FaRocket className="section-icon" /> Active Projects</h2>
            </div>
            <Dashboard projects={projects.filter(p => !p.isCompleted)} loading={loading} />
          </div>

          {/* Right Column: Quick Actions */}
          <div className="sidebar-section">
            <div className="dashboard-card quick-actions-card">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="action-btn primary" onClick={() => navigate('/create-project?new=true')}>
                  <div className="btn-icon"><FaPlus /></div>
                  <span>New Project</span>
                </button>
                <button className="action-btn secondary" onClick={() => navigate('/create-team')}>
                  <div className="btn-icon"><FaUsers /></div>
                  <span>Create Team</span>
                </button>
              </div>

              {/* Instructions Link */}
              <div className="instructions-link-wrapper">
                <button className="instructions-link" onClick={() => setShowInstructions(true)}>
                  <FaInfoCircle className="info-icon" />
                  <span>View Important Instructions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="modal-overlay" onClick={() => setShowInstructions(false)}>
          <div className="modal-content instructions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaInfoCircle /> Important Instructions</h3>
              <button className="close-btn-icon" onClick={() => setShowInstructions(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <ul className="instruction-list">
                <li>
                  Create your <strong>Team</strong> before initiating any project. A valid <strong>Team ID</strong> is required.
                </li>
                <li>
                  Ensure that <strong>all team members</strong> have completed their current or previous projects.
                </li>
                <li>
                  If any team member has an unfinished project, <strong>Admin approval</strong> is mandatory.
                </li>
                <li>
                  For Support Reach Admin or Raise your query at <a href="mailto:project.piloteg@gmail.com">project.piloteg@gmail.com</a>
                </li>
              </ul>
            </div>
            <div className="modal-footer">
              <button className="close-btn" onClick={() => setShowInstructions(false)}>Got it!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
