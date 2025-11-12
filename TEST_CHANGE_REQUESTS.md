# Testing Guide for v1.1.0 Change Requests

Quick guide to verify all 5 change requests are working correctly.

---

## 🔄 First Step: Reload Extension

```
1. Go to: chrome://extensions/
2. Find: "Bug Reporter for Monday.com"
3. Click: Reload icon (🔄)
4. Verify: Version shows 1.1.0
```

---

## 1️⃣ Test Change Request 1: Title Field

### What to Test
- Title field is required
- Used as Monday.com item name
- Validation works

### Steps
```
1. Click extension icon → "Create a New Bug"
2. Leave Title field empty
3. Try to fill Description and Steps
4. Observe:
   ✅ "Title is required" error appears
   ✅ Submit button is disabled

5. Enter Title: "Test Bug - Login Issue"
6. Observe:
   ✅ Error disappears
   ✅ Submit button enabled

7. Fill other required fields:
   • Description: "Users cannot log in"
   • Steps: "1. Go to login\n2. Enter credentials\n3. Click submit"

8. Click "Create & Upload"
9. Open Monday.com
10. Verify:
    ✅ Item name is "Test Bug - Login Issue"
```

### Expected Result
- ✅ Title field required
- ✅ Real-time validation
- ✅ Monday item has correct name

---

## 2️⃣ Test Change Request 2: Bold Labels

### What to Test
- Section labels are bold in Monday updates
- Format is `**Label:** value`

### Steps
```
1. Create a new bug with ALL fields filled:
   • Title: "Test Bold Labels"
   • Platform: "Chrome 120"
   • ENV: "Production"
   • Version: "1.2.3"
   • Description: "Testing bold labels"
   • Steps: "1. Test\n2. Verify"
   • Actual: "Labels not bold"
   • Expected: "Labels should be bold"

2. Submit bug
3. Open Monday.com item
4. Click on the bug updates section
5. Verify formatting:

   ✅ **Platform:** Chrome 120
   ✅ **ENV:** Production
   ✅ **Version:** 1.2.3
   ✅ **Description:** Testing bold labels
   ✅ **Steps to reproduce:**
      1. Test
      2. Verify
   ✅ **Actual result:** Labels not bold
   ✅ **Expected result:** Labels should be bold
   ✅ **Logs:** (HAR attached if available)
   ✅ **Media:** (screenshots attached if available)
```

### Expected Result
- ✅ All labels in bold
- ✅ Consistent format
- ✅ Professional appearance

---

## 3️⃣ Test Change Request 3: File Attachments

### What to Test
- Files upload reliably
- MIME type detection works
- Retry logic works
- Error messages helpful

### Test A: Normal Upload
```
1. Create new bug
2. Add attachments:
   • Take screenshot (with annotation)
   • Enable "Auto-attach HAR"
   • Drag & drop an image file
   • Browse and select a PDF

3. Submit bug
4. Watch progress bar
5. Verify:
   ✅ Progress shows for each file
   ✅ No errors in console
   ✅ Success message appears

6. Open Monday.com item
7. Check attachments update
8. Verify:
   ✅ Screenshot attached
   ✅ HAR file attached (.har or .json)
   ✅ Image file attached
   ✅ PDF file attached
```

### Test B: Large File
```
1. Create new bug
2. Try to attach file > 500MB
3. Verify:
   ✅ Error message: "File too large: ... exceeds 500MB limit"
   ✅ Helpful tip shown
   ✅ Bug creation continues (doesn't fail entirely)
```

### Test C: Network Error Simulation
```
1. Disable internet temporarily
2. Create bug with attachments
3. Verify:
   ✅ Retry attempts logged in console
   ✅ Error message shown
   ✅ Tip about checking connection
```

### Expected Results
- ✅ Files upload successfully
- ✅ Retry on failures
- ✅ Clear error messages
- ✅ Helpful tips provided

---

## 4️⃣ Test Change Request 4: Screenshot Capture

### What to Test
- Screenshot never includes extension UI
- Form state preserved
- Workflow is seamless

### Steps
```
1. Navigate to: https://example.com
2. Open extension → "Create a New Bug"
3. Fill in some fields:
   • Title: "Test Screenshot"
   • Platform: "Chrome"
   • Description: "Testing screenshot flow"
   • Steps: "1. Navigate\n2. Screenshot"

4. Click "Take Screenshot"
5. Observe:
   ✅ create-bug window/tab closes immediately
   ✅ example.com tab is focused
   ✅ Screenshot is captured (check if it includes the page, not extension)

6. Annotation window opens automatically
7. Draw some annotations:
   • Use pen tool to draw
   • Add an arrow
   • Add text

8. Click "Save"
9. Observe:
   ✅ Annotation window closes
   ✅ create-bug page reopens
   ✅ All form fields still filled (from step 3)
   ✅ Screenshot appears in attachments

10. Check screenshot thumbnail
11. Verify:
    ✅ No extension popup visible in screenshot
    ✅ Only example.com page visible
    ✅ Annotations are present
```

### Critical Checks
- ❌ Extension UI should NOT appear in screenshot
- ✅ Form data should be preserved
- ✅ Workflow should be automatic

---

## 5️⃣ Test Change Request 5: Search

