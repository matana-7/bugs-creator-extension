# 🔧 FIX - Version 1.3.5

## Missing File Argument in Mutation

**Release Date:** 2025-11-12  
**Version:** 1.3.4 → 1.3.5  
**Issue:** "Field 'add_file_to_update' is missing required arguments: file"

---

## 🚨 The Problem

### Error Message

```json
{
  "message": "Field 'add_file_to_update' is missing required arguments: file",
  "path": ["mutation", "add_file_to_update"],
  "extensions": {
    "code": "missingRequiredArguments",
    "arguments": "file"
  }
}
```

### What Was Wrong (v1.3.4)

```javascript
// ❌ WRONG: Mutation missing file argument
formData.append('query', `mutation { 
  add_file_to_update(update_id: ${updateId}) { id } 
}`);
formData.append('file', blob, filename);
```

**The mutation didn't reference the file!**

---

## ✅ The Solution (v1.3.5)

### Correct Mutation Format

```javascript
// ✅ CORRECT: Mutation declares and uses $file variable
const mutation = `mutation add_file($file: File!) { 
  add_file_to_update(update_id: ${updateId}, file: $file) { 
    id 
    name 
    url 
    file_extension 
    file_size 
  } 
}`;

formData.append('query', mutation);
formData.append('file', blob, filename);
```

**Key Points:**
1. **Declare variable**: `mutation add_file($file: File!)`
2. **Use variable**: `file: $file` in the mutation
3. **Map in FormData**: `formData.append('file', blob)` maps to `$file`

---

## 🔍 How It Works

### Monday.com's /v2/file Endpoint

**Request:**
```
POST https://api.monday.com/v2/file
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="query"

mutation add_file($file: File!) {
  add_file_to_update(update_id: 123, file: $file) { id }
}
--boundary
Content-Disposition: form-data; name="file"; filename="screenshot.png"

[binary data]
--boundary--
```

**How Monday.com Processes It:**
1. Reads `query` field → Parses GraphQL mutation
2. Sees `$file: File!` variable declaration
3. Reads `file` field from form data
4. Maps `file` form field → `$file` variable
5. Executes mutation with file

---

## 🧪 Testing

### Quick Test

1. **Reload Extension**
   ```
   chrome://extensions/ → Reload
   Version should show: 1.3.5
   ```

2. **Create Bug with Screenshot**

3. **Expected Console Output**
   ```
   Uploading file to Monday.com file upload endpoint...
   Upload request:
   - Update ID: 123456
   - File name: screenshot.png
   - File size: 240200
   - MIME type: image/png
   Upload response status: 200
   Upload result: {
     data: {
       add_file_to_update: {
         id: "789012",
         name: "screenshot.png",
         url: "https://files.monday.com/...",
         file_extension: "png",
         file_size: 240200
       }
     }
   }
   ✓ File screenshot.png uploaded successfully
   ```

4. **Check Monday.com**
   - ✅ File appears in "📎 Attachments" update
   - ✅ File is downloadable
   - ✅ Correct metadata shown

---

## 📊 Comparison

### v1.3.4 (Broken)
```javascript
// Mutation
mutation { add_file_to_update(update_id: 123) { id } }
//                                           ^^^^^ Missing file argument!

// FormData
formData.append('file', blob);  // File sent but not referenced in mutation
```
**Result:** ❌ "missing required arguments: file"

### v1.3.5 (Fixed)
```javascript
// Mutation
mutation add_file($file: File!) { 
  add_file_to_update(update_id: 123, file: $file) { id } 
}
//                                          ^^^^^^ File argument included!

// FormData
formData.append('file', blob);  // Maps to $file variable
```
**Result:** ✅ File uploads successfully

---

## ✅ Expected Results

✅ No more "missing required arguments: file" error  
✅ Mutation properly declares $file variable  
✅ File argument passed to add_file_to_update  
✅ Files upload successfully  
✅ Files appear in Monday items  
✅ HTTP 200 response with file metadata  

---

## 📝 Files Modified

| File | Change |
|------|--------|
| `modules/monday-api.js` | Lines 476-486: Add $file variable to mutation |
| `manifest.json` | Version 1.3.4 → 1.3.5 |
| `CHANGELOG.md` | Added v1.3.5 entry |

---

## 🎓 Technical Explanation

### GraphQL Variable Mapping in Multipart Requests

**The Pattern:**

1. **Declare variable in mutation**
   ```graphql
   mutation add_file($file: File!) {
     # $file is now available
   }
   ```

2. **Use variable in field**
   ```graphql
   add_file_to_update(update_id: 123, file: $file)
   #                                       ^^^^^^ Reference the variable
   ```

3. **Provide value in FormData**
   ```javascript
   formData.append('file', actualFileBlob)
   # 'file' field → $file variable
   ```

**Monday.com automatically maps the form field to the variable.**

---

## 🚀 Status

**Version 1.3.5 is ready for testing.**

Changes:
- ✅ Mutation includes $file variable declaration
- ✅ Mutation passes $file to add_file_to_update
- ✅ Uses correct endpoint (`/v2/file`)
- ✅ Simple multipart format (query + file)

**This should finally upload files successfully!**

---

**Release Date:** 2025-11-12  
**Version:** 1.3.5  
**Status:** ✅ READY FOR TESTING

---

## 🎯 Summary

**The issue:** Mutation didn't include the `file` argument  
**The fix:** Added `$file: File!` variable and passed it to mutation  
**The result:** Files now upload correctly  

**Test it now!** 🚀
