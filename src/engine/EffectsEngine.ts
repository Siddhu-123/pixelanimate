/**
 * Runtime Effects Engine
 * Handles dynamic game-state modifications to the character's lookup texture:
 * - AST-1 gravity device toggle on arm
 * - 3D-angle asymmetric accessories (hairpin)
 * - Progressive mud accumulation & water cleaning simulation
 * - Dynamic lighting and face shadow overlays
 */

export class EffectsEngine {
  /**
   * Applies equipment or accessory changes directly to a lookup texture copy.
   */
  public static applyEquipment(
    baseLookup: Uint8ClampedArray,
    width: number,
    ast1Equipped: boolean,
    hairpinEquipped: boolean,
    faceShadow: boolean
  ): Uint8ClampedArray {
    const lookup = new Uint8ClampedArray(baseLookup);

    // AST-1 Device: located at (u: 10..12, v: 16..20) - Alice's right arm
    // In Astortion, these 3-4 white pixels represent the AST-1 gravity device
    const ast1Pixels = [
      { x: 10, y: 16, color: [245, 245, 250, 255] },
      { x: 10, y: 17, color: [255, 255, 255, 255] },
      { x: 10, y: 18, color: [220, 230, 245, 255] },
      { x: 10, y: 19, color: [80, 110, 140, 255] }, // connector
    ];

    for (const p of ast1Pixels) {
      if (p.x < width) {
        const idx = (p.y * width + p.x) * 4;
        if (ast1Equipped) {
          lookup[idx] = p.color[0];
          lookup[idx + 1] = p.color[1];
          lookup[idx + 2] = p.color[2];
          lookup[idx + 3] = p.color[3];
        } else {
          // Revert to sleeve / bare skin
          lookup[idx] = 40;
          lookup[idx + 1] = 42;
          lookup[idx + 2] = 45;
          lookup[idx + 3] = 255;
        }
      }
    }

    // Asymmetric Hairpin: located at (u: 23..24, v: 7..9) - right side of Alice's head
    // Visible only when head turns or from right angle
    const hairpinPixels = [
      { x: 23, y: 7, color: [255, 255, 255, 255] },
      { x: 24, y: 7, color: [0, 210, 230, 255] },
      { x: 23, y: 8, color: [240, 245, 255, 255] },
    ];

    for (const p of hairpinPixels) {
      if (p.x < width) {
        const idx = (p.y * width + p.x) * 4;
        if (hairpinEquipped) {
          lookup[idx] = p.color[0];
          lookup[idx + 1] = p.color[1];
          lookup[idx + 2] = p.color[2];
          lookup[idx + 3] = p.color[3];
        } else {
          // Revert to black/dark hair
          lookup[idx] = 26;
          lookup[idx + 1] = 26;
          lookup[idx + 2] = 28;
          lookup[idx + 3] = 255;
        }
      }
    }

    // Face shadow: darkens under-chin / lower face pixels (u: 15..18, v: 9..10)
    if (faceShadow) {
      for (let y = 9; y <= 10; y++) {
        for (let x = 14; x <= 18; x++) {
          const idx = (y * width + x) * 4;
          lookup[idx] = Math.round(lookup[idx] * 0.72);
          lookup[idx + 1] = Math.round(lookup[idx + 1] * 0.72);
          lookup[idx + 2] = Math.round(lookup[idx + 2] * 0.72);
        }
      }
    }

    return lookup;
  }
}
