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

  createBtn.addEventListener('click', async () => {
    const folderName = folderNameInput.value;
    const folderDescription = folderDescriptionTextarea.value;

    if (folderName.trim() === '') {
      alert('Folder name cannot be empty!');
      return;
    }

    if (folderDescription.split(' ').length > 20) {
        alert('Description should not exceed 20 words.');
        return;
    }

    const newFolder = {
      id: Date.now().toString(),
      name: folderName,
      description: folderDescription,
      chats: [],
    };

    const result = await chrome.storage.local.get('folders');
    const folders = result.folders || [];
    folders.push(newFolder);
    await chrome.storage.local.set({ folders });

    window.dispatchEvent(new CustomEvent('folderCreated'));

    hidePopup();
  });

  return { showPopup };
}
