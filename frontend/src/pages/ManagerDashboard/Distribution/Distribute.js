import React, { useEffect, useState } from 'react';
import './Distribute.css';
import TopbarWithLogo from '../TopBarWithLogo';
import NoDataFound from '../../../components/NoDataFound';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function getCurrentISTSlot() {
  const now = new Date();
  const hours = now.getHours();
  if (hours === 11) return 1;
  if (hours === 13) return 2;
  if (hours === 14) return 3;
  if (hours === 15) return 4;
  if (hours === 16) return 5;
  return -1;
}

const Distribute = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [assigningProject, setAssigningProject] = useState(null);
  const [updatedComponents, setUpdatedComponents] = useState({});
  const [importedProjects, setImportedProjects] = useState([]);
  const [assignStatus, setAssignStatus] = useState(null);
  const [masterComponents, setMasterComponents] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
    fetchMasterComponents();
    const interval = setInterval(fetchProjects, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${BASE_URL}/get-all-projects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setProjects(data.data);
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/get-all-users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setUsers(data.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const fetchMasterComponents = async () => {
    try {
      const res = await fetch(`${BASE_URL}/get-all-components`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setMasterComponents(data.data);
    } catch (err) {
      console.error("Error fetching master components", err);
    }
  };

  useEffect(() => {
    const slot = getCurrentISTSlot();
    const today = new Date().toDateString();
    const match = projects.filter(p =>
      (p.slot?.slotn === slot || p.slot?.slotn === -1) &&
      new Date(p.slot.date).toDateString() === today &&
      p.ack !== 1
    );
    setFilteredProjects(match);
  }, [projects]);

  const getLeadInfo = (team) => {
    if (!team?.members || !Array.isArray(team.members)) return { id: "N/A", name: "N/A" };
    const lead = team.members.find(m => m.role === "Lead");
    const user = users.find(u => u.userID === lead?.userID);
    return lead ? { id: lead.userID, name: user ? `${user.firstName} ${user.lastName}` : "Unknown" } : { id: "N/A", name: "N/A" };
  };

  const openAssignPopup = (project) => {
    const acceptedComponents = project.components.filter(c => c.accepted);
    const initialMemo = {};
    acceptedComponents.forEach(c => {
      initialMemo[c.name] = { receivedQantity: '', remark: '' };
    });
    setAssigningProject(project);
    setUpdatedComponents(initialMemo);
    setAssignStatus(null);
  };

  const handleReceivedQuantityChange = (name, value) => {
    setUpdatedComponents(prev => ({
      ...prev,
      [name]: { ...prev[name], receivedQantity: Number(value) }
    }));
  };

  const handleRemarkChange = (name, value) => {
    setUpdatedComponents(prev => ({
      ...prev,
      [name]: { ...prev[name], remark: value }
    }));
  };

  const getComponentStatus = (name, receivedQuantity) => {
    const master = masterComponents.find(mc => mc.title.trim().toLowerCase() === name.trim().toLowerCase());
    if (!master) return 'invalid';
    if (receivedQuantity === '' || receivedQuantity === null) return 'empty';
    if (Number(receivedQuantity) <= master.qnty) return 'valid';
    return 'exceed';
  };

  const submitAssign = async () => {
    setAssignStatus("loading");

    // 1️⃣ Build updated component list for the project
    const updatedComponentsList = assigningProject.components.map(c => {
      if (c.accepted && updatedComponents[c.name]) {
        const issuedQty = Number(updatedComponents[c.name].receivedQantity) || 0;

        return {
          ...c,
          fullfilledQty: issuedQty,                   // ✔ actual outgoing stock
          fullfilled: issuedQty >= c.quantity        // ✔ requirement satisfied?
        };
      }
      return c;
    });

    // 2️⃣ Check if entire project is fully completed
    const allAcceptedFullfilled = updatedComponentsList
      .filter(c => c.accepted)
      .every(c => (c.fullfilledQty ?? 0) >= c.quantity);


    // 4️⃣ Build final object for backend
    const payload = {
      projectID: assigningProject._id,
      updatedProject: {
        ...assigningProject,
        components: updatedComponentsList,
        allFullfilled: allAcceptedFullfilled
      }
    };

    // 5️⃣ Send to backend
    try {
      const response = await fetch(`${BASE_URL}/check-in/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.ackk === true) {
        setAssignStatus("success");
        setTimeout(() => {
          setAssigningProject(null);
          setUpdatedComponents({});
          fetchProjects();
        }, 1500);
      } else if (result.ackk === false) {
        setAssignStatus("rejected");
        setTimeout(() => {
          setAssigningProject(null);
          setUpdatedComponents({});
          fetchProjects();
        }, 2000);
      } else {
        setAssignStatus("error");
      }

    } catch (err) {
      console.error(err);
      setAssignStatus("error");
    }
  };


  const currentDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });

  const importedAndFiltered = [...filteredProjects, ...importedProjects];

  return (
    <div className="distribute-container">
      <TopbarWithLogo title="Component Delivery Master" />
      <div className="marginn">
        <h2>Slot Projects</h2>
        <p><strong>Current Date & Time:</strong> {currentDate}</p>
        <p><strong>Projects in Current Slot:</strong> {filteredProjects.length}</p>

        {importedAndFiltered.length === 0 ? (
          <NoDataFound message="No projects found for this slot." />
        ) : (
          <div className="project-table-container">
            <table className="project-table">
              <thead>
                <tr>
                  <th>Project ID</th>
                  <th>Project Title</th>
                  <th>Team ID</th>
                  <th>Lead User ID</th>
                  <th>Lead Name</th>
                  <th>Slot</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {importedAndFiltered.map(project => {
                  const team = project.teamID;
                  const lead = getLeadInfo(team);
                  return (
                    <tr key={project._id} className={project.allReceived ? 'project-complete' : ''}>
                      <td>{project.ID}</td>
                      <td>{project.title}</td>
                      <td>{team?.teamID || 'N/A'}</td>
                      <td>{lead.id}</td>
                      <td>{lead.name}</td>
                      <td>{project.slot?.slotn === -1 ? "ANY" : project.slot?.slotn}</td>
                      <td>{new Date(project.slot?.date).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="assign-btn"
                          disabled={project.allReceived}
                          onClick={() => openAssignPopup(project)}
                        >
                          {project.allReceived ? 'Completed' : 'Assign'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="import-link">
          <a onClick={() => {
            const input = prompt("Enter the Project ID to import:");
            if (!input) return;
            const trimmedID = input.trim().toLowerCase();
            const alreadyShown = importedAndFiltered.some(p => p.ID.trim().toLowerCase() === trimmedID);
            if (alreadyShown) return alert("This project is already visible.");
            const match = projects.find(p => p.ID.trim().toLowerCase() === trimmedID);
            if (match) setImportedProjects(prev => [...prev, match]);
            else alert("Project ID not found.");
          }}>Import project from other slot</a>
        </div>

        {/* Assignment Popup */}
        {assigningProject && (
          <div className="assign-popup">
            <div className="popup-content">
              <h3>Component Receive Memo - {assigningProject.title}</h3>
              {assignStatus === 'loading' && <p className="loader">Waiting for acknowledgement by student...</p>}
              {assignStatus === 'success' && <p className="success-tick">✔ Acknowledged Successfully!</p>}
              {assignStatus === 'rejected' && <p className="error-msg">❌ User Rejected Some Components!</p>}
              {assignStatus === 'error' && <p className="error-msg">⚠ Internal Server Error</p>}

              {assignStatus === null && (
                <>
                  <table className="component-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Quantity to Allot</th>
                        <th>Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assigningProject.components.filter(c => c.accepted).map((comp) => {
                        const status = getComponentStatus(comp.name, updatedComponents[comp.name]?.receivedQantity);
                        return (
                          <tr key={comp._id}>
                            <td>{comp.id}</td>
                            <td>{comp.name}</td>
                            <td>{comp.quantity}</td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                max={comp.quantity}
                                className={`quantity-input ${status}`}
                                value={updatedComponents[comp.name]?.receivedQantity || ''}
                                onChange={(e) => handleReceivedQuantityChange(comp.name, e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="Remark"
                                value={updatedComponents[comp.name]?.remark || ''}
                                onChange={(e) => handleRemarkChange(comp.name, e.target.value)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="popup-actions">
                    <button
                      className="accept-btn"
                      onClick={submitAssign}
                      disabled={
                        Object.entries(updatedComponents).some(([name, val]) =>
                          getComponentStatus(name, val.receivedQantity) !== 'valid'
                        )
                      }
                    >
                      Assign
                    </button>
                    <button className="close-btn" onClick={() => setAssigningProject(null)}>Close</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {(assignStatus === 'success' || assignStatus === 'rejected') && (
          <div className="splash-screen">
            <div className="splash-content">
              {assignStatus === 'success' ? (
                <p>✔ Acknowledged Successfully!</p>
              ) : (
                <p>❌ User Rejected Some Components!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Distribute;
