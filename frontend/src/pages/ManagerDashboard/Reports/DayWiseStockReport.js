import React, { useState } from 'react';

import './GenerateReports.css';
import { FaCalendarAlt, FaDownload, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const DayWiseStockReport = () => {
    const [date, setDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!date) {
            alert("Please select a date.");
            return;
        }

        setLoading(true);
        setReportData(null);

        try {
            const token = localStorage.getItem('token');
            const payload = {
                reportType: 'day_wise',
                endDate: date // API expects endDate for day_wise
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
        } catch (error) {
            console.error("Report generation error:", error);
            alert("An error occurred while generating the report.");
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        if (!reportData || reportData.length === 0) return;

        const doc = new jsPDF();
        const dateStr = new Date().toLocaleDateString();
        const selectedDateStr = new Date(date).toLocaleDateString();

        doc.setFontSize(18);
        doc.text(`Day Wise Stock Report`, 14, 20);
        doc.setFontSize(10);
        doc.text(`For Date: ${selectedDateStr}`, 14, 28);
        doc.text(`Generated: ${dateStr}`, 14, 34);

        const tableColumn = ["ID", "Name", "Quantity", "Available"];
        const tableRows = reportData.map(row => [
            row.componentID,
            row.name,
            row.quantity,
            row.available ? 'In Stock' : 'Out of Stock'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`DayWise_Report_${date}.pdf`);
    };

    return (
        <div className="manager-dashboard">


            <div className="gen-rep-container">
                <div className="gen-rep-header">
                    <h1>Day Wise Stock Report</h1>
                    <p>View stock status for a specific date.</p>
                </div>

                <div className="gen-rep-card">
                    <div className="gen-rep-filters-row">
                        <div className="gen-rep-form-group hover-effect" style={{ maxWidth: '300px' }}>
                            <label><FaCalendarAlt /> Select Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="gen-rep-form-control"
                            />
                        </div>
                    </div>

                    <button className="gen-rep-generate-btn" onClick={handleGenerate} disabled={loading}>
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>

                    {reportData && (
                        <div className="gen-rep-results fade-in">
                            <div className="gen-rep-results-header">
                                <h3>Results ({reportData.length} records)</h3>
                                <button className="gen-rep-download-btn" onClick={downloadPDF}>
                                    <FaDownload /> Download PDF
                                </button>
                            </div>

                            <div className="gen-rep-table-responsive">
                                <table className="gen-rep-table">
                                    <thead>
                                        <tr>
                                            <th>Component ID</th>
                                            <th>Name</th>
                                            <th>Quantity</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.length === 0 ? (
                                            <tr><td colSpan="4" className="gen-rep-no-data">No records found for this date.</td></tr>
                                        ) : (
                                            reportData.map((row, index) => (
                                                <tr key={index}>
                                                    <td>{row.componentID}</td>
                                                    <td>{row.name}</td>
                                                    <td className={row.quantity < 10 ? 'gen-rep-low-stock' : ''}>{row.quantity}</td>
                                                    <td>
                                                        <span className={`gen-rep-badge ${row.available ? 'available' : 'unavailable'}`}>
                                                            {row.available ? 'In Stock' : 'Out of Stock'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DayWiseStockReport;
