import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Inventory.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import NoDataFound from "../../../components/NoDataFound"; // Adjust the path if needed

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Inventory() {
  const [components, setComponents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [role, setRole] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setRole(user.role);
    }
    const token = localStorage.getItem("token");

    axios
      .get(`${BASE_URL}/get-all-components`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.success) {
          setComponents(res.data.data);
        }
      })
      .catch((err) => console.error("Failed to fetch components", err));
  }, []);

  const handleSearchChange = (e) => setSearchQuery(e.target.value.toLowerCase());
  const handleFilterChange = (e) => setFilter(e.target.value);

  const filteredComponents = components.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery);
    const matchesFilter =
      filter === "all" ||
      (filter === "inStock" && item.qnty > 0) ||
      (filter === "outOfStock" && item.qnty === 0);
    return matchesSearch && matchesFilter;
  });

  const downloadPDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString();

    doc.setFontSize(18);
    doc.text("Component Inventory Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${dateStr}`, 14, 30);

    const tableColumn = ["Component ID", "Name", "Quantity", "Status"];
    const tableRows = filteredComponents.map((item) => [
      item.cID,
      item.title,
      item.qnty,
      item.qnty > 0 ? "In Stock" : "Out of Stock",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "grid",
      headStyles: { fillColor: [0, 123, 255] },
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

    doc.save("Inventory_Report.pdf");
  };



  return (
    <div>

      <div className="inventory-container">
        <h2>Component Inventory</h2>

        <div className="top-controls">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />

          <select onChange={handleFilterChange} value={filter} className="filter-select">
            <option value="all">All</option>
            <option value="inStock">In Stock</option>
            <option value="outOfStock">Out of Stock</option>
          </select>

          <button onClick={downloadPDF} className="download-btn">
            Download PDF
          </button>
        </div>

        <div className="scroll-table-wrapper">
          {filteredComponents.length === 0 ? (
            <NoDataFound message="No components found in inventory." />
          ) : (
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Component ID</th>
                  <th>Name</th>
                  <th>Available Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredComponents.map((item) => (
                  <tr key={item._id}>
                    <td>{item.cID}</td>
                    <td>{item.title}</td>
                    <td>{item.qnty}</td>
                    <td className={item.qnty > 0 ? "in-stock" : "out-of-stock"}>
                      {item.qnty > 0 ? "In Stock" : "Out of Stock"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
