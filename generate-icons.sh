#!/bin/bash
# Script to generate PNG icons from SVG
# Requires ImageMagick or similar tool

# If you have ImageMagick installed:
# convert -background none icons/icon.svg -resize 16x16 icons/icon16.png
# convert -background none icons/icon.svg -resize 32x32 icons/icon32.png
# convert -background none icons/icon.svg -resize 48x48 icons/icon48.png
# convert -background none icons/icon.svg -resize 128x128 icons/icon128.png

# Alternative: Use an online tool or design software to export the SVG to PNG at different sizes
# Or install rsvg-convert:
# rsvg-convert -w 16 -h 16 icons/icon.svg > icons/icon16.png
# rsvg-convert -w 32 -h 32 icons/icon.svg > icons/icon32.png
# rsvg-convert -w 48 -h 48 icons/icon.svg > icons/icon48.png
# rsvg-convert -w 128 -h 128 icons/icon.svg > icons/icon128.png

echo "Please convert icons/icon.svg to PNG at sizes: 16x16, 32x32, 48x48, 128x128"
echo "Place them in the icons/ directory as icon16.png, icon32.png, icon48.png, icon128.png"
