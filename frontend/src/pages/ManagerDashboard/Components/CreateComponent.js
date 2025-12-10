import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CreateComponent.css';
import { useNavigate, useLocation } from 'react-router-dom';

import TopBarWithLogo from '../TopBarWithLogo';
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const compressImage = (file, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = (err) => reject(err);
    };
  });
};

const CreateComponent = ({ onComponentCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    qnty: 0,
    price: '',
    loc: '',
    imageURL: '',
    imageFile: null,
    compressedImageBase64: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [generatedCID, setGeneratedCID] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    setGeneratedCID(`COM${Math.floor(10000 + Math.random() * 90000)}`);
  }, []);
  const location = useLocation();
  const returnTo = location.state?.returnTo || -1;


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'imageURL') {
      setFormData((prev) => ({ ...prev, imageFile: null, compressedImageBase64: null }));
      setImagePreview(value);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    const maxSizeMB = 1;

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Only JPG, PNG, or GIF files are allowed.');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      try {
        const compressed = await compressImage(file);
        setImagePreview(compressed);
        setFormData((prev) => ({
          ...prev,
          imageFile: null,
          imageURL: '',
          compressedImageBase64: compressed,
        }));
        setErrorMessage('');
      } catch {
        setErrorMessage('Image compression failed.');
      }
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({
          ...prev,
          imageFile: file,
          imageURL: '',
          compressedImageBase64: null,
        }));
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) await handleImageUpload({ target: { files: [file] } });
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imageURL: '',
      compressedImageBase64: null,
    }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token'); // ⬅️ Adjust if token is stored differently
    if (!token) {
      setErrorMessage('Authentication token missing.');
      return;
    }

    const imageData =
      formData.compressedImageBase64 ||
      (formData.imageFile ? imagePreview : formData.imageURL) ||
      null;

    const componentData = {
      title: formData.title,
      description: formData.description,
      qnty: formData.qnty,
      price: formData.price,
      loc: formData.loc,
      cID: generatedCID,
      image: imageData,
      minPurchase: 1,
      available: formData.qnty ? true : false,
    };

    try {
      await axios.post(
        `${BASE_URL}/create-component`,
        componentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(`Component created successfully with ID: ${generatedCID}`);
      setErrorMessage('');
      if (onComponentCreated) onComponentCreated(generatedCID);

      setFormData({
        title: '',
        description: '',
        qnty: 0,
        price: '',
        loc: '',
        imageURL: '',
        imageFile: null,
        compressedImageBase64: null,
      });
      setImagePreview(null);
      setGeneratedCID(`COM${Math.floor(10000 + Math.random() * 90000)}`);
      navigate(returnTo, {
        state: {
          newComponent: {
            name: formData.title,
            id: generatedCID,
            description: formData.description,
            quantity: Number(formData.qnty),
            price: formData.price
          }
        }
      });

    } catch (err) {
      console.error('Component creation failed:', err);
      setErrorMessage('Error creating component. Please try again.');
      setSuccessMessage('');
    }
  };

  return (
    <div className="create-component-container">
      {/* <h2>Create New Component</h2> */}
      <TopBarWithLogo title='Component Creation Utility' />
      <div className='mastt'>
        {generatedCID && <p className="cid-label">Generated Component ID: <strong>{generatedCID}</strong></p>}

        <form onSubmit={handleSubmit} className="create-component-form">
          <div className="form-row">
            <label>Component Title*</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} />
          </div>

          <div className="form-row">
            <label>Initial Quantity*</label>
            <input type="number" name="qnty" value={formData.qnty} onChange={handleChange} min="0" required />
          </div>

          <div className="form-row">
            <label>Add Local Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>

          <div className="form-row">
            <label>Location*</label>
            <input type="text" name="loc" value={formData.loc} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label>Or Image URL</label>
            <input type="text" name="imageURL" value={formData.imageURL} onChange={handleChange} />
          </div>

          <div className="form-row">
            <label>Approximate Price*</label>
            <input type="text" name="price" value={formData.price} onChange={handleChange} required />
          </div>

          <div className="dropzone" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
            <p>Drag & Drop an image here</p>
          </div>

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <a href="#" onClick={(e) => { e.preventDefault(); handleRemoveImage(); }} className="remove-img-link">
                Remove Image
              </a>
            </div>
          )}

          {successMessage && <p className="success-msg">{successMessage}</p>}
          {errorMessage && <p className="error-msg">{errorMessage}</p>}

          <button type="submit" className="submit-btn">Create Component</button>
        </form>
      </div>
    </div>
  );
};

export default CreateComponent;
