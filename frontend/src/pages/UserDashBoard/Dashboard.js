import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import NoDataFound from '../../components/NoDataFound'; // Adjust the path based on your project structure

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const ITEMS_PER_PAGE = 3;

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComponents, setSelectedComponents] = useState(null);


  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/projects-me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch projects');

        const data = await response.json();
        const incompleteProjects = data.filter(project => !project.isCompleted);
        setProjects(incompleteProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProjects = projects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const renderTeamMembers = (members) =>
    members.map((m, i) => (
      <span key={i}>
        {m.userID}
        {i < members.length - 1 && ', '}
      </span>
    ));



  return (
    <div className="dashboard">
      {loading ? (
        <p>Loading...</p>
      ) : projects.length === 0 ? (
        <NoDataFound message="You have no ongoing/incomplete projects." />
      ) : (
        <>
          <table className="project-table">
            <thead>
              <tr>
                <th>Project ID / Name</th>
                <th>Team Members</th>
                <th>View Components</th>
                <th>Guide Info</th>

              </tr>
            </thead>
            <tbody>
              {currentProjects.map((project, index) => (
                <tr key={project.ID || index}>
                  <td>
                    <strong>{project.ID}</strong><br />
                    {project.title}
                  </td>
                  <td>{renderTeamMembers(project?.team?.members || [])}</td>
                  <td>
                    <a
                      className="view-link"
                      onClick={() => setSelectedComponents(project.components)}
                    >
                      View Components ({project.components?.length || 0})
                    </a>
                  </td>
                  <td>
                    <div>{project?.projectGuide?.userID || 'N/A'}</div>
                    <div>
                      {project?.projectGuide?.firstName && project?.projectGuide?.lastName
                        ? `${project.projectGuide.firstName} ${project.projectGuide.lastName}`
                        : 'Unknown'}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button onClick={handlePrev} disabled={currentPage === 1}>{'<'}</button>
              <span>{currentPage} / {totalPages}</span>
              <button onClick={handleNext} disabled={currentPage === totalPages}>{'>'}</button>
            </div>
          )}
        </>
      )}

      {selectedComponents && (
        <div className="modal-overlay" onClick={() => setSelectedComponents(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Components</h3>
            <table className="component-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Purpose</th>
                  <th>Qty</th>
                  <th>Accepted</th>
                  <th>Fullfilled</th>
                </tr>
              </thead>
              <tbody>
                {selectedComponents.map((comp, idx) => (
                  <tr key={idx}>
                    <td>{comp.id}</td>
                    <td>{comp.name}</td>
                    <td>{comp.purpose}</td>
                    <td>{comp.quantity}</td>
                    <td>{comp.accepted ? 'Yes' : 'No'}</td>
                    <td>{comp.fullfilledQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="close-btn" onClick={() => setSelectedComponents(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
