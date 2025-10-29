import { initializeCreateFolderPopup } from './createFolderPopup.js';

document.addEventListener('DOMContentLoaded', async () => {
  const createFolderBtn = document.getElementById('createFolderBtn');
  const foldersContainer = document.querySelector('.folders');

  // Fetch and inject the popup HTML
  const response = await fetch('createFolderPopup.html');
  const popupHtml = await response.text();
  document.body.insertAdjacentHTML('beforeend', popupHtml);

  const { showPopup } = initializeCreateFolderPopup();

  createFolderBtn.addEventListener('click', showPopup);

  window.addEventListener('folderCreated', () => {
    loadFolders();
  });

  async function loadFolders() {
    const result = await chrome.storage.local.get('folders');
    const folders = result.folders || [];
    foldersContainer.innerHTML = '';
    if (folders.length === 0) {
      foldersContainer.innerHTML = '<p class="sectionEnd">No folders yet.</p>';
      return;
    }
    folders.forEach(folder => {
      const folderElement = document.createElement('div');
      folderElement.classList.add('folder', 'flexRow');
      folderElement.innerHTML = `
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0,0,256,256"
          width="24px"
          height="24px"
          fill-rule="nonzero"
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
        <div>
          <h3>${folder.name}</h3>
          <p class="description">${folder.description}</p>
        </div>
      `;
      foldersContainer.appendChild(folderElement);
    });
  }

  loadFolders();
});
