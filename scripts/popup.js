// Popup Script - Main interface for viewing bugs and creating new ones

let allBugs = []; // Store all bugs for client-side filtering
let filteredBugs = []; // Currently displayed bugs

document.addEventListener('DOMContentLoaded', async () => {
  const settingsBtn = document.getElementById('settingsBtn');
  const createBugBtn = document.getElementById('createBugBtn');
  const bugsList = document.getElementById('bugsList');
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  const searchInput = document.getElementById('searchInput');
  const resultsCount = document.getElementById('resultsCount');

  // Check connection status
  await checkConnectionStatus();

  // Load recent bugs
  await loadRecentBugs();

  // Search functionality with debounce
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filterBugs(e.target.value);
    }, 250); // 250ms debounce
  });

  // Event listeners
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  createBugBtn.addEventListener('click', () => {
    // Open create bug page in a new tab
    chrome.tabs.create({ url: 'create-bug.html' });
  });

  async function checkConnectionStatus() {
    try {
      const settings = await chrome.storage.sync.get(['mondayToken', 'selectedBoardId', 'selectedGroupId']);
      
      if (settings.mondayToken && settings.selectedBoardId && settings.selectedGroupId) {
        statusIndicator.className = 'status-indicator connected';
        statusText.textContent = 'Connected to Monday.com';
      } else if (settings.mondayToken) {
        statusIndicator.className = 'status-indicator warning';
        statusText.textContent = 'Please select board and group';
      } else {
        statusIndicator.className = 'status-indicator disconnected';
        statusText.textContent = 'Not connected to Monday.com';
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }

  async function loadRecentBugs() {
    try {
      console.log('Loading recent bugs...');
      const settings = await chrome.storage.sync.get(['mondayToken', 'selectedBoardId', 'selectedGroupId']);
      
      console.log('Settings loaded:', {
        hasToken: !!settings.mondayToken,
        boardId: settings.selectedBoardId,
        groupId: settings.selectedGroupId
      });
      
      if (!settings.mondayToken || !settings.selectedBoardId || !settings.selectedGroupId) {
        bugsList.innerHTML = '<div class="empty-state">Connect to Monday.com in settings to view bugs</div>';
        resultsCount.textContent = '';
        return;
      }

      bugsList.innerHTML = '<div class="loading">Loading bugs...</div>';
      resultsCount.textContent = '';

      // Request bugs from background script
      chrome.runtime.sendMessage(
        { action: 'fetchRecentBugs' },
        (response) => {
          console.log('Received bugs response:', response);
          
          if (chrome.runtime.lastError) {
            console.error('Runtime error loading bugs:', chrome.runtime.lastError);
            bugsList.innerHTML = `<div class="error">Error: ${chrome.runtime.lastError.message}</div>`;
            resultsCount.textContent = '';
            return;
          }
          
          if (response && response.success) {
            console.log('Bugs loaded successfully:', response.bugs?.length || 0);
            allBugs = response.bugs || [];
            filteredBugs = allBugs;
            displayBugs(filteredBugs);
            updateResultsCount();
          } else {
            const errorMsg = response ? response.error : 'No response received';
            console.error('Failed to load bugs:', errorMsg);
            
            let displayMessage = errorMsg;
            if (errorMsg.includes('token')) {
              displayMessage = 'Authentication error. Please check your Monday.com token in settings.';
            } else if (errorMsg.includes('board')) {
              displayMessage = 'Board not found. Please select a valid board in settings.';
            }
            
            bugsList.innerHTML = `<div class="error">Error: ${displayMessage}</div>`;
            resultsCount.textContent = '';
          }
        }
      );
    } catch (error) {
      console.error('Error loading bugs:', error);
      bugsList.innerHTML = `<div class="error">Failed to load bugs: ${error.message}</div>`;
      resultsCount.textContent = '';
    }
  }

  function filterBugs(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      // No search term, show all bugs
      filteredBugs = allBugs;
    } else {
      // Filter bugs by title, status, and date
      const term = searchTerm.toLowerCase();
      filteredBugs = allBugs.filter(bug => {
        const title = bug.name ? bug.name.toLowerCase() : '';
        const statusColumn = bug.column_values?.find(col => col.id === 'status');
        const status = statusColumn ? statusColumn.text.toLowerCase() : '';
        const date = new Date(bug.created_at).toLocaleDateString().toLowerCase();
        
        return title.includes(term) || status.includes(term) || date.includes(term);
      });
    }
    
    displayBugs(filteredBugs);
    updateResultsCount();
  }

  function updateResultsCount() {
    if (allBugs.length === 0) {
      resultsCount.textContent = '';
    } else if (filteredBugs.length === allBugs.length) {
      resultsCount.textContent = `${allBugs.length} bug${allBugs.length !== 1 ? 's' : ''}`;
    } else {
      resultsCount.textContent = `${filteredBugs.length} of ${allBugs.length}`;
    }
  }

  function displayBugs(bugs) {
    if (!bugs || bugs.length === 0) {
      bugsList.innerHTML = '<div class="empty-state">No bugs found</div>';
      return;
    }

    bugsList.innerHTML = '';

    bugs.forEach(bug => {
      const bugItem = document.createElement('div');
      bugItem.className = 'bug-item';
      
      const title = document.createElement('div');
      title.className = 'bug-title';
      title.textContent = bug.name;
      
      const meta = document.createElement('div');
      meta.className = 'bug-meta';
      
      const date = new Date(bug.created_at);
      const dateStr = date.toLocaleDateString();
      
      // Find status column
      const statusColumn = bug.column_values.find(col => col.id === 'status');
      const statusText = statusColumn ? statusColumn.text : 'Unknown';
      
      meta.innerHTML = `
        <span class="bug-status">${statusText}</span>
        <span class="bug-date">${dateStr}</span>
      `;
      
      bugItem.appendChild(title);
      bugItem.appendChild(meta);
      
      bugItem.addEventListener('click', () => {
        // Open Monday item in new tab (construct URL)
        const mondayUrl = `https://monday.com/boards/${bug.board_id}/pulses/${bug.id}`;
        chrome.tabs.create({ url: mondayUrl });
      });
      
      bugsList.appendChild(bugItem);
    });
  }
});
