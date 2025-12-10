import React from 'react';
import './InstructorDashboard.css';
import TopBarWithLogo from './TopBarWithLogo';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaChalkboardTeacher, FaClipboardList } from 'react-icons/fa';

const InstructorDashboard = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Project Approvals',
      description: 'Review and approve student project proposals.',
      path: '/projects-to-approve',
      icon: <FaCheckCircle />,
      color: '#4e73df'
    },
    {
      title: 'Guided Projects',
      description: 'View and manage projects under your guidance.',
      path: '/projects-under-me',
      icon: <FaChalkboardTeacher />,
      color: '#1cc88a'
    },
    // Adding a placeholder for future features or if ComponentForm was intended here
    // { 
    //   title: 'Component Requests', 
    //   description: 'View component requests from your students.', 
    //   path: '/component-requests', // Placeholder path
    //   icon: <FaClipboardList />,
    //   color: '#f6c23e'
    // }
  ];

  return (
    <div className="instructor-dashboard">
      <TopBarWithLogo title="Instructor Dashboard" />

      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Instructor Portal</h1>
          <p>Manage your projects and student approvals efficiently.</p>
        </div>

        <div className="actions-grid">
          {actions.map((action, index) => (
            <div
              key={index}
              className="action-card"
              onClick={() => navigate(action.path)}
              style={{ borderTop: `4px solid ${action.color}` }}
            >
              <div className="icon-wrapper" style={{ color: action.color, backgroundColor: `${action.color}15` }}>
                {action.icon}
              </div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
              <button className="instructor-nav-btn" style={{ backgroundColor: action.color }}>
                Go to {action.title} &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
