import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CheckIn.css';
import { useLocation, useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CheckIn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = location.state || {};
  const [details, setDetails] = useState([]);
  const [activeTCRIndex, setActiveTCRIndex] = useState(null);
  const [newComponent, setNewComponent] = useState({
    name: '',
    purpose: '',
    image: '',
    price: '',
    quantity: 0
  });

  useEffect(() => {
    if (cart?.details) {
      const updatedDetails = cart.details.map(item => ({
        ...item,
        receivedQuantity: item.receivedQuantity || 0,
        damageCount: item.damageCount || 0,
        checkIn: false,
        deflict: {
          number: 0,
          remark: ''
        },
        finally: Math.max((item.receivedQuantity || 0) - (item.damageCount || 0), 0)
      }));
      setDetails(updatedDetails);
    }
  }, [cart]);

  const handleInputChange = (index, field, value) => {
    const updated = [...details];
    const item = updated[index];

    if (field === 'receivedQuantity') {
      item.receivedQuantity = parseInt(value) || 0;
    } else if (field === 'damageCount') {
      item.damageCount = parseInt(value) || 0;
    } else if (field === 'remark') {
      item.deflict.remark = value;
    } else if (field === 'checkIn') {
      item.checkIn = value;
    }

    if (item.orderedQuantity > item.receivedQuantity) {
      item.deflict.number = item.orderedQuantity - item.receivedQuantity;
    } else {
      item.deflict.number = 0;
      item.deflict.remark = '';
    }

    item.finally = Math.max(item.receivedQuantity - item.damageCount, 0);

    setDetails(updated);
  };

  const generateComID = () => {
    return "CMP" + Math.floor(1000 + Math.random() * 9000);
  };

  const createComponent = async () => {
    if (!newComponent.name.trim()) {
      alert("Component name is required.");
      return;
    }

    const comID = generateComID();
    const payload = {
      name: newComponent.name,
      cID: comID,
      description: newComponent.purpose || '',
      // quantity: newComponent.quantity || 0,
      image: newComponent.image || '',
      price: newComponent.price || ''
    };

    try {
      const res = await fetch(`${BASE_URL}/create-component/form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Component created successfully!");
        const updated = [...details];
        updated[activeTCRIndex].ID = comID;
        updated[activeTCRIndex].Name = newComponent.name;
        setDetails(updated);
        setNewComponent({ name: '', purpose: '', image: '', price: '', quantity: 0 });
        setActiveTCRIndex(null);
      } else {
        alert("Creation failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.put(
        `${BASE_URL}/cart/checkin/${cart.ID}`,
        {
          checkInDate: new Date(),
          details
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      alert('Cart checked in successfully');
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert('Failed to check in cart');
    }
  };

  const str = `Check In - Cart ${cart?.ID}`;
  const hasUnresolvedTCR = details.some(d => d.ID === 'TCR');

  return (
    <div className="checkin-container">
      <h2>{str}</h2>
      <table className="checkin-table">
        <thead>
          <tr>
            <th>Component ID</th>
            <th>Name</th>
            <th>Ordered Qty</th>
            <th>Received Qty</th>
            <th>Damage Count</th>
            <th>Deficit</th>
            <th>Remark</th>
            <th>Final Qty</th>
            <th>Check In?</th>
          </tr>
        </thead>
        <tbody>
          {details.map((item, idx) => (
            <tr key={idx}>
              <td>{item.ID}</td>
              <td>{item.Name}</td>
              <td>{item.orderedQuantity}</td>
              <td>
                <input
                  type="number"
                  value={item.receivedQuantity}
                  onChange={e => handleInputChange(idx, 'receivedQuantity', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.damageCount}
                  onChange={e => handleInputChange(idx, 'damageCount', e.target.value)}
                />
              </td>
              <td>{item.deflict.number || 0}</td>
              <td>
                <input
                  type="text"
                  value={item.deflict.remark}
                  onChange={e => handleInputChange(idx, 'remark', e.target.value)}
                  disabled={item.deflict.number === 0}
                />
              </td>
              <td>{item.finally}</td>
              <td>
                {item.ID === 'TCR' ? (
                  <button
                    onClick={() => {
                      setActiveTCRIndex(idx);
                      setNewComponent({
                        name: item.Name || '',
                        purpose: '',
                        image: '',
                        price: '',
                        quantity: item.finally || 0
                      });
                    }}
                  >
                    Create Component
                  </button>
                ) : (
                  <input
                    type="checkbox"
                    checked={item.checkIn}
                    onChange={e => handleInputChange(idx, 'checkIn', e.target.checked)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {activeTCRIndex !== null && (
        <div className="component-request-form" style={{ marginTop: '20px' }}>
          <h4>Request New Component</h4>

          <input
            type="text"
            placeholder="Component Name *"
            value={newComponent.name}
            onChange={e => setNewComponent({ ...newComponent, name: e.target.value })}
          />

          <textarea
            placeholder="Description"
            value={newComponent.purpose}
            onChange={e => setNewComponent({ ...newComponent, purpose: e.target.value })}
          />

          <input
            type="number"
            placeholder="Approximate Price (₹)"
            value={newComponent.price}
            onChange={e => setNewComponent({ ...newComponent, price: e.target.value })}
          />

          <input
            type="number"
            placeholder="Initial Quantity"
            value={newComponent.quantity}
            onChange={e =>
              setNewComponent({ ...newComponent, quantity: parseInt(e.target.value) || 0 })
            }
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setNewComponent(prev => ({ ...prev, image: reader.result }));
                };
                reader.readAsDataURL(file);
              }
            }}
          />

          {newComponent.image && (
            <div style={{ marginTop: '10px' }}>
              <p>Preview:</p>
              <img
                src={newComponent.image}
                alt="Component Preview"
                style={{ maxWidth: '150px', borderRadius: '8px' }}
              />
            </div>
          )}

          <div style={{ marginTop: '10px' }}>
            <button onClick={createComponent}>Submit Request</button>
            <button onClick={() => setActiveTCRIndex(null)} style={{ marginLeft: '10px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <button
        className="checkin-submit-btn"
        onClick={handleSubmit}
        disabled={hasUnresolvedTCR}
      >
        Submit Check In
      </button>
    </div>
  );
};

export default CheckIn;
