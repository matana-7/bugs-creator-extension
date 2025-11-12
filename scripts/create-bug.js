// Create Bug Script - Handles bug report creation with attachments

let attachedFiles = [];
let screenshotCount = 0;
let harCaptured = false;

document.addEventListener('DOMContentLoaded', async () => {
  const bugForm = document.getElementById('bugForm');
  const closeBtn = document.getElementById('closeBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const submitBtn = document.getElementById('submitBtn');
  const screenshotBtn = document.getElementById('screenshotBtn');
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const browseBtn = document.getElementById('browseBtn');
  const boardSelect = document.getElementById('boardSelect');
  const groupSelect = document.getElementById('groupSelect');
  const autoAttachHAR = document.getElementById('autoAttachHAR');

  // Load boards
  await loadBoards();

  // Event listeners
  closeBtn.addEventListener('click', () => window.close());
  cancelBtn.addEventListener('click', () => window.close());

  bugForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await createBug();
  });

  screenshotBtn.addEventListener('click', async () => {
    await captureScreenshot();
  });

  boardSelect.addEventListener('change', async () => {
    await loadGroups();
  });

  // Drag and drop functionality
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  browseBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
  });

  async function loadBoards() {
    try {
      const settings = await chrome.storage.sync.get(['mondayToken']);
      
      if (!settings.mondayToken) {
        boardSelect.innerHTML = '<option value="">Not connected to Monday.com</option>';
        return;
      }

      boardSelect.innerHTML = '<option value="">Loading boards...</option>';

      chrome.runtime.sendMessage(
        { action: 'testMondayConnection', token: settings.mondayToken },
        async (response) => {
          if (response.success) {
            boardSelect.innerHTML = '<option value="">Select a board</option>';
            
            response.workspaces.forEach(board => {
              const option = document.createElement('option');
              option.value = board.id;
              option.textContent = board.name;
              option.dataset.groups = JSON.stringify(board.groups);
              boardSelect.appendChild(option);
            });

            // Load saved selection
            const saved = await chrome.storage.sync.get(['selectedBoardId']);
            if (saved.selectedBoardId) {
              boardSelect.value = saved.selectedBoardId;
              await loadGroups();
            }
          } else {
            boardSelect.innerHTML = '<option value="">Failed to load boards</option>';
          }
        }
      );
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  }

  async function loadGroups() {
    const selectedOption = boardSelect.options[boardSelect.selectedIndex];
    
    if (!selectedOption || !selectedOption.dataset.groups) {
      groupSelect.innerHTML = '<option value="">Select board first</option>';
      return;
    }

    const groups = JSON.parse(selectedOption.dataset.groups);
    
    groupSelect.innerHTML = '<option value="">Select a group</option>';
    groups.forEach(group => {
      const option = document.createElement('option');
      option.value = group.id;
      option.textContent = group.title;
      groupSelect.appendChild(option);
    });

    // Load saved selection
    const saved = await chrome.storage.sync.get(['selectedGroupId']);
    if (saved.selectedGroupId) {
      groupSelect.value = saved.selectedGroupId;
    }
  }

  async function captureScreenshot() {
    try {
      screenshotBtn.disabled = true;
      screenshotBtn.textContent = 'Capturing...';

      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Request screenshot from background
      chrome.runtime.sendMessage(
        { action: 'captureScreenshot', tabId: tab.id },
        (response) => {
          if (response.success) {
            // Open annotation page
            openAnnotationPage(response.screenshot);
          } else {
            alert('Failed to capture screenshot: ' + response.error);
          }
          
          screenshotBtn.disabled = false;
          screenshotBtn.textContent = 'Take Screenshot';
        }
      );
    } catch (error) {
      console.error('Screenshot error:', error);
      screenshotBtn.disabled = false;
      screenshotBtn.textContent = 'Take Screenshot';
    }
  }

  function openAnnotationPage(screenshotDataUrl) {
    // Store screenshot in local storage temporarily
    chrome.storage.local.set({ 
      pendingScreenshot: screenshotDataUrl 
    }, () => {
      // Open annotation page
      window.open('annotate.html', '_blank', 'width=1200,height=800');
    });
  }

  // Listen for annotated screenshots
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.annotatedScreenshot) {
      const screenshot = changes.annotatedScreenshot.newValue;
      if (screenshot) {
        addScreenshot(screenshot);
        chrome.storage.local.remove('annotatedScreenshot');
      }
    }
  });

  function addScreenshot(dataUrl) {
    screenshotCount++;
    const screenshot = {
      id: `screenshot-${Date.now()}`,
      name: `screenshot-${screenshotCount}.png`,
      dataUrl: dataUrl,
      type: 'image/png'
    };

    attachedFiles.push(screenshot);
    displayScreenshot(screenshot);
  }

  function displayScreenshot(screenshot) {
    const screenshotsList = document.getElementById('screenshotsList');
    
    if (screenshotsList.querySelector('.empty-state')) {
      screenshotsList.innerHTML = '';
    }

    const item = document.createElement('div');
    item.className = 'screenshot-item';
    item.dataset.id = screenshot.id;
    
    item.innerHTML = `
      <img src="${screenshot.dataUrl}" alt="Screenshot">
      <button class="remove-btn" title="Remove">×</button>
    `;

    item.querySelector('.remove-btn').addEventListener('click', () => {
      attachedFiles = attachedFiles.filter(f => f.id !== screenshot.id);
      item.remove();
      
      if (screenshotsList.children.length === 0) {
        screenshotsList.innerHTML = '<div class="empty-state">No screenshots yet</div>';
      }
    });

    screenshotsList.appendChild(item);
  }

  function handleFiles(files) {
    const filesList = document.getElementById('filesList');
    
    Array.from(files).forEach(file => {
      // Check file size (limit to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} is too large (max 50MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          dataUrl: e.target.result,
          type: file.type,
          size: file.size
        };

        attachedFiles.push(fileData);
        displayFile(fileData);
      };
      reader.readAsDataURL(file);
    });
  }

  function displayFile(file) {
    const filesList = document.getElementById('filesList');
    
    const item = document.createElement('div');
    item.className = 'file-item';
    item.dataset.id = file.id;
    
    const icon = getFileIcon(file.type);
    const size = formatFileSize(file.size);
    
    item.innerHTML = `
      <span class="file-icon">${icon}</span>
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-size">${size}</div>
      </div>
      <button class="remove-btn" title="Remove">×</button>
    `;

    item.querySelector('.remove-btn').addEventListener('click', () => {
      attachedFiles = attachedFiles.filter(f => f.id !== file.id);
      item.remove();
    });

    filesList.appendChild(item);
  }

  function getFileIcon(type) {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type === 'application/json' || type === 'application/har+json') return '📋';
    if (type === 'application/pdf') return '📄';
    return '📎';
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  async function createBug() {
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating...';

      // Validate form
      const description = document.getElementById('description').value;
      const stepsToReproduce = document.getElementById('stepsToReproduce').value;
      
      if (!description || !stepsToReproduce) {
        alert('Please fill in required fields');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create & Upload';
        return;
      }

      // Validate board/group selection
      const boardId = boardSelect.value;
      const groupId = groupSelect.value;
      
      if (!boardId || !groupId) {
        alert('Please select a board and group');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create & Upload';
        return;
      }

      // Save board/group selection
      await chrome.storage.sync.set({
        selectedBoardId: boardId,
        selectedGroupId: groupId
      });

      // Gather bug data
      const bugData = {
        platform: document.getElementById('platform').value,
        env: document.getElementById('env').value,
        version: document.getElementById('version').value,
        description: description,
        stepsToReproduce: stepsToReproduce,
        actualResult: document.getElementById('actualResult').value,
        expectedResult: document.getElementById('expectedResult').value
      };

      // Capture HAR if enabled
      if (autoAttachHAR.checked) {
        await captureHAR();
      }

      // Show progress
      document.getElementById('uploadProgress').style.display = 'block';
      updateProgress(30, 'Uploading attachments...');

      // Create bug via background script
      chrome.runtime.sendMessage(
        {
          action: 'createBug',
          bugData: bugData,
          attachments: attachedFiles
        },
        (response) => {
          if (response.success) {
            updateProgress(100, 'Bug created successfully!');
            
            setTimeout(() => {
              // Open created bug in Monday.com
              if (response.item && response.item.url) {
                chrome.tabs.create({ url: response.item.url });
              }
              window.close();
            }, 1500);
          } else {
            alert('Failed to create bug: ' + response.error);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create & Upload';
            document.getElementById('uploadProgress').style.display = 'none';
          }
        }
      );
    } catch (error) {
      console.error('Error creating bug:', error);
      alert('Failed to create bug: ' + error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create & Upload';
      document.getElementById('uploadProgress').style.display = 'none';
    }
  }

  async function captureHAR() {
    try {
      const settings = await chrome.storage.sync.get(['harConsent']);
      
      if (!settings.harConsent) {
        const consent = confirm(
          'HAR Capture Consent:\n\n' +
          'This will capture network traffic from the last 10 minutes, which may include:\n' +
          '- Authentication tokens\n' +
          '- Cookies\n' +
          '- Personal data in URLs and requests\n\n' +
          'Sensitive headers will be masked by default.\n\n' +
          'Do you want to proceed?'
        );
        
        if (!consent) {
          return;
        }
        
        await chrome.storage.sync.set({ harConsent: true });
      }

      const harStatus = document.getElementById('harStatus');
      harStatus.innerHTML = '<span class="status-icon">⏳</span><span>Capturing HAR...</span>';

      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      chrome.runtime.sendMessage(
        { action: 'captureHAR', tabId: tab.id, timeframeMinutes: 10 },
        (response) => {
          if (response.success) {
            // Convert HAR to file
            const harJson = JSON.stringify(response.har, null, 2);
            const harBlob = new Blob([harJson], { type: 'application/json' });
            const harDataUrl = URL.createObjectURL(harBlob);
            
            const tabTitle = tab.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            const harFile = {
              id: `har-${Date.now()}`,
              name: `bug-${timestamp}-${tabTitle}.har`,
              dataUrl: harDataUrl,
              type: 'application/json',
              size: harBlob.size
            };

            attachedFiles.push(harFile);
            harCaptured = true;
            
            harStatus.innerHTML = '<span class="status-icon">✅</span><span>HAR captured</span>';
          } else {
            harStatus.innerHTML = '<span class="status-icon">❌</span><span>HAR capture failed</span>';
          }
        }
      );
    } catch (error) {
      console.error('HAR capture error:', error);
      const harStatus = document.getElementById('harStatus');
      harStatus.innerHTML = '<span class="status-icon">❌</span><span>HAR capture failed</span>';
    }
  }

  function updateProgress(percent, text) {
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = text;
  }
});
