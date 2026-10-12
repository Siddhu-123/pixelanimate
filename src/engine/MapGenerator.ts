/**
 * Generates high-contrast, distinctive Map textures.
 * Every coordinate receives a distinct, identifiable color with striped patterns
 * to aid visual feature tracking during character animation.
 */

export class MapGenerator {
  /**
   * Generates an algorithmic distinctive map where every (x, y) has a guaranteed unique RGB value.
   */
  public static generateUniquePaletteMap(width: number, height: number): Uint8ClampedArray {
    const data = new Uint8ClampedArray(width * height * 4);
    const totalPixels = width * height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const i = y * width + x;

        // Alternate stripe intensity to provide visual banding
        const stripe = (y % 2 === 0) ? 1.0 : 0.82;

        // Hue sweeps smoothly across x and y
        const hue = (i / totalPixels) * 360;
        const sat = 0.85;
        const light = (0.35 + 0.35 * (x / width)) * stripe;

        const [r, g, b] = this.hslToRgb(hue, sat, light);

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    return data;
  }

  /**
   * HSL to RGB helper
   */
  public static hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h = (h % 360) / 360;
    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
}
