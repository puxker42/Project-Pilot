// ============================================
// FILE: Form.js (Main Component with Draft Functionality)
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Restore as RestoreIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import StepOne from './components/StepOne';
import StepTwo from './components/StepTwo';
import StepThree from './components/StepThree';
import StepFour from './components/StepFour';
import StepFive from './components/StepFive';
import StepSix from './components/StepSix';
import { generateProjectID } from './utils/idGenerator';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const DRAFT_STORAGE_KEY = 'project_draft';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

const Form = () => {
  const [step, setStep] = useState(1);
  const [stepHistory, setStepHistory] = useState([]);
  const [projectID, setProjectID] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    description: '',
    components: [],
    teamID: '',
    guideID: '',
  });

  const navigate = useNavigate();
  const [allComponents, setAllComponents] = useState([]);
  
  // Draft-related states
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // const navigate = useNavigate();

  // Check for existing draft on mount
  useEffect(() => {
    const checkForDraft = () => {
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          // Check if draft is less than 7 days old
          const draftAge = Date.now() - draft.timestamp;
          const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
          
          if (draftAge < sevenDaysInMs) {
            setDraftData(draft);
            setShowDraftDialog(true);
          } else {
            // Clear old draft
            localStorage.removeItem(DRAFT_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Error checking for draft:', error);
      }
    };

    checkForDraft();
  }, []);

  // Initialize project ID
  useEffect(() => {
    if (step === 1 && !projectID) {
      setProjectID(generateProjectID());
    }
  }, [step, projectID]);

  // Fetch components
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/get-all-components`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = response.data;
        if (data.success && Array.isArray(data.data)) {
          const valid = data.data
            .filter(c => c && typeof c.title === 'string')
            .map(c => ({ ...c, name: c.title, id: c.cID }));
          setAllComponents(valid);
        } else {
          console.error('Invalid component data:', data);
        }
      } catch (error) {
        console.error('Error fetching components:', error);
      }
    };

    fetchComponents();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const autoSaveTimer = setInterval(() => {
      // Only auto-save if there's meaningful data
      if (formData.type || formData.name || formData.description || 
          formData.components.length > 0 || formData.teamID || formData.guideID) {
        saveDraft(true); // true indicates auto-save
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(autoSaveTimer);
  }, [formData, step, projectID, acknowledged, autoSaveEnabled]);

  // Save draft function
  const saveDraft = useCallback((isAutoSave = false) => {
    try {
      const draftToSave = {
        formData,
        step,
        stepHistory,
        projectID,
        acknowledged,
        timestamp: Date.now(),
        lastSaved: new Date().toLocaleString()
      };

      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftToSave));
      setLastSaved(new Date().toLocaleString());

      if (!isAutoSave) {
        setSnackbar({
          open: true,
          message: 'Draft saved successfully!',
          severity: 'success'
        });
      }

      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save draft',
        severity: 'error'
      });
      return false;
    }
  }, [formData, step, stepHistory, projectID, acknowledged]);

  // Load draft function
  const loadDraft = () => {
    if (draftData) {
      setFormData(draftData.formData);
      setStep(draftData.step);
      setStepHistory(draftData.stepHistory || []);
      setProjectID(draftData.projectID);
      setAcknowledged(draftData.acknowledged || false);
      setLastSaved(draftData.lastSaved);
      
      setSnackbar({
        open: true,
        message: 'Draft restored successfully!',
        severity: 'success'
      });
    }
    setShowDraftDialog(false);
  };

  // Discard draft function
  const discardDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraftData(null);
    setShowDraftDialog(false);
    setSnackbar({
      open: true,
      message: 'Draft discarded',
      severity: 'info'
    });
  };

  // Clear draft after successful submission
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setLastSaved(null);
  };

  const handleComponentChange = (index, field, value) => {
    const updated = [...formData.components];
    updated[index][field] = value;
    setFormData({ ...formData, components: updated });
  };

  const handleSubmit = async () => {
    try {
      const dataToSend = {
        ID: projectID,
        type: formData.type,
        title: formData.name,
        description: formData.description,
        teamID: formData.teamID,
        guideID: formData.guideID,
        components: formData.components.map(comp => ({
          id: comp.id,
          name: comp.name,
          purpose: comp.purpose,
          quantity: comp.quantity
        }))
      };
      
      const response = await axios.post(`${BASE_URL}/create-project`, dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          'authorization': localStorage.getItem('token')
        }
      });

      const result = response.data;
      if (result.success) {
        clearDraft(); // Clear draft after successful submission
        setSnackbar({
          open: true,
          message: 'Project submitted successfully!',
          severity: 'success'
        });
        setTimeout(() => navigate(-1), 1500);
      } else {
        setSnackbar({
          open: true,
          message: 'Project submission failed!',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSnackbar({
        open: true,
        message: 'Submission failed. Please try again.',
        severity: 'error'
      });
    }
  };

  const goNext = (nextStep) => {
    setStepHistory(prev => [...prev, step]);
    setStep(nextStep);
  };

  const goBack = () => {
    const history = [...stepHistory];
    const prevStep = history.pop();
    if (prevStep !== undefined) {
      setStep(prevStep);
      setStepHistory(history);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const steps = ['Type', 'Details', 'Components', 'Component Details', 'Team', 'Summary'];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepOne
            formData={formData}
            setFormData={setFormData}
            projectID={projectID}
            acknowledged={acknowledged}
            setAcknowledged={setAcknowledged}
            goNext={goNext}
          />
        );
      case 2:
        return (
          <StepTwo
            formData={formData}
            setFormData={setFormData}
            goBack={goBack}
            goNext={goNext}
          />
        );
      case 3:
        return (
          <StepThree
            formData={formData}
            setFormData={setFormData}
            allComponents={allComponents}
            goBack={goBack}
            goNext={goNext}
          />
        );
      case 4:
        return (
          <StepFour
            formData={formData}
            handleComponentChange={handleComponentChange}
            goBack={goBack}
            goNext={goNext}
          />
        );
      case 5:
        return (
          <StepFive
            formData={formData}
            setFormData={setFormData}
            goBack={goBack}
            goNext={goNext}
          />
        );
      case 6:
        return (
          <StepSix
            formData={formData}
            projectID={projectID}
            acknowledged={acknowledged}
            setAcknowledged={setAcknowledged}
            goBack={goBack}
            handleSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Draft Status and Save Button */}
      <Paper elevation={1} sx={{ mb: 2, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={() => saveDraft(false)}
            size="small"
          >
            Save Draft
          </Button>
          {lastSaved && (
            <Typography variant="caption" color="text.secondary">
              Last saved: {lastSaved}
            </Typography>
          )}
          <Chip
            label={autoSaveEnabled ? "Auto-save ON" : "Auto-save OFF"}
            size="small"
            color={autoSaveEnabled ? "success" : "default"}
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
      </Paper>

      {/* Stepper */}
      <Paper elevation={2} sx={{ mb: 3, p: 2 }}>
        <Stepper activeStep={step - 1} alternativeLabel>
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            return (
              <Step
                key={label}
                completed={step > stepNumber}
                sx={{ cursor: stepNumber < step ? 'pointer' : 'default' }}
                onClick={() => {
                  if (stepNumber < step) {
                    setStep(stepNumber);
                    setStepHistory((prev) => prev.slice(0, prev.indexOf(stepNumber)));
                  } else if (stepNumber === step + 1) {
                    setStepHistory((prev) => [...prev, step]);
                    setStep(stepNumber);
                  }
                }}
              >
                <StepLabel>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Paper>

      {/* Form Steps */}
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>

      {/* Draft Recovery Dialog */}
      <Dialog
        open={showDraftDialog}
        onClose={() => setShowDraftDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RestoreIcon color="primary" />
              <Typography variant="h6">Draft Found</Typography>
            </Box>
            <IconButton onClick={() => setShowDraftDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            We found a saved draft from your previous session.
          </Typography>
          {draftData && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Project Type:</strong> {draftData.formData.type || 'Not set'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Project Name:</strong> {draftData.formData.name || 'Not set'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Components:</strong> {draftData.formData.components.length} selected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Last Saved:</strong> {draftData.lastSaved || 'Unknown'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Current Step:</strong> {steps[draftData.step - 1]}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
            Would you like to continue from where you left off?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={discardDraft} color="error">
            Start Fresh
          </Button>
          <Button onClick={loadDraft} variant="contained" autoFocus>
            Continue Draft
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Form;