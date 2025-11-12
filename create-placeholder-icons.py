#!/usr/bin/env python3
"""
Simple script to create placeholder PNG icons for the extension.
Requires PIL/Pillow: pip install pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    
    # Define sizes
    sizes = [16, 32, 48, 128]
    
    for size in sizes:
        # Create a new image with gradient-like background
        img = Image.new('RGBA', (size, size), (102, 126, 234, 255))
        draw = ImageDraw.Draw(img)
        
        # Draw a simple bug icon representation
        if size >= 32:
            # Draw a circle for the bug body
            center = size // 2
            radius = size // 4
            draw.ellipse(
                [center - radius, center - radius, center + radius, center + radius],
                fill=(255, 107, 107, 255)
            )
        
        # Save the icon
        filename = f'icons/icon{size}.png'
        img.save(filename, 'PNG')
        print(f'Created {filename}')
    
    print('\nAll icon files created successfully!')
    print('Note: These are placeholder icons. For production, create proper icons from icon.svg')
    
except ImportError:
    print('Error: PIL/Pillow is not installed.')
    print('Install it with: pip install pillow')
    print('\nAlternatively, manually create PNG icons at sizes 16x16, 32x32, 48x48, 128x128')
    print('and save them as icon16.png, icon32.png, icon48.png, icon128.png in the icons/ directory.')
except Exception as e:
    print(f'Error creating icons: {e}')
