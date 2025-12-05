import React, { useEffect, useState } from "react";
import "./ProjectCheckIn.css";
import TopbarWithLogo from '../TopBarWithLogo';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function ProjectCheckIn() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [inputID, setInputID] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [rowState, setRowState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completedProjectFound, setCompletedProjectFound] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, userRes] = await Promise.all([
          fetch(`${BASE_URL}/get-all-projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/get-all-users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const projJson = await projRes.json();
        const userJson = await userRes.json();

        if (projJson.success) setProjects(projJson.data);
        if (userJson.success) setUsers(userJson.data);
      } catch (err) {
        console.error("Fetch error", err);
      }
    };

    fetchData();
  }, [token]);

  const handleSearch = () => {
    const proj = projects.find((p) => p.ID.toLowerCase() === inputID.trim().toLowerCase());

    if (!proj) {
      alert("Project not found");
      setSelectedProject(null);
      setCompletedProjectFound(false);
      return;
    }

    if (proj.isCompleted) {
      setSelectedProject(null);
      setCompletedProjectFound(true);
      return;
    }

    setSelectedProject(proj);
    setCompletedProjectFound(false);
  };

  const getTeamLeadName = (team) => {
    if (!team) return "";
    const lead = team.members.find((m) => m.role.toLowerCase() === "lead");
    const user = users.find((u) => u.userID === lead?.userID);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown";
  };

  const openModal = () => {
    if (!selectedProject) return;
    setRowState(
      selectedProject.components.map((c) => ({
        returnQty: 0,
        remark: "",
      }))
    );
    setModalOpen(true);
  };

  const handleReturnQtyChange = (idx, value, received) => {
    const qty = Number(value);
    setRowState((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, returnQty: qty, remark: qty < received ? row.remark : "" } : row
      )
    );
  };

  const handleRemarkChange = (idx, value) => {
    setRowState((prev) => prev.map((row, i) => (i === idx ? { ...row, remark: value } : row)));
  };

  const canSubmit = rowState.some((r) => r.returnQty > 0);

  const handleCheckIn = async () => {
    if (!selectedProject) return;

    setLoading(true);

    try {
      const updatedProject = JSON.parse(JSON.stringify(selectedProject));

      updatedProject.components = updatedProject.components.map((comp, idx) => {
        const row = rowState[idx];

        if (row.returnQty > 0) {
          const issuedQty = comp.fullfilledQty ?? 0;

          comp.receiveMemo = {
            receivedQantity: row.returnQty,
            remark: row.remark,
          };

          comp.allReceived = row.returnQty >= issuedQty;
        }

        return comp;
      });
      console.log(updatedProject);
      const res = await fetch(`${BASE_URL}/check-in/project`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProject),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Check-in failed");

      alert("Check-in successful!");
      setModalOpen(false);
      setProjects((prev) =>
        prev.map((p) => (p._id === updatedProject._id ? updatedProject : p))
      );

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <TopbarWithLogo title='Project Return Master' />
      <div className="pc-container">
        <h1>Project Check‑In</h1>
        <div className="pc-search">
          <input
            type="text"
            value={inputID}
            onChange={(e) => setInputID(e.target.value)}
            placeholder="Enter Project ID (e.g., PRJ1234)"
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        {completedProjectFound && (
          <div className="pc-warning">
            This project is already <strong>completed</strong>. Check‑in not allowed.
          </div>
        )}

        {selectedProject && (
          <table className="pc-table">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Project Name</th>
                <th>Team Lead</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedProject.ID}</td>
                <td>{selectedProject.title}</td>
                <td>{getTeamLeadName(selectedProject.teamID)}</td>
                <td>
                  <button onClick={openModal}>View Component List</button>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {modalOpen && (
          <div className="pc-modal-overlay">
            <div className="pc-modal-content">
              <h2>Components</h2>
              <table className="pc-table">
                <thead>
                  <tr>
                    <th>Component ID</th>
                    <th>Name</th>
                    <th>Received Qty</th>
                    <th>Return Qty</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProject.components.map((comp, idx) => {
                    const received = comp.fullfilledQty ?? 0;
                    const row = rowState[idx] || { returnQty: 0, remark: "" };
                    return (
                      <tr key={comp.id}>
                        <td>{comp.id}</td>
                        <td>{comp.name}</td>
                        <td>{received}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max={received}
                            value={row.returnQty}
                            onChange={(e) => handleReturnQtyChange(idx, e.target.value, received)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={row.remark}
                            onChange={(e) => handleRemarkChange(idx, e.target.value)}
                            disabled={row.returnQty >= received}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="pc-btn-row">
                <button onClick={() => setModalOpen(false)}>Cancel</button>
                <button disabled={!canSubmit || loading} onClick={handleCheckIn}>
                  {loading ? "Saving…" : "Check‑In"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
