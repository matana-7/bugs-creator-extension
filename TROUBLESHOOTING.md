# Troubleshooting Guide

Quick solutions to common issues with the Bug Reporter extension.

---

## 🔧 Installation & Loading Issues

### Extension won't load in Chrome
**Symptoms:** Error when loading unpacked extension

**Solutions:**
1. Verify all files are present (check PROJECT_SUMMARY.md)
2. Ensure icon PNG files exist in `/icons/` directory
3. Check for syntax errors in manifest.json
4. Try Chrome version 88 or higher
5. Look for specific errors in `chrome://extensions/`

**Action:**
```bash
cd /workspace
ls -la manifest.json icons/*.png
```

---

### Icons are missing
**Symptoms:** Extension loads but no icon appears

**Solutions:**
1. Run icon generation script:
   ```bash
   cd /workspace/icons
   bash create-icons.sh
   ```
2. Or manually create 16x16, 32x32, 48x48, 128x128 PNG icons
3. Reload extension after creating icons

---

## 🔌 Monday.com Connection Issues

### "Cannot read properties of undefined" error
**Symptoms:** Error when creating a bug, appears in console

**✅ FIXED in v1.0.1**

**Solutions:**
1. **Reload the extension:**
   - Go to `chrome://extensions/`
   - Find "Bug Reporter for Monday.com"
   - Click the reload icon (🔄)

2. **Verify the fix is applied:**
   - Open `modules/monday-api.js`
   - Check that `createBugItem` uses `create_update` for bug details
   - Look for `addBugDetailsUpdate` function

3. **If still having issues:**
   - Clear browser cache
   - Remove and re-add the extension
   - Check browser console (F12) for detailed errors

**Why this happened:**
- Monday.com's file upload API structure was misunderstood
- Files need to be attached to updates/posts, not directly to items
- Column-based attachments require board-specific column IDs

---

### Connection test fails
**Symptoms:** "Connection failed" message in settings

