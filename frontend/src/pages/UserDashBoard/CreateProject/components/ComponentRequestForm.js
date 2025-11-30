// ============================================
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { generateComID } from '../utils/idGenerator';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ComponentRequestForm = ({ setFormData, setShowRequestForm }) => {
  const [requestedComponents, setRequestedComponents] = useState([{
    name: '',
    purpose: '',
    image: '',
    price: ''
  }]);

  const handleSubmitRequest = async () => {
    const comp = requestedComponents[0];
    if (!comp.name.trim()) {
      alert("Component name is required.");
      return;
    }

    const comID = generateComID();
    const newComponentPayload = {
      name: comp.name,
      cID: comID,
      description: comp.purpose || '',
      quantity: 0,
      image: comp.image || '',
      price: comp.price || ''
    };

    try {
      const res = await fetch(`${BASE_URL}/create-component/form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newComponentPayload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Component request submitted successfully!");

        setFormData((prev) => ({
          ...prev,
          components: [
            ...prev.components,
            {
              id: comID,
              name: comp.name,
              purpose: comp.purpose || '',
              quantity: 1
            }
          ]
        }));
      } else {
        alert("Request failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to submit request", err);
      alert("Something went wrong. Please try again later.");
    }

    setShowRequestForm(false);
    setRequestedComponents([{ name: '', purpose: '', image: '', price: '' }]);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Request New Component
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Component Name"
            placeholder="Component Name *"
            value={requestedComponents[0].name}
            onChange={(e) => {
              const updated = [...requestedComponents];
              updated[0].name = e.target.value;
              setRequestedComponents(updated);
            }}
            required
            fullWidth
          />

          <TextField
            label="Description"
            placeholder="Description"
            value={requestedComponents[0].purpose}
            onChange={(e) => {
              const updated = [...requestedComponents];
              updated[0].purpose = e.target.value;
              setRequestedComponents(updated);
            }}
            multiline
            rows={3}
            fullWidth
          />

          <TextField
            label="Approximate Price"
            placeholder="Approximate Price (₹)"
            type="number"
            value={requestedComponents[0].price || ''}
            onChange={(e) => {
              const updated = [...requestedComponents];
              updated[0].price = e.target.value;
              setRequestedComponents(updated);
            }}
            fullWidth
          />

          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
          >
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const updated = [...requestedComponents];
                    updated[0].image = reader.result;
                    setRequestedComponents(updated);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </Button>

          {requestedComponents[0].image && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Preview:
              </Typography>
              <Box
                component="img"
                src={requestedComponents[0].image}
                alt="Component Preview"
                sx={{
                  maxWidth: 150,
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider'
                }}
              />
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleSubmitRequest}
          >
            Submit Request
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ComponentRequestForm;