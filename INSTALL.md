# Installation Guide

## Quick Start

### Step 1: Prepare Icons

The extension requires PNG icons at four sizes. You have several options:

#### Option A: Use ImageMagick (Recommended)
```bash
cd /workspace
convert -background none icons/icon.svg -resize 16x16 icons/icon16.png
convert -background none icons/icon.svg -resize 32x32 icons/icon32.png
convert -background none icons/icon.svg -resize 48x48 icons/icon48.png
convert -background none icons/icon.svg -resize 128x128 icons/icon128.png
```

#### Option B: Use rsvg-convert
```bash
cd /workspace
rsvg-convert -w 16 -h 16 icons/icon.svg > icons/icon16.png
rsvg-convert -w 32 -h 32 icons/icon.svg > icons/icon32.png
rsvg-convert -w 48 -h 48 icons/icon.svg > icons/icon48.png
rsvg-convert -w 128 -h 128 icons/icon.svg > icons/icon128.png
```

#### Option C: Use Python PIL
```bash
cd /workspace
pip install pillow
python3 create-placeholder-icons.py
```

#### Option D: Manual Creation
- Open `icons/icon.svg` in any design tool (Figma, Photoshop, GIMP, Inkscape, etc.)
- Export as PNG at sizes: 16×16, 32×32, 48×48, 128×128
- Save as: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png` in the `icons/` folder

### Step 2: Load Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `/workspace` directory (or wherever you cloned the extension)
6. The Bug Reporter icon should appear in your Chrome toolbar

### Step 3: Configure Monday.com

1. Get your Monday.com API token:
   - Log in to Monday.com
   - Go to your profile → **Developers** → **API**
   - Generate a new **Personal API Token**
   - Copy the token

2. Configure the extension:
   - Click the Bug Reporter icon in Chrome toolbar
   - Click the **Settings** gear icon
   - Paste your API token
   - Click **Test Connection**
   - Click **Save Token**

3. Select board and group:
   - Choose your board from the dropdown
   - Choose the group where bugs should be created
   - Click **Save Selection**

### Step 4: Set Privacy Preferences

1. In Settings, navigate to **Privacy & Consent**
2. Read the privacy notice
3. Check the consent boxes:
   - ✅ I understand and consent to HAR capture
   - ✅ I understand and consent to screenshot capture
4. Configure HAR settings:
   - ✅ Mask sensitive headers (recommended)
   - Set HAR timeframe (default: 10 minutes)
5. Click **Save Consent Preferences**

## Verification

Test the extension:

1. Navigate to any website (e.g., https://example.com)
2. Click the Bug Reporter icon
3. Click **Create a New Bug**
4. Fill in the bug details
5. Click **Take Screenshot** and annotate
6. Click **Create & Upload**
7. Verify the bug appears in your Monday.com board

## Troubleshooting

### Icons not showing
- Ensure all four PNG icon files exist in the `icons/` directory
- Check file names are exactly: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
- Reload the extension in `chrome://extensions/`

### Extension won't load
- Check for errors in `chrome://extensions/`
- Ensure all files are present (check project structure in README.md)
- Try removing and re-adding the extension

### Monday.com connection fails
- Verify your API token is valid
- Ensure you have access to boards in Monday.com
- Check your internet connection

## Next Steps

- Read the full [README.md](README.md) for detailed usage instructions
- Review [PRIVACY_NOTICE.md](PRIVACY_NOTICE.md) to understand data handling
- Start reporting bugs!

## Uninstallation

To remove the extension:

1. Go to `chrome://extensions/`
2. Find "Bug Reporter for Monday.com"
3. Click **Remove**
4. Optionally, delete the extension directory from your computer

Your Monday.com data is not affected by uninstallation.
