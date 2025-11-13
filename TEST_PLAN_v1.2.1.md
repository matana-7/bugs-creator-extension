# Test Plan - Version 1.2.1

## 🧪 Critical Bug Fixes Verification

**Purpose:** Verify all 6 critical issues are resolved  
**Version:** 1.2.1  
**Tester:** _____________  
**Date:** _____________

---

## Pre-Test Setup

- [ ] Extension reloaded in Chrome (`chrome://extensions/` → Reload)
- [ ] Browser console open (F12)
- [ ] Monday.com API token configured
- [ ] At least one board/group selected

---

## Test Cases

### Test 1: No Console Errors ✅

**Expected:** No JavaScript errors in console

**Steps:**
1. Open create-bug page
2. Check browser console (F12)
3. Look for any red error messages

**Pass Criteria:**
- [ ] No "submitBtn already declared" error
- [ ] No syntax errors
- [ ] No undefined variable errors

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________________________

---

### Test 2: GraphQL Errors Display Correctly ✅

**Expected:** Clear error messages (not "[object Object]")

**Steps:**
1. Use invalid/expired Monday token
2. Try to load boards
3. Check console error messages

**Pass Criteria:**
- [ ] Error message shows clear text (e.g., "User unauthorized to perform action")
- [ ] Error includes path if available
- [ ] No "[object Object]" in console

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________________________

---

### Test 3: Pagination Handles Unauthorized Boards ✅

**Expected:** Graceful handling, no crash

**Steps:**
1. Use token with partial board access
2. Open Settings → Test Connection
3. Watch console during board loading

**Pass Criteria:**
- [ ] Console shows "Skipping remaining boards - unauthorized access" OR similar
- [ ] Extension doesn't crash
- [ ] Accessible boards are shown in dropdown
- [ ] No error dialog

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________________________

---

### Test 4: Create Bug Button Works ✅

**Expected:** Creates Monday item successfully

**Steps:**
1. Open create-bug page
2. Fill all required fields:
   - Title: "Test Bug v1.2.1"
   - Description: "Testing critical fixes"
   - Steps to reproduce: "1. Test 2. Verify 3. Done"
3. Select board and group
4. Click "Create & Upload"

**Pass Criteria:**
- [ ] Button shows "Creating..." with spinner
- [ ] Progress indicator appears
- [ ] Success message shown
- [ ] Monday item created (verify in Monday.com)
- [ ] Item opens in new tab

**Status:** ☐ PASS ☐ FAIL  
**Monday Item URL:** ___________________________  
**Notes:** ___________________________

---

### Test 5: Screenshot Feature Works ✅

**Expected:** Captures website, not extension UI

**Steps:**
1. Navigate to any website (e.g., google.com)
2. Open create-bug page
3. Click "Take Screenshot"
4. Wait for annotation window

**Pass Criteria:**
- [ ] Screenshot captures website (not create-bug page)
- [ ] Annotation window opens
- [ ] Can draw on screenshot
- [ ] Can save annotation
- [ ] Screenshot appears in attachments list
- [ ] Returns to create-bug form

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________________________

---

### Test 6: File Upload Works ✅

**Expected:** Files attach to Monday item

**Steps:**
1. In create-bug page, drag and drop a file
2. Verify file appears in attachments list
3. Fill form and click "Create & Upload"
4. Check Monday item for attachments

**Pass Criteria:**
- [ ] File appears in attachments list immediately
- [ ] File size shown
- [ ] Can remove file if needed
- [ ] Progress indicator during upload
- [ ] File attached to Monday item (verify in Monday.com)

**Status:** ☐ PASS ☐ FAIL  
**File Tested:** ___________________________  
**Notes:** ___________________________

---

### Test 7: HAR Capture Works ✅

**Expected:** HAR file captures and attaches

**Steps:**
1. Navigate to website with network activity
2. Open create-bug page
3. Enable "Auto-attach HAR"
4. Fill form and click "Create & Upload"
5. Check Monday item for HAR attachment

**Pass Criteria:**
- [ ] HAR capture consent shown (first time)
- [ ] HAR status shows "Capturing HAR..."
- [ ] HAR file appears in attachments
- [ ] HAR attached to Monday item

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________________________

---

### Test 8: End-to-End Bug Reporting ✅

**Expected:** Complete workflow works

**Steps:**
1. Navigate to website (e.g., example.com)
2. Click extension icon → "Create a new bug"
3. Fill form:
   - Title: "E2E Test Bug"
   - Platform: "Chrome"
   - Description: "Testing full workflow"
   - Steps: "1. Open extension 2. Create bug"
