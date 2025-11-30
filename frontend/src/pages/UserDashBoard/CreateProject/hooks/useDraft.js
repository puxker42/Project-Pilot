// ============================================
// FILE: hooks/useDraft.js
// Custom Hook for Draft Management
// ============================================
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  saveDraft as saveDraftUtil,
  loadDraft as loadDraftUtil,
  deleteDraft as deleteDraftUtil,
  getDraftsList,
  getMostRecentDraft,
  calculateDraftCompletion
} from '../utils/draftUtils';

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

/**
 * Custom hook for managing form drafts
 * @param {Object} formData - Current form data
 * @param {number} step - Current step
 * @param {Array} stepHistory - Step navigation history
 * @param {string} projectID - Project ID
 * @param {boolean} acknowledged - Acknowledgement state
 * @param {Object} options - Configuration options
 * @returns {Object} Draft management functions and state
 */
export const useDraft = (
  formData,
  step,
  stepHistory,
  projectID,
  acknowledged,
  options = {}
) => {
  const {
    autoSaveEnabled: initialAutoSave = true,
    autoSaveInterval = AUTO_SAVE_INTERVAL,
    onSaveSuccess = null,
    onSaveError = null,
    onLoadSuccess = null,
    onLoadError = null
  } = options;

  const [autoSaveEnabled, setAutoSaveEnabled] = useState(initialAutoSave);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const autoSaveTimerRef = useRef(null);

  /**
   * Save current form state as draft
   */
  const saveDraft = useCallback(
    async (isAutoSave = false) => {
      try {
        setIsSaving(true);
        setSaveError(null);

        const draftData = {
          formData,
          step,
          stepHistory,
          projectID,
          acknowledged
        };

        const success = saveDraftUtil(draftData, projectID);

        if (success) {
          const now = new Date().toLocaleString();
          setLastSaved(now);
          
          if (onSaveSuccess) {
            onSaveSuccess({ isAutoSave, timestamp: now });
          }
          
          return { success: true, timestamp: now };
        } else {
          throw new Error('Failed to save draft');
        }
      } catch (error) {
        console.error('Error in saveDraft:', error);
        setSaveError(error.message);
        
        if (onSaveError) {
          onSaveError(error);
        }
        
        return { success: false, error: error.message };
      } finally {
        setIsSaving(false);
      }
    },
    [formData, step, stepHistory, projectID, acknowledged, onSaveSuccess, onSaveError]
  );

  /**
   * Load a draft by ID
   */
  const loadDraft = useCallback(
    async (draftId) => {
      try {
        const draft = loadDraftUtil(draftId);
        
        if (draft) {
          setLastSaved(draft.lastSaved);
          
          if (onLoadSuccess) {
            onLoadSuccess(draft);
          }
          
          return { success: true, data: draft };
        } else {
          throw new Error('Draft not found');
        }
      } catch (error) {
        console.error('Error in loadDraft:', error);
        
        if (onLoadError) {
          onLoadError(error);
        }
        
        return { success: false, error: error.message };
      }
    },
    [onLoadSuccess, onLoadError]
  );

  /**
   * Delete a draft by ID
   */
  const deleteDraft = useCallback(async (draftId) => {
    try {
      const success = deleteDraftUtil(draftId);
      
      if (success && draftId === projectID) {
        setLastSaved(null);
      }
      
      return { success };
    } catch (error) {
      console.error('Error in deleteDraft:', error);
      return { success: false, error: error.message };
    }
  }, [projectID]);

  /**
   * Get list of all drafts
   */
  const listDrafts = useCallback(() => {
    try {
      return getDraftsList();
    } catch (error) {
      console.error('Error listing drafts:', error);
      return [];
    }
  }, []);

  /**
   * Get the most recent draft
   */
  const getRecentDraft = useCallback(() => {
    try {
      return getMostRecentDraft();
    } catch (error) {
      console.error('Error getting recent draft:', error);
      return null;
    }
  }, []);

  /**
   * Calculate completion percentage
   */
  const getCompletion = useCallback(() => {
    return calculateDraftCompletion(formData);
  }, [formData]);

  /**
   * Check if there are unsaved changes
   */
  const hasUnsavedChanges = useCallback(() => {
    // Check if form has any meaningful data
    return (
      formData.type ||
      formData.name ||
      formData.description ||
      formData.components.length > 0 ||
      formData.teamID ||
      formData.guideID
    );
  }, [formData]);

  /**
   * Toggle auto-save
   */
  const toggleAutoSave = useCallback(() => {
    setAutoSaveEnabled(prev => !prev);
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled) {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      return;
    }

    // Set up auto-save interval
    autoSaveTimerRef.current = setInterval(() => {
      if (hasUnsavedChanges()) {
        saveDraft(true);
      }
    }, autoSaveInterval);

    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [autoSaveEnabled, autoSaveInterval, hasUnsavedChanges, saveDraft]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges() && autoSaveEnabled) {
        saveDraft(true);
        // Show browser warning
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, autoSaveEnabled, saveDraft]);

  return {
    // State
    autoSaveEnabled,
    lastSaved,
    isSaving,
    saveError,
    completion: getCompletion(),
    hasUnsavedChanges: hasUnsavedChanges(),
    
    // Functions
    saveDraft,
    loadDraft,
    deleteDraft,
    listDrafts,
    getRecentDraft,
    toggleAutoSave,
    setAutoSaveEnabled
  };
};