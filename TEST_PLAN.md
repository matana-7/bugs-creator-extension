# Test Plan - Bug Reporter Extension

## Pre-Testing Setup

### Requirements
- [ ] Chrome browser (version 88+)
- [ ] Monday.com account with API access
- [ ] Valid Monday.com API token
- [ ] At least one board and group in Monday.com

### Installation
- [ ] Icons generated (all 4 sizes: 16x16, 32x32, 48x48, 128x128)
- [ ] Extension loaded in `chrome://extensions/`
- [ ] No errors shown in extensions page
- [ ] Extension icon visible in Chrome toolbar

---

## Test Suite

### 1. Initial Setup & Configuration

#### Test 1.1: Settings Page Access
**Steps:**
1. Click Bug Reporter icon in toolbar
2. Click Settings gear icon
3. Verify settings page opens

**Expected:**
- Settings page loads without errors
- All sections visible: Connection, Board Selection, HAR Settings, Privacy, Advanced

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 1.2: Monday.com Connection
**Steps:**
1. Open Settings
2. Paste valid Monday.com API token
3. Click "Test Connection"

**Expected:**
- Success message appears
- Board dropdown populates with boards
- Status badge shows "Connected"

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 1.3: Invalid Token
**Steps:**
1. Enter invalid token (e.g., "invalid123")
2. Click "Test Connection"

**Expected:**
- Error message appears
- No boards populate
- Status remains "Disconnected"

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 1.4: Board & Group Selection
**Steps:**
1. With valid token, select a board
2. Verify groups populate
3. Select a group
4. Click "Save Selection"

**Expected:**
- Groups load for selected board
- Success message on save
- Selection persists after closing/reopening settings

**Status:** ⬜ Pass | ⬜ Fail

---

### 2. HAR Capture Tests

#### Test 2.1: HAR Capture with Consent
**Steps:**
1. Navigate to https://httpbin.org/get
2. Open Bug Reporter → Create New Bug
3. Ensure "Auto-attach HAR" is checked
4. If prompted, grant HAR consent
5. Fill required fields (description, steps)
6. Submit bug

**Expected:**
- Consent prompt appears (first time only)
- HAR status shows "✅ HAR captured"
- Bug created successfully
- HAR file attached to Monday item

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 2.2: HAR Capture without Consent
**Steps:**
1. Settings → Privacy → Uncheck "HAR consent"
2. Save consent preferences
3. Create new bug with "Auto-attach HAR" enabled

**Expected:**
- Consent prompt appears before capture
- If denied, HAR not captured
- Bug still created without HAR

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 2.3: HAR with Header Masking
**Steps:**
1. Settings → HAR Settings → Enable "Mask sensitive headers"
2. Navigate to site with auth (e.g., GitHub while logged in)
3. Create bug with HAR
4. Download HAR from Monday

**Expected:**
- Authorization headers show `***MASKED***`
- Cookie headers show `***MASKED***`
- Other headers visible

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 2.4: HAR Timeframe
**Steps:**
1. Settings → Set HAR timeframe to 5 minutes
2. Navigate to site, perform actions
3. Wait 6 minutes
4. Create bug with HAR

**Expected:**
- Only last 5 minutes of traffic captured
- Older traffic excluded

**Status:** ⬜ Pass | ⬜ Fail

---

### 3. Screenshot & Annotation Tests

#### Test 3.1: Basic Screenshot Capture
**Steps:**
1. Navigate to https://example.com
2. Create new bug
3. Click "Take Screenshot"

**Expected:**
- Screenshot captures visible tab content
- Annotation tool opens with captured image
- Image displays correctly

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 3.2: Pen Tool
**Steps:**
1. Take screenshot
2. Select Pen tool
3. Draw on canvas

**Expected:**
- Pen tool draws smooth lines
- Color and width settings apply
- Drawing visible on canvas

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 3.3: Arrow Tool
**Steps:**
1. In annotation tool, select Arrow
2. Click and drag to create arrow

**Expected:**
- Arrow drawn from start to end point
- Arrowhead visible at end
- Color and width apply

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 3.4: Rectangle Tool
**Steps:**
1. Select Rectangle tool
2. Click and drag to draw rectangle

**Expected:**
- Rectangle outline drawn
- No fill (transparent interior)
- Color and width apply

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 3.5: Text Tool
**Steps:**
1. Select Text tool
2. Click on canvas
3. Enter text in prompt
4. Click OK

