import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Requirement.css";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Requirement = () => {
  const [midOrders, setMidOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRequirementData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/mid-orders/fetch`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter only rows where toOrder > 0
        const filtered = res.data.data.filter(item => item.toOrder > 0);
        setMidOrders(filtered);
      } catch (err) {
        console.error("Error fetching requirement data", err);
        alert("Auth error! Please log in again.");
      }
    };

    fetchRequirementData();
  }, [token]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Requirement Report", 14, 15);

    const tableColumn = ["ID", "Name", "Required", "Available", "Ordered", "To Order"];
    const tableRows = [];

    midOrders.forEach(item => {
      tableRows.push([
        item.ID,
        item.name,
        item.reqty,
        item.available,
        item.ordered,
        item.toOrder,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
    });

    doc.save("requirement_report.pdf");
  };

  return (
    <div>

      <div className="requirement-section">
        <div className="requirement-header">
          <h3>Requirement Table</h3>
          <button className="export-btn" onClick={exportPDF}>
            Export to PDF
          </button>
        </div>

        <table className="requirement-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Required</th>
              <th>Available</th>
              <th>Ordered</th>
              <th>To Order</th>
            </tr>
          </thead>
          <tbody>
            {midOrders.map((item, idx) => (
              <tr key={idx}>
                <td>{item.ID}</td>
                <td>{item.name}</td>
                <td>{item.reqty}</td>
                <td>{item.available}</td>
                <td>{item.ordered}</td>
                <td>{item.toOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Requirement;
