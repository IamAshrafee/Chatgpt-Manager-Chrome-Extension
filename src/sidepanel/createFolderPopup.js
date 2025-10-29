export function initializeCreateFolderPopup() {
  const popupContainer = document.querySelector('.popupContainer');
  const closeBtn = document.getElementById('closeBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const createBtn = document.getElementById('createBtn');
  const folderNameInput = document.getElementById('folderName');
  const folderDescriptionTextarea = document.getElementById('folderDescription');

  // Validation messages
  const validationMessages = {
    emptyName: 'Folder name cannot be empty!',
    nameTooLong: 'Folder name should not exceed 50 characters.',
    descriptionTooLong: 'Description should not exceed 200 characters.',
    descriptionTooManyWords: 'Description should not exceed 20 words.',
    storageError: 'Failed to create folder. Please try again.'
  };

  // Focus management
  let previousActiveElement = null;

  function showPopup() {
    previousActiveElement = document.activeElement;
    popupContainer.classList.remove('hidden');
    folderNameInput.focus();
    
    // Add escape key listener
    document.addEventListener('keydown', handleEscapeKey);
  }

  function hidePopup() {
    popupContainer.classList.add('hidden');
    // Clear input fields when hiding the popup
    folderNameInput.value = '';
    folderDescriptionTextarea.value = '';
    
    // Remove escape key listener
    document.removeEventListener('keydown', handleEscapeKey);
    
    // Restore focus to previous element
    if (previousActiveElement) {
      previousActiveElement.focus();
    }
  }

  function handleEscapeKey(event) {
    if (event.key === 'Escape') {
      hidePopup();
    }
  }

  function validateInputs(folderName, folderDescription) {
    // Check if folder name is empty
    if (folderName.trim() === '') {
      showError(validationMessages.emptyName);
      folderNameInput.focus();
      return false;
    }

    // Check folder name length
    if (folderName.length > 50) {
      showError(validationMessages.nameTooLong);
      folderNameInput.focus();
      return false;
    }

    // Check description word count
    const wordCount = folderDescription.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 20) {
      showError(validationMessages.descriptionTooManyWords);
      folderDescriptionTextarea.focus();
      return false;
    }

    // Check description character length
    if (folderDescription.length > 200) {
      showError(validationMessages.descriptionTooLong);
      folderDescriptionTextarea.focus();
      return false;
    }

    return true;
  }

  function showError(message) {
    // You could replace this with a more sophisticated error display
    alert(message);
  }

  function sanitizeInput(text) {
    // Basic sanitization to prevent XSS
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async function createNewFolder() {
    const folderName = folderNameInput.value.trim();
    const folderDescription = folderDescriptionTextarea.value.trim();

    // Validate inputs
    if (!validateInputs(folderName, folderDescription)) {
      return;
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(folderName);
    const sanitizedDescription = sanitizeInput(folderDescription);

    const newFolder = {
      id: Date.now().toString(),
      name: sanitizedName,
      description: sanitizedDescription,
      chats: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const result = await chrome.storage.local.get('folders');
      const folders = result.folders || [];
      
      // Check for duplicate folder names
      const folderExists = folders.some(folder => 
        folder.name.toLowerCase() === sanitizedName.toLowerCase()
      );
      
      if (folderExists) {
        showError('A folder with this name already exists!');
        return;
      }

      folders.push(newFolder);
      await chrome.storage.local.set({ folders });

      // Dispatch event with folder details
      window.dispatchEvent(new CustomEvent('folderCreated', { 
        detail: { 
          folder: newFolder,
          totalFolders: folders.length
        }
      }));

      hidePopup();
      
    } catch (error) {
      console.error('Error creating folder:', error);
      showError(validationMessages.storageError);
    }
  }

  // Event Listeners
  closeBtn.addEventListener('click', hidePopup);
  cancelBtn.addEventListener('click', hidePopup);

  // Create button click handler
  createBtn.addEventListener('click', createNewFolder);

  // Enter key support in input fields
  folderNameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      createNewFolder();
    }
  });

  folderDescriptionTextarea.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      createNewFolder();
    }
  });

  // Close popup when clicking outside
  popupContainer.addEventListener('click', (event) => {
    if (event.target === popupContainer) {
      hidePopup();
    }
  });

  // Input validation while typing
  folderNameInput.addEventListener('input', () => {
    if (folderNameInput.value.length > 50) {
      folderNameInput.style.borderColor = '#ff4444';
    } else {
      folderNameInput.style.borderColor = '';
    }
  });

  folderDescriptionTextarea.addEventListener('input', () => {
    const wordCount = folderDescriptionTextarea.value.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 20 || folderDescriptionTextarea.value.length > 200) {
      folderDescriptionTextarea.style.borderColor = '#ff4444';
    } else {
      folderDescriptionTextarea.style.borderColor = '';
    }
  });

  return { 
    showPopup, 
    hidePopup,
    validateInputs // Export for testing
  };
}