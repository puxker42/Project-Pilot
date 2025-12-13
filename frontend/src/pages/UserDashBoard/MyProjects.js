import React, { useEffect, useState } from 'react';
import './MyProjects.css';
import STATUS_MAP from '../statusMap';
import TopBarWithLogo from './TopBarWithLogo';
import NoDataFound from '../../components/NoDataFound'; // Adjust path as per your structure
import ReportUploadSlot from '../../components/ReportUploadSlot';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const ITEMS_PER_PAGE = 3;

const YEAR_MAP = {
  1: "First Year",
  2: "Second Year",
  3: "Third Year",
  4: "Final Year"
};

function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComponents, setSelectedComponents] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Report State
  const [selectedProjectForReports, setSelectedProjectForReports] = useState(null);
  const [userYear, setUserYear] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch Projects
        const projectsRes = await fetch(`${BASE_URL}/projects-me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        });

        // Fetch User Details for Year
        const userRes = await fetch(`${BASE_URL}/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        });

        if (!projectsRes.ok) throw new Error('Failed to fetch projects');

        const projectsData = await projectsRes.json();
        setProjects(projectsData);
        setFilteredProjects(projectsData);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserYear(userData.data.year); // Assuming response structure { success: true, data: { ... } }
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = projects.filter(
      (project) =>
        project.ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [searchTerm, projects]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProjects = filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const renderTeamMembers = (members) =>
    members.map((m, i) => (
      <span key={i}>
        {m.userID}
        {i < members.length - 1 && ', '}
      </span>
    ));

  const refreshProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/projects-me`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProjects(data);
      setFilteredProjects(data);

      // Update selected project if open
      if (selectedProjectForReports) {
        const updatedProject = data.find(p => p.ID === selectedProjectForReports.ID);
        setSelectedProjectForReports(updatedProject);
      }
    } catch (error) {
      console.error("Error refreshing projects", error);
    }
  };

  const handleUploadReport = async (reportNumber, fileUrl) => {
    if (!selectedProjectForReports) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/projects/${selectedProjectForReports.ID}/report/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reportNumber, fileUrl })
      });
      if (res.ok) {
        await refreshProjects();
      }
    } catch (error) {
      console.error("Upload error", error);
    }
  };

  const handleSendReport = async (reportNumber) => {
    if (!selectedProjectForReports) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/projects/${selectedProjectForReports.ID}/report/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reportNumber })
      });
      if (res.ok) {
        await refreshProjects();
      }
    } catch (error) {
      console.error("Send error", error);
    }
  };

  return (
    <div>
      <TopBarWithLogo title='My Projects' />
      <div className="my-projects">
        <input
          type="text"
          className="search-input"
          placeholder="Search by Project ID or Title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {loading ? (
          <p>Loading...</p>
        ) : projects.length === 0 ? (
          <NoDataFound message="You have not created any projects yet." />
        ) : filteredProjects.length === 0 ? (
          <NoDataFound message="No matching projects found." />
        ) : (
          <>
            <table className="project-table">
              <thead>
                <tr>
                  <th>Project ID / Name</th>
                  <th>Team Members</th>
                  <th>Year</th>
                  <th>View Components</th>
                  <th>Guide Info</th>
                  <th>Status</th>
                  <th>Reports</th>
                </tr>
              </thead>
              <tbody>
                {currentProjects.map((project, index) => (
                  <tr key={project.ID || index}>
                    <td>
                      <strong>{project.ID}</strong>
                      <br />
                      {project.title}
                    </td>
                    <td>{renderTeamMembers(project?.team?.members || [])}</td>
                    <td>{YEAR_MAP[project.year] || 'N/A'}</td>
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
                    <td>
                      <span className={`status-badge status-${project.status}`}>
                        {STATUS_MAP[project.status] ?? 'Unknown Status'}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setSelectedProjectForReports(project)}
                      >
                        Manage Reports
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination-controls">
                <button onClick={handlePrev} disabled={currentPage === 1}>
                  {'<'}
                </button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <button onClick={handleNext} disabled={currentPage === totalPages}>
                  {'>'}
                </button>
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
              <button className="close-btn" onClick={() => setSelectedComponents(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report Management Dialog */}
      <Dialog
        open={!!selectedProjectForReports}
        onClose={() => setSelectedProjectForReports(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Project Reports - {selectedProjectForReports?.title}
        </DialogTitle>
        <DialogContent dividers>
          {/* Report 1 */}
          <ReportUploadSlot
            reportNumber={1}
            projectId={selectedProjectForReports?.ID}
            report={selectedProjectForReports?.reports?.find(r => r.reportNumber === 1)}
            onUpload={handleUploadReport}
            onSendForApproval={handleSendReport}
          />

          {/* Report 2 - Only for Year 4 */}
          {userYear === 4 && (
            <ReportUploadSlot
              reportNumber={2}
              projectId={selectedProjectForReports?.ID}
              report={selectedProjectForReports?.reports?.find(r => r.reportNumber === 2)}
              onUpload={handleUploadReport}
              onSendForApproval={handleSendReport}
              disabled={!selectedProjectForReports?.reports?.find(r => r.reportNumber === 1)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedProjectForReports(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default MyProjects;
