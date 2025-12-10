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

      <div className="student-dashboard-content">
        {/* Welcome Section */}
        <div className="student-welcome-section">
          <div className="student-welcome-text">
            <h1>{getGreeting()}, {user.name.split(' ')[0]}! 👋</h1>
            <p>Here's what's happening with your projects today.</p>
          </div>
          <div className="student-date-badge">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Stats Row */}
        <div className="student-stats-grid">
          <div className="student-stat-card total">
            <div className="student-stat-icon"><FaProjectDiagram /></div>
            <div className="student-stat-info">
              <h3>{totalProjects}</h3>
              <p>Total Projects</p>
            </div>
          </div>
          <div className="student-stat-card active">
            <div className="student-stat-icon"><FaHourglassHalf /></div>
            <div className="student-stat-info">
              <h3>{activeProjects}</h3>
              <p>In Progress</p>
            </div>
          </div>
          <div className="student-stat-card completed">
            <div className="student-stat-icon"><FaCheckCircle /></div>
            <div className="student-stat-info">
              <h3>{completedProjects}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="student-main-grid">

          {/* Left Column: Projects */}
          <div className="student-projects-section">
            <div className="student-section-header">
              <h2><FaRocket className="student-section-icon" /> Active Projects</h2>
            </div>
            <Dashboard projects={projects.filter(p => !p.isCompleted)} loading={loading} />
          </div>

          {/* Right Column: Quick Actions */}
          <div className="student-sidebar-section">
            <div className="student-card student-quick-actions-card">
              <h3>Quick Actions</h3>
              <div className="student-action-buttons">
                <button className="student-action-btn primary" onClick={() => navigate('/create-project?new=true')}>
                  <div className="student-btn-icon"><FaPlus /></div>
                  <span>New Project</span>
                </button>
                <button className="student-action-btn secondary" onClick={() => navigate('/create-team')}>
                  <div className="student-btn-icon"><FaUsers /></div>
                  <span>Create Team</span>
                </button>
              </div>

              {/* Instructions Link */}
              <div className="student-instructions-link-wrapper">
                <button className="student-instructions-link" onClick={() => setShowInstructions(true)}>
                  <FaInfoCircle className="student-info-icon" />
                  <span>View Important Instructions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="student-modal-overlay" onClick={() => setShowInstructions(false)}>
          <div className="student-modal-content student-instructions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="student-modal-header">
              <h3><FaInfoCircle /> Important Instructions</h3>
              <button className="student-close-btn-icon" onClick={() => setShowInstructions(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="student-modal-body">
              <ul className="student-instruction-list">
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
            <div className="student-modal-footer">
              <button className="student-close-btn" onClick={() => setShowInstructions(false)}>Got it!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
