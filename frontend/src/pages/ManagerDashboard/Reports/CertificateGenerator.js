import React, { useState } from 'react';

import './GenerateReports.css'; // Reusing styles for consistency
import { FaCertificate, FaDownload } from 'react-icons/fa';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CertificateGenerator = () => {
    const [projectId, setProjectId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDownloadCertificate = async () => {
        if (!projectId.trim()) {
            alert("Please enter a valid Project ID.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/generate-certificate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ projectId: projectId.trim() })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Certificate-${projectId}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                const data = await response.json();
                alert(data.message || "Failed to generate certificate. Please check the Project ID.");
            }
        } catch (error) {
            console.error("Certificate download error:", error);
            alert("An error occurred while downloading the certificate.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="manager-dashboard">


            <div className="gen-rep-container">
                <div className="gen-rep-header">
                    <h1>Certificate Generator</h1>
                    <p>Enter the Project ID to generate and download the official completion certificate.</p>
                </div>

                <div className="gen-rep-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '3rem', color: '#f6c23e', marginBottom: '20px' }}>
                        <FaCertificate />
                    </div>

                    <div className="gen-rep-form-group" style={{ maxWidth: '400px', margin: '0 auto 30px' }}>
                        <label style={{ textAlign: 'left', display: 'block', marginBottom: '8px' }}>Project ID</label>
                        <input
                            type="text"
                            className="gen-rep-form-control"
                            placeholder="e.g. PRJ-2023-001"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            style={{ fontSize: '1.1rem', padding: '12px' }}
                        />
                    </div>

                    <button
                        className="gen-rep-generate-btn"
                        onClick={handleDownloadCertificate}
                        disabled={loading}
                        style={{ backgroundColor: '#e74c3c', width: '100%', maxWidth: '400px' }}
                    >
                        {loading ? (
                            <span>Generating...</span>
                        ) : (
                            <>
                                <FaDownload style={{ marginRight: '8px' }} /> Download Certificate
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CertificateGenerator;
