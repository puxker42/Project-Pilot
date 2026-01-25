import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VisitorDashboard.css';

// Import Images
import adminDashboardImg from '../../images/admin-dashboard-demo.png';
import managerDashboardImg from '../../images/manager-dashboard-demo.png';
// Manager Features
import managerCartCreatorRef from '../../images/manager-cartcreator.png';
import managerDistSlotCreatorRef from '../../images/manager-distributionslotcreator.png';
import managerReportStockRef from '../../images/manager-reportgen-stock.png';
import managerReportProjectRef from '../../images/manager-reportgen-projectreport.png';
// Manager Nav Items
import navInventoryImg from '../../images/manager-navitem-Inventory.png';
import navOrdersImg from '../../images/manager-navitem-orders.png';
import navProjectsImg from '../../images/manager-navitem-projects.png';
// Student
import studentDashboardImg from '../../images/student-dashboard-demo.png';
import studentMyProjectsRef from '../../images/student-myprojects.png';
import studentReportsRef from '../../images/student-myprojects-reports.png';
import studentTeamCreatorRef from '../../images/student-team-creator.png';
// Student Project Wizard
import studentWizard1 from '../../images/student-projectcreator-pg1.png';
import studentWizard2 from '../../images/student-projectcreator-pg2.png';
import studentWizard3 from '../../images/student-projectcreator-pg3.png';
import studentWizard4 from '../../images/student-projectcreator-pg4.png';
import studentWizard5 from '../../images/student-projectcreator-pg5.png';
import studentWizard6 from '../../images/student-projectcreator-pg6.png';