### What to Test
- Search filters bugs
- Debounce works (250ms)
- Results count updates

### Setup: Create Test Bugs
```
First, create a few bugs for testing:
1. "Login bug on mobile"
2. "Payment processing error"
3. "Dashboard not loading"
```

### Steps
```
1. Click extension icon (opens popup)
2. Wait for bugs to load
3. Verify: "3 bugs" shows in results count

4. Type in search box: "login"
5. Wait 250ms
6. Verify:
   ✅ Only "Login bug on mobile" shows
   ✅ Results count: "1 of 3"

7. Clear search box
8. Verify:
   ✅ All 3 bugs reappear
   ✅ Results count: "3 bugs"

9. Type: "error"
10. Verify:
    ✅ "Payment processing error" shows
    ✅ Results count: "1 of 3"

11. Type: "not"
12. Verify:
    ✅ "Dashboard not loading" shows
    ✅ Results count: "1 of 3"

13. Type status name (e.g., "open")
14. Verify:
    ✅ Filters by status too

15. Type date (e.g., "nov" or "2025")
16. Verify:
    ✅ Filters by date too
```

### Performance Check
```
1. Type quickly: "a" then "b" then "c" rapidly
2. Verify:
   ✅ Doesn't filter on every keystroke
   ✅ Waits for 250ms pause
   ✅ Only filters once after typing stops
```

### Expected Results
- ✅ Search filters by title
- ✅ Search filters by status
- ✅ Search filters by date
- ✅ Debounce prevents excessive filtering
- ✅ Results count accurate
- ✅ Clear search restores all bugs

---

## ✅ Full Integration Test

Test all features together:

```
1. Open extension popup
2. Search for existing bug: "test"
3. Click "Create a New Bug"
4. Fill Title: "Integration Test Bug"
5. Fill all other fields
6. Click "Take Screenshot"
7. Wait for capture and annotation
8. Annotate screenshot
9. Save annotation
10. Return to create-bug (fields preserved)
11. Drag & drop an image file
12. Enable "Auto-attach HAR"
13. Select board and group
14. Click "Create & Upload"
15. Wait for upload progress
16. Open Monday.com item
17. Verify:
    ✅ Item name: "Integration Test Bug"
    ✅ Update has bold labels
    ✅ All fields present
    ✅ Screenshot attached (no extension UI)
    ✅ Image file attached
    ✅ HAR file attached
18. Return to extension popup
19. Search for: "integration"
20. Verify:
    ✅ New bug appears in search results
```

---

## 🐛 Known Issues to Watch For

### Potential Issues
1. **Screenshot capture timing**
   - If popup doesn't close fast enough
   - Solution: Increase delay in background.js (currently 300ms)

2. **Form state restoration**
   - If attachedFiles don't restore correctly
   - Check: chrome.storage.local has size limits

3. **File upload retries**
   - Network issues may cause multiple retries
   - Check: Console logs for retry attempts

4. **Search performance**
   - With 1000+ bugs, may be slow
   - Consider pagination for large lists

---

## 📊 Test Results Template

Use this to track your testing:

```
CHANGE REQUEST 1: Title Field
□ Title required validation works
□ Submit button disabled when empty
□ Monday item has correct name
Status: _____ (Pass/Fail)
Notes: _______________

CHANGE REQUEST 2: Bold Labels
□ All labels bold in Monday
□ Format is **Label:** value
□ Professional appearance
Status: _____ (Pass/Fail)
Notes: _______________

CHANGE REQUEST 3: File Attachments
□ Files upload successfully
□ Retry logic works
□ Error messages helpful
□ Size validation works
Status: _____ (Pass/Fail)
Notes: _______________

CHANGE REQUEST 4: Screenshot
□ No extension UI in screenshot
□ Form state preserved
□ Workflow seamless
Status: _____ (Pass/Fail)
Notes: _______________

CHANGE REQUEST 5: Search
□ Filters by title
□ Filters by status
□ Filters by date
□ Debounce works
□ Results count accurate
Status: _____ (Pass/Fail)
Notes: _______________

OVERALL: _____ (Pass/Fail)
Date Tested: ___________
Tester: _______________
```

---

## 🆘 Troubleshooting

### Issue: Title validation not working
- **Check:** Browser console for errors
- **Try:** Reload extension
- **Verify:** Title input has id="title"

### Issue: Labels not bold in Monday
- **Check:** Monday.com renders Markdown
- **Try:** View update in Monday web interface
- **Verify:** Format is exactly `**Label:**`

### Issue: Files not uploading
- **Check:** Browser console for upload errors
- **Try:** Test with smaller files first
- **Verify:** Monday.com token is valid
- **Check:** Network tab for API calls

### Issue: Screenshot captures extension
- **Check:** Timing delays in background.js
- **Try:** Increase wait times (300ms → 500ms)
- **Verify:** create-bug window closes before capture

### Issue: Search not working
- **Check:** Console for JavaScript errors
- **Try:** Reload extension
- **Verify:** Bugs loaded successfully first

---

## 📞 Need Help?

If any test fails:
1. Check browser console (F12) for errors
2. Check background service worker console
3. Review CHANGES_v1.1.0.md for implementation details
4. Check TROUBLESHOOTING.md for solutions

---

**Happy Testing! 🧪✅**
