import React, { useState, useEffect } from 'react';
import './ManagerDashboard.css';
import { useNavigate } from 'react-router-dom';
import { FaProjectDiagram, FaShoppingCart, FaSearch, FaClipboardList, FaPlusSquare, FaCalendarCheck, FaTruck, FaWarehouse, FaTasks, FaFileAlt, FaCertificate, FaCalendarDay, FaChartPie } from 'react-icons/fa';
import axios from 'axios';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    lowStockItems: 0
  });
  const [lowStockList, setLowStockList] = useState([]);
  const [showLowStock, setShowLowStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Manager');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch User Data
        const userRes = await axios.get(`${BASE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userRes.data.success) {
          const user = userRes.data.data;
          setUserName(user.name);
        }

        // Fetch Components
        const res = await axios.get(`${BASE_URL}/get-all-components`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success) {
          const allComponents = res.data.data;
          // Filter for low stock (quantity < 10)
          const lowStock = allComponents.filter(item => item.qnty < 10);
          setLowStockList(lowStock);
          setStats({
            lowStockItems: lowStock.length
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    { name: 'All Projects', path: '/all-projects', icon: <FaProjectDiagram />, color: '#4e73df' },
    { name: 'Create Cart', path: '/get-order', icon: <FaShoppingCart />, color: '#1cc88a' },
    { name: 'Search Components', path: '/search-components', icon: <FaSearch />, color: '#36b9cc' },
    { name: 'View Carts', path: '/view-carts', icon: <FaClipboardList />, color: '#f6c23e' },
    { name: 'Create Component', path: '/create-component', icon: <FaPlusSquare />, color: '#e74a3b' },
    { name: 'Assign Slots', path: '/assign-slot', icon: <FaCalendarCheck />, color: '#858796' },
    { name: 'Distribute Components', path: '/check-out', icon: <FaTruck />, color: '#5a5c69' },
    { name: 'Generate Reports', path: '/generate-reports', icon: <FaFileAlt />, color: '#fd7e14' },
    { name: 'Check-In', path: '/check-in', icon: <FaWarehouse />, color: '#2e59d9' },
    { name: 'Certificate Gen', path: '/generate-certificate', icon: <FaCertificate />, color: '#e74c3c' },
    { name: 'Day Wise Stock', path: '/report-day-wise', icon: <FaCalendarDay />, color: '#20c997' },
    { name: 'Comp. Wise Stock', path: '/report-component-wise', icon: <FaChartPie />, color: '#6610f2' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleLowStock = () => {
    setShowLowStock(!showLowStock);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString();

    doc.setFontSize(18);
    doc.text("Low Stock Components Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${dateStr}`, 14, 30);

    const tableColumn = ["Component ID", "Name", "Quantity", "Status"];
    const tableRows = lowStockList.map((item) => [
      item.cID,
      item.title,
      item.qnty,
      "Low Stock",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "grid",
      headStyles: { fillColor: [231, 74, 59] }, // Red color for low stock
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          doc.internal.pageSize.getWidth() - 40,
          doc.internal.pageSize.getHeight() - 10
        );
      },
    });

    doc.save("Low_Stock_Report.pdf");
  };

  return (
    <div className="manager-dashboard">
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-banner">
          <h1>Welcome back, {userName}!</h1>
          <p>Here's what's happening in your lab today.</p>
        </div>

        {/* Quick Actions Grid - Moved Up */}
        <h2 className="section-title">Quick Actions</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              onClick={() => handleNavigation(feature.path)}
              style={{ borderTop: `4px solid ${feature.color}` }}
            >
              <div className="feature-icon" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="feature-name">{feature.name}</h3>
            </div>
          ))}
        </div>

        {/* Stats Overview - Moved Down */}
        <div className="stats-grid" style={{ marginTop: '30px' }}>
          {/* Only Low Stock Card remains */}
          <div
            className="stat-card"
            onClick={toggleLowStock}
            style={{ cursor: 'pointer', border: showLowStock ? '2px solid #e74a3b' : 'none' }}
          >
            <div className="stat-icon" style={{ backgroundColor: 'rgba(231, 74, 59, 0.1)', color: '#e74a3b' }}>
              <FaWarehouse />
            </div>
            <div className="stat-info">
              <h3>Low Stock Items</h3>
              <p className="stat-value">{loading ? '...' : stats.lowStockItems}</p>
              <small style={{ color: '#858796', fontSize: '0.8rem' }}>Click to view details</small>
            </div>
          </div>
        </div>

        {/* Low Stock Modal */}
        {showLowStock && (
          <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div className="modal-content" style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '8px',
              width: '80%',
              maxWidth: '800px',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <button
                onClick={toggleLowStock}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#858796'
                }}
              >
                &times;
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 className="section-title" style={{ margin: 0 }}>Low Stock Components (Less than 10)</h2>
                <button
                  onClick={downloadPDF}
                  style={{
                    backgroundColor: '#e74a3b',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginRight: '30px' // Space for close button
                  }}
                >
                  Download PDF
                </button>
              </div>

              <div className="table-responsive">
                {lowStockList.length > 0 ? (
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e3e6f0', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Component ID</th>
                        <th style={{ padding: '12px' }}>Name</th>
                        <th style={{ padding: '12px' }}>Quantity</th>
                        <th style={{ padding: '12px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockList.map((item) => (
                        <tr key={item._id} style={{ borderBottom: '1px solid #e3e6f0' }}>
                          <td style={{ padding: '12px' }}>{item.cID}</td>
                          <td style={{ padding: '12px' }}>{item.title}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: '#e74a3b' }}>{item.qnty}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              backgroundColor: '#e74a3b',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.85rem'
                            }}>
                              Low Stock
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ padding: '20px', textAlign: 'center', color: '#858796' }}>No low stock items found.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

export default ManagerDashboard;