4. Click "Take Screenshot"
5. Annotate screenshot
6. Save annotation
7. Drag and drop a test file
8. Enable "Auto-attach HAR"
9. Click "Create & Upload"

**Pass Criteria:**
- [ ] All steps complete without errors
- [ ] Monday item created with all fields
- [ ] Screenshot attached
- [ ] File attached
- [ ] HAR attached
- [ ] Item opens in browser

**Status:** ☐ PASS ☐ FAIL  
**Monday Item URL:** ___________________________  
**Notes:** ___________________________

---

## Regression Tests

### Test 9: Settings Page Still Works ✅

**Steps:**
1. Open Settings (gear icon)
2. Enter/verify API token
3. Click "Test Connection"
4. Select board and group
5. Click "Save Selection"

**Pass Criteria:**
- [ ] All boards load (with pagination)
- [ ] Search box filters boards
- [ ] Board/group selection works
- [ ] Settings save successfully

**Status:** ☐ PASS ☐ FAIL

---

### Test 10: Popup Bug List Works ✅

**Steps:**
1. Click extension icon
2. View recent bugs list
3. Try search box

**Pass Criteria:**
- [ ] Recent bugs load
- [ ] Search filters bugs
- [ ] Clicking bug opens Monday.com

**Status:** ☐ PASS ☐ FAIL

---

## Performance Tests

### Test 11: Load Time Acceptable ✅

**Acceptable:** <3 seconds for 100 boards

**Steps:**
1. Settings → Test Connection
2. Time board loading
3. Note duration

**Result:**
- Boards count: _______
- Load time: _______ seconds
- Pass if: <3s for 100 boards

**Status:** ☐ PASS ☐ FAIL

---

### Test 12: No Memory Leaks ✅

**Steps:**
1. Open/close create-bug 10 times
2. Check Chrome Task Manager
3. Note memory usage

**Result:**
- Initial memory: _______ MB
- After 10 cycles: _______ MB
- Increase: _______ MB
- Pass if: <50MB increase

**Status:** ☐ PASS ☐ FAIL

---

## Edge Cases

### Test 13: Invalid Token Handling ✅

**Steps:**
1. Settings → Enter invalid token
2. Click "Test Connection"

**Pass Criteria:**
- [ ] Clear error message shown
- [ ] No crash
- [ ] Can correct token and retry

**Status:** ☐ PASS ☐ FAIL

---

### Test 14: Network Error Handling ✅

**Steps:**
1. Disable internet
2. Try to create bug

**Pass Criteria:**
- [ ] Clear error message shown
- [ ] Form data not lost
- [ ] Can retry when online

**Status:** ☐ PASS ☐ FAIL

---

### Test 15: Large File Handling ✅

**Steps:**
1. Try to attach 600MB file (over limit)

**Pass Criteria:**
- [ ] Error shown: "File too large"
- [ ] File size limit mentioned (500MB)
- [ ] Other files can still be uploaded

**Status:** ☐ PASS ☐ FAIL

---

## Browser Compatibility

### Test 16: Chrome Latest ✅

**Browser:** Chrome _______  
**OS:** _______

**Tests:**
- [ ] All core features work
- [ ] No console errors
- [ ] UI renders correctly

**Status:** ☐ PASS ☐ FAIL

---

## Final Checklist

- [ ] All 16 tests executed
- [ ] 0 critical failures
- [ ] All acceptance criteria met
- [ ] Documentation reviewed
- [ ] Ready for production

---

## Summary

**Total Tests:** 16  
**Passed:** _______  
**Failed:** _______  
**Skipped:** _______

**Critical Issues:** _______  
**Minor Issues:** _______

**Overall Result:** ☐ PASS ☐ FAIL

---

## Issues Found

| Test # | Issue | Severity | Status |
|--------|-------|----------|--------|
|        |       |          |        |
|        |       |          |        |
|        |       |          |        |

---

## Tester Sign-off

**Name:** _____________  
**Date:** _____________  
**Signature:** _____________

---

## Notes

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

## Recommended Actions

Based on test results:

☐ **PASS** - Ready for production  
☐ **MINOR ISSUES** - Document and fix in next release  
☐ **CRITICAL ISSUES** - Do not release, fix immediately  

---

**Test Plan Version:** 1.0  
**Extension Version:** 1.2.1  
**Last Updated:** 2025-11-12
