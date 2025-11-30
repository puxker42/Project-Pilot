import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './RequirementManager.css';
import { useNavigate, useLocation } from 'react-router-dom';
import TopBarWithLogo from '../TopBarWithLogo';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const RequirementManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, editMode } = location.state || {};
  const [midOrders, setMidOrders] = useState([]);
  const [initialMidOrders, setInitialMidOrders] = useState([]);
  const [masterComponents, setMasterComponents] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [newEntry, setNewEntry] = useState({ ID: 'TCR', name: '', quantity: '' });
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isNameLocked, setIsNameLocked] = useState(false);
  const token = localStorage.getItem('token');

  const nameInputRef = useRef();
  const suggestionRef = useRef();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target) &&
        !nameInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (editMode && cart?.details?.length) {
      setCartItems(cart.details.map(c => ({
        ID: c.ID,
        Name: c.Name,
        orderedQuantity: c.orderedQuantity,
      })));
    }
  }, [editMode, cart]);

  const fetchInitialData = async () => {
    try {
      const [reqRes, compRes] = await Promise.all([
        axios.get(`${BASE_URL}/mid-orders/fetch`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BASE_URL}/get-all-components`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const filteredReqs = reqRes.data.data.filter(item => item.toOrder > 0);
      setMidOrders(filteredReqs);
      setInitialMidOrders(reqRes.data.data);
      setMasterComponents(compRes.data.data || []);
    } catch (err) {
      console.error('ERROR', err);
      alert('Auth error! Please log in again.');
    }
  };

  const handleNameChange = (value) => {
    const name = value;
    setNewEntry(prev => ({ ...prev, name, quantity: prev.quantity }));
    setError('');

    const filtered = [...masterComponents, ...midOrders]
      .filter(item =>
        (item.name || item.title || '').includes(name)
      )
      .slice(0, 5);
    setSuggestions(filtered);

    const exactReq = midOrders.find(item => item.name === name);
    const exactMaster = masterComponents.find(item => item.title === name);

    if (exactReq) {
      setNewEntry(prev => ({ ...prev, ID: exactReq.ID }));
      setIsNameLocked(true);
    } else if (exactMaster) {
      setNewEntry(prev => ({ ...prev, ID: exactMaster.cID }));
      setIsNameLocked(true);
    } else {
      setNewEntry(prev => ({ ...prev, ID: 'TCR' }));
      setIsNameLocked(false);
    }
  };

  const handleSuggestionClick = (name) => {
    handleNameChange(name);
    setSuggestions([]);
  };

  const handleAddEntry = () => {
    const { ID, name, quantity } = newEntry;
    if (!name || !quantity) return setError('Please enter name and quantity.');

    const enteredQty = parseInt(quantity);
    if (enteredQty <= 0 || isNaN(enteredQty)) {
      return setError('Please enter a valid positive quantity.');
    }

    let updatedMidOrders = [...midOrders];
    const existing = updatedMidOrders.find(item => item.ID === ID);
    const masterMatch = masterComponents.find(c => c.cID === ID);
    const isNewComponent = ID === 'TCR';

    const resolvedName = existing?.name || masterMatch?.title || name;

    if (!resolvedName && isNewComponent) {
      return setError('Please enter a valid name for the new component.');
    }

    if (!isNewComponent && cartItems.some(c => c.ID === ID)) {
      return setError('Duplicate ID entry is not allowed.');
    }

    let source = 'new';
    if (existing) source = 'requirement';
    else if (masterMatch) source = 'manual';

    if (existing) {
      const updatedQty = Math.min(enteredQty, existing.toOrder);
      updatedMidOrders = updatedMidOrders.map(item =>
        item.ID === ID
          ? {
              ...item,
              toOrder: item.toOrder - updatedQty,
              ordered: (item.ordered || 0) + updatedQty
            }
          : item
      ).filter(item => item.toOrder > 0);
    }

    if (isNewComponent) {
      alert('New component not found in system. Entry will be saved with ID "TCR".\nYou have to create component while checkIn');
    }

    setCartItems(prev => [
      ...prev,
      {
        ID: isNewComponent ? 'TCR' : ID,
        Name: resolvedName,
        orderedQuantity: enteredQty,
        __source: source
      }
    ]);

    setMidOrders(updatedMidOrders);
    setNewEntry({ ID: '', name: '', quantity: '' });
    setIsNameLocked(false);
    setSuggestions([]);
    setError('');
  };

  const handleRemoveEntry = (index) => {
    const itemToRemove = cartItems[index];
    const updatedCart = [...cartItems];
    updatedCart.splice(index, 1);

    const source = itemToRemove.__source;

    if (source === 'requirement') {
      const original = initialMidOrders.find(item => item.ID === itemToRemove.ID);
      if (original) {
        const alreadyExists = midOrders.find(item => item.ID === original.ID);
        if (alreadyExists) {
          setMidOrders(midOrders.map(item =>
            item.ID === original.ID
              ? {
                  ...item,
                  toOrder: item.toOrder + itemToRemove.orderedQuantity,
                  ordered: Math.max((item.ordered || 0) - itemToRemove.orderedQuantity, 0)
                }
              : item
          ));
        } else {
          setMidOrders([
            ...midOrders,
            {
              ...original,
              toOrder: itemToRemove.orderedQuantity,
              ordered: Math.max((original.ordered || 0) - itemToRemove.orderedQuantity, 0)
            }
          ]);
        }
      }
    } else if (source === 'manual') {
      const master = masterComponents.find(c => c.cID === itemToRemove.ID);
      setMidOrders(prev => [
        ...prev,
        {
          ID: itemToRemove.ID,
          name: itemToRemove.Name,
          reqty: 0,
          available: master.qnty || 0,
          ordered: 0,
          toOrder: itemToRemove.orderedQuantity
        }
      ]);
    } else {
      setMidOrders(prev => [
        ...prev,
        {
          ID: itemToRemove.ID,
          name: itemToRemove.Name,
          reqty: 0,
          available: 0,
          ordered: 0,
          toOrder: itemToRemove.orderedQuantity
        }
      ]);
    }

    setCartItems(updatedCart);
  };

  const handleSaveCart = async () => {
    try {
      let res2;
      let newCartID;

      if (editMode) {
        const updatedCart = {
          ID: cart.ID,
          vendorID: cart.vendorID || undefined,
          vendorName: cart.vendorName || undefined,
          ordered: cart.ordered ?? false,
          orderDate: cart.orderDate || undefined,
          checkInDate: cart.checkInDate || undefined,
          token: token,
          details: cartItems.map(({ __source, ...rest }) => rest)
        };

        res2 = await axios.put(`${BASE_URL}/update-cart`, updatedCart, {
          headers: { Authorization: `Bearer ${token}` }
        });

        newCartID = cart.ID;
      } else {
        res2 = await axios.post(`${BASE_URL}/create-cart`, {
          details: cartItems,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        newCartID = res2?.data?.data?.ID;
      }

      if (!res2?.data?.success || !newCartID) {
        alert(`Failed to ${editMode ? 'update' : 'create'} Cart. Requirement Table update skipped.`);
        return;
      }

      const updatedMidOrdersPayload = initialMidOrders.map(item => {
        const remaining = midOrders.find(m => m.ID === item.ID);
        return {
          ID: item.ID,
          toOrder: remaining ? remaining.toOrder : 0,
          ordered: remaining ? remaining.ordered : item.ordered || 0,
          cartID: newCartID
        };
      });

      const res1 = await axios.put(`${BASE_URL}/mid-orders/update`, {
        updatedReqs: updatedMidOrdersPayload,
        creationDate: new Date(),
        cartID: newCartID
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res1) {
        alert(`Cart ${editMode ? 'updated' : 'created'} but failed to update Requirement Table`);
        return;
      }

      alert(`Cart ${editMode ? 'updated' : 'created'} and requirement table saved successfully!`);
      setCartItems([]);
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert(`Failed to ${editMode ? 'update' : 'save'} cart.`);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/create-cart`, {
        details: cartItems
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const createdCart = res.data?.data;
      if (!createdCart?.ID) {
        alert('Cart created, but response missing cart ID.');
        return;
      }

      alert('Cart created successfully! Redirecting to Order page...');
      navigate(`/cart-order/${createdCart.ID}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create and order cart.');
    }
  };

  return (
    <div className="req-container">
      <TopBarWithLogo title='Cart Master' />
      {/* ✅ Removed top margin / padding by styling inline */}
      <div className='mstt' style={{ paddingTop: '0px', marginTop: '0px' }}>
        {editMode && (
          <div className="edit-banner">
            <strong>Editing Cart:</strong> {cart?.ID || 'Cart ID not found'}
          </div>
        )}

        <div className="req-section">
          <h3>Requirement Table</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Required</th><th>Available</th><th>Ordered</th><th>To Order</th>
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

        <div className="req-entry">
          <h3>Add Entry</h3>
          <div className="entry-row" style={{ position: 'relative' }}>
            <input placeholder="ID" value={newEntry.ID} readOnly />
            <div className="suggestion-wrapper" ref={suggestionRef}>
              <input
                ref={nameInputRef}
                className="req-input"
                placeholder="Name"
                value={newEntry.name}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  handleNameChange(e.target.value);
                  setShowSuggestions(true);
                  setHighlightIndex(-1);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    setHighlightIndex((prev) => (prev + 1) % suggestions.length);
                  } else if (e.key === 'ArrowUp') {
                    setHighlightIndex((prev) =>
                      (prev - 1 + suggestions.length) % suggestions.length
                    );
                  } else if (e.key === 'Enter' && highlightIndex >= 0) {
                    e.preventDefault();
                    const selected = suggestions[highlightIndex];
                    handleSuggestionClick(selected.name || selected.title);
                    setHighlightIndex(-1);
                    setShowSuggestions(false);
                  }
                }}
              />
              {showSuggestions && suggestions.length > 0 && newEntry.name.trim() && (
                <ul className="suggestion-list">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        handleSuggestionClick(s.name || s.title);
                        setShowSuggestions(false);
                      }}
                      className={i === highlightIndex ? 'highlight' : ''}
                    >
                      {s.name || s.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <input
              placeholder="Quantity"
              type="number"
              value={newEntry.quantity}
              onChange={e => setNewEntry({ ...newEntry, quantity: e.target.value })}
            />
          </div>
          <button onClick={handleAddEntry}>+ Add Entry</button>
          {error && <p className="error">{error}</p>}
        </div>

        <div className="req-cart">
          <h3>Cart Preview</h3>
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Ordered Quantity</th><th></th></tr>
            </thead>
            <tbody>
              {cartItems.map((item, i) => (
                <tr key={i}>
                  <td>{item.ID}</td>
                  <td>{item.Name}</td>
                  <td>{item.orderedQuantity}</td>
                  <td>
                    <button className="remove-btn" onClick={() => handleRemoveEntry(i)}>X</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="req-actions">
          <button onClick={handleSaveCart}>{editMode ? 'Update Cart' : 'Save Cart'}</button>
          <button
            className="place-order"
            onClick={handlePlaceOrder}
            disabled={editMode}
            title={editMode ? "Can't place order while editing existing cart" : ""}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequirementManager;
