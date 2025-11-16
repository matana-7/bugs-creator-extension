# 🚀 Quick Start - Version 1.3.3

## THE FIX IS IN! ✅

**Problem:** File uploads failing with "Cannot query field 'create_asset'"  
**Solution:** Use correct GraphQL multipart format with `operations` + `map` + file  
**Version:** 1.3.3

---

## 🔄 Update Now

1. **Reload Extension**
   ```
   chrome://extensions/ → Find "Bug Reporter for Monday.com" → Click ⟳
   ```

2. **Verify Version**
   ```
   Should show: 1.3.3
   ```

---

## 🧪 Test It

1. Click extension icon → "Create a new bug"
2. Fill in title and description
3. Click "Take a screenshot"
4. Draw something and save
5. Click "Create & Upload"

**Console should show:**
```
Uploading file using Monday.com multipart format...
Multipart request prepared:
- Operations: { query: "mutation ($file: File!) {...}", variables: { file: null } }
- Map: { "0": ["variables.file"] }
- File key: "0", name: screenshot.png, size: 240200
Upload response status: 200
✓ File screenshot.png uploaded successfully
```

**Monday.com should show:**
- ✅ New item created
- ✅ "📎 Attachments" update with your screenshot
- ✅ File is downloadable

---

## ✅ What's Fixed

| Issue | Status |
|-------|--------|
| "Cannot query field 'create_asset'" | ✅ FIXED |
| "Invalid GraphQL request" | ✅ FIXED |
| Files not appearing in Monday | ✅ FIXED |
| HTTP 400 errors | ✅ FIXED |

---

## 📋 Format Details

**Correct Multipart Format:**

```javascript
// Field 1: operations (JSON string)
{
  query: "mutation ($file: File!) { add_file_to_update(update_id: 123, file: $file) { id } }",
  variables: { file: null }
}

// Field 2: map (JSON string)
{
  "0": ["variables.file"]
}

// Field 3: file (with key "0")
Binary blob
```

---

## 🐛 Still Having Issues?

**Authorization Errors (Normal):**
```
⚠️ Unauthorized access at page 8 - this is normal if token has limited board access
```
→ This is expected. Extension handles it gracefully.

**File Still Not Uploading:**
1. Check console for exact error message
2. Verify token has file upload permissions
3. Try with a small image first (<1MB)
4. Check Monday.com server status

---

## 📖 Documentation

- **Technical Details:** See `FINAL_FIX_v1.3.3.md`
- **Full Changelog:** See `CHANGELOG.md`
- **API Reference:** https://github.com/jaydenseric/graphql-multipart-request-spec

---

**Status:** ✅ PRODUCTION READY  
**Version:** 1.3.3  
**Date:** 2025-11-12
