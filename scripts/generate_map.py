#!/usr/bin/env python3
"""
High-Contrast Striped Map Generator
Generates reference Map textures for authoring UV-mapped pixel art.

Usage:
  python3 scripts/generate_map.py --width 32 --height 32 --output path/to/map.png
"""

import argparse
import colorsys
from PIL import Image

def generate_map(width, height, output_path):
    im = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    pixels = im.load()
    total = width * height

    for y in range(height):
        for x in range(width):
            i = y * width + x
            stripe = 1.0 if (y % 2 == 0) else 0.82
            hue = (i / total)
            sat = 0.85
            val = (0.35 + 0.35 * (x / width)) * stripe

            r, g, b = colorsys.hsv_to_rgb(hue, sat, val)
            pixels[x, y] = (int(r * 255), int(g * 255), int(b * 255), 255)

    im.save(output_path)
    print(f"Generated {width}x{height} striped map at: {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Astortion Striped Map Generator")
    parser.add_argument("--width", type=int, default=32, help="Map width in pixels (default: 32)")
    parser.add_argument("--height", type=int, default=32, help="Map height in pixels (default: 32)")
    parser.add_argument("--output", default="map_template.png", help="Output PNG path")

    args = parser.parse_args()
    generate_map(args.width, args.height, args.output)

if __name__ == "__main__":
    main()
