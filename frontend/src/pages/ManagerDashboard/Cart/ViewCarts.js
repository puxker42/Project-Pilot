import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ViewCarts.css';

import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../../images/logo.png';
import NoDataFound from '../../../components/NoDataFound';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  InputAdornment
} from '@mui/material';
import {
  FilterList,
  Clear,
  Store,
  Inventory
} from '@mui/icons-material';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ViewCarts = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [componentSearch, setComponentSearch] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [selectedCart, setSelectedCart] = useState(null);
  const [selectedForRemoval, setSelectedForRemoval] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/get-carts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCarts(res.data.data);
      } catch (err) {
        setError('Failed to load carts');
      } finally {
        setLoading(false);
      }
    };

    fetchCarts();
  }, []);

  const openDetailsModal = (cart) => {
    setSelectedCart(cart);
    setSelectedForRemoval([]);
  };

  const closeModal = () => {
    setSelectedCart(null);
    setSelectedForRemoval([]);
  };

  const goToOrderPage = (token) => {
    navigate(`/cart-order/${token}`);
  };

  const handleCheckboxToggle = (index) => {
    setSelectedForRemoval((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const removeSelectedComponents = () => {
    if (!selectedCart) return;
    const updatedDetails = selectedCart.details.filter(
      (_, index) => !selectedForRemoval.includes(index)
    );
    setSelectedCart({ ...selectedCart, details: updatedDetails });
    setSelectedForRemoval([]);
  };

  const handleCheckIn = (cart) => {
    navigate(`/cart-check-in/${cart.ID}`, { state: { cart } });
  };

  const handleUpdateCart = (cart) => {
    navigate('/get-order', {
      state: {
        cart,
        editMode: true,
      },
    });
  };

  const generatePDF = async (cart) => {
    const token = localStorage.getItem('token');
    const invoiceItems = cart.details.map((item) => ({
      ID: item.ID,
      name: item.Name,
      toOrder: item.orderedQuantity,
    }));

    try {
      const meRes = await axios.get(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const senderName = meRes?.data?.data?.name || 'Department Representative';

      const doc = new jsPDF();
      const img = new Image();
      img.src = logo;

      img.onload = async () => {
        doc.addImage(img, 'PNG', 14, 10, 28, 28);
        doc.setFont('Times', 'Bold');
        doc.setFontSize(14);
        doc.text('Department of Electronics Engineering', 45, 16);

        doc.setFont('Times', 'Normal');
        doc.setFontSize(12);
        doc.text('Walchand College of Engineering, Sangli', 45, 23);
        doc.text('416416, Maharashtra, India', 45, 30);

        doc.setFontSize(11);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 30, { align: 'right' });
        doc.setDrawColor(100);
        doc.setLineWidth(0.3);
        doc.line(14, 38, 196, 38);

        let y = 48;
        doc.text('To,', 14, y);
        doc.text('The Supplier,', 14, (y += 7));

        doc.setFont('Times', 'Bold');
        doc.text('Subject:', 14, (y += 12));
        doc.setFont('Times', 'Normal');
        doc.text('Request for the supply of listed electronic components.', 32, y);

        doc.text('Respected Sir/Madam,', 14, (y += 12));
        doc.text(
          'We kindly request you to supply the following electronic components listed below as they are',
          14,
          (y += 10),
          { maxWidth: 180 }
        );
        doc.text(
          'essential for the ongoing academic and project activities in our department.',
          14,
          (y += 6),
          { maxWidth: 180 }
        );

        const invoiceData = invoiceItems.map((item, index) => [
          index + 1,
          item.ID,
          item.name,
          item.toOrder,
        ]);

        autoTable(doc, {
          startY: y + 10,
          head: [['#', 'ID', 'Name', 'Required Quantity']],
          body: invoiceData,
          theme: 'grid',
          styles: { fontSize: 11 },
          headStyles: { fillColor: [50, 50, 50], textColor: 255 },
        });

        const afterTableY = doc.lastAutoTable.finalY + 10;

        doc.text(
          'We assure you that the components will be utilized solely for academic and research purposes.',
          14,
          afterTableY
        );
        doc.text(
          'We would appreciate your prompt response and cooperation in this matter.',
          14,
          afterTableY + 8
        );

        doc.text('Thank you.', 14, afterTableY + 18);
        doc.text('Sincerely,', 14, afterTableY + 26);

        doc.setFont('Times', 'Bold');
        doc.text(`${senderName}`, 14, afterTableY + 33);
        doc.setFont('Times', 'Normal');
        doc.text('Department of Electronics Engineering', 14, afterTableY + 40);
        doc.text('WCE, Sangli', 14, afterTableY + 47);

        const signatureY = afterTableY + 70;
        doc.setLineWidth(0.2);
        doc.line(30, signatureY, 80, signatureY);
        doc.line(130, signatureY, 180, signatureY);

        doc.setFontSize(11);
        doc.text('Head of Department', 30, signatureY + 6);
        doc.text('Dept. of Electronics Engg.', 30, signatureY + 12);

        doc.text('Director', 130, signatureY + 6);
        doc.text('Walchand College of Engineering', 130, signatureY + 12);
        doc.text('Sangli', 130, signatureY + 18);

        doc.save(`Order_${cart.ID}.pdf`);
      };

      img.onerror = () => {
        alert('Failed to load logo.');
      };
    } catch (err) {
      console.error('Error while creating PDF:', err);
      alert('Failed to generate PDF.');
    }
  };

  // --- Filtering Logic ---
  const filteredCarts = carts.filter(cart => {
    // 1. Component Search (by ID or Name nested in details)
    const matchesComponent = componentSearch === '' || cart.details?.some(item =>
      (item.ID?.toLowerCase().includes(componentSearch.toLowerCase())) ||
      (item.Name?.toLowerCase().includes(componentSearch.toLowerCase()))
    );

    // 2. Vendor Search (by Name or ID)
    const matchesVendor = vendorSearch === '' ||
      (cart.vendorName?.toLowerCase().includes(vendorSearch.toLowerCase())) ||
      (cart.vendorID?.toLowerCase().includes(vendorSearch.toLowerCase()));

    // 3. Date Filter
    // Format cart date to YYYY-MM-DD for comparison with input date
    const cartDate = new Date(cart.crationDate).toISOString().split('T')[0];
    const matchesDate = dateFilter === '' || cartDate === dateFilter;

    return matchesComponent && matchesVendor && matchesDate;
  });

  const clearFilters = () => {
    setComponentSearch('');
    setVendorSearch('');
    setDateFilter('');
  };

  // --- Summary PDF Logic ---
  const generateSummaryPDF = (cart) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let yPos = 20;

    // Helper for styled sections
    const addSectionHeader = (text, y) => {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 35, 126); // Navy Blue
      doc.text(text, margin, y);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);
      return y + 10;
    };

    const addLabelValue = (label, value, x, y) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100);
      doc.text(label + ':', x, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      doc.text(String(value), x + 35, y);
    };

    // --- Title ---
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text("CART SUMMARY REPORT", margin, yPos);
    yPos += 15;

    // --- Cart Info ---
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos);
    yPos += 10;

    yPos = addSectionHeader("Cart Details", yPos);

    // Row 1
    addLabelValue("Cart ID", cart.ID, margin, yPos);
    addLabelValue("Status", cart.checkIn ? "Checked In" : cart.ordered ? "Ordered" : "Pending", margin + 80, yPos);
    yPos += 8;

    // Row 2
    const vendorName = cart.vendorName || 'N/A';
    const vendorID = cart.vendorID || 'N/A';
    addLabelValue("Vendor", `${vendorName} (${vendorID})`, margin, yPos);
    yPos += 8;

    // Row 3 (Dates)
    addLabelValue("Created At", new Date(cart.crationDate).toLocaleDateString(), margin, yPos);
    addLabelValue("Ordered At", cart.orderDate ? new Date(cart.orderDate).toLocaleDateString() : '-', margin + 80, yPos);
    yPos += 8;
    addLabelValue("Checked In", cart.checkInDate ? new Date(cart.checkInDate).toLocaleDateString() : '-', margin, yPos);
    yPos += 15;

    // --- Component Table ---
    yPos = addSectionHeader("Component Details", yPos);

    const tableHeaders = [['#', 'Comp ID', 'Name', 'Ordered', 'Recv', 'Dmg', 'Deficit', 'Status']];
    const tableData = cart.details.map((item, index) => {
      const deficitText = item.deflict?.number > 0 ? `${item.deflict.number} (${item.deflict.remark || ''})` : '-';
      return [
        index + 1,
        item.ID,
        item.Name,
        item.orderedQuantity,
        item.receivedQuantity ?? '-',
        item.damageCount ?? '-',
        deficitText,
        item.checkIn ? 'OK' : 'Pending'
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: tableHeaders,
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3, halign: 'center' },
      columnStyles: {
        2: { halign: 'left' } // Name alignment
      },
      margin: { left: margin, right: margin }
    });

    // --- Footer ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, 290, { align: 'right' });
    }

    doc.save(`Cart_Summary_${cart.ID}.pdf`);
  };

  if (loading) return <div className="loader"></div>;
  if (error) return <div className="view-carts-container11 error11">{error}</div>;

  return (
    <div className="view-carts-container11">


      <div className="mstt">
        {/* Filters Section */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <FilterList color="primary" />
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                  FILTERS
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Search Component (ID or Name)"
                placeholder="e.g. Resistor, CMP123"
                value={componentSearch}
                onChange={(e) => setComponentSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Inventory color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: 'white' }}
              />
            </Grid>

            <Grid item xs={12} sm={3} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Vendor (Name or ID)"
                placeholder="Search Vendor..."
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Store color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: 'white' }}
              />
            </Grid>

            <Grid item xs={12} sm={3} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Creation Date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ bgcolor: 'white' }}
              />
            </Grid>

            <Grid item xs={12} sm={2} md={2}>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                startIcon={<Clear />}
                onClick={clearFilters}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {filteredCarts.length === 0 ? (
          <NoDataFound message="No carts match your filters." />
        ) : (
          <table className="cart-table11">
            <thead>
              <tr>
                <th>Cart ID</th>
                <th>Vendor ID</th>
                <th>Vendor Name</th>
                <th>Creation Date</th>
                <th>Order Date</th>
                <th>Check-In Date</th>
                <th></th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarts.map((cart) => (
                <tr key={cart._id}>
                  <td>{cart.ID}</td>
                  <td>{cart.vendorID || 'N/A'}</td>
                  <td>{cart.vendorName || 'N/A'}</td>
                  <td>{new Date(cart.crationDate).toLocaleDateString()}</td>
                  <td>{cart.orderDate ? new Date(cart.orderDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{cart.checkInDate ? new Date(cart.checkInDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button className="btn-view11" onClick={() => openDetailsModal(cart)}>View Details</button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      <button className="btn-pdf11" style={{ backgroundColor: '#2c3e50' }} onClick={() => generateSummaryPDF(cart)} title="Download Internal Summary Report">
                        Summary
                      </button>
                      {cart.checkIn ? (
                        <button className="btn-pdf11" style={{ backgroundColor: '#27ae60' }} onClick={() => generatePDF(cart)} title="Download Supplier Order Letter">
                          Order Letter
                        </button>
                      ) : cart.ordered ? (
                        <button className="btn-checkin11" onClick={() => handleCheckIn(cart)}>Check In</button>
                      ) : (
                        <>
                          <button className="btn-order11" onClick={() => goToOrderPage(cart.ID)}>Order</button>
                          <button className="btn-update11" onClick={() => handleUpdateCart(cart)}>Update</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {selectedCart && (
          <div className="modal-overlay11">
            <div className="modal-content11">
              <div className="modal-header11">
                <h3>Details for Cart: {selectedCart.ID}</h3>
                <button className="close-btn11" onClick={closeModal}>✖</button>
              </div>
              <table className="details-table11">
                <thead>
                  <tr>
                    <th></th>
                    <th>Component ID</th>
                    <th>Name</th>
                    <th>Ordered Quantity</th>
                    <th>Received Quantity</th>
                    <th>Deficit</th>
                    <th>Check-In</th>
                    <th>Damage Count</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCart.details.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedForRemoval.includes(i)}
                          onChange={() => handleCheckboxToggle(i)}
                        />
                      </td>
                      <td>{item.ID}</td>
                      <td>{item.Name}</td>
                      <td>{item.orderedQuantity}</td>
                      <td>{item.receivedQuantity ?? 'N/A'}</td>
                      <td>{item.deflict?.number ? `${item.deflict.number} - ${item.deflict.remark}` : 'None'}</td>
                      <td>{item.checkIn ? 'Yes' : 'No'}</td>
                      <td>{item.damageCount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedForRemoval.length > 0 && (
                <button className="remove-selected-btn11" onClick={removeSelectedComponents}>
                  Remove Selected
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewCarts;
