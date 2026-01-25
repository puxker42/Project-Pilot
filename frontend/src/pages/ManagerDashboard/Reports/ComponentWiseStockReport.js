import React, { useState, useEffect } from 'react';

import './GenerateReports.css';
import { FaDownload, FaChartPie } from 'react-icons/fa';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ComponentWiseStockReport = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Auto-fetch on mount? User usually likes to click generate, but specific page implies purpose. 
    // Let's keep it manual or auto? Manual is safer, consistent with other reports.
    // Actually, since it's "Component Wise Stock Report" page, maybe just one button "Generate Fresh Report".

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                reportType: 'component_wise'
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

        doc.setFontSize(18);
        doc.text(`Component Wise Stock Report`, 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${dateStr}`, 14, 28);

        const tableColumn = ["ID", "Name", "Total IN", "Total OUT", "Current Stock"];
        const tableRows = reportData.map(row => [
            row.componentID,
            row.name,
            row.totalIn,
            row.totalOut,
            row.currentStock
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`ComponentWise_Report_${dateStr}.pdf`);
    };

    // Effect to load data automatically on enter if desired? 
    // I'll leave it as button for now to avoid load spikes if not needed.

    return (
        <div className="manager-dashboard">


            <div className="gen-rep-container">
                <div className="gen-rep-header">
                    <h1>Component Wise Stock Report</h1>
                    <p>Detailed analysis of component movement (In/Out) and current standing.</p>
                </div>

                <div className="gen-rep-card">
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <button className="gen-rep-generate-btn" onClick={handleGenerate} disabled={loading} style={{ width: '250px' }}>
                            {loading ? 'Generating Analysis...' : 'Generate Analysis'}
                        </button>
                    </div>

                    {reportData && (
                        <div className="gen-rep-results fade-in">
                            <div className="gen-rep-results-header">
                                <h3>Analysis Results ({reportData.length} components)</h3>
                                <button className="gen-rep-download-btn" onClick={downloadPDF}>
                                    <FaDownload /> Download PDF
                                </button>
                            </div>

                            <div className="gen-rep-table-responsive">
                                <table className="gen-rep-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Total IN</th>
                                            <th>Total OUT</th>
                                            <th>Current Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.length === 0 ? (
                                            <tr><td colSpan="5" className="gen-rep-no-data">No records found.</td></tr>
                                        ) : (
                                            reportData.map((row, index) => (
                                                <tr key={index}>
                                                    <td>{row.componentID}</td>
                                                    <td>{row.name}</td>
                                                    <td style={{ color: 'green', fontWeight: 'bold' }}>{row.totalIn}</td>
                                                    <td style={{ color: '#e74a3b', fontWeight: 'bold' }}>{row.totalOut}</td>
                                                    <td className={row.currentStock < 10 ? 'gen-rep-low-stock' : ''}>
                                                        <strong>{row.currentStock}</strong>
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

export default ComponentWiseStockReport;
