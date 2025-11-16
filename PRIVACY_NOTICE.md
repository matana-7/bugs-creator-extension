# Privacy Notice - Bug Reporter Extension

**Last Updated**: November 12, 2025

## Overview

The Bug Reporter for Monday.com extension is designed to help you report bugs efficiently by capturing network logs, screenshots, and other debugging information. This document explains what data the extension collects, how it's used, and your privacy rights.

## Data Collection

### What We Collect

#### 1. Network Traffic (HAR Files)
When you create a bug report with HAR capture enabled, the extension collects:

- **HTTP/HTTPS Requests & Responses**
  - Request URLs (including domain, path, and query parameters)
  - Request and response headers (including Authorization, Cookie, User-Agent, etc.)
  - Request and response bodies (may include form data, JSON payloads, etc.)
  - HTTP methods (GET, POST, PUT, DELETE, etc.)
  - Status codes and timing information

- **Potentially Sensitive Information**
  - Authentication tokens (in Authorization headers)
  - Session cookies
  - API keys (in headers or query parameters)
  - Personal data in URLs, form submissions, or API requests
  - Internal IP addresses and server information

#### 2. Screenshots
When you capture a screenshot:

- **Visible Tab Content**
  - Everything currently visible in your browser tab
  - May include personal information, account details, or sensitive data displayed on screen
  - Annotations you add using the annotation tools

#### 3. Settings & Preferences
The extension stores:

- Monday.com API token (stored locally in Chrome's secure storage)
- Selected board and group IDs
- Privacy preferences (consent flags, masking options)
- HAR capture settings (timeframe, auto-attach preferences)

### What We DON'T Collect

- **No background tracking**: The extension does NOT collect data when you're not actively using it
- **No browsing history**: We don't track which websites you visit
- **No analytics**: We don't send usage statistics to any third-party service
- **No advertising data**: We don't collect data for advertising purposes

## How Data is Used

### Primary Use
All collected data is used **solely for bug reporting purposes**:

1. You manually trigger data collection by creating a bug report
2. Data is assembled into a bug report with your explicit action
3. Data is sent directly to your Monday.com account via their API
4. No intermediary servers are used (direct browser ↔ Monday.com communication)

### Data Storage

- **Local Storage Only**: All data is stored temporarily in your browser's local storage
- **No Cloud Storage**: We don't maintain any servers or databases
- **Automatic Cleanup**: Captured data is deleted after successful upload to Monday.com
- **User Control**: You can clear all stored data at any time via Settings

## Data Sharing

### Who Has Access

1. **You**: You have full control over what data is captured and submitted
2. **Monday.com**: Data you submit is sent to your Monday.com account via their API
3. **Your Organization**: If you use a company Monday.com account, your organization administrators may have access to bug reports you create

### Third Parties

- **No Third-Party Sharing**: We do NOT share data with any third parties
- **No Data Sales**: We do NOT sell your data
- **Monday.com's Terms**: Once data is submitted to Monday.com, it's subject to [Monday.com's Privacy Policy](https://monday.com/l/privacy/privacy-policy/)

## Privacy Controls

### Consent & Permissions

The extension requires your explicit consent before:
- Capturing network traffic (HAR)
- Taking screenshots
- Accessing sensitive Chrome permissions (debugger, activeTab, etc.)

You can revoke consent at any time in Settings.

### Data Masking Options

To protect sensitive information, enable these options:

1. **Mask Sensitive Headers** (Recommended: ON)
   - Masks Authorization headers
   - Masks Cookie headers
   - Replaces values with `***MASKED***`

2. **Mask Query Strings** (Optional)
   - Removes or masks URL query parameters
   - Useful if URLs contain tokens or personal data

3. **Review Before Upload** (Recommended)
   - Always review captured screenshots before submission
   - Check HAR files if you download them before upload

### User Rights

You have the right to:

- **Access**: View all settings and preferences stored by the extension
- **Modify**: Change any settings, preferences, or consent flags
- **Delete**: Clear all extension data via Settings → Advanced → Clear All Extension Data
- **Revoke**: Disconnect from Monday.com at any time
- **Uninstall**: Remove the extension completely from Chrome

## Security Measures

### Data Protection

1. **Encrypted Storage**: Monday.com API tokens are stored in Chrome's encrypted storage
2. **HTTPS Only**: All communication with Monday.com uses HTTPS
3. **No Plaintext Logs**: Sensitive data is not logged to browser console in production
4. **Minimal Permissions**: We request only the permissions necessary for functionality

### API Token Security

- Your Monday.com API token is stored locally in your browser
- The token is never sent to any server except Monday.com
- Tokens are NOT included in any telemetry or diagnostics
- **Best Practice**: Regularly rotate your API tokens in Monday.com settings

## Compliance

### GDPR (General Data Protection Regulation)

For users in the EU:
- **Lawful Basis**: We process data based on your explicit consent
- **Data Minimization**: We collect only data necessary for bug reporting
- **Right to Erasure**: You can delete all data at any time
- **Data Portability**: You can export bug reports from Monday.com

### CCPA (California Consumer Privacy Act)

For users in California:
- We do NOT sell personal information
- You have the right to opt-out of data collection (by not using the extension)
- You can request deletion of all stored data

## Sensitive Permissions

### chrome.debugger Permission

This is the most powerful and sensitive permission required by the extension.

**Why it's needed**: The debugger permission allows the extension to use Chrome DevTools Protocol to capture network traffic (HAR).

**What it can do**: 
- Attach to browser tabs
- Intercept network requests and responses
- Inspect page resources

**What we do with it**: 
- Capture network traffic ONLY when you explicitly create a bug report
- Detach debugger immediately after capture
- Never use it for tracking or surveillance

**Limitations**:
- Only one debugger can attach at a time (conflicts with DevTools)
- You can deny this permission (HAR capture will be disabled, but other features will work)

## Changes to This Policy

We may update this Privacy Notice from time to time. Changes will be:
- Reflected in the "Last Updated" date at the top
- Announced via extension update notes
- Never applied retroactively to already collected data

## Questions & Concerns

If you have questions about this Privacy Notice or data practices:

- Open an issue on our GitHub repository
- Contact: [Your contact email]
- Review our open-source code: [GitHub URL]

## Consent

By using this extension, you acknowledge that you have read and understood this Privacy Notice. You can withdraw consent at any time by:
- Disabling HAR/screenshot consent in Settings
- Disconnecting from Monday.com
- Uninstalling the extension

---

**Remember**: This extension is a tool to help YOU report bugs more effectively. You are always in control of what data is captured and submitted. Review data before submission, use masking options, and only report bugs that don't contain overly sensitive information.

**Stay safe and happy debugging! 🔒🐛**
