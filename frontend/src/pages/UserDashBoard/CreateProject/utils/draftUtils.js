// ============================================
// FILE: utils/draftUtils.js
// Draft Management Utilities
// ============================================

const DRAFT_STORAGE_KEY = 'project_draft';
const DRAFT_LIST_KEY = 'project_drafts_list';
const MAX_DRAFTS = 5;

/**
 * Save a draft to localStorage
 * @param {Object} draftData - The draft data to save
 * @param {string} draftId - Optional draft ID (uses projectID if not provided)
 * @returns {boolean} Success status
 */
export const saveDraft = (draftData, draftId = null) => {
  try {
    const id = draftId || draftData.projectID || `draft_${Date.now()}`;
    const draft = {
      ...draftData,
      id,
      timestamp: Date.now(),
      lastSaved: new Date().toLocaleString()
    };

    // Save individual draft
    localStorage.setItem(`${DRAFT_STORAGE_KEY}_${id}`, JSON.stringify(draft));

    // Update drafts list
    const draftsList = getDraftsList();
    const existingIndex = draftsList.findIndex(d => d.id === id);
    
    if (existingIndex !== -1) {
      draftsList[existingIndex] = {
        id,
        projectName: draft.formData.name || 'Untitled Project',
        projectType: draft.formData.type,
        timestamp: draft.timestamp,
        lastSaved: draft.lastSaved,
        step: draft.step
      };
    } else {
      draftsList.unshift({
        id,
        projectName: draft.formData.name || 'Untitled Project',
        projectType: draft.formData.type,
        timestamp: draft.timestamp,
        lastSaved: draft.lastSaved,
        step: draft.step
      });
    }

    // Keep only latest MAX_DRAFTS
    const trimmedList = draftsList.slice(0, MAX_DRAFTS);
    localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(trimmedList));

    // Remove old drafts
    draftsList.slice(MAX_DRAFTS).forEach(d => {
      localStorage.removeItem(`${DRAFT_STORAGE_KEY}_${d.id}`);
    });

    return true;
  } catch (error) {
    console.error('Error saving draft:', error);
    return false;
  }
};

/**
 * Load a specific draft
 * @param {string} draftId - The ID of the draft to load
 * @returns {Object|null} The draft data or null
 */
export const loadDraft = (draftId) => {
  try {
    const draftString = localStorage.getItem(`${DRAFT_STORAGE_KEY}_${draftId}`);
    if (draftString) {
      return JSON.parse(draftString);
    }
    return null;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

/**
 * Get list of all saved drafts
 * @returns {Array} Array of draft metadata
 */
export const getDraftsList = () => {
  try {
    const listString = localStorage.getItem(DRAFT_LIST_KEY);
    if (listString) {
      const list = JSON.parse(listString);
      // Filter out drafts older than 7 days
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return list.filter(draft => draft.timestamp > sevenDaysAgo);
    }
    return [];
  } catch (error) {
    console.error('Error getting drafts list:', error);
    return [];
  }
};

/**
 * Delete a specific draft
 * @param {string} draftId - The ID of the draft to delete
 * @returns {boolean} Success status
 */
export const deleteDraft = (draftId) => {
  try {
    localStorage.removeItem(`${DRAFT_STORAGE_KEY}_${draftId}`);
    
    const draftsList = getDraftsList();
    const updatedList = draftsList.filter(d => d.id !== draftId);
    localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(updatedList));
    
    return true;
  } catch (error) {
    console.error('Error deleting draft:', error);
    return false;
  }
};

/**
 * Delete all drafts
 * @returns {boolean} Success status
 */
export const deleteAllDrafts = () => {
  try {
    const draftsList = getDraftsList();
    draftsList.forEach(draft => {
      localStorage.removeItem(`${DRAFT_STORAGE_KEY}_${draft.id}`);
    });
    localStorage.removeItem(DRAFT_LIST_KEY);
    return true;
  } catch (error) {
    console.error('Error deleting all drafts:', error);
    return false;
  }
};

/**
 * Check if a draft exists for a specific project ID
 * @param {string} projectId - The project ID to check
 * @returns {boolean} Whether draft exists
 */
export const draftExists = (projectId) => {
  return localStorage.getItem(`${DRAFT_STORAGE_KEY}_${projectId}`) !== null;
};

/**
 * Get the most recent draft
 * @returns {Object|null} The most recent draft or null
 */
export const getMostRecentDraft = () => {
  const draftsList = getDraftsList();
  if (draftsList.length > 0) {
    return loadDraft(draftsList[0].id);
  }
  return null;
};

/**
 * Export draft as JSON file
 * @param {string} draftId - The ID of the draft to export
 */
export const exportDraft = (draftId) => {
  try {
    const draft = loadDraft(draftId);
    if (!draft) {
      throw new Error('Draft not found');
    }

    const dataStr = JSON.stringify(draft, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `project_draft_${draft.projectID}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting draft:', error);
    return false;
  }
};

/**
 * Import draft from JSON file
 * @param {File} file - The JSON file to import
 * @returns {Promise<Object|null>} The imported draft data or null
 */
export const importDraft = async (file) => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const draft = JSON.parse(e.target.result);
          // Validate draft structure
          if (!draft.formData || !draft.projectID) {
            throw new Error('Invalid draft format');
          }
          resolve(draft);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('Error importing draft:', error);
    return null;
  }
};

/**
 * Calculate draft completion percentage
 * @param {Object} formData - The form data to analyze
 * @returns {number} Completion percentage (0-100)
 */
export const calculateDraftCompletion = (formData) => {
  let completedFields = 0;
  const totalFields = 6;

  if (formData.type) completedFields++;
  if (formData.name) completedFields++;
  if (formData.description) completedFields++;
  if (formData.components && formData.components.length > 0) completedFields++;
  if (formData.teamID) completedFields++;
  if (formData.guideID) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
};

/**
 * Clean up old drafts (older than specified days)
 * @param {number} days - Number of days to keep drafts
 * @returns {number} Number of drafts deleted
 */
export const cleanupOldDrafts = (days = 7) => {
  try {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const draftsList = getDraftsList();
    let deletedCount = 0;

    draftsList.forEach(draft => {
      if (draft.timestamp < cutoffTime) {
        if (deleteDraft(draft.id)) {
          deletedCount++;
        }
      }
    });

    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up old drafts:', error);
    return 0;
  }
};