# Bug Reporter for Monday.com

A Chrome browser extension (Manifest V3) that enables fast and comprehensive bug reporting from your browser directly to Monday.com. Capture network logs (HAR), take annotated screenshots, and attach files—all in one seamless workflow.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/chrome-manifest%20v3-orange.svg)

## ✨ Features

### 🐛 Comprehensive Bug Reporting
- **Template-based bug reports** with fields for Platform, Environment, Version, Description, Steps to Reproduce, Actual/Expected Results
- **Direct Monday.com integration** - bugs are created as items in your chosen board/group
- **Auto-filled metadata** and timestamps

### 📊 HAR Capture (Network Logs)
- Automatically captures **last 10 minutes of network traffic** for the active tab
- Uses Chrome DevTools Protocol via `chrome.debugger` API
- **Privacy controls**: mask sensitive headers (Authorization, Cookie), mask query strings
- HAR files are automatically attached to bug reports

### 📸 Screenshot + Annotation
- Capture visible tab content with `chrome.tabs.captureVisibleTab`
- **Built-in annotation tools**:
  - ✏️ Pen (free draw)
  - ➡️ Arrow
  - ⬜ Rectangle
  - 📝 Text
  - 🎨 Color picker
  - ↩️ Undo/Redo
  - 🗑️ Clear
- Save annotated screenshots as PNG and attach to bugs

### 📎 File Attachments
- **Drag & drop** files directly into the bug report
- Support for images, videos, logs, and other file types
- File size validation (max 50MB per file)
- Visual file preview with file type icons

### 🔐 Privacy & Security
- **Consent prompts** before capturing HAR or screenshots
- **Sensitive data masking** options (headers, cookies, query strings)
- Privacy notice explaining what data is captured
- User-controlled consent preferences in settings

### ⚙️ Settings & Configuration
- Connect to Monday.com via API token (OAuth support ready)
- Select default board and group for bug reports
- Configure HAR capture preferences (timeframe, masking options)
- Auto-attach HAR toggle
- Clear all extension data option

## 📋 Requirements

- **Chrome Browser** (version 88+) with Manifest V3 support
- **Monday.com account** with API access
- **Permissions**: The extension requires several permissions explained during installation

## 🚀 Installation

