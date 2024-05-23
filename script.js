document.addEventListener("DOMContentLoaded", function () {
  const savedDocuments = JSON.parse(localStorage.getItem('savedDocuments')) || [];
  const undoStack = [];
  const redoStack = [];

  function initializeApp() {
    if (savedDocuments.length > 0) {
      savedDocuments.forEach(documentData => {
        displaySavedDocument(documentData);
      });
    }
  }

  setTimeout(function () {
    document.querySelector('.loading-screen').style.display = 'none';
    document.querySelector('.main-screen').style.display = 'block';
    initializeApp();
  }, 3000);

  document.querySelector('.add-button').addEventListener('click', function () {
    openNewDocument();
  });

  document.querySelector('.save-button').addEventListener('click', function () {
    const title = document.getElementById('document-title').value;
    const content = document.querySelector('.document-content').innerHTML;
    const date = document.getElementById('document-date').textContent;
    const tags = Array.from(document.querySelectorAll('.tag-input')).map(input => input.value);

    const documentData = { title, content, date, tags };
    saveDocument(documentData);

    document.querySelector('.document-screen').style.display = 'none';
    document.querySelector('.main-screen').style.display = 'block';
  });

  function openNewDocument() {
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    document.getElementById('document-title').value = `Untitled-${savedDocuments.length + 1}`;
    document.querySelector('.document-content').innerHTML = '';  // Clear previous content
    document.getElementById('document-date').textContent = dateStr;

    document.querySelector('.main-screen').style.display = 'none';
    document.querySelector('.document-screen').style.display = 'block';
  }

  function saveDocument(documentData) {
    const existingIndex = savedDocuments.findIndex(doc => doc.title === documentData.title);
    if (existingIndex !== -1) {
      savedDocuments[existingIndex] = documentData;
    } else {
      savedDocuments.push(documentData);
    }
    localStorage.setItem('savedDocuments', JSON.stringify(savedDocuments));
    displaySavedDocuments();
  }

  function displaySavedDocuments() {
    const contentDiv = document.querySelector('.main-screen .content');
    contentDiv.innerHTML = '';
    savedDocuments.forEach(documentData => {
      displaySavedDocument(documentData);
    });
  }

  function displaySavedDocument(documentData) {
    const contentDiv = document.querySelector('.main-screen .content');
    const savedDocument = document.createElement('div');
    savedDocument.className = 'saved-document';
    savedDocument.innerHTML = `
      <div class="saved-document-title">${documentData.title}</div>
      <div class="saved-document-date">${documentData.date}</div>
      <div class="options-menu">
        <button class="download-button">Download</button>
        <button class="share-button">Share</button>
        <button class="delete-button">Delete</button>
      </div>
    `;
    savedDocument.addEventListener('click', function () {
      openDocument(documentData);
    });
    savedDocument.addEventListener('contextmenu', function (event) {
      event.preventDefault();
      const optionsMenu = savedDocument.querySelector('.options-menu');
      optionsMenu.style.display = 'block';
      document.addEventListener('click', function (event) {
        if (!savedDocument.contains(event.target)) {
          optionsMenu.style.display = 'none';
        }
      }, { once: true });
    });
    savedDocument.querySelector('.download-button').addEventListener('click', function (event) {
      event.stopPropagation();
      downloadDocument(documentData);
    });
    savedDocument.querySelector('.share-button').addEventListener('click', function (event) {
      event.stopPropagation();
      shareDocument(documentData);
    });
    savedDocument.querySelector('.delete-button').addEventListener('click', function (event) {
      event.stopPropagation();
      deleteDocument(documentData);
    });
    contentDiv.appendChild(savedDocument);
  }

  function openDocument(documentData) {
    document.getElementById('document-title').value = documentData.title;
    document.querySelector('.document-content').innerHTML = documentData.content;
    document.getElementById('document-date').textContent = documentData.date;

    document.querySelector('.main-screen').style.display = 'none';
    document.querySelector('.document-screen').style.display = 'block';
  }

  function downloadDocument(documentData) {
    const blob = new Blob([documentData.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentData.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function shareDocument(documentData) {
    const shareData = {
      title: documentData.title,
      text: documentData.content,
    };
    if (navigator.share) {
      navigator.share(shareData).then(() => {
        console.log('Document shared successfully');
      }).catch(error => {
        console.error('Error sharing document:', error);
      });
    } else {
      alert('Share API is not supported in your browser.');
    }
  }

  function deleteDocument(documentData) {
    const index = savedDocuments.findIndex(doc => doc.title === documentData.title);
    if (index !== -1) {
      savedDocuments.splice(index, 1);
      localStorage.setItem('savedDocuments', JSON.stringify(savedDocuments));
      displaySavedDocuments();
    }
  }

  document.querySelectorAll('.menu-icon').forEach(icon => {
    icon.addEventListener('click', function (event) {
      event.stopPropagation();
      const sidebar = document.querySelector('.sidebar');
      sidebar.style.display = 'block';
      sidebar.style.transform = 'translateX(0)';
    });
  });

  document.addEventListener('click', function (event) {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar.style.display === 'block' && !sidebar.contains(event.target)) {
      sidebar.style.transform = 'translateX(-100%)';
      setTimeout(() => {
        sidebar.style.display = 'none';
      }, 300);
    }
  });

  document.querySelector('.settings-option').addEventListener('click', function () {
    document.querySelector('.sidebar').style.transform = 'translateX(-100%)';
    document.querySelector('.settings-screen').style.display = 'block';
    document.querySelector('.main-screen').style.display = 'none';
    document.querySelector('.document-screen').style.display = 'none';
    document.querySelector('.bookmark-screen').style.display = 'none';
  });

  document.querySelector('.home-option').addEventListener('click', function () {
    document.querySelector('.sidebar').style.transform = 'translateX(-100%)';
    document.querySelector('.settings-screen').style.display = 'none';
    document.querySelector('.main-screen').style.display = 'block';
    document.querySelector('.document-screen').style.display = 'none';  // Ensure the document screen is hidden
    document.querySelector('.bookmark-screen').style.display = 'none';
  });

  document.getElementById('font-selector').addEventListener('change', function () {
    document.body.style.fontFamily = this.value;
  });

  document.getElementById('text-color').addEventListener('change', function () {
    document.querySelector('.document-content').style.color = this.value;
  });

  document.getElementById('background-color').addEventListener('change', function () {
    document.querySelector('.document-content').style.backgroundColor = this.value;
  });

  document.getElementById('autosave-interval').addEventListener('input', function () {
    const interval = parseInt(this.value, 10);
    if (interval > 0 && interval <= 60) {
      clearInterval(autoSaveInterval);
      autoSaveInterval = setInterval(autoSaveDocument, interval * 60000);
    }
  });

  let autoSaveInterval = setInterval(autoSaveDocument, 5 * 60000);

  function autoSaveDocument() {
    const title = document.getElementById('document-title').value;
    const content = document.querySelector('.document-content').innerHTML;  // Use innerHTML for content
    const date = document.getElementById('document-date').textContent;
    const tags = Array.from(document.querySelectorAll('.tag-input')).map(input => input.value);

    const documentData = { title, content, date, tags };
    saveDocument(documentData);
  }

  document.querySelector('.search-bar').addEventListener('input', function () {
    searchDocuments(this.value);
  });

  function searchDocuments(query) {
    const filteredDocuments = savedDocuments.filter(document => 
      document.title.toLowerCase().includes(query.toLowerCase()) || 
      document.content.toLowerCase().includes(query.toLowerCase())
    );
    displayFilteredDocuments(filteredDocuments);
  }

  function displayFilteredDocuments(documents) {
    const contentDiv = document.querySelector('.main-screen .content');
    contentDiv.innerHTML = '';
    documents.forEach(documentData => {
      displaySavedDocument(documentData);
    });
  }

  // Additional functionality for dark mode
  const toggleSwitch = document.getElementById('dark-mode-toggle');
  toggleSwitch.addEventListener('change', function () {
    if (this.checked) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'enabled');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'disabled');
    }
  });

  if (localStorage.getItem('darkMode') === 'enabled') {
    document.documentElement.classList.add('dark-mode');
    toggleSwitch.checked = true;
  }

  const style = document.createElement('style');
  style.textContent = `
    .dark-mode {
      background-color: #121212;
      color: white;
    }
    .dark-mode .taskbar {
      background-color: #1f1f1f;
    }
    .dark-mode .saved-document {
      background-color: #2c2c2c;
      border-color: #444;
    }
    .dark-mode .document-content {
      background-color: #2c2c2c;
      color: white;
    }
    .dark-mode .options-menu {
      background-color: #333;
      border-color: #444;
    }
    .dark-mode .sidebar {
      background-color: #1f1f1f;
    }
  `;
  document.head.append(style);

  function initializeTagFilter() {
    const tagsFilter = document.querySelector('.tags-filter');
    const uniqueTags = new Set(savedDocuments.flatMap(doc => doc.tags));
    uniqueTags.forEach(tag => {
      const tagElement = document.createElement('span');
      tagElement.className = 'filter-tag';
      tagElement.textContent = tag;
      tagElement.dataset.tag = tag;
      tagElement.addEventListener('click', () => filterByTag(tag));
      tagsFilter.appendChild(tagElement);
    });
  }

  function filterByTag(tag) {
    const filteredDocuments = tag === 'all' ? savedDocuments : savedDocuments.filter(doc => doc.tags.includes(tag));
    displayFilteredDocuments(filteredDocuments);
  }

  initializeTagFilter();

  document.getElementById('sort-options').addEventListener('change', function () {
    const sortOption = this.value;
    sortDocuments(sortOption);
  });

  function sortDocuments(option) {
    let sortedDocuments;
    switch (option) {
      case 'date-asc':
        sortedDocuments = savedDocuments.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'date-desc':
        sortedDocuments = savedDocuments.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'title-asc':
        sortedDocuments = savedDocuments.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sortedDocuments = savedDocuments.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    displayFilteredDocuments(sortedDocuments);
  }
});
