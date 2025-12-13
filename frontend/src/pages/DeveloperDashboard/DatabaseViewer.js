import React, { useState, useEffect } from 'react';
import TopBarWithLogo from '../AdminDashboard/TopBarWithLogo';
import { toast } from 'react-toastify';
import './DatabaseViewer.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const DatabaseViewer = () => {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'json'

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/developer/models`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setModels(result.models);
            }
        } catch (error) {
            console.error("Error fetching models:", error);
            toast.error("Failed to load models");
        }
    };

    const fetchData = async (modelName) => {
        setLoading(true);
        setSelectedModel(modelName);
        setData([]);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/developer/data/${modelName}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setData(result.data);
                toast.success(`Loaded ${result.count} entries for ${modelName}`);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const renderTable = () => {
        if (!data || data.length === 0) return <p className="no-data">No data found in this model.</p>;

        const headers = Object.keys(data[0]);

        return (
            <div className="table-wrapper">
                <table className="db-table">
                    <thead>
                        <tr>
                            {headers.map(key => <th key={key}>{key}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={idx}>
                                {headers.map(key => (
                                    <td key={key}>
                                        {typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="database-viewer">
            <TopBarWithLogo title="System Database Reflection" />

            <div className="db-container">
                <div className="db-sidebar">
                    <h3>Models</h3>
                    <ul className="model-list">
                        {models.map(model => (
                            <li
                                key={model}
                                className={selectedModel === model ? 'active' : ''}
                                onClick={() => fetchData(model)}
                            >
                                {model}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="db-content">
                    <div className="db-header">
                        <h2>{selectedModel ? `${selectedModel} Data` : 'Select a Model'}</h2>
                        {selectedModel && (
                            <div className="view-toggle">
                                <button
                                    className={viewMode === 'table' ? 'active' : ''}
                                    onClick={() => setViewMode('table')}
                                >
                                    Table
                                </button>
                                <button
                                    className={viewMode === 'json' ? 'active' : ''}
                                    onClick={() => setViewMode('json')}
                                >
                                    JSON
                                </button>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="loading">Loading data...</div>
                    ) : (
                        <div className="data-display">
                            {selectedModel && (
                                <>
                                    {viewMode === 'table' ? renderTable() : (
                                        <pre className="json-view">{JSON.stringify(data, null, 2)}</pre>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DatabaseViewer;
