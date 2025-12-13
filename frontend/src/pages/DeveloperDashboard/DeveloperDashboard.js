import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBarWithLogo from '../AdminDashboard/TopBarWithLogo'; // Reusing TopBar
import { FaUserShield, FaUsersCog, FaChalkboardTeacher, FaUserGraduate, FaDatabase } from 'react-icons/fa';
import './DeveloperDashboard.css';

const DeveloperDashboard = () => {
    const navigate = useNavigate();

    const dashboards = [
        {
            name: 'Admin Dashboard',
            desc: 'Full administrative control',
            path: '/admin-dashboard',
            icon: <FaUserShield />,
            color: '#4e73df'
        },
        {
            name: 'Manager Dashboard',
            desc: 'Inventory and team management',
            path: '/manager-dashboard',
            icon: <FaUsersCog />,
            color: '#1cc88a'
        },
        {
            name: 'Instructor Dashboard',
            desc: 'Project approval and guidance',
            path: '/instructor-dashboard',
            icon: <FaChalkboardTeacher />,
            color: '#36b9cc'
        },
        {
            name: 'Student Dashboard',
            desc: 'Project submission and status',
            path: '/student-dashboard',
            icon: <FaUserGraduate />,
            color: '#f6c23e'
        },
        {
            name: 'Database Reflection',
            desc: 'View all system data logs',
            path: '/developer-database',
            icon: <FaDatabase />,
            color: '#e74a3b'
        },
        {
            name: 'User Management',
            desc: 'Create Admin, Instructor, Student',
            path: '/developer-users',
            icon: <FaUsersCog />, // Reusing icon, or import new one if preferred but FaUsersCog is fitting
            color: '#1cc88a'
        }
    ];

    return (
        <div className="developer-dashboard">
            <TopBarWithLogo title="Developer Console" />

            <div className="dev-container">
                <header className="dev-header">
                    <h1>System God Mode</h1>
                    <p>Full unrestricted access to all system modules.</p>
                </header>

                <div className="dev-grid">
                    {dashboards.map((dash, index) => (
                        <div
                            key={index}
                            className="dev-card"
                            onClick={() => navigate(dash.path)}
                            style={{ borderTopColor: dash.color }}
                        >
                            <div className="dev-icon" style={{ color: dash.color }}>
                                {dash.icon}
                            </div>
                            <div className="dev-info">
                                <h3>{dash.name}</h3>
                                <p>{dash.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeveloperDashboard;
