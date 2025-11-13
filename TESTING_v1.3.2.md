# Testing Guide - Version 1.3.2

## 🎯 Critical Fix: File Upload to Monday.com

**Version:** 1.3.2  
**Release Date:** 2025-11-12  
**Priority:** CRITICAL - File uploads completely broken in v1.3.1

---

## 🚨 What Was Broken

### Error Messages You Were Seeing

```
File upload HTTP error: {
  "errors": [{
    "message": "Invalid GraphQL request",
    "extensions": {
      "code": "INVALID_GRAPHQL_REQUEST",
      "details": "Request body must be a JSON with query."
    }
  }]
}

Failed to upload file screenshot-1.png: 
Error: Upload failed after 3 attempts: HTTP 400
```

### Why It Failed

- **v1.3.0 & v1.3.1 used the GraphQL multipart upload specification**
  - This is a standard for many GraphQL servers (Apollo, etc.)
  - **Monday.com does NOT support this specification**
- **Monday.com requires a proprietary 3-step asset upload process**
  - We were sending the wrong format to their API
  - Result: HTTP 400 "Invalid GraphQL request"

---

## ✅ What's Fixed

### New Implementation: Monday.com Assets API

**The correct way to upload files to Monday.com:**

```javascript
// ❌ WRONG (v1.3.0 - v1.3.1)
const formData = new FormData();
formData.append('query', mutation);
formData.append('map', '{"image": ["variables.file"]}');
formData.append('image', blob, filename);
fetch(mondayAPI, { body: formData }); // ❌ HTTP 400

// ✅ CORRECT (v1.3.2)
// Step 1: Create asset and get presigned URL
const asset = await createAsset(); // Returns { id, url, upload_url }

// Step 2: Upload directly to storage (not to Monday API)
await fetch(asset.upload_url, {
  method: 'PUT',
  body: blob
});

// Step 3: Link the uploaded asset to Monday item
await addFileToUpdate(updateId, asset.id);
```

---

## 🧪 Testing Checklist

### ✅ Pre-Testing Setup

1. **Reload Extension**
   ```
   1. Open chrome://extensions/
   2. Find "Bug Reporter for Monday.com"
   3. Click "Reload" (⟳)
   4. Verify version shows "1.3.2"
   ```

2. **Open Developer Console**
   ```
   F12 or right-click → Inspect → Console tab
   ```

3. **Verify Monday.com Connection**
   ```
   1. Click extension icon
   2. Click Settings (⚙️)
   3. Check token is valid
   4. Click "Test Connection"
   5. Should see success message
   ```

---

### 📸 Test 1: Single Screenshot Upload

**Steps:**

1. Navigate to any webpage
2. Click extension icon → "Create a new bug"
3. Fill in required fields:
   - Title: "Test screenshot upload"
   - Platform: "Web"
   - Description: "Testing v1.3.2 fix"
4. Click "Take a screenshot"
5. Draw something on the screenshot
6. Click "Save"
7. Click "Create & Upload"

**Expected Console Output:**

```
Creating update for 1 file(s) on item 123456789...
✓ Update created with ID: 987654321
Uploading file screenshot.png to update 987654321 (attempt 1)...
File size: 123.45 KB, MIME: image/png
Uploading file using Monday.com assets API...
Step 1: Creating asset...
Asset creation result: { data: { create_asset: { id: "111", url: "...", upload_url: "https://..." } } }
✓ Asset created: 111
Step 2: Uploading file to presigned URL...
✓ File uploaded to storage
Step 3: Adding asset to update...
Upload response status: 200
✓ File screenshot.png uploaded successfully
```

**Expected Monday.com Result:**

✅ New item created with correct title  
✅ Item contains "📎 Attachments" update  
✅ Screenshot is visible and downloadable  
✅ Filename, size, and preview shown correctly

**If It Fails:**

- Check console for error messages
- Verify token has file upload permissions
- Check if update ID was created successfully

