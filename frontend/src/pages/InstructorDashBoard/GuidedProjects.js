import React, { useEffect, useState } from 'react';
import './GuidedProjects.css';
import TopBarWithLogo from './TopBarWithLogo';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const YEAR_MAP = {
  1: "First Year",
  2: "Second Year",
  3: "Third Year",
  4: "Final Year"
};

const BATCH_MAP = {
  1: "EN-1",
  2: "EN-2",
  3: "EN-3",
  4: "EN-4",
  5: "EN-5",
  6: "EN-6"
};

const GuidedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/get-guided-projects`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setProjects(data.projects);
          setFilteredProjects(data.projects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    let temp = [...projects];

    if (batchFilter !== 'All') {
      temp = temp.filter(p => p.batch === parseInt(batchFilter));
    }

    if (yearFilter !== 'All') {
      temp = temp.filter(p => p.year === parseInt(yearFilter));
    }

    if (searchTerm) {
      temp = temp.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ID.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProjects(temp);
  }, [searchTerm, batchFilter, yearFilter, projects]);

  return (
    <div>
      <TopBarWithLogo title='Guided Projects' />

      <div className="guided-projects-container">
        <div className="filters">
          <input
            type="text"
            placeholder="Search by Title or ID"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
            <option value="All">All Years</option>
            <option value="1">First Year</option>
            <option value="2">Second Year</option>
            <option value="3">Third Year</option>
            <option value="4">Final Year</option>
          </select>
          <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)}>
            <option value="All">All Batches</option>
            <option value="1">EN-1</option>
            <option value="2">EN-2</option>
            <option value="3">EN-3</option>
            <option value="4">EN-4</option>
            <option value="5">EN-5</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="guided-projects-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Year</th>
                <th>Batch</th>
                <th>Approved</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project._id}>
                  <td>{project.ID}</td>
                  <td>{project.title}</td>
                  <td>{project.type}</td>
                  <td>{YEAR_MAP[project.year] || 'N/A'}</td>
                  <td>{BATCH_MAP[project.batch] || project.batch || 'N/A'}</td>
                  <td>
                    <span className={`badge ${project.approved ? 'approved' : 'not-approved'}`}>
                      {project.approved ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>{project.isCompleted ? 'Completed' : 'In Progress'}</td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => setSelectedProject(project)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedProject && (
          <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>Components of {selectedProject.title}</h3>
              <div className="table-wrapper">
                <table className="components-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Purpose</th>
                      <th>Qty</th>
                      <th>Fulfilled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProject.components.map((comp, index) => (
                      <tr key={index}>
                        <td>{comp.id}</td>
                        <td>{comp.name}</td>
                        <td>{comp.purpose}</td>
                        <td>{comp.quantity}</td>
                        <td>{comp.fullfilledQty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="close-btn" onClick={() => setSelectedProject(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidedProjects;
