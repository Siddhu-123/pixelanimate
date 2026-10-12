#!/usr/bin/env python3
"""
Astortion UV Baker CLI Tool
Recreation of aarthificial's "Pixel Art Animation. Reinvented" Asset Importer.

Usage:
  python3 scripts/bake_uv.py --map path/to/map.png --input path/to/mapped_sprite.png --output path/to/baked_uv.png [--tolerance 5]
"""

import argparse
import sys
from PIL import Image

def bake_uv(map_path, input_path, output_path, tolerance=5):
    print(f"Loading map from {map_path}...")
    map_im = Image.open(map_path).convert("RGBA")
    map_w, map_h = map_im.size
    map_pixels = map_im.load()

    # Build color lookup map
    color_map = {}
    palette_list = []
    for my in range(map_h):
        for mx in range(map_w):
            r, g, b, a = map_pixels[mx, my]
            if a > 10:
                color_map[(r, g, b)] = (mx, my)
                palette_list.append((r, g, b, mx, my))

    print(f"Map contains {len(color_map)} unique color coordinates ({map_w}x{map_h})")

    print(f"Processing input sprite from {input_path}...")
    src_im = Image.open(input_path).convert("RGBA")
    src_w, src_h = src_im.size
    src_pixels = src_im.load()

    out_im = Image.new("RGBA", (src_w, src_h), (0, 0, 0, 0))
    out_pixels = out_im.load()

    total_px = 0
    matched_px = 0
    unmatched_px = 0

    tol_sq = tolerance * tolerance * 3

    for y in range(src_h):
        for x in range(src_w):
            r, g, b, a = src_pixels[x, y]
            if a < 10:
                continue

            total_px += 1
            key = (r, g, b)

            match = color_map.get(key)
            if not match and tolerance > 0:
                best_d = tol_sq
                closest = None
                for pr, pg, pb, pmx, pmy in palette_list:
                    dr = r - pr
                    dg = g - pg
                    db = b - pb
                    d = dr * dr + dg * dg + db * db
                    if d < best_d:
                        best_d = d
                        closest = (pmx, pmy)
                match = closest

            if match:
                matched_px += 1
                mx, my = match
                # Encode normalized UV coordinate into Red and Green
                u_byte = round(((mx + 0.5) / map_w) * 255)
                v_byte = round(((my + 0.5) / map_h) * 255)
                out_pixels[x, y] = (u_byte, v_byte, 0, a)
            else:
                unmatched_px += 1

    out_im.save(output_path)
    print(f"Successfully baked UV sprite to: {output_path}")
    print(f"Stats: Total pixels={total_px}, Matched={matched_px} ({matched_px/(total_px or 1)*100:.1f}%), Unmatched={unmatched_px}")

def main():
    parser = argparse.ArgumentParser(description="Astortion UV Sprite Baker")
    parser.add_argument("--map", required=True, help="Path to reference Map texture")
    parser.add_argument("--input", required=True, help="Path to input Mapped animation sprite/spritesheet")
    parser.add_argument("--output", required=True, help="Output path for baked UV sprite")
    parser.add_argument("--tolerance", type=int, default=5, help="Color distance tolerance (default: 5)")

    args = parser.parse_args()
    bake_uv(args.map, args.input, args.output, args.tolerance)

if __name__ == "__main__":
    main()