---

### 📁 Test 2: Multiple File Uploads

**Steps:**

1. Create a new bug
2. Drag & drop 2-3 different files (images, PDF, etc.)
3. Also take a screenshot
4. Fill form and submit

**Expected Console Output:**

```
Creating update for 4 file(s) on item 123456789...
✓ Update created with ID: 987654321

Uploading file image1.png...
[3-step process for file 1]
✓ File image1.png uploaded successfully

Uploading file document.pdf...
[3-step process for file 2]
✓ File document.pdf uploaded successfully

Uploading file screenshot.png...
[3-step process for file 3]
✓ File screenshot.png uploaded successfully

Bug created with 4 attachments! ✓
```

**Expected Monday.com Result:**

✅ All 4 files appear in "📎 Attachments" update  
✅ Each file is individually downloadable  
✅ Correct filenames and sizes shown

---

### 🎥 Test 3: Large File / Video Upload

**Steps:**

1. Create a new bug
2. Attach a video file (10-50 MB)
3. Submit

**Expected Behavior:**

✅ Upload succeeds (no "Message length exceeded" error)  
✅ Progress shows in UI  
✅ Video appears in Monday.com  
✅ Video is playable from Monday.com

**Note:** This tests the fix from v1.3.0 (using `chrome.storage.local` instead of `sendMessage` for large files)

---

### 🚫 Test 4: Authorization Error Handling

**Purpose:** Verify graceful handling of limited token permissions

**Steps:**

1. Go to Settings
2. Scroll to "Board & Group Selection"
3. Watch console while boards load

**Expected Console Output:**

```
Fetching boards page 1...
Fetching boards page 2...
...
Error fetching boards page 8: Error: Monday GraphQL error: User unauthorized to perform action (boards.9.groups)
⚠️ Unauthorized access at page 8 - this is normal if token has limited board access
```

**Expected UI Behavior:**

✅ Extension doesn't crash  
✅ Accessible boards still load in dropdown  
✅ Console shows warning (not error)  
✅ User can still create bugs on accessible boards

---

### 🧹 Test 5: Error Recovery

**Purpose:** Verify upload retry logic

**Steps:**

1. Turn off internet or throttle to "Offline" in DevTools
2. Create a bug with attachments
3. Turn internet back on after first failure

**Expected Behavior:**

✅ First attempt fails (network error)  
✅ Extension retries automatically (exponential backoff)  
✅ Eventually succeeds when network restored  
✅ User sees clear error if all retries fail

---

## 📊 Validation Criteria

### For Each Test, Verify:

| Check | Expected | Status |
|-------|----------|--------|
| **Console Errors** | No "Invalid GraphQL request" | ⬜ |
| **HTTP Status** | 200 (not 400) for all API calls | ⬜ |
| **3-Step Process** | All 3 steps logged clearly | ⬜ |
| **Asset Creation** | Returns id, url, upload_url | ⬜ |
| **Presigned Upload** | PUT request succeeds | ⬜ |
| **Asset Linking** | File linked to update | ⬜ |
| **Monday.com Item** | Files visible and downloadable | ⬜ |
| **UI Feedback** | Progress shows, success message | ⬜ |
| **Auth Errors** | Handled gracefully, no crash | ⬜ |

---

## 🐛 Common Issues & Solutions

### Issue: "Asset creation error: 401 Unauthorized"

**Cause:** Token doesn't have permission to create assets  
**Solution:** 
1. Go to Monday.com → Profile → Admin → API
2. Regenerate token
3. Ensure token has "boards:write" and "assets:write" scopes

### Issue: "Failed to upload file: 403 Forbidden"

**Cause:** Presigned URL expired or token invalid  
**Solution:** 
- Extension handles this with retry logic
- If persistent, check token permissions

### Issue: Files upload but don't appear in Monday