### For Development / Local Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd bug-reporter-extension
   ```

2. **Generate icon files**
   
   The extension includes an SVG icon template. Convert it to PNG at required sizes:
   ```bash
   # Option 1: Using ImageMagick
   convert -background none icons/icon.svg -resize 16x16 icons/icon16.png
   convert -background none icons/icon.svg -resize 32x32 icons/icon32.png
   convert -background none icons/icon.svg -resize 48x48 icons/icon48.png
   convert -background none icons/icon.svg -resize 128x128 icons/icon128.png
   
   # Option 2: Using rsvg-convert
   rsvg-convert -w 16 -h 16 icons/icon.svg > icons/icon16.png
   rsvg-convert -w 32 -h 32 icons/icon.svg > icons/icon32.png
   rsvg-convert -w 48 -h 48 icons/icon.svg > icons/icon48.png
   rsvg-convert -w 128 -h 128 icons/icon.svg > icons/icon128.png
   ```
   
   Alternatively, use any design tool (Figma, Photoshop, etc.) to export the SVG to PNG.

3. **Load the extension in Chrome**
   
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top right)
   - Click **Load unpacked**
   - Select the extension directory (`/workspace` or where you cloned it)

4. **Verify installation**
   
   You should see the Bug Reporter icon in your Chrome toolbar.

### For End Users (Chrome Web Store)

*Note: This extension is not yet published to the Chrome Web Store. Follow the development installation steps above.*

## 🔧 Setup & Configuration

### 1. Get Monday.com API Token

1. Log in to your Monday.com account
2. Go to https://monday.com/developers/v2#authentication-section
3. Navigate to your profile → **Developers** → **API**
4. Generate a new **Personal API Token**
5. Copy the token (you'll need it in the next step)

### 2. Configure the Extension

1. Click the Bug Reporter icon in Chrome toolbar
2. Click the **Settings** gear icon
3. Paste your Monday.com API token
4. Click **Test Connection** to verify
5. Click **Save Token**

### 3. Select Default Board & Group

1. In Settings, the **Board & Group Selection** section will now show your boards
2. Select your desired **Board** from the dropdown
3. Select the **Group** where bugs should be created
4. Click **Save Selection**

### 4. Configure Privacy Settings

1. Review the **HAR Capture Settings**:
   - Toggle **Auto-attach HAR** (recommended: ON)
   - Set **HAR Timeframe** (default: 10 minutes)
   - Enable **Mask sensitive headers** (recommended: ON)
   - Enable **Mask query strings** if URLs contain sensitive data

2. Review **Privacy & Consent**:
   - Read the privacy notice carefully
   - Check **I understand and consent to HAR capture**
   - Check **I understand and consent to screenshot capture**
   - Click **Save Consent Preferences**

## 📖 Usage

### Viewing Recent Bugs

1. Click the Bug Reporter icon in Chrome toolbar
2. The popup shows recent bugs from your configured Monday board/group
3. Click any bug to open it in Monday.com

### Creating a New Bug

1. Click **Create a New Bug** button in the popup
2. A new tab opens with the bug report form

#### Fill in Bug Details (Left Column)

- **Platform**: Browser/OS (e.g., Chrome, Windows)
- **Environment**: Production, Staging, Development
- **Version**: App/product version
- **Description**: Brief summary of the bug (required)
- **Steps to Reproduce**: Numbered steps (required)
- **Actual Result**: What happened
- **Expected Result**: What should have happened

#### Add Attachments (Right Column)

**HAR (Network Logs)**
- Toggle **Auto-attach HAR** (ON by default)
- On submission, the extension automatically captures and attaches network traffic from the last 10 minutes

**Screenshots**
1. Click **Take Screenshot**
2. The visible tab is captured
3. Annotation tool opens automatically:
   - Select tool (Pen, Arrow, Rectangle, Text)
   - Choose color and line width
   - Draw annotations on the screenshot
   - Click **Save** to attach to bug report
4. Multiple screenshots can be added
5. Hover over screenshot and click **×** to remove

**Additional Files**
- **Drag & drop** files into the drop zone
- Or click **Browse Files** to select
- Supported: images, videos, logs, PDFs, etc.
- Max file size: 50MB per file
- Click **×** next to any file to remove

#### Submit Bug

1. Select **Monday Board** and **Group** (or use saved defaults)
2. Click **Create & Upload**
3. Progress indicator shows upload status
4. On success, the created Monday item opens in a new tab

### Annotating Screenshots

The annotation tool provides:

- **Pen**: Free-hand drawing
- **Arrow**: Point to specific elements
- **Rectangle**: Highlight areas
- **Text**: Add text labels
- **Color Picker**: Choose annotation color
- **Line Width**: Adjust thickness (1-10px)
- **Undo/Redo**: Step backward/forward
- **Clear**: Remove all annotations
- **Save**: Attach to bug report
- **Cancel**: Discard and close

## 🔒 Privacy & Security

### What Data is Captured?

**HAR Files (Network Logs)**
- HTTP/HTTPS request and response headers
- Request/response URLs (including query parameters)
- Cookies and authentication tokens
- Request/response bodies (if available)
- Timing information

**Screenshots**
- Visible content of the active browser tab
- Any personal or sensitive information visible on screen

### Privacy Controls

The extension provides several privacy protections:

1. **Consent Required**: You must explicitly consent before HAR or screenshot capture
2. **Sensitive Header Masking**: Authorization and Cookie headers are masked by default
3. **Query String Masking**: Optional setting to mask URL query parameters
4. **Review Before Upload**: You can preview and modify data before submitting
5. **Local Storage Only**: No data is stored on external servers (only Monday.com via API)

### Permissions Explained

The extension requires these Chrome permissions:

- **activeTab**: Capture screenshots of the current tab
- **scripting**: Inject scripts for enhanced functionality
- **tabs**: Access tab information for HAR capture
- **storage**: Save settings and preferences
- **downloads**: Download HAR files if needed
- **debugger**: **[CRITICAL]** Capture network traffic via Chrome DevTools Protocol
- **notifications**: Show success/error notifications
- **host_permissions (<all_urls>)**: Access any site for HAR capture

⚠️ **debugger permission** is the most sensitive and powerful permission. This extension uses it solely to capture network traffic for debugging purposes. The extension does NOT:
- Spy on your browsing
- Send data to third parties
- Modify website behavior
- Track your activity

## 🧪 Testing

### Test Plan

#### 1. Connection Test
- [ ] Open Settings
- [ ] Enter valid Monday.com API token
- [ ] Click "Test Connection"
- [ ] Verify "Connection successful" message
- [ ] Verify boards appear in dropdown

#### 2. HAR Capture Test
- [ ] Navigate to a website (e.g., https://example.com)
- [ ] Perform some actions (click links, submit forms)
- [ ] Open Bug Reporter → Create New Bug
- [ ] Ensure "Auto-attach HAR" is checked
- [ ] Fill required fields
- [ ] Submit bug
- [ ] Verify HAR file is attached to Monday item

#### 3. Screenshot & Annotation Test
- [ ] Create New Bug
- [ ] Click "Take Screenshot"
- [ ] Verify annotation tool opens with captured image
- [ ] Test each tool: Pen, Arrow, Rectangle, Text
- [ ] Test Undo/Redo
- [ ] Click "Save"
- [ ] Verify screenshot appears in attachments list

#### 4. File Upload Test
- [ ] Create New Bug
- [ ] Drag & drop an image file
- [ ] Verify file appears in attachments list
- [ ] Click "Browse Files" and select a PDF
- [ ] Verify both files are listed
- [ ] Remove one file using × button
- [ ] Submit bug
- [ ] Verify remaining file is attached to Monday item

#### 5. Privacy Test
- [ ] Clear all consent in Settings
- [ ] Create New Bug with "Auto-attach HAR" enabled
- [ ] Verify consent prompt appears before HAR capture
- [ ] Accept consent
- [ ] Enable "Mask sensitive headers" in Settings
- [ ] Create another bug
- [ ] Download HAR and verify Authorization headers are masked

#### 6. Board/Group Selection Test
- [ ] In Settings, select a board
- [ ] Verify groups populate
- [ ] Save selection
- [ ] Create New Bug
- [ ] Verify board/group are pre-selected
- [ ] Submit bug
- [ ] Verify item appears in correct Monday board/group

## 🐛 Troubleshooting

### Extension doesn't load
- Ensure you're using Chrome 88+ with Manifest V3 support
- Check `chrome://extensions/` for error messages
- Try reloading the extension

