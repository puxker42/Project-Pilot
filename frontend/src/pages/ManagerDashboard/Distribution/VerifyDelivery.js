import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './VerifyDelivery.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const VerifyDelivery = () => {
  const { token } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [denied, setDenied] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // ✅ Fetch project using JWT token from URL param
  useEffect(() => {
    fetch(`${BASE_URL}/verify/get-project/${token}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // 🔄 Use token from URL
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.project) {
          setProject(data.project);
        } else {
          setError('Invalid or expired token.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch project.');
        setLoading(false);
      });
  }, [token]);

  // ✅ Auto-close logic
  useEffect(() => {
    if (!acknowledged && !denied) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          window.close();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [acknowledged, denied]);

  // ✅ Acknowledge delivery (POST)
  const handleAcknowledge = () => {
    fetch(`${BASE_URL}/verify/success`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // 🔄 Send token from URL param
      },
      body: JSON.stringify({ updatedProject: project, denied: false }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to submit acknowledgement.');
        setAcknowledged(true);
      })
      .catch(() => alert('Failed to submit acknowledgement.'));
  };

  // ✅ Deny delivery (POST)
  const handleDenial = () => {
    fetch(`${BASE_URL}/verify/success`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ updatedProject: project, denied: true }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to submit denial.');
        setDenied(true);
      })
      .catch(() => alert('Failed to submit denial.'));
  };

  // ✅ Render loading or error
  if (loading) return <div className="verify-container">Loading...</div>;
  if (error) return <div className="verify-container error">{error}</div>;

  // ✅ Confirmation
  if (acknowledged || denied) {
    return (
      <div className="verify-container">
        <h2>{acknowledged ? 'Acknowledgement Submitted' : 'Denial Submitted'}</h2>
        <p>Thank you for your response.</p>
        <p>Closing page in {countdown} seconds...</p>
      </div>
    );
  }

  // ✅ Main render
  return (
    <div className="verify-container">
      <h2>Verify Component Delivery</h2>

      <div className="project-info">
        <p><strong>Project ID:</strong> {project.ID}</p>
        <p><strong>Project Title:</strong> {project.title}</p>
        <p><strong>Guide:</strong> {project.guideID?.userID} - {project.guideID?.name}</p>
      </div>

      <h3>Component Details</h3>
      <table className="component-table">
        <thead>
          <tr>
            <th>COMID</th>
            <th>Component Name</th>
            <th>Received Quantity</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          {project.components?.map((comp, index) => (
            <tr key={index}>
              <td>{comp.id}</td>
              <td>{comp.name}</td>
              <td>{comp.receivedQty}</td>
              <td>{comp.remark || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="button-group">
        <button className="ack-btn" onClick={handleAcknowledge} disabled={acknowledged || denied}>Acknowledge</button>
        <button className="deny-btn" onClick={handleDenial} disabled={acknowledged || denied}>Deny</button>
      </div>
    </div>
  );
};

export default VerifyDelivery;
