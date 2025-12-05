import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import NoDataFound from '../../components/NoDataFound';
import { FaUsers, FaChalkboardTeacher, FaBoxOpen, FaProjectDiagram } from 'react-icons/fa';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Dashboard({ projects = [], loading = false }) {
  const [selectedComponents, setSelectedComponents] = useState(null);

  const renderTeamMembers = (members) => {
    if (!members || members.length === 0) return 'No members';
    return members.map(m => m.userID).join(', ');
  };

  return (
    <div className="dashboard-container-student">
      {loading ? (
        <div className="loading-spinner">Loading projects...</div>
      ) : projects.length === 0 ? (
        <NoDataFound message="You have no ongoing/incomplete projects." />
      ) : (
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={project.ID || index} className="project-card">
              <div className="project-header">
                <div className="project-icon">
                  <FaProjectDiagram />
                </div>
                <div className="project-title-section">
                  <span className="project-id">#{project.ID}</span>
                  <h3 className="project-title">{project.title}</h3>
                </div>
              </div>

              <div className="project-details">
                <div className="detail-row">
                  <FaUsers className="detail-icon" />
                  <div className="detail-content">
                    <label>Team Members</label>
                    <p>{renderTeamMembers(project?.team?.members)}</p>
                  </div>
                </div>

                <div className="detail-row">
                  <FaChalkboardTeacher className="detail-icon" />
                  <div className="detail-content">
                    <label>Guide</label>
                    <p>
                      {project?.projectGuide?.firstName && project?.projectGuide?.lastName
                        ? `${project.projectGuide.firstName} ${project.projectGuide.lastName}`
                        : project?.projectGuide?.userID || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="project-actions">
                <button
                  className="view-components-btn"
                  onClick={() => setSelectedComponents(project.components)}
                >
                  <FaBoxOpen /> View Components ({project.components?.length || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedComponents && (
        <div className="modal-overlay" onClick={() => setSelectedComponents(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Project Components</h3>
              <button className="close-btn-icon" onClick={() => setSelectedComponents(null)}>&times;</button>
            </div>
            <div className="table-responsive">
              <table className="component-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Purpose</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Fulfilled</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedComponents.map((comp, idx) => (
                    <tr key={idx}>
                      <td>{comp.id}</td>
                      <td>{comp.name}</td>
                      <td>{comp.purpose}</td>
                      <td>{comp.quantity}</td>
                      <td>
                        <span className={`status-badge ${comp.accepted ? 'accepted' : 'pending'}`}>
                          {comp.accepted ? 'Accepted' : 'Pending'}
                        </span>
                      </td>
                      <td>{comp.fullfilledQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="close-btn" onClick={() => setSelectedComponents(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