**Expected:**
- Text prompt appears
- Entered text drawn on canvas
- Text color matches selected color

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 3.6: Undo/Redo
**Steps:**
1. Draw multiple annotations (pen, arrow, etc.)
2. Click Undo multiple times
3. Click Redo

**Expected:**
- Undo removes annotations in reverse order
- Redo restores them
- Can undo/redo up to 50 steps

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 3.7: Clear All
**Steps:**
1. Draw multiple annotations
2. Click Clear button
3. Confirm in dialog

**Expected:**
- Confirmation dialog appears
- All annotations removed
- Original screenshot remains

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 3.8: Save Annotation
**Steps:**
1. Annotate screenshot
2. Click Save

**Expected:**
- Annotation tool closes
- Screenshot appears in attachments list
- Preview shows annotated version

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 3.9: Multiple Screenshots
**Steps:**
1. Take and save first screenshot
2. Take and save second screenshot
3. Verify both in attachments

**Expected:**
- Both screenshots visible
- Named sequentially (screenshot-1, screenshot-2)
- Can remove individually

**Status:** ⬜ Pass | ⬜ Fail

---

### 4. File Attachment Tests

#### Test 4.1: Drag & Drop Single File
**Steps:**
1. Create new bug
2. Drag an image file to drop zone

**Expected:**
- Drop zone highlights on dragover
- File appears in attachments list
- File icon, name, and size shown

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 4.2: Drag & Drop Multiple Files
**Steps:**
1. Drag 3 files simultaneously to drop zone

**Expected:**
- All files added to attachments list
- Each file shown separately
- All files uploadable

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 4.3: Browse and Select Files
**Steps:**
1. Click "Browse Files"
2. Select multiple files in file picker

**Expected:**
- File picker opens
- Selected files added to list
- Same behavior as drag & drop

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 4.4: Large File Rejection
**Steps:**
1. Attempt to upload file > 50MB

**Expected:**
- Alert appears: "File too large (max 50MB)"
- File NOT added to attachments
- Other files still uploadable

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 4.5: Remove Attachment
**Steps:**
1. Add multiple files
2. Click × button on one file

**Expected:**
- File removed from list
- Other files remain
- No confirmation needed

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 4.6: Mixed Attachment Types
**Steps:**
1. Add screenshot
2. Add HAR (auto-attached)
3. Add image file
4. Add PDF file

**Expected:**
- All attachment types visible
- Different icons for different types
- All upload successfully

**Status:** ⬜ Pass | ⬜ Fail

---

### 5. Bug Creation & Submission Tests

#### Test 5.1: Required Fields Validation
**Steps:**
1. Create new bug
2. Leave Description blank
3. Click "Create & Upload"

**Expected:**
- Alert: "Please fill in required fields"
- Bug NOT created
- Form remains open

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 5.2: Complete Bug Submission
**Steps:**
1. Fill all fields:
   - Platform: "Chrome"
   - Env: "Production"
   - Version: "1.0.0"
   - Description: "Test bug"
   - Steps: "1. Do this\n2. See error"
   - Actual: "Error appears"
   - Expected: "Should work"
2. Add screenshot
3. Add file attachment
4. Submit

**Expected:**
- Progress bar appears
- Success message shown
- Monday item opens in new tab
- All data present in Monday item

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 5.3: Board/Group Selection
**Steps:**
1. Create bug
2. Select different board from dropdown
3. Select group
4. Submit

**Expected:**
- Groups update when board changes
- Bug created in selected board/group
- Selection saved for next bug

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 5.4: Upload Progress Indicator
**Steps:**
1. Create bug with large attachments
2. Observe progress bar during upload

**Expected:**
- Progress bar visible
- Percentage updates
- Text shows "Uploading attachments..."
- "Create & Upload" button disabled during upload

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 5.5: Network Error Handling
**Steps:**
1. Disconnect internet
2. Attempt to create bug

**Expected:**
- Error message appears
- Bug NOT created
- User can retry after reconnecting

**Status:** ⬜ Pass | ⬜ Fail

---

### 6. Popup & Recent Bugs Tests

#### Test 6.1: Recent Bugs List
**Steps:**
1. Ensure bugs exist in Monday board
2. Click extension icon

**Expected:**
- Popup shows recent bugs
- Bug titles visible
- Status badges shown
- Dates formatted correctly

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 6.2: Open Bug from List
**Steps:**
1. Click on a bug in recent list

