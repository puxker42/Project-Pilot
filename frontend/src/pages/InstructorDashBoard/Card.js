import React, { useState } from 'react';
import './Card.css';

const Card = ({
  title,
  projectID,
  description,
  components,
  team,
  guideID,
  guideName,
  createdAt,
  onApprove,
  onDeny,
}) => {
  const [showTable, setShowTable] = useState(false);

  const toggleTable = (e) => {
    e.preventDefault(); // Prevent page reload
    setShowTable(!showTable);
  };

  return (
    <div className="card">
      <h2>{title}</h2>
      <p>
        <span className="label">Project ID:</span> {projectID}
      </p>
      <p>
        <span className="label">Description:</span> {description}
      </p>

      <p>
        <span className="label">Components:</span>{' '}
        {components && components.length > 0 ? (
          <>
            {components.length} component(s) —{' '}
            <a className="link-text" href="#" onClick={toggleTable}>
              {showTable ? 'Hide Component Table' : 'View Component Table'}
            </a>
          </>
        ) : (
          'None'
        )}
      </p>

      {showTable && (
        <table className="component-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Purpose</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {components.map((comp) => (
              <tr key={comp.id}>
                <td>{comp.id}</td>
                <td>{comp.name}</td>
                <td>{comp.purpose}</td>
                <td>{comp.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p>
        <span className="label">Team:</span> {team ? team : 'None'}
      </p>

      <p>
        <span className="label">Project Guide:</span> {guideID} - {guideName}
      </p>

      <div className="card-footer">
        <div className="fter">
          Created: {new Date(createdAt).toLocaleDateString()}
        </div>
        <div className="card-buttons">
          <button className="approve-btn" onClick={() => onApprove()}>
            Approve
          </button>
          <button className="deny-btn" onClick={() => onDeny()}>
            Deny
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
