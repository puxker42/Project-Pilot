import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PendingComponentsPage.css';
import ManagerTopBar from './ManagerDashboard/TopBarWithLogo';
import InstructorTopBar from './InstructorDashBoard/TopBarWithLogo';
import NoDataFound from '../components/NoDataFound';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PendingComponentsPage = () => {
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setRole(user.role);
        }

        const token = localStorage.getItem('token');
        axios.get(`${BASE_URL}/pending-components`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (res.data.success) {
                    setComponents(res.data.data);
                }
            })
            .catch(err => console.error("Failed to fetch pending components", err))
            .finally(() => setLoading(false));
    }, []);

    const TopBar = role === 'Manager' ? ManagerTopBar : InstructorTopBar;

    return (
        <div>
            <TopBar title="Pending Components List" />
            <div className="pending-container">
                <h2>Components Currently Issued</h2>

                {loading ? (
                    <p>Loading...</p>
                ) : components.length === 0 ? (
                    <NoDataFound message="No components are currently issued." />
                ) : (
                    <table className="pending-table">
                        <thead>
                            <tr>
                                <th>Component Name</th>
                                <th>Currently Issued</th>
                                <th>Pending Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {components.map((comp) => (
                                <tr key={comp._id}>
                                    <td>{comp.title}</td>
                                    <td>{comp.issued}</td>
                                    <td>{comp.issued > 0 ? 'Pending Return' : 'Cleared'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PendingComponentsPage;
