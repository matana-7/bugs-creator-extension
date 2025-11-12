// Popup Script - Main interface for viewing bugs and creating new ones

document.addEventListener('DOMContentLoaded', async () => {
  const settingsBtn = document.getElementById('settingsBtn');
  const createBugBtn = document.getElementById('createBugBtn');
  const bugsList = document.getElementById('bugsList');
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');

  // Check connection status
  await checkConnectionStatus();

  // Load recent bugs
  await loadRecentBugs();

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
      const settings = await chrome.storage.sync.get(['mondayToken', 'selectedBoardId', 'selectedGroupId']);
      
      if (!settings.mondayToken || !settings.selectedBoardId || !settings.selectedGroupId) {
        bugsList.innerHTML = '<div class="empty-state">Connect to Monday.com in settings to view bugs</div>';
        return;
      }

      bugsList.innerHTML = '<div class="loading">Loading bugs...</div>';

      // Request bugs from background script
      chrome.runtime.sendMessage(
        { action: 'fetchRecentBugs' },
        (response) => {
          if (response.success) {
            displayBugs(response.bugs);
          } else {
            bugsList.innerHTML = `<div class="error">Error loading bugs: ${response.error}</div>`;
          }
        }
      );
    } catch (error) {
      console.error('Error loading bugs:', error);
      bugsList.innerHTML = '<div class="error">Failed to load bugs</div>';
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
