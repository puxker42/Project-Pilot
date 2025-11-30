import React from 'react';
import './InstructionCard.css';
import { FaInfoCircle } from 'react-icons/fa';

const InstructionCard = () => {
  return (
    <div className="instruction-card">
      <div className="instruction-header">
        <FaInfoCircle className="instruction-icon" />
        <h2>Important Instructions</h2>
      </div>
      <ul className="instruction-list">
        <li>
          Create your <strong>Team</strong> before initiating any project. A valid <strong>Team ID</strong> is required.
        </li>
        <li>
          Ensure that <strong>all team members</strong> have completed their current or previous projects.
        </li>
        <li>
          If any team member has an unfinished project, <strong>Admin approval</strong> is mandatory.
        </li>
        <li>
          For Support Reach Admin or Raise your query at <a href="mailto:project.piloteg@gmail.com"> project.piloteg@gmail.com </a>
        </li>
      </ul>
    </div>
  );
};

export default InstructionCard;
