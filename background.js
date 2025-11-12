// Background Service Worker for Bug Reporter Extension
// Handles HAR capture via chrome.debugger, message routing, and state management

import { HARCapture } from './modules/har-capture.js';
import { MondayAPI } from './modules/monday-api.js';

const harCapture = new HARCapture();
const mondayAPI = new MondayAPI();

// Track active debugger sessions
const activeSessions = new Map();

// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked', tab);
});

// Message handler for popup/content script communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep channel open for async response
});

async function handleMessage(message, sender, sendResponse) {
  try {
    switch (message.action) {
      case 'captureHAR':
        await handleCaptureHAR(message, sendResponse);
        break;
      
      case 'captureScreenshot':
        await handleCaptureScreenshot(message, sendResponse);
        break;
      
      case 'createBug':
        await handleCreateBug(message, sendResponse);
        break;
      
      case 'fetchRecentBugs':
        await handleFetchRecentBugs(message, sendResponse);
        break;
      
      case 'uploadFile':
        await handleUploadFile(message, sendResponse);
        break;
      
      case 'testMondayConnection':
        await handleTestConnection(message, sendResponse);
        break;
      
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleCaptureHAR(message, sendResponse) {
  const { tabId, timeframeMinutes = 10 } = message;
  
  try {
    // Check if user has consented to HAR capture
    const settings = await chrome.storage.sync.get(['harConsent', 'autoAttachHAR', 'maskSensitiveHeaders']);
    
    if (!settings.harConsent) {
      sendResponse({ 
        success: false, 
        error: 'HAR capture requires user consent',
        needsConsent: true
      });
      return;
    }
    
    const har = await harCapture.captureHAR(tabId, timeframeMinutes, {
      maskAuthHeaders: settings.maskSensitiveHeaders !== false,
      maskCookies: settings.maskSensitiveHeaders !== false
    });
    
    sendResponse({ success: true, har });
  } catch (error) {
    console.error('HAR capture failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleCaptureScreenshot(message, sendResponse) {
  const { tabId } = message;
  
  try {
    const screenshot = await chrome.tabs.captureVisibleTab(null, {
      format: 'png'
    });
    
    sendResponse({ success: true, screenshot });
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleCreateBug(message, sendResponse) {
  const { bugData, attachments } = message;
  
  try {
    const settings = await chrome.storage.sync.get(['mondayToken', 'selectedBoardId', 'selectedGroupId']);
    
    if (!settings.mondayToken) {
      sendResponse({ success: false, error: 'Monday.com not connected' });
      return;
    }
    
    mondayAPI.setToken(settings.mondayToken);
    
    // Upload all attachments first
    const uploadedFiles = [];
    for (const attachment of attachments) {
      const result = await mondayAPI.uploadFile(attachment);
      uploadedFiles.push(result);
    }
    
    // Create the bug item
    const item = await mondayAPI.createBugItem(
      settings.selectedBoardId,
      settings.selectedGroupId,
      bugData,
      uploadedFiles
    );
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Bug Reported Successfully',
      message: `Bug "${bugData.description}" has been created on Monday.com`,
      priority: 2
    });
    
    sendResponse({ success: true, item });
  } catch (error) {
    console.error('Bug creation failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleFetchRecentBugs(message, sendResponse) {
  try {
    const settings = await chrome.storage.sync.get(['mondayToken', 'selectedBoardId', 'selectedGroupId']);
    
    if (!settings.mondayToken) {
      sendResponse({ success: false, error: 'Monday.com not connected' });
      return;
    }
    
    mondayAPI.setToken(settings.mondayToken);
    
    const bugs = await mondayAPI.fetchRecentItems(
      settings.selectedBoardId,
      settings.selectedGroupId
    );
    
    sendResponse({ success: true, bugs });
  } catch (error) {
    console.error('Fetch bugs failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleUploadFile(message, sendResponse) {
  const { file } = message;
  
  try {
    const settings = await chrome.storage.sync.get(['mondayToken']);
    
    if (!settings.mondayToken) {
      sendResponse({ success: false, error: 'Monday.com not connected' });
      return;
    }
    
    mondayAPI.setToken(settings.mondayToken);
    const result = await mondayAPI.uploadFile(file);
    
    sendResponse({ success: true, fileId: result.id, fileUrl: result.url });
  } catch (error) {
    console.error('File upload failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleTestConnection(message, sendResponse) {
  const { token } = message;
  
  try {
    mondayAPI.setToken(token);
    const workspaces = await mondayAPI.fetchWorkspaces();
    
    sendResponse({ success: true, workspaces });
  } catch (error) {
    console.error('Connection test failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Cleanup on extension unload
chrome.runtime.onSuspend.addListener(() => {
  harCapture.cleanup();
});

console.log('Bug Reporter background service worker loaded');