const VisitorDashboard = () => {
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('homePath');
        navigate('/');
    };

    const openImage = (imgSrc) => {
        setSelectedImage(imgSrc);
    };

    const closeImage = () => {
        setSelectedImage(null);
    };

    return (
        <div className="visitor-dashboard">
            <header className="visitor-header">
                <div className="header-content">
                    <h1>Welcome, Visitor!</h1>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
                <p className="disclaimer-text">
                    ⚠️ This is just a visitor page you can just go through the features all features are working !!
                </p>
            </header>

            <div className="dashboards-container">
                {/* Admin Dashboard Section */}
                <section className="dashboard-section">
                    <div className="dashboard-info">
                        <h2>Admin Dashboard</h2>
                        <p>
                            The Admin Dashboard provides comprehensive control over the entire system.
                            Key features include:
                        </p>
                        <ul>
                            <li><strong>User Management:</strong> View and manage all users (Students, Instructors, Managers).</li>
                            <li><strong>Role Assignment:</strong> Create and assign roles like Instructors and Managers.</li>
                            <li><strong>System Reporting:</strong> Access high-level system reports and analytics.</li>
                        </ul>
                    </div>
                    <div className="dashboard-media">
                        <img
                            src={adminDashboardImg}
                            alt="Admin Dashboard Interface"
                            className="dashboard-main-img clickable-img"
                            onClick={() => openImage(adminDashboardImg)}
                        />
                        <p className="caption">Click to enlarge</p>
                    </div>
                </section>

                {/* Manager Dashboard Section */}
                <section className="dashboard-section col-layout">
                    <div className="section-intro">
                        <h2>Manager Dashboard</h2>
                        <p>
                            Designed for lab managers to handle inventory and project logistics.
                            The interface allows for seamless component tracking and distribution.
                        </p>
                    </div>

                    <div className="feature-showcase">
                        <div className="showcase-item main-view">
                            <img
                                src={managerDashboardImg}
                                alt="Manager Dashboard Overview"
                                className="clickable-img"
                                onClick={() => openImage(managerDashboardImg)}
                            />
                            <p className="caption">Dashboard Overview (Click to enlarge)</p>
                        </div>

                        <div className="features-grid">
                            <div className="showcase-item">
                                <img
                                    src={managerCartCreatorRef}
                                    alt="Cart Creator Tool"
                                    className="clickable-img"
                                    onClick={() => openImage(managerCartCreatorRef)}
                                />
                                <p className="caption">Cart Creation</p>
                            </div>
                            <div className="showcase-item">
                                <img
                                    src={managerDistSlotCreatorRef}
                                    alt="Distribution Slot Creator"
                                    className="clickable-img"
                                    onClick={() => openImage(managerDistSlotCreatorRef)}
                                />
                                <p className="caption">Slot Distribution</p>
                            </div>
                            <div className="showcase-item">
                                <img
                                    src={managerReportStockRef}
                                    alt="Stock Reports"
                                    className="clickable-img"
                                    onClick={() => openImage(managerReportStockRef)}
                                />
                                <p className="caption">Stock Reporting</p>
                            </div>
                            <div className="showcase-item">
                                <img
                                    src={managerReportProjectRef}
                                    alt="Project Reports"
                                    className="clickable-img"
                                    onClick={() => openImage(managerReportProjectRef)}
                                />
                                <p className="caption">Project Reporting</p>
                            </div>
                            {/* Nav Items */}
                            <div className="showcase-item">
                                <img
                                    src={navInventoryImg}
                                    alt="Inventory Navigation"
                                    className="clickable-img"
                                    onClick={() => openImage(navInventoryImg)}
                                />
                                <p className="caption">Inventory Module</p>
                            </div>
                            <div className="showcase-item">
                                <img
                                    src={navOrdersImg}
                                    alt="Orders Navigation"
                                    className="clickable-img"
                                    onClick={() => openImage(navOrdersImg)}
                                />
                                <p className="caption">Orders Module</p>
                            </div>
                            <div className="showcase-item">
                                <img
                                    src={navProjectsImg}
                                    alt="Projects Navigation"
                                    className="clickable-img"
                                    onClick={() => openImage(navProjectsImg)}
                                />
                                <p className="caption">Projects Module</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Student Dashboard Section */}
                <section className="dashboard-section col-layout">
                    <div className="section-intro">
                        <h2>Student Dashboard</h2>
                        <p>
                            The central hub for students to manage their academic projects.
                            Students can create teams, propose projects via a wizard, and track their progress.
                        </p>
                    </div>

                    <div className="feature-showcase">
                        <div className="showcase-item main-view">
                            <img
                                src={studentDashboardImg}
                                alt="Student Dashboard Main"
                                className="clickable-img"
                                onClick={() => openImage(studentDashboardImg)}
                            />
                            <p className="caption">Student Dashboard Overview</p>
                        </div>

                        <div className="features-grid">
                            <div className="showcase-item">
                                <img
                                    src={studentTeamCreatorRef}
                                    alt="Team Creator"
                                    className="clickable-img"
                                    onClick={() => openImage(studentTeamCreatorRef)}
                                />
                                <p className="caption">Team Creation</p>
                            </div>
                            <div className="showcase-item">
                                <img
                                    src={studentMyProjectsRef}
                                    alt="My Projects"
                                    className="clickable-img"
                                    onClick={() => openImage(studentMyProjectsRef)}
                                />
                                <p className="caption">My Projects List</p>
                            </div>
                            <div className="showcase-item">
                                <img
                                    src={studentReportsRef}
                                    alt="Project Reports"
                                    className="clickable-img"
                                    onClick={() => openImage(studentReportsRef)}
                                />
                                <p className="caption">Action Console</p>
                            </div>
                        </div>

                        <h3 className="wizard-title">Project Creation Wizard</h3>
                        <div className="features-grid wizard-grid">
                            {[studentWizard1, studentWizard2, studentWizard3, studentWizard4, studentWizard5, studentWizard6].map((img, index) => (
                                <div className="showcase-item" key={index}>
                                    <img
                                        src={img}
                                        alt={`Wizard Step ${index + 1}`}
                                        className="clickable-img"
                                        onClick={() => openImage(img)}
                                    />
                                    <p className="caption">Step {index + 1}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div className="image-modal-overlay" onClick={closeImage}>
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={closeImage}>&times;</button>
                        <img src={selectedImage} alt="Enlarged View" className="enlarged-img" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisitorDashboard;
