// Add your sidepanel javascript code here
import { initializeCreateFolderPopup } from './createFolderPopup.js';

document.addEventListener('DOMContentLoaded', () => {
  const createFolderBtn = document.getElementById('createFolderBtn');
  const { showPopup } = initializeCreateFolderPopup();

  createFolderBtn.addEventListener('click', showPopup);
});