**Cause:** Asset linking (step 3) failed  
**Solution:** 
- Check console for "Step 3: Adding asset to update" errors
- Verify update ID is valid
- Check token has permission to update items

### Issue: "User unauthorized to perform action"

**Cause:** Token lacks access to specific boards  
**Solution:** 
- This is normal! Extension handles gracefully
- Select a board you have access to
- Or request access from board owner

---

## 📈 Performance Benchmarks

### Expected Upload Times

| File Size | Expected Time | Notes |
|-----------|---------------|-------|
| < 1 MB | 1-3 seconds | Single image |
| 1-10 MB | 3-10 seconds | Document, small video |
| 10-50 MB | 10-30 seconds | Large video |
| 50-100 MB | 30-60 seconds | Very large file |

**If upload takes significantly longer:**
- Check network speed
- Check Monday.com server status
- Large files naturally take longer

---

## 🎓 Technical Details

### What Changed in the Code

**modules/monday-api.js - uploadFileToUpdate()**

```javascript
// Lines 469-558 completely rewritten

// OLD (v1.3.1): Multipart upload
const formData = new FormData();
formData.append('query', mutation);
formData.append('map', JSON.stringify(map));
formData.append('image', blob, filename);
await fetch(apiUrl, { body: formData }); // ❌ Failed

// NEW (v1.3.2): Assets API
// 1. Create asset
const assetResponse = await fetch(apiUrl, {
  body: JSON.stringify({ 
    query: 'mutation { create_asset { id url upload_url } }' 
  })
});
const asset = assetResponse.data.create_asset;

// 2. Upload to presigned URL
await fetch(asset.upload_url, {
  method: 'PUT',
  body: blob
});

// 3. Link asset to update
await fetch(apiUrl, {
  body: JSON.stringify({ 
    query: `mutation { add_file_to_update(update_id: ${id}, file_id: ${asset.id}) }` 
  })
});
```

### Why This Approach Works

1. **Separation of Concerns**
   - Asset creation is separate from file upload
   - File upload goes directly to storage (not through API)
   - Linking happens after upload completes

2. **Performance**
   - Presigned URLs allow direct upload to S3/CDN
   - No need to proxy files through Monday.com's API
   - Faster uploads, especially for large files

3. **Security**
   - Presigned URLs are temporary and scoped
   - Token only needs permission to create assets and link them
   - File data doesn't pass through GraphQL API

4. **Reliability**
   - Each step can be retried independently
   - Clear error messages for each step
   - Follows Monday.com's official API pattern

---

## ✅ Success Criteria

**Version 1.3.2 is successful if:**

✅ **No "Invalid GraphQL request" errors**  
✅ **All files upload successfully** (screenshots, attachments, HAR)  
✅ **Files appear in Monday.com items** immediately after creation  
✅ **Console shows clear 3-step process** for each file  
✅ **Authorization errors handled gracefully** (no crashes)  
✅ **UI shows clear progress** and success messages  
✅ **Large files (videos) upload** without errors  
✅ **Retry logic works** for network failures

---

## 🚀 Next Steps After Testing

1. **If all tests pass:**
   - Mark extension as production-ready
   - Deploy to users
   - Monitor for any edge cases

2. **If any test fails:**
   - Note the specific error message
   - Share console output
   - Provide steps to reproduce

3. **Optional enhancements:**
   - Add upload progress bar (percentage)
   - Support even larger files with chunking
   - Add file preview before upload
   - Support drag & drop reordering

---

**Testing Guide Version:** 1.3.2  
**Last Updated:** 2025-11-12  
**Status:** Ready for Production Testing

---

## 📞 Reporting Issues

If you encounter any issues during testing, please provide:

1. **Extension version** (should be 1.3.2)
2. **Complete console output** (copy/paste)
3. **Steps to reproduce**
4. **Expected vs actual behavior**
5. **Screenshots if applicable**

This helps diagnose issues quickly and accurately.
