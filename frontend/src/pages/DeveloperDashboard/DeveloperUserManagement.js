import React, { useState } from 'react';
import TopBarWithLogo from '../AdminDashboard/TopBarWithLogo';
import { toast } from 'react-toastify';
import './DeveloperUserManagement.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const DeveloperUserManagement = () => {
    const [activeTab, setActiveTab] = useState('admin'); // admin, instructor, student
    const [loading, setLoading] = useState(false);

    // Initial states for forms
    const initialAdminState = { firstName: '', lastName: '', userID: '', email: '', contactNumber: '', password: '', cPassword: '', prefix: 'Mr.' };
    const initialStudentState = { firstName: '', lastName: '', userID: '', email: '', contactNumber: '', password: '', cPassword: '', batch: 'EN-1', passingYear: '2025', academicYear: '1', prefix: 'Mr.' };

    const [formData, setFormData] = useState(initialAdminState);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setFormData(tab === 'student' ? initialStudentState : initialAdminState);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let endpoint = '';
        if (activeTab === 'admin') endpoint = '/create-admin';
        else if (activeTab === 'instructor') endpoint = '/create-instructor';
        else if (activeTab === 'student') endpoint = '/create-student-direct';

        if (formData.password !== formData.cPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const payload = { ...formData };
            if (payload.prefix) {
                payload.firstName = `${payload.prefix} ${payload.firstName}`.trim();
            }

            const res = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} created successfully!`);
                setFormData(activeTab === 'student' ? initialStudentState : initialAdminState);
            } else {
                toast.error(data.message || "Creation failed");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dev-user-management">
            <TopBarWithLogo title="User Creation Portal" />

            <div className="dum-container">
                <div className="dum-tabs">
                    <button className={activeTab === 'admin' ? 'active' : ''} onClick={() => handleTabChange('admin')}>Create Admin</button>
                    <button className={activeTab === 'instructor' ? 'active' : ''} onClick={() => handleTabChange('instructor')}>Create Instructor</button>
                    <button className={activeTab === 'student' ? 'active' : ''} onClick={() => handleTabChange('student')}>Create Student</button>
                </div>

                <div className="dum-form-wrapper">
                    <h2>Create New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                    <form onSubmit={handleSubmit} className="dum-form">

                        <div className="form-row">
                            <div className="form-group small">
                                <label>Prefix</label>
                                <select name="prefix" value={formData.prefix} onChange={handleChange}>
                                    <option value="Mr.">Mr.</option>
                                    <option value="Ms.">Ms.</option>
                                    <option value="Dr.">Dr.</option>
                                    <option value="Prof.">Prof.</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>User ID</label>
                                <input type="number" name="userID" value={formData.userID} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Contact No</label>
                                <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-group full">
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>

                        {activeTab === 'student' && (
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Batch</label>
                                    <select name="batch" value={formData.batch} onChange={handleChange}>
                                        <option value="EN-1">EN-1</option>
                                        <option value="EN-2">EN-2</option>
                                        <option value="EN-3">EN-3</option>
                                        <option value="EN-4">EN-4</option>
                                        <option value="EN-5">EN-5</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Academic Year</label>
                                    <select name="academicYear" value={formData.academicYear} onChange={handleChange}>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Passing Year</label>
                                    <input type="number" name="passingYear" value={formData.passingYear} onChange={handleChange} required />
                                </div>
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Set Password" />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input type="password" name="cPassword" value={formData.cPassword} onChange={handleChange} required placeholder="Retype Password" />
                            </div>
                        </div>

                        <button type="submit" className="dum-submit-btn" disabled={loading}>
                            {loading ? 'Creating...' : `Create ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DeveloperUserManagement;
