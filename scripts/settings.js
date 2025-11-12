// Settings Script - Handles Monday.com connection and preferences

document.addEventListener('DOMContentLoaded', async () => {
  // Load current settings
  await loadSettings();

  // Event listeners
  document.getElementById('toggleToken').addEventListener('click', toggleTokenVisibility);
  document.getElementById('testConnectionBtn').addEventListener('click', testConnection);
  document.getElementById('saveTokenBtn').addEventListener('click', saveToken);
  document.getElementById('disconnectBtn').addEventListener('click', disconnect);
  document.getElementById('boardSelect').addEventListener('change', loadGroups);
  document.getElementById('saveSelectionBtn').addEventListener('click', saveSelection);
  document.getElementById('saveHARSettingsBtn').addEventListener('click', saveHARSettings);
  document.getElementById('saveConsentBtn').addEventListener('click', saveConsent);
  document.getElementById('clearDataBtn').addEventListener('click', clearData);

  async function loadSettings() {
    try {
      const settings = await chrome.storage.sync.get([
        'mondayToken',
        'selectedBoardId',
        'selectedGroupId',
        'autoAttachHAR',
        'harTimeframe',
        'maskSensitiveHeaders',
        'maskQueryStrings',
        'harConsent',
        'screenshotConsent'
      ]);

      // Token
      if (settings.mondayToken) {
        document.getElementById('mondayToken').value = settings.mondayToken;
        updateConnectionStatus(true);
        await loadBoards(settings.mondayToken);
      }

      // HAR settings
      document.getElementById('autoAttachHAR').checked = settings.autoAttachHAR !== false;
      document.getElementById('harTimeframe').value = settings.harTimeframe || 10;
      document.getElementById('maskSensitiveHeaders').checked = settings.maskSensitiveHeaders !== false;
      document.getElementById('maskQueryStrings').checked = settings.maskQueryStrings || false;

      // Consent
      document.getElementById('harConsent').checked = settings.harConsent || false;
      document.getElementById('screenshotConsent').checked = settings.screenshotConsent !== false;

      // Board/Group selection
      if (settings.selectedBoardId) {
        document.getElementById('boardSelect').value = settings.selectedBoardId;
        await loadGroups();
        
        if (settings.selectedGroupId) {
          document.getElementById('groupSelect').value = settings.selectedGroupId;
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  function toggleTokenVisibility() {
    const input = document.getElementById('mondayToken');
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  async function testConnection() {
    const token = document.getElementById('mondayToken').value.trim();
    
    if (!token) {
      alert('Please enter an API token');
      return;
    }

    const btn = document.getElementById('testConnectionBtn');
    btn.disabled = true;
    btn.textContent = 'Testing...';

    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { action: 'testMondayConnection', token: token },
          resolve
        );
      });

      if (response.success) {
        alert('Connection successful!');
        updateConnectionStatus(true);
        await loadBoards(token);
      } else {
        alert('Connection failed: ' + response.error);
        updateConnectionStatus(false);
      }
    } catch (error) {
      alert('Connection error: ' + error.message);
      updateConnectionStatus(false);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Test Connection';
    }
  }

  async function saveToken() {
    const token = document.getElementById('mondayToken').value.trim();
    
    if (!token) {
      alert('Please enter an API token');
      return;
    }

    try {
      await chrome.storage.sync.set({ mondayToken: token });
      alert('Token saved successfully');
      updateConnectionStatus(true);
    } catch (error) {
      alert('Failed to save token: ' + error.message);
    }
  }

  async function disconnect() {
    if (!confirm('Are you sure you want to disconnect? This will remove your token and settings.')) {
      return;
    }

    try {
      await chrome.storage.sync.remove([
        'mondayToken',
        'selectedBoardId',
        'selectedGroupId'
      ]);
      
      document.getElementById('mondayToken').value = '';
      document.getElementById('boardSelect').innerHTML = '<option value="">Select a board...</option>';
      document.getElementById('groupSelect').innerHTML = '<option value="">Select board first</option>';
      
      updateConnectionStatus(false);
      alert('Disconnected successfully');
    } catch (error) {
      alert('Failed to disconnect: ' + error.message);
    }
  }

  function updateConnectionStatus(connected) {
    const badge = document.getElementById('statusBadge');
    badge.className = 'status-badge ' + (connected ? 'connected' : 'disconnected');
    badge.textContent = connected ? 'Connected' : 'Disconnected';
  }

  async function loadBoards(token) {
    try {
      const boardSelect = document.getElementById('boardSelect');
      boardSelect.innerHTML = '<option value="">Loading boards...</option>';

      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { action: 'testMondayConnection', token: token },
          resolve
        );
      });

      if (response.success && response.workspaces) {
        boardSelect.innerHTML = '<option value="">Select a board...</option>';
        
        response.workspaces.forEach(board => {
          const option = document.createElement('option');
          option.value = board.id;
          option.textContent = board.name;
          option.dataset.groups = JSON.stringify(board.groups);
          boardSelect.appendChild(option);
        });

        // Restore saved selection
        const settings = await chrome.storage.sync.get(['selectedBoardId']);
        if (settings.selectedBoardId) {
          boardSelect.value = settings.selectedBoardId;
        }
      } else {
        boardSelect.innerHTML = '<option value="">Failed to load boards</option>';
      }
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  }

  async function loadGroups() {
    const boardSelect = document.getElementById('boardSelect');
    const groupSelect = document.getElementById('groupSelect');
    const selectedOption = boardSelect.options[boardSelect.selectedIndex];
    
    if (!selectedOption || !selectedOption.dataset.groups) {
      groupSelect.innerHTML = '<option value="">Select board first</option>';
      return;
    }

    const groups = JSON.parse(selectedOption.dataset.groups);
    
    groupSelect.innerHTML = '<option value="">Select a group...</option>';
    groups.forEach(group => {
      const option = document.createElement('option');
      option.value = group.id;
      option.textContent = group.title;
      groupSelect.appendChild(option);
    });

    // Restore saved selection
    const settings = await chrome.storage.sync.get(['selectedGroupId']);
    if (settings.selectedGroupId) {
      groupSelect.value = settings.selectedGroupId;
    }
  }

  async function saveSelection() {
    const boardId = document.getElementById('boardSelect').value;
    const groupId = document.getElementById('groupSelect').value;
    
    if (!boardId || !groupId) {
      alert('Please select both board and group');
      return;
    }

    try {
      await chrome.storage.sync.set({
        selectedBoardId: boardId,
        selectedGroupId: groupId
      });
      
      alert('Selection saved successfully');
    } catch (error) {
      alert('Failed to save selection: ' + error.message);
    }
  }

  async function saveHARSettings() {
    try {
      await chrome.storage.sync.set({
        autoAttachHAR: document.getElementById('autoAttachHAR').checked,
        harTimeframe: parseInt(document.getElementById('harTimeframe').value),
        maskSensitiveHeaders: document.getElementById('maskSensitiveHeaders').checked,
        maskQueryStrings: document.getElementById('maskQueryStrings').checked
      });
      
      alert('HAR settings saved successfully');
    } catch (error) {
      alert('Failed to save HAR settings: ' + error.message);
    }
  }

  async function saveConsent() {
    try {
      await chrome.storage.sync.set({
        harConsent: document.getElementById('harConsent').checked,
        screenshotConsent: document.getElementById('screenshotConsent').checked
      });
      
      alert('Consent preferences saved successfully');
    } catch (error) {
      alert('Failed to save consent: ' + error.message);
    }
  }

  async function clearData() {
    if (!confirm('Are you sure you want to clear all extension data? This cannot be undone.')) {
      return;
    }

    try {
      await chrome.storage.sync.clear();
      await chrome.storage.local.clear();
      
      alert('All data cleared successfully. Please reload the settings page.');
      window.location.reload();
    } catch (error) {
      alert('Failed to clear data: ' + error.message);
    }
  }
});
