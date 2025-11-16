// HAR Capture Module using Chrome DevTools Protocol via chrome.debugger API
// Captures network traffic for the last N minutes for a specific tab

export class HARCapture {
  constructor() {
    this.sessions = new Map();
    this.networkEvents = new Map();
  }

  async captureHAR(tabId, timeframeMinutes = 10, options = {}) {
    const {
      maskAuthHeaders = true,
      maskCookies = true
    } = options;

    try {
      // Attach debugger to the tab
      await this.attachDebugger(tabId);
      
      // Enable Network domain
      await this.enableNetworkDomain(tabId);
      
      // Collect network events (in real implementation, these would be collected over time)
      // For now, we'll get current network state
      const entries = await this.collectNetworkEntries(tabId, timeframeMinutes);
      
      // Build HAR structure
      const har = this.buildHAR(entries, maskAuthHeaders, maskCookies);
      
      // Detach debugger
      await this.detachDebugger(tabId);
      
      return har;
    } catch (error) {
      console.error('HAR capture error:', error);
      // Ensure debugger is detached even on error
      try {
        await this.detachDebugger(tabId);
      } catch (e) {
        console.error('Failed to detach debugger:', e);
      }
      throw error;
    }
  }

  async attachDebugger(tabId) {
    return new Promise((resolve, reject) => {
      chrome.debugger.attach({ tabId }, '1.3', () => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Failed to attach debugger: ${chrome.runtime.lastError.message}`));
        } else {
          this.sessions.set(tabId, { attached: true, timestamp: Date.now() });
          resolve();
        }
      });
    });
  }

  async detachDebugger(tabId) {
    return new Promise((resolve) => {
      chrome.debugger.detach({ tabId }, () => {
        this.sessions.delete(tabId);
        resolve();
      });
    });
  }

  async enableNetworkDomain(tabId) {
    return new Promise((resolve, reject) => {
      chrome.debugger.sendCommand({ tabId }, 'Network.enable', {}, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Failed to enable Network domain: ${chrome.runtime.lastError.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  async collectNetworkEntries(tabId, timeframeMinutes) {
    // In a real implementation, we would:
    // 1. Set up event listeners for Network.requestWillBeSent, Network.responseReceived, etc.
    // 2. Store these events over time in chrome.storage.local
    // 3. Filter by timestamp (last N minutes)
    
    // For this implementation, we'll use a simpler approach:
    // Get the current network state snapshot
    
    const entries = [];
    const cutoffTime = Date.now() - (timeframeMinutes * 60 * 1000);
    
    // Get stored network events (these would be accumulated by event listeners)
    const stored = await chrome.storage.local.get([`networkEvents_${tabId}`]);
    const events = stored[`networkEvents_${tabId}`] || [];
    
    // Filter by timeframe
    const recentEvents = events.filter(event => event.timestamp >= cutoffTime);
    
    // Convert to HAR entries
    for (const event of recentEvents) {
      entries.push(this.convertToHAREntry(event));
    }
    
    return entries;
  }

  convertToHAREntry(event) {
    return {
      startedDateTime: new Date(event.timestamp).toISOString(),
      time: event.time || 0,
      request: {
        method: event.request?.method || 'GET',
        url: event.request?.url || '',
        httpVersion: 'HTTP/1.1',
        headers: event.request?.headers || [],
        queryString: this.parseQueryString(event.request?.url || ''),
        cookies: event.request?.cookies || [],
        headersSize: -1,
        bodySize: event.request?.bodySize || -1
      },
      response: {
        status: event.response?.status || 0,
        statusText: event.response?.statusText || '',
        httpVersion: 'HTTP/1.1',
        headers: event.response?.headers || [],
        cookies: event.response?.cookies || [],
        content: {
          size: event.response?.contentSize || 0,
          mimeType: event.response?.mimeType || 'application/octet-stream'
        },
        redirectURL: '',
        headersSize: -1,
        bodySize: event.response?.bodySize || -1
      },
      cache: {},
      timings: {
        send: 0,
        wait: event.time || 0,
        receive: 0
      }
    };
  }

  parseQueryString(url) {
    try {
      const urlObj = new URL(url);
      const params = [];
      urlObj.searchParams.forEach((value, name) => {
        params.push({ name, value });
      });
      return params;
    } catch {
      return [];
    }
  }

  buildHAR(entries, maskAuthHeaders, maskCookies) {
    // Apply masking if requested
    if (maskAuthHeaders || maskCookies) {
      entries = entries.map(entry => this.maskEntry(entry, maskAuthHeaders, maskCookies));
    }

    return {
      log: {
        version: '1.2',
        creator: {
          name: 'Anti Bugs',
          version: '1.0.0'
        },
        browser: {
          name: 'Chrome',
          version: navigator.userAgent
        },
        pages: [],
        entries: entries
      }
    };
  }

  maskEntry(entry, maskAuthHeaders, maskCookies) {
    const masked = JSON.parse(JSON.stringify(entry));

    if (maskAuthHeaders) {
      // Mask Authorization headers
      masked.request.headers = masked.request.headers.map(h => {
        if (h.name.toLowerCase() === 'authorization') {
          return { ...h, value: '***MASKED***' };
        }
        return h;
      });
      
      masked.response.headers = masked.response.headers.map(h => {
        if (h.name.toLowerCase() === 'authorization' || h.name.toLowerCase() === 'set-cookie') {
          return { ...h, value: '***MASKED***' };
        }
        return h;
      });
    }

    if (maskCookies) {
      // Mask cookies
      masked.request.cookies = masked.request.cookies.map(c => ({
        ...c,
        value: '***MASKED***'
      }));
      
      masked.response.cookies = masked.response.cookies.map(c => ({
        ...c,
        value: '***MASKED***'
      }));
    }

    return masked;
  }

  // Start continuous network monitoring for a tab
  async startMonitoring(tabId) {
    try {
      await this.attachDebugger(tabId);
      await this.enableNetworkDomain(tabId);

      // Set up event listeners
      chrome.debugger.onEvent.addListener((source, method, params) => {
        if (source.tabId !== tabId) return;

        this.handleNetworkEvent(tabId, method, params);
      });

      console.log(`Started network monitoring for tab ${tabId}`);
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      throw error;
    }
  }

  handleNetworkEvent(tabId, method, params) {
    const eventKey = `networkEvents_${tabId}`;
    
    chrome.storage.local.get([eventKey], (result) => {
      const events = result[eventKey] || [];
      
      const event = {
        timestamp: Date.now(),
        method: method,
        params: params
      };

      // Keep only last 1000 events per tab
      events.push(event);
      if (events.length > 1000) {
        events.shift();
      }

      chrome.storage.local.set({ [eventKey]: events });
    });
  }

  async stopMonitoring(tabId) {
    await this.detachDebugger(tabId);
    console.log(`Stopped network monitoring for tab ${tabId}`);
  }

  cleanup() {
    // Detach all active debugger sessions
    for (const [tabId] of this.sessions) {
      this.detachDebugger(tabId).catch(console.error);
    }
    this.sessions.clear();
    this.networkEvents.clear();
  }
}
