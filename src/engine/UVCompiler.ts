/**
 * Asset Importer & UV Compiler Pipeline
 * Converts human-authored Mapped Animation cels into baked UV Source sprites.
 */

import { BakeResult, RGBAColor } from '../types';

export interface CompileOptions {
  tolerance: number; // 0 for exact match, up to 30 for compressed/antialiased inputs
  mapWidth: number;
  mapHeight: number;
}

export class UVCompiler {
  /**
   * Compiles one or more frames colored with Map colors into UV-encoded source frames.
   */
  public static compileFrames(
    mapData: Uint8ClampedArray,
    mapWidth: number,
    mapHeight: number,
    mappedFrames: Uint8ClampedArray[],
    frameWidth: number,
    frameHeight: number,
    tolerance = 5
  ): BakeResult {
    // Build color lookup map for O(1) matching when exact
    // Color key: (r << 16) | (g << 8) | b
    const colorToCoord = new Map<number, { x: number; y: number }>();
    const mapPixels: { r: number; g: number; b: number; x: number; y: number }[] = [];

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const idx = (y * mapWidth + x) * 4;
        const r = mapData[idx];
        const g = mapData[idx + 1];
        const b = mapData[idx + 2];
        const a = mapData[idx + 3];

        if (a > 10) {
          const key = (r << 16) | (g << 8) | b;
          colorToCoord.set(key, { x, y });
          mapPixels.push({ r, g, b, x, y });
        }
      }
    }

    const uvFrames: Uint8ClampedArray[] = [];
    let totalProcessed = 0;
    let totalMatched = 0;
    let totalUnmatched = 0;
    const unmatchedMap = new Map<number, { color: RGBAColor; count: number }>();

    for (const frameData of mappedFrames) {
      const bakedUV = new Uint8ClampedArray(frameWidth * frameHeight * 4);

      for (let y = 0; y < frameHeight; y++) {
        for (let x = 0; x < frameWidth; x++) {
          const idx = (y * frameWidth + x) * 4;
          const r = frameData[idx];
          const g = frameData[idx + 1];
          const b = frameData[idx + 2];
          const a = frameData[idx + 3];

          // Transparent pixel in source frame
          if (a < 10) {
            bakedUV[idx] = 0;
            bakedUV[idx + 1] = 0;
            bakedUV[idx + 2] = 0;
            bakedUV[idx + 3] = 0;
            continue;
          }

          totalProcessed++;
          const key = (r << 16) | (g << 8) | b;

          let matchCoord = colorToCoord.get(key);

          // If no exact match and tolerance > 0, find closest color in Map
          if (!matchCoord && tolerance > 0) {
            let bestDist = tolerance * tolerance * 3;
            let closest: { x: number; y: number } | null = null;

            for (const mp of mapPixels) {
              const dr = r - mp.r;
              const dg = g - mp.g;
              const db = b - mp.b;
              const distSq = dr * dr + dg * dg + db * db;
              if (distSq < bestDist) {
                bestDist = distSq;
                closest = { x: mp.x, y: mp.y };
              }
            }
            if (closest) {
              matchCoord = closest;
            }
          }

          if (matchCoord) {
            totalMatched++;
            // Encode (x, y) into R and G channels
            // For a 32x32 map, (x + 0.5) / 32 * 255 ensures sampling center of texel in shader
            const uByte = Math.round(((matchCoord.x + 0.5) / mapWidth) * 255);
            const vByte = Math.round(((matchCoord.y + 0.5) / mapHeight) * 255);

            bakedUV[idx] = uByte;
            bakedUV[idx + 1] = vByte;
            bakedUV[idx + 2] = 0;
            bakedUV[idx + 3] = a;
          } else {
            totalUnmatched++;
            const existing = unmatchedMap.get(key);
            if (existing) {
              existing.count++;
            } else {
              unmatchedMap.set(key, { color: [r, g, b, a], count: 1 });
            }

            // Fallback: preserve original pixel with zero alpha or magenta flag
            bakedUV[idx] = 0;
            bakedUV[idx + 1] = 0;
            bakedUV[idx + 2] = 0;
            bakedUV[idx + 3] = 0;
          }
        }
      }

      uvFrames.push(bakedUV);
    }

    const unmatchedList = Array.from(unmatchedMap.values());

    return {
      success: totalUnmatched === 0,
      uvFrames,
      totalPixelsProcessed: totalProcessed,
      matchedPixels: totalMatched,
      unmatchedPixels: totalUnmatched,
      unmatchedColors: unmatchedList,
      warningMessage: totalUnmatched > 0 
        ? `Compiled with ${totalUnmatched} unmatched pixels across ${unmatchedList.length} unique colors.` 
        : undefined
    };
  }
}
