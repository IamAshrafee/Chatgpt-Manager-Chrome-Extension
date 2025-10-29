import { initializeCreateFolderPopup } from './createFolderPopup.js';

// Folder management utilities
const FolderManager = {
  async getAllFolders() {
    try {
      const result = await chrome.storage.local.get('folders');
      return result.folders || [];
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw new Error('Failed to load folders');
    }
  },

  async saveFolders(folders) {
    try {
      await chrome.storage.local.set({ folders });
    } catch (error) {
      console.error('Error saving folders:', error);
      throw new Error('Failed to save folders');
    }
  },

  async deleteFolder(folderId) {
    try {
      const folders = await this.getAllFolders();
      const updatedFolders = folders.filter(folder => folder.id !== folderId);
      await this.saveFolders(updatedFolders);
      return updatedFolders;
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw new Error('Failed to delete folder');
    }
  }
};

// UI Utilities
const UIHelper = {
  showLoading(message = 'Loading...') {
    // Implement loading state if needed
    console.log(message);
  },

  hideLoading() {
    // Hide loading state if implemented
  },

  showError(message) {
    // You could implement a proper error toast/notification
    console.error('Error:', message);
    alert(message);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const createFolderBtn = document.getElementById('createFolderBtn');
  const foldersContainer = document.querySelector('.folders');
  const searchInput = document.querySelector('input[type="text"]');
  const searchButton = document.querySelector('.searchIcon');

  // Initialize the application
  async function initializeApp() {
    try {
      UIHelper.showLoading();
      
      // Fetch and inject the popup HTML
      await injectPopupHTML();
      
      // Initialize popup functionality
      const { showPopup } = initializeCreateFolderPopup();
      
      // Set up event listeners
      setupEventListeners(showPopup);
      
      // Load initial data
      await loadFolders();
      
      UIHelper.hideLoading();
    } catch (error) {
      UIHelper.showError('Failed to initialize extension: ' + error.message);
    }
  }

  async function injectPopupHTML() {
    try {
      const response = await fetch('createFolderPopup.html');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const popupHtml = await response.text();
      document.body.insertAdjacentHTML('beforeend', popupHtml);
    } catch (error) {
      console.error('Error loading popup HTML:', error);
      throw new Error('Failed to load popup interface');
    }
  }

  function setupEventListeners(showPopup) {
    // Create folder button
    createFolderBtn.addEventListener('click', showPopup);

    // Folder created event
    window.addEventListener('folderCreated', (event) => {
      const folderDetail = event.detail;
      console.log('Folder created:', folderDetail);
      loadFolders();
    });

    // Search functionality
    if (searchInput && searchButton) {
      searchButton.addEventListener('click', handleSearch);
      searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          handleSearch();
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      // Ctrl/Cmd + N to create new folder
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        showPopup();
      }
    });
  }

  function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
      filterFoldersAndChats(searchTerm);
    } else {
      loadFolders(); // Reload all if search is empty
    }
  }

  async function filterFoldersAndChats(searchTerm) {
    try {
      const folders = await FolderManager.getAllFolders();
      const filteredFolders = folders.filter(folder => 
        folder.name.toLowerCase().includes(searchTerm) ||
        folder.description.toLowerCase().includes(searchTerm)
      );
      
      renderFolders(filteredFolders);
    } catch (error) {
      UIHelper.showError('Failed to search folders: ' + error.message);
    }
  }

  async function loadFolders() {
    try {
      const folders = await FolderManager.getAllFolders();
      renderFolders(folders);
    } catch (error) {
      UIHelper.showError(error.message);
      renderFolders([]);
    }
  }

  function renderFolders(folders) {
    foldersContainer.innerHTML = '';
    
    if (folders.length === 0) {
      foldersContainer.innerHTML = `
        <div class="empty-state">
          <p class="sectionEnd">No folders yet. Create your first folder to get started!</p>
        </div>
      `;
      return;
    }

    folders.forEach(folder => {
      const folderElement = createFolderElement(folder);
      foldersContainer.appendChild(folderElement);
    });
  }

  function createFolderElement(folder) {
    const folderElement = document.createElement('div');
    folderElement.classList.add('folder', 'flexRow');
    folderElement.setAttribute('data-folder-id', folder.id);
    
    folderElement.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0,0,256,256"
        width="24px"
        height="24px"
        fill-rule="nonzero"
        class="folder-icon"
      >
        <g
          fill="#ffffff"
          fill-rule="nonzero"
          stroke="none"
          stroke-width="1"
          stroke-linecap="butt"
          stroke-linejoin="miter"
          stroke-miterlimit="10"
          stroke-dasharray=""
          stroke-dashoffset="0"
          font-family="none"
          font-weight="none"
          font-size="none"
          text-anchor="none"
          style="mix-blend-mode: normal"
        >
          <g transform="scale(10.66667,10.66667)">
            <path
              d="M19,6h-8.231c-0.33,0 -0.632,-0.181 -0.788,-0.472c-0.504,-0.943 -1.482,-1.528 -2.551,-1.528h-2.43c-1.654,0 -3,1.346 -3,3v10c0,1.654 1.346,3 3,3h14c1.654,0 3,-1.346 3,-3v-8c0,-1.654 -1.346,-3 -3,-3zM5,6h2.43c0.322,0 0.628,0.168 0.778,0.453c0.502,0.954 1.485,1.547 2.561,1.547h8.231c0.552,0 1,0.448 1,1v0.814c0,0.181 -0.17,0.309 -0.346,0.266c-0.21,-0.05 -0.428,-0.08 -0.654,-0.08h-14c-0.226,0 -0.444,0.03 -0.654,0.08c-0.176,0.043 -0.346,-0.085 -0.346,-0.266v-2.814c0,-0.552 0.448,-1 1,-1zM20,17c0,0.551 -0.449,1 -1,1h-14c-0.551,0 -1,-0.449 -1,-1v-4c0,-0.551 0.449,-1 1,-1h14c0.551,0 1,0.449 1,1z"
            ></path>
          </g>
        </g>
      </svg>
      <div class="folder-content">
        <h3 class="folder-name">${escapeHtml(folder.name)}</h3>
        <p class="description">${escapeHtml(folder.description)}</p>
        <div class="folder-meta">
          <small>${folder.chats ? folder.chats.length : 0} chats • Created ${formatDate(folder.createdAt)}</small>
        </div>
      </div>
      <button class="folder-menu" aria-label="Folder options">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="6" r="2"></circle>
          <circle cx="12" cy="12" r="2"></circle>
          <circle cx="12" cy="18" r="2"></circle>
        </svg>
      </button>
    `;

    // Add click handler for folder menu
    const menuButton = folderElement.querySelector('.folder-menu');
    menuButton.addEventListener('click', (event) => {
      event.stopPropagation();
      showFolderMenu(folder, menuButton);
    });

    // Add click handler for folder selection
    folderElement.addEventListener('click', (event) => {
      if (!event.target.closest('.folder-menu')) {
        selectFolder(folder);
      }
    });

    return folderElement;
  }

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  function showFolderMenu(folder, buttonElement) {
    // Implement context menu for folder actions (rename, delete, etc.)
    console.log('Show menu for folder:', folder.name);
    // You could implement a proper context menu here
    const confirmDelete = confirm(`Delete folder "${folder.name}"?`);
    if (confirmDelete) {
      deleteFolder(folder.id);
    }
  }

  async function deleteFolder(folderId) {
    try {
      await FolderManager.deleteFolder(folderId);
      await loadFolders(); // Refresh the list
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('folderDeleted', {
        detail: { folderId }
      }));
    } catch (error) {
      UIHelper.showError('Failed to delete folder: ' + error.message);
    }
  }

  function selectFolder(folder) {
    // Implement folder selection logic
    console.log('Folder selected:', folder);
    // You could dispatch an event or update UI to show folder contents
    window.dispatchEvent(new CustomEvent('folderSelected', {
      detail: { folder }
    }));
  }

  // Initialize the application
  initializeApp();
});