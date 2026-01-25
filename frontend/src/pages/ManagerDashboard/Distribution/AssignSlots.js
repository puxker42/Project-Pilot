import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AssignSlots.css';
import { useNavigate } from 'react-router-dom';
import ProjectPopup from './ProjectPopup';

import AnimatedEmptyState from '../../../components/AnimatedEmptyState';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AssignSlots = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [popupProject, setPopupProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [batchFilter, setBatchFilter] = useState('all');
  const [uniqueBatches, setUniqueBatches] = useState([]);

  const token = localStorage.getItem('token');

  const slotOptions = [
    { value: -1, time: 'ANY' },
    { value: 1, time: '11:00 - 12:00' },
    { value: 2, time: '13:00 - 14:00' },
    { value: 3, time: '14:00 - 15:00' },
    { value: 4, time: '15:00 - 16:00' },
    { value: 5, time: '16:00 - 17:00' },
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/get-all-projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const liveProjects = res.data.data.filter((p) => !p.isCompleted && !p.comDel && !p.slotAssigned);
        setProjects(liveProjects);

        const batches = [...new Set(liveProjects.map((p) => p.batch).filter((b) => b !== undefined && b !== null))];
        setUniqueBatches(batches.sort());
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, [token]);

  const toggleProjectSelection = (project) => {
    const alreadySelected = selectedProjects.some((p) => p._id === project._id);
    if (alreadySelected) {
      setSelectedProjects(selectedProjects.filter((p) => p._id !== project._id));
    } else {
      setSelectedProjects([...selectedProjects, project]);
    }
  };

  const removeSelectedProject = (projectID) => {
    setSelectedProjects(selectedProjects.filter((p) => p._id !== projectID));
  };

  const handleAssignSlot = async () => {
    if (selectedSlot === null || !selectedDate || selectedProjects.length === 0) {
      alert('Please select date, slot, and at least one project.');
      return;
    }

    try {
      setLoading(true);
      for (const project of selectedProjects) {
        await axios.put(
          `${BASE_URL}/add-to-slots`,
          {
            projectID: project._id,
            slot: selectedSlot,
            date: selectedDate,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      alert('Slots assigned successfully!');
      navigate('/manager-dashboard');
    } catch (err) {
      console.error(err);
      alert('Error assigning slots!');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((proj) => {
    if (batchFilter === 'all') return true;
    if (batchFilter === 'null') return proj.batch === null || proj.batch === undefined;
    return proj.batch === batchFilter;
  });

  return (
    <div className="assign-container">

      <div className="masst">
        <div className="input-group">
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="slot-card-container">
          <label>Select a Slot:</label>
          <div className="slot-cards">
            {slotOptions.map((slot) => (
              <div
                key={slot.value}
                className={`slot-card ${selectedSlot === slot.value ? 'selected' : ''}`}
                onClick={() => setSelectedSlot(slot.value)}
              >
                {slot.time}
              </div>
            ))}
          </div>
        </div>

        <div className="slot-card-container">
          <label>Filter by Batch:</label>
          <div className="slot-cards">
            <div
              className={`slot-card ${batchFilter === 'all' ? 'selected' : ''}`}
              onClick={() => setBatchFilter('all')}
            >
              All
            </div>
            {uniqueBatches.map((batch) => (
              <div
                key={batch}
                className={`slot-card ${batchFilter === batch ? 'selected' : ''}`}
                onClick={() => setBatchFilter(batch)}
              >
                EN-{batch}
              </div>
            ))}
            <div
              className={`slot-card ${batchFilter === 'null' ? 'selected' : ''}`}
              onClick={() => setBatchFilter('null')}
            >
              No Batch
            </div>
          </div>
        </div>

        <div className="project-table">
          <h3>Live Projects</h3>
          {filteredProjects.length === 0 ? (
            <AnimatedEmptyState message="No live projects available for this filter." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Project ID</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Guide</th>
                  <th>Batch</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((proj) => (
                  <tr key={proj._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProjects.some((p) => p._id === proj._id)}
                        onChange={() => toggleProjectSelection(proj)}
                      />
                    </td>
                    <td>{proj.ID}</td>
                    <td>{proj.title}</td>
                    <td>{proj.type}</td>
                    <td>{proj.guideID?.firstName} {proj.guideID?.lastName}</td>
                    <td>{proj.batch !== undefined && proj.batch !== null ? `EN-${proj.batch}` : 'N/A'}</td>
                    <td>
                      <button onClick={() => {
                        setPopupProject(proj);
                        setShowModal(true);
                      }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedProjects.length > 0 && (
          <div className="confirmation-table">
            <h4>Selected Projects for Slot</h4>
            <table>
              <thead>
                <tr>
                  <th>Project ID</th>
                  <th>Title</th>
                  <th>Slot Time</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedProjects.map((proj) => (
                  <tr key={proj._id}>
                    <td>{proj.ID}</td>
                    <td>{proj.title}</td>
                    <td>{slotOptions.find((s) => s.value === selectedSlot)?.time}</td>
                    <td>{selectedDate}</td>
                    <td>
                      <button
                        className="remove-btn"
                        onClick={() => removeSelectedProject(proj._id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button className="assign-btnn" onClick={handleAssignSlot} disabled={loading}>
          {loading ? 'Assigning...' : 'Assign Selected Projects'}
        </button>

        {showModal && popupProject && (
          <ProjectPopup project={popupProject} onClose={() => setShowModal(false)} />
        )}
      </div>
    </div>
  );
};

export default AssignSlots;
