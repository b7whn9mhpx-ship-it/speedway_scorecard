#!/usr/bin/env python3
"""
Pure Python PNG icon generator using standard library zlib and struct.
Generates crisp PNG icons for iOS PWA and Android home screen shortcuts.
"""

import struct
import zlib
import os

def create_speedway_png(size, output_path):
    width = size
    height = size

    # Background color (#090d16) and amber/gold accent (#f59e0b)
    # Generate image buffer
    raw_data = bytearray()

    cx, cy = width / 2.0, height / 2.0
    corner_radius = size * 0.22

    for y in range(height):
        raw_data.append(0) # Filter byte: 0 = None
        for x in range(width):
            # Check rounded rectangle
            dx = max(abs(x - cx) - (cx - corner_radius), 0)
            dy = max(abs(y - cy) - (cy - corner_radius), 0)
            is_outside = (dx * dx + dy * dy) > (corner_radius * corner_radius)

            if is_outside:
                # Transparent outside rounded corners
                raw_data.extend([0, 0, 0, 0])
                continue

            # Distance from center
            dist = ((x - cx)**2 + (y - cy)**2)**0.5
            norm_dist = dist / (size * 0.5)

            # Draw outer ring border
            if 0.88 <= norm_dist <= 0.94:
                # Amber accent border
                raw_data.extend([245, 158, 11, 255])
            # Draw track oval silhouette
            elif 0.55 <= norm_dist <= 0.72:
                # Track curve
                raw_data.extend([30, 41, 59, 255])
            # Helmet colors badges in center
            elif size * 0.35 <= y <= size * 0.65:
                # 4 helmet badges (Red, Blue, White, Yellow)
                section = int((x / width) * 4)
                sub_cx = (section + 0.5) * (width / 4.0)
                sub_cy = height * 0.5
                sub_dist = ((x - sub_cx)**2 + (y - sub_cy)**2)**0.5

                if sub_dist < size * 0.08:
                    if section == 0:
                        raw_data.extend([239, 68, 68, 255]) # Red
                    elif section == 1:
                        raw_data.extend([59, 130, 246, 255]) # Blue
                    elif section == 2:
                        raw_data.extend([248, 250, 252, 255]) # White
                    else:
                        raw_data.extend([234, 179, 8, 255]) # Yellow
                else:
                    # Dark navy base
                    raw_data.extend([18, 24, 38, 255])
            else:
                # Dark slate gradient background
                val = int(18 - norm_dist * 8)
                raw_data.extend([max(9, val), max(13, val + 4), max(22, val + 14), 255])

    def chunk(chunk_type, data):
        return struct.pack('>I', len(data)) + chunk_type + data + struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)

    # PNG Signature
    png = bytearray(b'\x89PNG\r\n\x1a\n')

    # IHDR Chunk: width(4), height(4), bit_depth(1), color_type(1), compression(1), filter(1), interlace(1)
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(chunk(b'IHDR', ihdr_data))

    # IDAT Chunk
    compressed_data = zlib.compress(bytes(raw_data), 9)
    png.extend(chunk(b'IDAT', compressed_data))

    # IEND Chunk
    png.extend(chunk(b'IEND', b''))

    with open(output_path, 'wb') as f:
        f.write(png)
    print(f"✓ Generated {output_path} ({size}x{size})")

if __name__ == '__main__':
    icons_dir = os.path.dirname(os.path.abspath(__file__))
    create_speedway_png(192, os.path.join(icons_dir, 'icon-192.png'))
    create_speedway_png(512, os.path.join(icons_dir, 'icon-512.png'))
    create_speedway_png(180, os.path.join(icons_dir, 'apple-touch-icon.png'))
