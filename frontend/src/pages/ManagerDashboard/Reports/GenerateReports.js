import React, { useState, useEffect } from 'react';


import './GenerateReports.css';
import { FaFileInvoice, FaCalendarAlt, FaDownload, FaTable, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const GenerateReports = () => {
    const [activeTab, setActiveTab] = useState('project');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [generatedReportType, setGeneratedReportType] = useState('');
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${BASE_URL}/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setUserRole(response.data.data.accountType);
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
            }
        };
        fetchUserRole();
    }, []);

    // State for Project Reports
    const [projectReportMode, setProjectReportMode] = useState('summary'); // summary, contact, detailed, custom

    // Granular Options State
    const [projectFilters, setProjectFilters] = useState({
        status: 'All',
        type: 'All',
        batch: 'All'
    });

    // State for Certificate Generation


    const [projectCustomOptions, setProjectCustomOptions] = useState({
        includeId: true,
        includeTitle: true,
        includeDescription: false,
        includeYear: true,
        teamDetails: 'id_only', // none, id_only, id_prn, id_prn_name, id_name_contact_mobile, id_name_contact_all
        includeGuideDetails: false,
        includeComponents: false
    });

    // State for Stock Reports
    const [stockReportType, setStockReportType] = useState('current');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [stockOptions, setStockOptions] = useState({
        projectDetails: true,
        cartDetails: true
    });

    // Column Filters (Key-Value map: column name -> selected value)
    const [columnFilters, setColumnFilters] = useState({});

    // Handler to update filters
    const handleFilterChange = (column, value) => {
        setColumnFilters(prev => ({
            ...prev,
            [column]: value
        }));
    };

    const downloadPDF = () => {
        if (!reportData || reportData.length === 0) {
            alert("No data available to download.");
            return;
        }

        const doc = new jsPDF('landscape');
        const dateStr = new Date().toLocaleDateString();
        let title = "";

        if (activeTab === 'project') {
            title = `Project_Report_${projectReportMode}_${dateStr}`;

            const headers = Object.keys(reportData[0]);
            const head = [headers];

            const body = reportData.map(row => {
                return headers.map(key => {
                    const value = row[key];

                    if (value === null || value === undefined) return '-';

                    if (Array.isArray(value)) {
                        if (value.length === 0) return '-';
                        if (typeof value[0] === 'object' && value[0] !== null) {
                            return value.map((item, idx) => {
                                const parts = [];
                                for (const [k, v] of Object.entries(item)) {
                                    parts.push(`${k}: ${v}`);
                                }
                                return `[${idx + 1}] ${parts.join(', ')}`;
                            }).join('\n');
                        }
                        return value.join(', ');
                    }

                    if (typeof value === 'object') {
                        const parts = [];
                        for (const [k, v] of Object.entries(value)) {
                            parts.push(`${k}: ${v}`);
                        }
                        return parts.join('\n');
                    }

                    return String(value);
                });
            });

            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text(`Project Report - ${projectReportMode.toUpperCase()}`, 14, 15);

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Generated: ${dateStr}`, 14, 22);
            doc.text(`Total Records: ${reportData.length}`, 14, 28);

            autoTable(doc, {
                startY: 35,
                head: head,
                body: body,
                theme: 'grid',
                styles: {
                    fontSize: 7,
                    cellPadding: 3,
                    overflow: 'linebreak',
                    cellWidth: 'wrap'
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    fontStyle: 'bold',
                    fontSize: 8,
                    halign: 'center'
                },
                didParseCell: function (data) {
                    if (data.cell.raw && typeof data.cell.raw === 'string') {
                        if (data.cell.raw.includes('\n')) {
                            data.cell.styles.fontSize = 6;
                            data.cell.styles.cellPadding = 2;
                        }
                    }
                },
                margin: { top: 35, left: 10, right: 10 }
            });

        } else {
            title = `Stock_Report_${stockReportType}_${dateStr}`;
            let head = [];
            let body = [];

            if (stockReportType === 'current' || stockReportType === 'day_wise') {
                head = [['ID', 'Name', 'Qty', 'Date', 'Available']];
                body = getFilteredData().map(row => [
                    row.componentID,
                    row.name,
                    row.quantity,
                    new Date(row.date || Date.now()).toLocaleDateString(),
                    row.available ? 'Available' : 'Out of Stock'
                ]);
            } else if (stockReportType === 'component_wise') {
                head = [['ID', 'Name', 'Total IN', 'Total OUT', 'Current Stock']];
                body = getFilteredData().map(row => [
                    row.componentID,
                    row.name,
                    row.totalIn,
                    row.totalOut,
                    row.currentStock
                ]);
            } else if (stockReportType === 'requirements') {
                head = [['ID', 'Name', 'Required', 'Available', 'Ordered', 'To Order']];
                body = getFilteredData().map(row => [
                    row.ID,
                    row.name,
                    row.reqty,
                    row.available,
                    row.ordered,
                    row.toOrder
                ]);
            } else if (stockReportType === 'in_cart') {
                head = [['Date', 'Comp ID', 'Comp Name', 'Qty', 'Cart ID', 'Vendor', 'Status', 'Remark']];
                body = getFilteredData().map(row => [
                    new Date(row.date).toLocaleDateString(),
                    row.componentID,
                    row.componentName || '-',
                    row.quantity,
                    row.cartDetails?.id || row.source,
                    row.cartDetails?.vendorName || '-',
                    row.cartDetails?.status || '-',
                    row.remark
                ]);
            } else {
                head = [['Date', 'ID', 'Name', 'Type', 'Qty', 'Source', 'Dest', 'Remark']];
                body = getFilteredData().map(row => [
                    new Date(row.date).toLocaleDateString(),
                    row.componentID,
                    row.componentName || '-',
                    row.type,
                    row.quantity,
                    row.source,
                    row.destination,
                    row.remark
                ]);
            }

            doc.setFontSize(16);
            doc.text(`Stock Report - ${stockReportType}`, 14, 20);

            autoTable(doc, {
                startY: 30,
                head: head,
                body: body,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 2 },
                headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold' }
            });
        }

        console.log('Saving PDF with filename:', `${title}.pdf`);
        doc.save(`${title}.pdf`);
    };

    const handleGenerate = async () => {
        setLoading(true);
        setReportData(null);
        setColumnFilters({});

        try {
            const token = localStorage.getItem('token');

            if (activeTab === 'project') {
                setGeneratedReportType('project_' + projectReportMode);

                // Construct Payload based on Mode
                let payload = {
                    filters: projectFilters,
                    projectDetails: {},
                    teamDetails: 'none',
                    otherDetails: {}
                };

                if (projectReportMode === 'summary') {
                    payload.projectDetails = { includeId: true, includeTitle: true, includeYear: true };
                    payload.teamDetails = 'id_only';
                    payload.otherDetails = { includeGuideDetails: true };
                } else if (projectReportMode === 'contact') {
                    payload.projectDetails = { includeId: true, includeTitle: true };
                    payload.teamDetails = 'id_name_contact_mobile';
                    payload.otherDetails = { includeGuideDetails: true };
                } else if (projectReportMode === 'detailed') {
                    payload.projectDetails = { includeId: true, includeTitle: true, includeDescription: true, includeYear: true };
                    payload.teamDetails = 'id_prn_name';
                    payload.otherDetails = { includeGuideDetails: true, includeComponents: true };
                } else {
                    // Custom
                    payload.projectDetails = {
                        includeId: projectCustomOptions.includeId,
                        includeTitle: projectCustomOptions.includeTitle,
                        includeDescription: projectCustomOptions.includeDescription,
                        includeYear: projectCustomOptions.includeYear
                    };
                    payload.teamDetails = projectCustomOptions.teamDetails;
                    payload.otherDetails = {
                        includeGuideDetails: projectCustomOptions.includeGuideDetails,
                        includeComponents: projectCustomOptions.includeComponents
                    };
                }

                const response = await axios.post(`${BASE_URL}/generate-project-report`, payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.data.success) {
                    setReportData(response.data.data);
                } else {
                    alert("Failed to generate project report.");
                }

            } else {
                setGeneratedReportType(stockReportType);

                // Special case for Requirements Report
                if (stockReportType === 'requirements') {
                    const response = await axios.get(`${BASE_URL}/mid-orders/fetch`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    // Filter client side as per requirements page logic (toOrder > 0)
                    if (response.data && response.data.data) {
                        const filtered = response.data.data.filter(item => item.toOrder > 0);
                        setReportData(filtered);
                    } else {
                        setReportData([]);
                    }
                } else {
                    const payload = {
                        reportType: stockReportType,
                        startDate: dateRange.startDate || undefined,
                        endDate: dateRange.endDate || undefined,
                        includeProjectDetails: stockOptions.projectDetails,
                        includeCartDetails: stockOptions.cartDetails
                    };

                    const response = await axios.post(`${BASE_URL}/generate-stock-report`, payload, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.data.success) {
                        setReportData(response.data.data);
                    } else {
                        alert("Failed to generate report: " + response.data.message);
                    }
                }
            }
        } catch (error) {
            console.error("Report generation error:", error);
            alert("An error occurred while generating the report.");
        } finally {
            setLoading(false);
        }
    };




    // Helper to get value for filtering
    const getRowValue = (row, key) => {
        if (!row) return '';
        let cellValue = '';

        try {
            if (generatedReportType === 'requirements') {
                if (key === 'ID') cellValue = row.ID;
                else if (key === 'name') cellValue = row.name;
                else if (key === 'reqty') cellValue = row.reqty;
                else if (key === 'available') cellValue = row.available;
                else if (key === 'ordered') cellValue = row.ordered;
                else if (key === 'toOrder') cellValue = row.toOrder;
                return cellValue ? String(cellValue) : '';
            }

            if (key === 'componentID') cellValue = row.componentID;
            else if (key === 'name') cellValue = row.name || row.componentName;
            else if (key === 'quantity') cellValue = row.quantity;
            else if (key === 'location') cellValue = row.location;
            else if (key === 'available') cellValue = row.available ? 'In Stock' : 'Out of Stock';
            else if (key === 'date') cellValue = row.date ? new Date(row.date).toLocaleDateString() : '';
            else if (key === 'type') cellValue = row.type;
            else if (key === 'source') cellValue = row.source;
            else if (key === 'destination') cellValue = row.destination;
            else if (key === 'remark') cellValue = row.remark;

            // Deep checks with optional chaining
            else if (key === 'projectTitle') cellValue = row.projectDetails?.title;
            else if (key === 'guide') cellValue = row.projectDetails?.guideName;

            // For Project Reports, keys are dynamic at top level
            else if (generatedReportType.startsWith('project_')) {
                cellValue = row[key];
            }

            else if (key === 'cartId') cellValue = row.cartDetails?.id;
            else if (key === 'vendor') cellValue = row.cartDetails?.vendorName;
            else if (key === 'status') cellValue = row.cartDetails?.status;
        } catch (e) {
            console.warn("Error getting row value for key:", key, e);
            return '';
        }

        return cellValue ? String(cellValue) : '';
    };

    // Helper to extract unique values for dropdowns
    const getUniqueOptions = (key) => {
        if (!reportData) return [];
        const values = new Set();
        reportData.forEach(row => {
            if (row) {
                const val = getRowValue(row, key);
                if (val) values.add(val);
            }
        });
        return Array.from(values).sort();
    };

    // Helper to get data after applying column filters
    const getFilteredData = () => {
        if (!reportData) return [];
        return reportData.filter(row => {
            // Check each filter
            for (const key of Object.keys(columnFilters)) {
                const filterValue = columnFilters[key];
                if (!filterValue) continue; // Skip empty filters

                const cellValue = getRowValue(row, key);
                if (cellValue !== filterValue) return false;
            }
            return true;
        });
    };

    const renderFilterDropdown = (columnKey, placeholder) => {
        const options = getUniqueOptions(columnKey);
        return (
            <div className="gen-rep-filter-wrapper">
                <select
                    className="gen-rep-column-filter"
                    value={columnFilters[columnKey] || ''}
                    onChange={(e) => handleFilterChange(columnKey, e.target.value)}
                >
                    <option value="">All</option>
                    {options.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
        );
    };

    const renderStockTable = () => {
        if (!reportData || reportData.length === 0) return <p className="gen-rep-no-data">No records.</p>;

        const isCurrent = generatedReportType === 'current';
        const isDayWise = generatedReportType === 'day_wise';
        const isComponentWise = generatedReportType === 'component_wise';
        const isProjectReportStock = generatedReportType === 'out_project' || generatedReportType === 'in_project';
        const isCartReport = generatedReportType === 'in_cart';
        const isRequirements = generatedReportType === 'requirements';
        const isProjectGen = generatedReportType.startsWith('project_');

        const filteredData = getFilteredData();

        return (
            <div className="gen-rep-table-responsive">
                <table className="gen-rep-table">
                    <thead>
                        <tr>
                            {isCurrent || isDayWise ? (
                                <>
                                    <th>ID {renderFilterDropdown('componentID')}</th>
                                    <th>Name {renderFilterDropdown('name')}</th>
                                    <th>Qty</th>
                                    {isCurrent && <th>Location {renderFilterDropdown('location')}</th>}
                                    <th>Available {renderFilterDropdown('available')}</th>
                                </>
                            ) : isComponentWise ? (
                                <>
                                    <th>ID {renderFilterDropdown('componentID')}</th>
                                    <th>Name {renderFilterDropdown('name')}</th>
                                    <th>Total IN {renderFilterDropdown('totalIn')}</th>
                                    <th>Total OUT {renderFilterDropdown('totalOut')}</th>
                                    <th>Current Stock {renderFilterDropdown('currentStock')}</th>
                                </>
                            ) : isRequirements ? (
                                <>
                                    <th>ID {renderFilterDropdown('ID')}</th>
                                    <th>Name {renderFilterDropdown('name')}</th>
                                    <th>Required {renderFilterDropdown('reqty')}</th>
                                    <th>Available {renderFilterDropdown('available')}</th>
                                    <th>Ordered {renderFilterDropdown('ordered')}</th>
                                    <th>To Order {renderFilterDropdown('toOrder')}</th>
                                </>
                            ) : isProjectGen ? (
                                <>
                                    {reportData && reportData.length > 0 && Object.keys(reportData[0]).map((key, i) => (
                                        <th key={i}>{key} {renderFilterDropdown(key)}</th>
                                    ))}
                                </>
                            ) : isProjectReportStock ? (
                                <>
                                    <th>Date {renderFilterDropdown('date')}</th>
                                    <th>Comp ID {renderFilterDropdown('componentID')}</th>
                                    <th>Comp Name {renderFilterDropdown('name')}</th>
                                    <th>Type</th>
                                    <th>Qty {renderFilterDropdown('quantity')}</th>
                                    <th>Project Title {renderFilterDropdown('projectTitle')}</th>
                                    <th>Guide {renderFilterDropdown('guide')}</th>
                                    <th>Team Details</th>
                                    <th>Remark {renderFilterDropdown('remark')}</th>
                                </>
                            ) : isCartReport ? (
                                <>
                                    <th>Date {renderFilterDropdown('date')}</th>
                                    <th>Comp ID {renderFilterDropdown('componentID')}</th>
                                    <th>Comp Name {renderFilterDropdown('name')}</th>
                                    <th>Qty {renderFilterDropdown('quantity')}</th>
                                    <th>Cart ID {renderFilterDropdown('cartId')}</th>
                                    <th>Vendor {renderFilterDropdown('vendor')}</th>
                                    <th>Order Date</th>
                                    <th>Status {renderFilterDropdown('status')}</th>
                                    <th>Remark</th>
                                </>
                            ) : (
                                <>
                                    <th>Date {renderFilterDropdown('date')}</th>
                                    <th>ID {renderFilterDropdown('componentID')}</th>
                                    <th>Name {renderFilterDropdown('name')}</th>
                                    <th>Type {renderFilterDropdown('type')}</th>
                                    <th>Quantity</th>
                                    <th>Source {renderFilterDropdown('source')}</th>
                                    <th>Destination {renderFilterDropdown('destination')}</th>
                                    <th>Remark</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr><td colSpan="10" className="gen-rep-no-data">No matching records found.</td></tr>
                        ) : (
                            filteredData.map((row, index) => {
                                if (isCurrent || isDayWise) {
                                    return (
                                        <tr key={index}>
                                            <td>{row.componentID}</td>
                                            <td>{row.name}</td>
                                            <td className={row.quantity < 10 ? 'gen-rep-low-stock' : ''}>{row.quantity}</td>
                                            {isCurrent && <td>{row.location || '-'}</td>}
                                            <td>
                                                <span className={`gen-rep-badge ${row.available ? 'available' : 'unavailable'}`}>
                                                    {row.available ? 'In Stock' : 'Out of Stock'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                } else if (isComponentWise) {
                                    return (
                                        <tr key={index}>
                                            <td>{row.componentID}</td>
                                            <td>{row.name}</td>
                                            <td style={{ color: 'green' }}>{row.totalIn}</td>
                                            <td style={{ color: 'red' }}>{row.totalOut}</td>
                                            <td className={row.currentStock < 0 ? 'gen-rep-low-stock' : ''}>
                                                <strong>{row.currentStock}</strong>
                                            </td>
                                        </tr>
                                    );
                                } else if (isRequirements) {
                                    /* Correct rendering for Requirements */
                                    return (
                                        <tr key={index}>
                                            <td>{row.ID}</td>
                                            <td>{row.name}</td>
                                            <td>{row.reqty}</td>
                                            <td>{row.available}</td>
                                            <td>{row.ordered}</td>
                                            <td>{row.toOrder}</td>
                                        </tr>
                                    );
                                } else if (isProjectGen) {
                                    /* Generic rendering for Project Reports */
                                    return (
                                        <tr key={index}>
                                            {Object.keys(row).map((key, i) => {
                                                const value = row[key];
                                                let displayValue;

                                                // Handle arrays (like team members or components)
                                                if (Array.isArray(value)) {
                                                    if (value.length === 0) {
                                                        displayValue = '-';
                                                    } else if (typeof value[0] === 'object') {
                                                        // Array of objects - display as a list
                                                        displayValue = (
                                                            <ul className="gen-rep-nested-list">
                                                                {value.map((item, idx) => (
                                                                    <li key={idx}>
                                                                        {Object.entries(item).map(([k, v]) => (
                                                                            <span key={k}>
                                                                                <strong>{k}:</strong> {v}{' '}
                                                                            </span>
                                                                        ))}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        );
                                                    } else {
                                                        // Array of primitives
                                                        displayValue = value.join(', ');
                                                    }
                                                }
                                                // Handle objects
                                                else if (typeof value === 'object' && value !== null) {
                                                    displayValue = (
                                                        <div className="gen-rep-nested-object">
                                                            {Object.entries(value).map(([k, v]) => (
                                                                <div key={k}>
                                                                    <strong>{k}:</strong> {String(v)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                }
                                                // Handle primitives
                                                else {
                                                    displayValue = value !== null && value !== undefined ? String(value) : '-';
                                                }
                                                return <td key={i}>{displayValue}</td>;
                                            })}
                                        </tr>
                                    );
                                } else if (isProjectReportStock) {
                                    const pd = row.projectDetails || {};
                                    return (
                                        <tr key={index}>
                                            <td>{new Date(row.date).toLocaleDateString()}</td>
                                            <td>{row.componentID}</td>
                                            <td>{row.componentName || '-'}</td>
                                            <td><span className={`gen-rep-badge ${row.type === 'IN' ? 'in-type' : 'out-type'}`}>{row.type}</span></td>
                                            <td>{row.quantity}</td>
                                            <td>
                                                {pd.title ? (
                                                    <div>
                                                        <strong>{pd.title}</strong>
                                                        <div className="gen-rep-small-text">ID: {pd.id}</div>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td>{pd.guideName || '-'}</td>
                                            <td>
                                                {pd.team ? (
                                                    <div className="team-details">
                                                        <strong>{pd.team.teamName}</strong>
                                                        <ul className="member-list">
                                                            {pd.team.members.map((m, i) => (
                                                                <li key={i}>{m.name} <span className="text-muted">({m.role})</span></li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td>{row.remark}</td>
                                        </tr>
                                    );
                                } else if (isCartReport) {
                                    // As before...
                                    const cd = row.cartDetails || {};
                                    return (
                                        <tr key={index}>
                                            <td>{new Date(row.date).toLocaleDateString()}</td>
                                            <td>{row.componentID}</td>
                                            <td>{row.componentName || '-'}</td>
                                            <td>{row.quantity}</td>
                                            <td>{cd.id || row.source}</td>
                                            <td>{cd.vendorName || '-'}</td>
                                            <td>{cd.orderDate ? new Date(cd.orderDate).toLocaleDateString() : '-'}</td>
                                            <td>
                                                <span className="gen-rep-status-badge">{cd.status || '-'}</span>
                                            </td>
                                            <td>{row.remark}</td>
                                        </tr>
                                    );
                                } else {
                                    // As before...
                                    return (
                                        <tr key={index}>
                                            <td>{new Date(row.date).toLocaleDateString()}</td>
                                            <td>{row.componentID}</td>
                                            <td>{row.componentName || '-'}</td>
                                            <td>
                                                <span className={`gen-rep-badge ${row.type === 'IN' ? 'in-type' : 'out-type'}`}>
                                                    {row.type}
                                                </span>
                                            </td>
                                            <td>{row.quantity}</td>
                                            <td>{row.source}</td>
                                            <td>{row.destination}</td>
                                            <td>{row.remark}</td>
                                        </tr>
                                    );
                                }
                            })
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    // Need to update handleGenerate as well, but can't do it in one big block easily without context.
    // I will replace handleGenerate separately or try to catch it here if I include it above.
    // Actually the above block starts AFTER handleGenerate. I'll need to update handleGenerate first.

    // Let's do handleGenerate first in a separate replace_file_content call since it's cleaner.
    // I will return the functions first.
    // Wait, I can do it all if I select the right lines. Ideally I would use multi-replace.
    // I'll stick to a strategy of updating handleGenerate first, then the render/helper methods.

    // Changing strategy: Only update renderStockTable and helpers here.


    return (
        <div className={userRole === 'Admin' ? "admin-dashboard" : "manager-dashboard"}>


            <div className="gen-rep-container">
                <div className="gen-rep-header">
                    <h1>Report Generation Center</h1>
                    <p>Select the type of report you wish to generate and customize the details.</p>
                </div>

                <div className="gen-rep-card">
                    <div className="gen-rep-tabs-header">
                        <button
                            className={`gen-rep-tab-btn ${activeTab === 'project' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('project'); setReportData(null); }}
                        >
                            Project Reports
                        </button>
                        <button
                            className={`gen-rep-tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('stock'); setReportData(null); }}
                        >
                            Stock Reports
                        </button>
                    </div>

                    <div className="gen-rep-tab-content">
                        {activeTab === 'project' ? (
                            <div className="gen-rep-project-section">
                                <div className="gen-rep-form-group">
                                    <label>Select Report Mode</label>
                                    <select
                                        className="gen-rep-select"
                                        value={projectReportMode}
                                        onChange={(e) => setProjectReportMode(e.target.value)}
                                    >
                                        <option value="summary">Summary List (Standard)</option>
                                        <option value="contact">Contact List Focus</option>
                                        <option value="detailed">Full Detailed Report</option>
                                        <option value="custom">Custom Configuration</option>

                                    </select>
                                </div>

                                {false ? (null) : (
                                    <>
                                        <div className="gen-rep-filters-row">
                                            <div className="gen-rep-form-group third">
                                                <label>Project Status</label>
                                                <select value={projectFilters.status} onChange={e => setProjectFilters({ ...projectFilters, status: e.target.value })}>
                                                    <option value="All">All</option>
                                                    <option value="Ongoing">Ongoing</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                            </div>
                                            <div className="gen-rep-form-group third">
                                                <label>Project Type</label>
                                                <select value={projectFilters.type} onChange={e => setProjectFilters({ ...projectFilters, type: e.target.value })}>
                                                    <option value="All">All</option>
                                                    <option value="Mini">Mini</option>
                                                    <option value="Mega">Mega</option>
                                                </select>
                                            </div>
                                            <div className="gen-rep-form-group third">
                                                <label>Batch</label>
                                                <select value={projectFilters.batch} onChange={e => setProjectFilters({ ...projectFilters, batch: e.target.value })}>
                                                    <option value="All">All</option>
                                                    <option value="2021">2021</option>
                                                    <option value="2022">2022</option>
                                                    <option value="2023">2023</option>
                                                    <option value="2024">2024</option>
                                                    <option value="2025">2025</option>
                                                </select>
                                            </div>
                                        </div>

                                        {projectReportMode === 'custom' && (
                                            <div className="gen-rep-custom-panel">
                                                <h4>Custom Report Details</h4>

                                                <div className="gen-rep-custom-section">
                                                    <label className="gen-rep-section-label">Project Details</label>
                                                    <div className="gen-rep-options-grid">
                                                        <label className="gen-rep-checkbox-label">
                                                            <input
                                                                type="checkbox"
                                                                checked={projectCustomOptions.includeId}
                                                                onChange={e => setProjectCustomOptions({ ...projectCustomOptions, includeId: e.target.checked })}
                                                            />
                                                            <span>Include ID</span>
                                                        </label>
                                                        <label className="gen-rep-checkbox-label">
                                                            <input
                                                                type="checkbox"
                                                                checked={projectCustomOptions.includeTitle}
                                                                onChange={e => setProjectCustomOptions({ ...projectCustomOptions, includeTitle: e.target.checked })}
                                                            />
                                                            <span>Include Title</span>
                                                        </label>
                                                        <label className="gen-rep-checkbox-label">
                                                            <input
                                                                type="checkbox"
                                                                checked={projectCustomOptions.includeDescription}
                                                                onChange={e => setProjectCustomOptions({ ...projectCustomOptions, includeDescription: e.target.checked })}
                                                            />
                                                            <span>Include Description</span>
                                                        </label>
                                                        <label className="gen-rep-checkbox-label">
                                                            <input
                                                                type="checkbox"
                                                                checked={projectCustomOptions.includeYear}
                                                                onChange={e => setProjectCustomOptions({ ...projectCustomOptions, includeYear: e.target.checked })}
                                                            />
                                                            <span>Include Year</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="gen-rep-custom-section">
                                                    <label className="gen-rep-section-label">Team Details</label>
                                                    <div className="gen-rep-radio-group">
                                                        <label className="gen-rep-radio-label">
                                                            <input
                                                                type="radio"
                                                                name="teamDetails"
                                                                value="none"
                                                                checked={projectCustomOptions.teamDetails === 'none'}
                                                                onChange={e => setProjectCustomOptions({ ...projectCustomOptions, teamDetails: e.target.value })}
                                                            />
                                                            <span>None</span>
                                                        </label>
                                                        <label className="gen-rep-radio-label">
                                                            <input
                                                                type="radio"
                                                                name="teamDetails"
                                                                value="id_only"
                                                                checked={projectCustomOptions.teamDetails === 'id_only'}
                                                                onChange={e => setProjectCustomOptions({ ...projectCustomOptions, teamDetails: e.target.value })}
                                                            />
                                                            <span>ID Only</span>
                                                        </label>
                                                        <label className="gen-rep-radio-label">
                                                            <input
                                                                type="radio"
                                                                name="teamDetails"
                                                                value="id_prn"
                                                                checked={projectCustomOptions.teamDetails === 'id_prn'}
                                                                onChange={e => setProjectCustomOptions({ ...projectCustomOptions, teamDetails: e.target.value })}
                                                            />
                                                            <span>ID + PRN</span>
                                                        </label>
                                                        <label className="gen-rep-radio-label">
                                                            <input
                                                                type="radio"
                                                                name="teamDetails"
                                                                value="id_prn_name"
                                                                checked={projectCustomOptions.teamDetails === 'id_prn_name'}
                                                                onChange={e => setProjectCustomOptions({ ...projectCustomOptions, teamDetails: e.target.value })}
                                                            />
                                                            <span>ID + PRN + Name</span>
                                                        </label>
                                                        <label className="gen-rep-radio-label">
                                                            <input
                                                                type="radio"
                                                                name="teamDetails"
                                                                value="id_name_contact_mobile"
                                                                checked={projectCustomOptions.teamDetails === 'id_name_contact_mobile'}
                                                                onChange={e => setProjectCustomOptions({ ...projectCustomOptions, teamDetails: e.target.value })}
                                                            />
                                                            <span>ID + Name + Contact (Mobile)</span>
                                                        </label>
                                                        <label className="gen-rep-radio-label">
                                                            <input
                                                                type="radio"
                                                                name="teamDetails"
                                                                value="id_name_contact_all"
                                                                checked={projectCustomOptions.teamDetails === 'id_name_contact_all'}
                                                                onChange={e => setProjectCustomOptions({ ...projectCustomOptions, teamDetails: e.target.value })}
                                                            />
                                                            <span>ID + Name + Contact (All)</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="gen-rep-custom-section">
                                                    <label className="gen-rep-section-label">Other Details</label>
                                                    <div className="gen-rep-options-grid">
                                                        <label className="gen-rep-checkbox-label">
                                                            <input
                                                                type="checkbox"
                                                                checked={projectCustomOptions.includeGuideDetails}
                                                                onChange={e => setProjectCustomOptions({ ...projectCustomOptions, includeGuideDetails: e.target.checked })}
                                                            />
                                                            <span>Include Guide Details</span>
                                                        </label>
                                                        <label className="gen-rep-checkbox-label">
                                                            <input
                                                                type="checkbox"
                                                                checked={projectCustomOptions.includeComponents}
                                                                onChange={e => setProjectCustomOptions({ ...projectCustomOptions, includeComponents: e.target.checked })}
                                                            />
                                                            <span>Include Components</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <button className="gen-rep-generate-btn" onClick={handleGenerate} disabled={loading}>
                                            {loading ? 'Generating Report...' : 'Generate Report'}
                                        </button>

                                        {reportData && (
                                            <div className="gen-rep-results fade-in">
                                                <div className="gen-rep-results-header">
                                                    <h3>Report Results ({reportData.length} records)</h3>
                                                    <button className="gen-rep-download-btn" onClick={downloadPDF}>
                                                        <FaDownload /> Download PDF
                                                    </button>
                                                </div>
                                                {renderStockTable()}
                                            </div>
                                        )}
                                    </>
                                )}

                            </div>
                        ) : (
                            <div className="gen-rep-stock-section">
                                <div className="gen-rep-filters-row">
                                    <div className="gen-rep-form-group hover-effect">
                                        <label><FaFilter /> Report Type</label>
                                        <select
                                            className="gen-rep-select"
                                            value={stockReportType}
                                            onChange={(e) => setStockReportType(e.target.value)}
                                        >
                                            <option value="current">Current Stock Status</option>
                                            <option value="requirements">Stock Requirements</option>
                                            <option value="in_cart">Items in Cart</option>
                                            <option value="in_stock">Stock In History</option>
                                            <option value="out_project">Stock Out (Projects)</option>
                                            <option value="out_distribution">Stock Out (Distribution)</option>

                                        </select>
                                    </div>
                                    <div className="gen-rep-form-group hover-effect">
                                        <label><FaCalendarAlt /> {stockReportType === 'day_wise' ? 'Select Date' : 'Date Range (Optional)'}</label>
                                        <div className="gen-rep-date-inputs">
                                            {stockReportType === 'day_wise' ? (
                                                <input
                                                    type="date"
                                                    value={dateRange.endDate}
                                                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                                />
                                            ) : (
                                                <>
                                                    <input
                                                        type="date"
                                                        value={dateRange.startDate}
                                                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                                    />
                                                    <span>to</span>
                                                    <input
                                                        type="date"
                                                        value={dateRange.endDate}
                                                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button className="gen-rep-generate-btn" onClick={handleGenerate} disabled={loading}>
                                    {loading ? 'Generating Report...' : 'Generate Report'}
                                </button>

                                {reportData && (
                                    <div className="gen-rep-results fade-in">
                                        <div className="gen-rep-results-header">
                                            <h3>Report Results</h3>
                                            <button className="gen-rep-download-btn" onClick={downloadPDF}>
                                                <FaDownload /> Download PDF
                                            </button>
                                        </div>
                                        {renderStockTable()}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GenerateReports;