**Expected:**
- Monday.com opens in new tab
- Correct bug item displayed

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 6.3: Empty State
**Steps:**
1. Select board/group with no items
2. Open popup

**Expected:**
- Message: "No bugs found"
- Create button still visible

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 6.4: Connection Status Indicator
**Steps:**
1. Open popup while connected
2. Disconnect in settings
3. Reopen popup

**Expected:**
- Green indicator + "Connected" when connected
- Red indicator + "Not connected" when disconnected
- Yellow + "Please select board" if token but no board

**Status:** ⬜ Pass | ⬜ Fail

---

### 7. Privacy & Security Tests

#### Test 7.1: Privacy Notice Display
**Steps:**
1. Open Settings → Privacy & Consent

**Expected:**
- Privacy notice fully visible
- Lists HAR contents
- Lists screenshot contents
- Clear and understandable

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 7.2: Consent Persistence
**Steps:**
1. Grant HAR consent
2. Close settings
3. Reopen settings

**Expected:**
- Consent checkbox remains checked
- No re-prompting for granted consent

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 7.3: Token Security
**Steps:**
1. Enter token in settings
2. Save token
3. Check Chrome DevTools console
4. Check network tab

**Expected:**
- Token NOT visible in console logs
- Token NOT sent to any server except Monday.com
- Token stored in encrypted Chrome storage

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 7.4: Clear All Data
**Steps:**
1. Configure extension fully
2. Settings → Advanced → Clear All Extension Data
3. Confirm

**Expected:**
- Confirmation dialog appears
- All settings cleared
- Token removed
- Board/group selection reset
- Page reloads

**Status:** ⬜ Pass | ⬜ Fail

---

### 8. Edge Cases & Error Handling

#### Test 8.1: Debugger Already Attached
**Steps:**
1. Open Chrome DevTools on a tab
2. Attempt to capture HAR for that tab

**Expected:**
- Error message: "Failed to attach debugger"
- Explanation provided
- Bug still created without HAR

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 8.2: Incognito Mode
**Steps:**
1. Open incognito window
2. Attempt to use extension

**Expected:**
- Extension works OR
- Clear message about incognito permissions needed

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 8.3: Chrome Internal Pages
**Steps:**
1. Navigate to chrome://extensions/
2. Attempt to capture screenshot

**Expected:**
- Error message
- Explanation that Chrome pages can't be captured
- Graceful failure

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 8.4: Monday API Rate Limiting
**Steps:**
1. Create 20 bugs rapidly

**Expected:**
- Rate limit error handled gracefully
- User informed to slow down
- No data loss

**Status:** ⬜ Pass | ⬜ Fail

---

#### Test 8.5: Long Bug Description
**Steps:**
1. Enter 5000+ character description
2. Submit bug

**Expected:**
- Either accepted by Monday OR
- Validation error with character limit
- No truncation without warning

**Status:** ⬜ Pass | ⬜ Fail

---

## Performance Tests

### Test P.1: HAR Capture Performance
**Expected:** HAR capture completes in < 5 seconds for typical browsing session

**Status:** ⬜ Pass | ⬜ Fail

---

### Test P.2: Screenshot Annotation Responsiveness
**Expected:** Drawing tools respond immediately, no lag on 4K screenshots

**Status:** ⬜ Pass | ⬜ Fail

---

### Test P.3: Large File Upload
**Expected:** 45MB file uploads with visible progress, completes successfully

**Status:** ⬜ Pass | ⬜ Fail

---

### Test P.4: Memory Usage
**Expected:** Extension uses < 100MB RAM during normal operation

**Status:** ⬜ Pass | ⬜ Fail

---

## Browser Compatibility

### Chrome Versions
- [ ] Chrome 88 (minimum)
- [ ] Chrome 100
- [ ] Chrome 120 (latest)

### Operating Systems
- [ ] Windows 10/11
- [ ] macOS (Intel & Apple Silicon)
- [ ] Linux (Ubuntu/Debian)

---

## Test Summary

**Total Tests:** 49
**Passed:** _____
**Failed:** _____
**Blocked:** _____

**Critical Issues:**
- List any critical bugs found

**Minor Issues:**
- List any minor bugs found

**Tester Name:** _______________
**Date:** _______________
**Environment:** _______________
**Chrome Version:** _______________

---

## Notes

Use this section to document:
- Additional observations
- Performance notes
- UX feedback
- Suggested improvements
