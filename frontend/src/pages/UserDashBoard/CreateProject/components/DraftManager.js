// ============================================
// FILE: components/DraftManager.js
// Component for viewing and managing saved drafts
// ============================================
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  DeleteSweep as DeleteSweepIcon
} from '@mui/icons-material';
import {
  getDraftsList,
  deleteDraft,
  deleteAllDrafts,
  exportDraft,
  calculateDraftCompletion
} from '../utils/draftUtils';

const DraftManager = ({ open, onClose, onLoadDraft }) => {
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);

  // Load drafts when dialog opens
  useEffect(() => {
    if (open) {
      loadDrafts();
    }
  }, [open]);

  const loadDrafts = () => {
    const draftsList = getDraftsList();
    setDrafts(draftsList);
  };

  const handleDelete = (draftId) => {
    setDraftToDelete(draftId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (draftToDelete) {
      deleteDraft(draftToDelete);
      loadDrafts();
      setShowDeleteConfirm(false);
      setDraftToDelete(null);
    }
  };

  const handleDeleteAll = () => {
    setShowDeleteAllConfirm(true);
  };

  const confirmDeleteAll = () => {
    deleteAllDrafts();
    setDrafts([]);
    setShowDeleteAllConfirm(false);
  };

  const handleExport = (draftId) => {
    exportDraft(draftId);
  };

  const handleRestore = (draftId) => {
    if (onLoadDraft) {
      onLoadDraft(draftId);
    }
    onClose();
  };

  const getStepLabel = (step) => {
    const steps = ['Type', 'Details', 'Components', 'Component Details', 'Team', 'Summary'];
    return steps[step - 1] || 'Unknown';
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Less than 7 days
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '60vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RestoreIcon color="primary" />
              <Typography variant="h6">Saved Drafts</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {drafts.length > 0 && (
                <Tooltip title="Delete all drafts">
                  <IconButton onClick={handleDeleteAll} color="error" size="small">
                    <DeleteSweepIcon />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {drafts.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No saved drafts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your drafts will appear here when you save them
              </Typography>
            </Box>
          ) : (
            <List>
              {drafts.map((draft, index) => {
                const completion = calculateDraftCompletion(draft);
                
                return (
                  <React.Fragment key={draft.id}>
                    <ListItem
                      sx={{
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        py: 2,
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" component="div">
                            {draft.projectName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                              label={draft.projectType}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              label={getStepLabel(draft.step)}
                              size="small"
                              color="info"
                            />
                          </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Last saved: {formatDate(draft.timestamp)}
                        </Typography>

                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Completion
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {completion}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={completion}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<RestoreIcon />}
                          onClick={() => handleRestore(draft.id)}
                          fullWidth
                        >
                          Restore
                        </Button>
                        <Tooltip title="Export draft">
                          <IconButton
                            size="small"
                            onClick={() => handleExport(draft.id)}
                            sx={{ border: 1, borderColor: 'divider' }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete draft">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(draft.id)}
                            color="error"
                            sx={{ border: 1, borderColor: 'divider' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                    {index < drafts.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this draft? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <Dialog
        open={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete All Drafts</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will permanently delete all {drafts.length} saved drafts.
          </Alert>
          <Typography>
            Are you sure you want to continue? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteAllConfirm(false)}>Cancel</Button>
          <Button onClick={confirmDeleteAll} color="error" variant="contained">
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DraftManager;    