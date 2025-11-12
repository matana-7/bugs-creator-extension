# Changelog

All notable changes to the Bug Reporter extension will be documented in this file.

## [1.1.1] - 2025-11-12

### 🚨 CRITICAL FIXES

Fixed three blocking issues that prevented core functionality from working.

#### Fixed
- **Screenshot capture not working** - Rewrote tab detection to find correct website tab instead of extension pages
- **Create Bug button doing nothing** - Added comprehensive error handling, loading states, and user feedback
- **Monday.com connection failing silently** - Added logging throughout API calls and proper error display

#### Added
- Comprehensive console logging for debugging
- Error banner UI component in create-bug page
- Loading spinner in submit button
- User-friendly error messages for all failure scenarios
- Better validation before API calls

#### Changed
- Tab detection now excludes all extension pages automatically
- Error messages are contextual and actionable
- All operations provide visual feedback to users

#### Technical
- Added `showError()` and `hideError()` helper functions
- Enhanced `chrome.runtime.lastError` checking
- Logging in `monday-api.js` query method
- Logging in background message handlers
- Better state management during async operations

## [1.1.0] - 2025-11-12

### Added
- Title field (required) that maps to Monday.com item name
- Search functionality in popup with 250ms debounce
- Bold section labels in Monday updates using **Label:** format

### Changed
- File upload flow with retry logic (3 attempts, exponential backoff)
- Screenshot capture workflow to exclude extension UI
- Form state preservation across screenshot workflow

### Fixed
- File attachments now upload reliably to Monday.com
- MIME type detection for uploads
- Screenshot never captures extension popup anymore

## [1.0.1] - 2025-11-12

### Fixed
- **Critical Fix**: Resolved "Cannot read properties of undefined (reading 'add_file_to_update')" error
- Changed Monday.com integration approach:
  - Bug details are now added as updates/posts on items (more reliable)
  - Files are attached to updates instead of columns
  - Simplified item creation without complex column value mapping
- Improved error handling throughout the file upload process
- Added validation for board/group selection before bug creation
- Better error messages for debugging

### Changed
- Simplified bug creation flow for better reliability
- Bug information is now formatted as markdown in update posts
- File attachments are more robust (continue even if some files fail)

### Technical Notes
- The Monday.com API has specific requirements for file uploads
- Files must be attached to updates (posts) rather than directly to items
- Column-based file attachments require specific column IDs that vary by board
- Updates approach is more universal and works across all board types

## [1.0.0] - 2025-11-12

### Added
- Initial release
- Chrome Manifest V3 extension
- HAR capture using chrome.debugger API
- Screenshot capture with annotation tools (pen, arrow, rectangle, text)
- Drag & drop file attachments
- Monday.com GraphQL API integration
- Privacy controls and consent system
- Settings page for configuration
- Recent bugs list in popup
- Comprehensive documentation

### Features
- Template-based bug reporting
- Network traffic capture (last 10 minutes)
- Canvas-based screenshot annotation
- File attachment support (up to 50MB per file)
- Board and group selection with persistence
- Sensitive header masking
- Auto-attach HAR option
- Professional gradient UI design

### Documentation
- README with full usage instructions
- QUICKSTART guide (5-minute setup)
- INSTALL guide with multiple icon generation methods
- PRIVACY_NOTICE with GDPR/CCPA compliance
- TEST_PLAN with 49 test cases
- PROJECT_SUMMARY with technical overview

## Known Limitations

### File Uploads
- Monday.com file upload API has some limitations
- Large files (>50MB) cannot be uploaded
- Some file types may not upload depending on Monday.com plan
- File uploads happen asynchronously and may take time to appear

### HAR Capture
- Limited to last 10 minutes (configurable)
- Requires debugger permission (conflicts with DevTools)
- Some sites with strict CSP may have incomplete HAR data
- Only captures traffic for the active tab

### Screenshots
- Can only capture visible tab content (not full page)
- Cannot capture Chrome internal pages (chrome://)
- Incognito mode may require additional permissions

## Future Enhancements

### Planned
- OAuth 2.0 for Monday.com (vs. personal tokens)
- Full-page screenshot with stitching
- Video recording capability
- Better file upload progress indicators
- HAR viewer/preview before upload

### Under Consideration
- Firefox support (when Manifest V3 available)
- Dark mode UI theme
- Keyboard shortcuts
- Offline queue for bug creation
- Automatic duplicate detection
- Custom templates per board

## Support

For issues or questions:
- Check TROUBLESHOOTING section in README.md
- Review this CHANGELOG for recent fixes
- Open an issue on GitHub
- Check browser console for detailed error messages

---

**Tip**: Always reload the extension after updates:
1. Go to chrome://extensions/
2. Find "Bug Reporter for Monday.com"
3. Click the reload icon (circular arrow)