### "Failed to attach debugger" error
- The `debugger` permission is required for HAR capture
- Ensure the permission is granted in `chrome://extensions/`
- The debugger can only attach to one extension at a time—close Chrome DevTools if open

### HAR file is empty or incomplete
- HAR capture is limited to the last 10 minutes
- If the tab was recently opened, there may be minimal traffic
- Ensure the website makes network requests
- Some sites with strict CSP may block certain requests

### Monday.com connection fails
- Verify your API token is correct
- Check token permissions in Monday.com settings
- Ensure you have access to the selected board/group
- Try generating a new token

### "Cannot read properties of undefined" error
- This was fixed in the latest version
- Reload the extension: chrome://extensions/ → Click reload icon
- Bug details are now added as updates/posts on the item
- Files are attached to updates (more reliable than column attachments)

### Screenshots are not capturing
- Ensure the tab is visible (not minimized or in another workspace)
- Some Chrome internal pages (chrome://) cannot be captured
- Incognito mode may require additional permissions

### Files are too large to upload
- Monday.com has file size limits (check your plan)
- The extension limits files to 50MB each
- Try compressing large files before upload

## 🛠️ Development

### Project Structure

```
/workspace/
├── manifest.json              # Chrome extension manifest (V3)
├── background.js              # Service worker, message routing
├── popup.html                 # Main popup UI
├── create-bug.html            # Bug creation form
├── annotate.html              # Screenshot annotation tool
├── settings.html              # Settings/preferences page
├── modules/
│   ├── har-capture.js         # HAR capture via chrome.debugger
│   └── monday-api.js          # Monday.com GraphQL API client
├── scripts/
│   ├── popup.js               # Popup logic
│   ├── create-bug.js          # Bug creation logic
│   ├── annotate.js            # Annotation canvas logic
│   └── settings.js            # Settings management
├── styles/
│   ├── popup.css              # Popup styles
│   ├── create-bug.css         # Bug form styles
│   ├── annotate.css           # Annotation tool styles
│   └── settings.css           # Settings page styles
├── icons/
│   ├── icon.svg               # Source SVG icon
│   ├── icon16.png             # 16x16 icon
│   ├── icon32.png             # 32x32 icon
│   ├── icon48.png             # 48x48 icon
│   └── icon128.png            # 128x128 icon
├── generate-icons.sh          # Helper script for icon generation
└── README.md                  # This file
```

### Technologies Used

- **Chrome Manifest V3**: Latest extension platform
- **Chrome DevTools Protocol**: For HAR capture
- **Monday.com GraphQL API**: For board/item management
- **Canvas API**: For screenshot annotation
- **HTML5 Drag & Drop**: For file attachments
- **Chrome Storage API**: For settings persistence

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Future Enhancements

- [ ] OAuth 2.0 support for Monday.com (vs. personal tokens)
- [ ] Full-page screenshot (stitching) support
- [ ] Video recording capability
- [ ] Automatic bug duplicate detection
- [ ] Custom templates per board
- [ ] Firefox support (Manifest V3 when available)
- [ ] Dark mode UI
- [ ] Keyboard shortcuts
- [ ] Offline queue (create bugs when offline)
- [ ] HAR viewer/preview before upload

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Monday.com for their excellent GraphQL API
- Chrome DevTools Protocol for network inspection capabilities
- The open-source community for inspiration and tools

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Contact: [Your contact information]
- Documentation: [Your documentation URL]

---

**⚠️ Important Security Note**: This extension handles sensitive data (network logs, API tokens). Always:
- Review captured data before submission
- Use header masking in production environments
- Keep your Monday.com API token secure
- Regularly rotate your API tokens
- Only install from trusted sources

**Happy Bug Hunting! 🐛🔍**