**Solutions:**
1. **Check token validity:**
   - Go to monday.com → Profile → Developers → API
   - Verify token is active (not expired or revoked)
   - Copy token again (don't include extra spaces)

2. **Check token format:**
   - Should start with `eyJ` (JWT format)
   - Should be long (200+ characters)
   - No line breaks or spaces

3. **Test manually:**
   - Open browser console (F12)
   - Run:
     ```javascript
     fetch('https://api.monday.com/v2', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': 'YOUR_TOKEN_HERE'
       },
       body: JSON.stringify({
         query: '{ me { id name } }'
       })
     }).then(r => r.json()).then(console.log)
     ```

4. **Check permissions:**
   - Ensure your Monday.com account has API access
   - Some enterprise accounts restrict API usage
   - Contact your Monday.com admin if needed

---

### Board/Group not loading
**Symptoms:** Dropdown shows "Loading boards..." forever

**Solutions:**
1. Check browser console for errors
2. Verify you have at least one board in Monday.com
3. Ensure your token has access to boards
4. Try refreshing settings page
5. Check network tab for API response errors

---

## 🐛 Bug Creation Issues

### "Please select a board and group" error
**Symptoms:** Can't create bug even though board/group are selected

**Solutions:**
1. **Re-save selection:**
   - Go to Settings
   - Select board from dropdown
   - Select group from dropdown
   - Click "Save Selection"

2. **Verify saved:**
   - Close and reopen settings
   - Check if selections persist

3. **Check storage:**
   - Open browser console (F12)
   - Run:
     ```javascript
     chrome.storage.sync.get(['selectedBoardId', 'selectedGroupId'], console.log)
     ```
   - Should show board and group IDs

---

### Bug creates but no attachments
**Symptoms:** Bug appears in Monday.com but files are missing

**Possible causes:**
1. **File size too large:** Monday.com has upload limits
2. **File type restricted:** Some plans restrict certain file types
3. **Network timeout:** Large files may timeout
4. **API rate limiting:** Too many uploads at once

**Solutions:**
1. Reduce file sizes (compress images, videos)
2. Upload fewer files at once
3. Check Monday.com plan file upload limits
4. Wait a moment between bug creations
5. Check browser console for specific file errors

---

### "Failed to attach debugger" error
**Symptoms:** HAR capture fails with debugger error

**Causes:**
- Chrome DevTools is already open on that tab
- Another extension is using the debugger
- Tab is a Chrome internal page (chrome://)

**Solutions:**
1. **Close DevTools:**
   - Close DevTools (F12) on the active tab
   - Try HAR capture again

2. **Check for conflicts:**
   - Disable other debugging extensions temporarily
   - Only one debugger can attach at a time

3. **Try different tab:**
   - HAR capture won't work on chrome:// pages
   - Navigate to a regular website

4. **Grant permission:**
   - Ensure debugger permission is enabled in `chrome://extensions/`

---

## 📸 Screenshot Issues

### Screenshot button doesn't work
**Symptoms:** Nothing happens when clicking "Take Screenshot"

**Solutions:**
1. Check if tab is visible (not minimized)
2. Ensure tab is not a Chrome internal page
3. Check browser console for errors
4. Try with a different website
5. Reload extension and try again

---

### Annotation tool doesn't open
**Symptoms:** Screenshot captured but editor doesn't appear

**Solutions:**
1. Check if popup blockers are enabled
2. Allow popups for extension
3. Check browser console for errors
4. Try opening annotate.html manually in a new tab

---

### Annotations not saving
**Symptoms:** Annotations disappear when clicking Save

**Solutions:**
1. Check chrome.storage permissions
2. Look for errors in console
3. Try drawing something simple first
4. Reload extension and try again

---

## 🔐 Privacy & Permissions

### HAR consent keeps asking
**Symptoms:** Consent prompt appears every time

**Solutions:**
1. Go to Settings → Privacy & Consent
2. Check "I understand and consent to HAR capture"
3. Click "Save Consent Preferences"
4. Verify checkbox persists after reload

---

### Sensitive headers still visible
**Symptoms:** Authorization headers not masked in HAR

**Solutions:**
1. Go to Settings → HAR Capture Settings
2. Enable "Mask sensitive headers"
3. Click "Save HAR Settings"
4. Create new bug to test

---

## 🎯 General Debugging

### Check browser console
**Always check console for detailed errors:**
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for red error messages
4. Copy full error text for reporting

### Check extension console
**For background script errors:**
1. Go to `chrome://extensions/`
2. Enable Developer Mode
3. Click "background page" or "service worker" link
4. View console for background errors

### Enable verbose logging
**For debugging:**
1. Open `background.js`
2. Add at top:
   ```javascript
   console.log('Debug mode enabled');
   ```
3. Add console.log statements where needed
4. Reload extension

### Reset extension
**Nuclear option:**
1. Go to Settings → Advanced
2. Click "Clear All Extension Data"
3. Confirm
4. Reconfigure from scratch

### Reinstall extension
**If all else fails:**
1. Go to `chrome://extensions/`
2. Remove "Bug Reporter for Monday.com"
3. Close and reopen Chrome
4. Load unpacked extension again
5. Reconfigure settings

---

## 📞 Getting Help

### Before reporting an issue:
1. ✅ Check this troubleshooting guide
2. ✅ Review CHANGELOG.md for recent fixes
3. ✅ Check browser console for errors
4. ✅ Try reloading the extension
5. ✅ Verify Monday.com token is valid

### When reporting an issue, include:
- Chrome version
- Extension version
- Operating system
- Exact error message from console
- Steps to reproduce
- What you've already tried

### Useful commands for debugging:
```javascript
// Check extension storage
chrome.storage.sync.get(null, console.log)
chrome.storage.local.get(null, console.log)

// Test Monday.com connection manually
fetch('https://api.monday.com/v2', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'YOUR_TOKEN'
  },
  body: JSON.stringify({ query: '{ me { id } }' })
}).then(r => r.json()).then(console.log)

// Check current tab
chrome.tabs.query({active: true, currentWindow: true}, console.log)
```

---

## 🎓 Pro Tips

1. **Always reload extension after code changes**
   - Go to `chrome://extensions/`
   - Click reload icon

2. **Check Monday.com directly**
   - Verify board/group exists
   - Check permissions
   - Look for created items

3. **Test with simple case first**
   - Create bug without attachments
   - Add one screenshot
   - Then try HAR + multiple files

4. **Keep console open**
   - See errors in real-time
   - Catch issues early
   - Better debugging

5. **Use Settings to test connection**
   - "Test Connection" button validates setup
   - Catches most configuration issues
   - Loads boards to verify access

---

**Still having issues?** Open an issue on GitHub with:
- Extension version (check manifest.json)
- Chrome version (chrome://version/)
- Full error message from console
- Screenshots of the issue
- Steps to reproduce

**Common gotchas:**
- ⚠️ Don't use extension on chrome:// pages
- ⚠️ Close DevTools when capturing HAR
- ⚠️ Reload extension after updates
- ⚠️ Monday.com tokens can expire
- ⚠️ File sizes affect upload time
