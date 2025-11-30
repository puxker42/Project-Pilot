// src/pages/AdminDashboard.js
import React from 'react';
import TopBarWithLogo from './TopBarWithLogo';
import ControlsCard from './ControlsCard';
const AdminDashboard = () => {
  return (
    <div>
      <TopBarWithLogo title='Welcome Admin'/>
      <ControlsCard/>
    </div>
  );
}; 

export default AdminDashboard;
