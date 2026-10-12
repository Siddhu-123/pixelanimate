export type RGBAColor = [number, number, number, number];

export interface TextureData {
  width: number;
  height: number;
  data: Uint8ClampedArray; // RGBA byte array
}

export interface AnimationFrame {
  id: string;
  name: string;
  durationMs: number;
  // UV Data: R = U (0..width-1 or normalized), G = V (0..height-1 or normalized), B = 0, A = alpha
  uvData: Uint8ClampedArray;
  // Optional Mapped Data: the human-visible colors from the Map texture used during authoring
  mappedData?: Uint8ClampedArray;
}

export interface AnimationClip {
  id: string;
  name: string;
  fps: number;
  width: number;
  height: number;
  frames: AnimationFrame[];
}

export interface PresetSkin {
  id: string;
  name: string;
  category: string;
  description: string;
  previewColor: string;
  data: Uint8ClampedArray; // 32x32 RGBA
}

export interface RuntimeEffects {
  ast1Equipped: boolean;
  faceShadow: boolean;
  asymmetricHairpin: boolean;
  dirtAmount: number; // 0 to 100
  waterWashSpeed: number; // 0 to 100
  lightAngleDeg: number;
}

export type EditorTool = 
  | 'pencil' 
  | 'eraser' 
  | 'bucket' 
  | 'picker' 
  | 'line' 
  | 'rect' 
  | 'shade_dark' 
  | 'shade_light';

export type BackgroundStyle = 'dark' | 'astortion_teal' | 'checker' | 'white' | 'green_screen';

export interface PixelHoverInfo {
  sourcePanel: 'SOURCE' | 'RESULT' | 'LOOKUP';
  spriteX: number;
  spriteY: number;
  lookupU: number;
  lookupV: number;
  color: RGBAColor;
}

export interface BakeResult {
  success: boolean;
  uvFrames: Uint8ClampedArray[];
  totalPixelsProcessed: number;
  matchedPixels: number;
  unmatchedPixels: number;
  unmatchedColors: { color: RGBAColor; count: number }[];
  warningMessage?: string;
}
