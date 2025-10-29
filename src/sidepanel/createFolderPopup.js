// src/sidepanel/createFolderPopup.js

export function initializeCreateFolderPopup() {
  const popupContainer = document.querySelector('.popupContainer');
  const closeBtn = document.getElementById('closeBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const createBtn = document.getElementById('createBtn');
  const folderNameInput = document.getElementById('folderName');
  const folderDescriptionTextarea = document.getElementById('folderDescription');

  function showPopup() {
    popupContainer.classList.remove('hidden');
  }

  function hidePopup() {
    popupContainer.classList.add('hidden');
    // Clear input fields when hiding the popup
    folderNameInput.value = '';
    folderDescriptionTextarea.value = '';
  }

  closeBtn.addEventListener('click', hidePopup);
  cancelBtn.addEventListener('click', hidePopup);

  createBtn.addEventListener('click', () => {
    const folderName = folderNameInput.value;
    const folderDescription = folderDescriptionTextarea.value;

    if (folderName.trim() === '') {
      alert('Folder name cannot be empty!');
      return;
    }

    console.log('Creating folder:', { folderName, folderDescription });
    // Here you would typically save the folder data
    // For now, just hide the popup
    hidePopup();
  });

  return { showPopup };
}