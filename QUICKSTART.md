# Quick Start Guide

Get started with the Bug Reporter Extension in 5 minutes!

## Step 1: Install Extension (2 minutes)

The icons are already created, so you can skip icon generation!

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select this directory: `/workspace`
5. ✅ Extension icon appears in toolbar!

## Step 2: Get Monday.com Token (1 minute)

1. Log in to Monday.com
2. Click your profile photo → **Developers** → **API**
3. Click **Generate** to create a Personal API Token
4. Copy the token (starts with `eyJ...`)

## Step 3: Connect Extension (1 minute)

1. Click the **Bug Reporter** icon in Chrome toolbar
2. Click the **⚙️ Settings** gear icon
3. Paste your token in the **API Token** field
4. Click **Test Connection** (should see "Connection successful!")
5. Click **Save Token**

## Step 4: Select Board & Group (30 seconds)

1. In Settings, scroll to **Board & Group Selection**
2. Select your **Board** from dropdown
3. Select a **Group** where bugs should go
4. Click **Save Selection**

## Step 5: Configure Privacy (30 seconds)

1. Scroll to **Privacy & Consent** section
2. Read the privacy notice
3. Check both boxes:
   - ✅ I understand and consent to HAR capture
   - ✅ I understand and consent to screenshot capture
4. Click **Save Consent Preferences**

## Step 6: Create Your First Bug! (2 minutes)

1. Navigate to any website (try https://example.com)
2. Click the **Bug Reporter** icon
3. Click **Create a New Bug**

### Fill the form:
- **Description:** "Test bug - login button not working"
- **Steps to Reproduce:** 
  ```
  1. Go to login page
  2. Enter credentials
  3. Click login button
  ```
- Leave other fields as desired

### Add attachments:
- Click **Take Screenshot**
- Draw an arrow pointing to the issue
- Click **Save**
- HAR will auto-attach (last 10 min of network traffic)

### Submit:
- Click **Create & Upload**
- Wait for progress bar
- Bug opens in Monday.com! 🎉

## Quick Tips

### Keyboard Shortcuts
- None yet! (Future enhancement)

### Best Practices
- ✅ Always review screenshots before submitting
- ✅ Use header masking in production environments
- ✅ Describe steps clearly and numbered
- ✅ Attach relevant files (logs, error screenshots)

### Troubleshooting

**"Failed to attach debugger"**
- Close Chrome DevTools on the tab
- Only one debugger can attach at a time

**"Connection failed"**
- Check your API token is valid
- Ensure you have internet connection
- Try generating a new token

**Screenshots won't capture**
- Make sure tab is visible (not minimized)
- Can't capture Chrome internal pages (chrome://)

## What's Next?

- Read [README.md](README.md) for full feature documentation
- Check [TEST_PLAN.md](TEST_PLAN.md) for comprehensive testing
- Review [PRIVACY_NOTICE.md](PRIVACY_NOTICE.md) for data handling details

## Need Help?

1. Check README.md "Troubleshooting" section
2. Review TEST_PLAN.md for expected behavior
3. Open an issue on GitHub (if available)

## You're All Set! 🚀

Start reporting bugs with:
- 📊 Network logs (HAR)
- 📸 Annotated screenshots
- 📎 File attachments
- 🎯 Structured templates

All directly to your Monday.com board!

**Happy Bug Hunting! 🐛🔍**
