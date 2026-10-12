import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Sun, 
  Crosshair, 
  Sparkles,
  Layers
} from 'lucide-react';
import { AnimationClip, BackgroundStyle, PixelHoverInfo, RGBAColor } from '../types';
import { ShaderEngine } from '../engine/ShaderEngine';

interface ThreePanelViewProps {
  activeAnimation: AnimationClip;
  currentFrameIndex: number;
  lookupData: Uint8ClampedArray;
  textureWidth: number;
  textureHeight: number;
  zoom: number;
  showGrid: boolean;
  bgStyle: BackgroundStyle;
  isFlipped: boolean;
  dirtAmount: number;
  faceShadow: boolean;
  hoverInfo: PixelHoverInfo | null;
  setHoverInfo: (info: PixelHoverInfo | null) => void;
  onPixelClickOnLookup?: (x: number, y: number) => void;
  activeColor?: string;
  isDrawingOnLookup?: boolean;
  onPaintPixel?: (x: number, y: number) => void;
}

export const ThreePanelView: React.FC<ThreePanelViewProps> = ({
  activeAnimation,
  currentFrameIndex,
  lookupData,
  textureWidth,
  textureHeight,
  zoom,
  showGrid,
  bgStyle,
  isFlipped,
  dirtAmount,
  faceShadow,
  hoverInfo,
  setHoverInfo,
  onPaintPixel,
}) => {
  // Canvases
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lookupCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Shader engines
  const sourceShaderRef = useRef<ShaderEngine | null>(null);
  const resultShaderRef = useRef<ShaderEngine | null>(null);

  // SOURCE Panel controls
  const [boostEnabled, setBoostEnabled] = useState(true);
  const [boostFactor, setBoostFactor] = useState(8.0);
  const [sourceChannel, setSourceChannel] = useState<'all' | 'u' | 'v'>('all');
  const [isMouseDownLookup, setIsMouseDownLookup] = useState(false);

  const currentFrame = activeAnimation.frames[currentFrameIndex] || activeAnimation.frames[0];
  const frameW = activeAnimation.width;
  const frameH = activeAnimation.height;

  // Initialize shader engines
  useEffect(() => {
    if (sourceCanvasRef.current && !sourceShaderRef.current) {
      sourceShaderRef.current = new ShaderEngine(sourceCanvasRef.current);
    }
    if (resultCanvasRef.current && !resultShaderRef.current) {
      resultShaderRef.current = new ShaderEngine(resultCanvasRef.current);
    }

    return () => {
      sourceShaderRef.current?.destroy();
      sourceShaderRef.current = null;
      resultShaderRef.current?.destroy();
      resultShaderRef.current = null;
    };
  }, []);

  // Render SOURCE canvas
  useEffect(() => {
    if (!sourceShaderRef.current || !currentFrame) return;

    let mode: 'source_raw' | 'source_boosted' | 'channel_u' | 'channel_v' = 'source_boosted';
    if (!boostEnabled) {
      mode = 'source_raw';
    } else if (sourceChannel === 'u') {
      mode = 'channel_u';
    } else if (sourceChannel === 'v') {
      mode = 'channel_v';
    }

    const hlUV = hoverInfo ? [hoverInfo.lookupU / textureWidth, hoverInfo.lookupV / textureHeight] as [number, number] : undefined;

    sourceShaderRef.current.render(
      currentFrame.uvData,
      frameW,
      frameH,
      lookupData,
      textureWidth,
      textureHeight,
      {
        mode,
        boostFactor: boostEnabled ? boostFactor : 1.0,
        highlightUV: hlUV,
        time: performance.now() / 1000,
      }
    );
  }, [currentFrame, boostEnabled, boostFactor, sourceChannel, hoverInfo, frameW, frameH, lookupData, textureWidth, textureHeight]);

  // Render RESULT canvas
  useEffect(() => {
    if (!resultShaderRef.current || !currentFrame) return;

    const hlUV = hoverInfo ? [hoverInfo.lookupU / textureWidth, hoverInfo.lookupV / textureHeight] as [number, number] : undefined;

    resultShaderRef.current.render(
      currentFrame.uvData,
      frameW,
      frameH,
      lookupData,
      textureWidth,
      textureHeight,
      {
        mode: 'result',
        boostFactor: 1.0,
        highlightUV: hlUV,
        dirtAmount,
        faceShadow,
        time: performance.now() / 1000,
      }
    );
  }, [currentFrame, lookupData, dirtAmount, faceShadow, hoverInfo, frameW, frameH, textureWidth, textureHeight]);

  // Render LOOKUP canvas (2D canvas for crisp interactive inspection & painting)
  useEffect(() => {
    const canvas = lookupCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(textureWidth, textureHeight);
    imgData.data.set(lookupData);
    ctx.putImageData(imgData, 0, 0);

    // If hoverInfo exists, draw a highlighted box on the lookup coordinate
    if (hoverInfo) {
      const u = hoverInfo.lookupU;
      const v = hoverInfo.lookupV;
      ctx.fillStyle = 'rgba(255, 240, 50, 0.7)';
      ctx.fillRect(u, v, 1, 1);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(u, v, 1, 1);
    }
  }, [lookupData, textureWidth, textureHeight, hoverInfo]);

  // Get background class
  const getBgClass = () => {
    switch (bgStyle) {
      case 'checker':
        return 'bg-checker';
      case 'astortion_teal':
        return 'bg-[#13857f]';
      case 'dark':
        return 'bg-[#14171a]';
      case 'white':
        return 'bg-[#ffffff]';
      case 'green_screen':
        return 'bg-[#00b140]';
      default:
        return 'bg-checker';
    }
  };

  // Mouse handlers for RESULT / SOURCE hover
  const handleFrameMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, panel: 'SOURCE' | 'RESULT') => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = isFlipped ? rect.right - e.clientX : e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const px = Math.floor((clientX / rect.width) * frameW);
    const py = Math.floor((clientY / rect.height) * frameH);

    if (px >= 0 && px < frameW && py >= 0 && py < frameH) {
      const idx = (py * frameW + px) * 4;
      const r = currentFrame.uvData[idx];
      const g = currentFrame.uvData[idx + 1];
      const a = currentFrame.uvData[idx + 3];

      if (a > 10) {
        const u = Math.min(textureWidth - 1, Math.floor((r / 255) * textureWidth));
        const v = Math.min(textureHeight - 1, Math.floor((g / 255) * textureHeight));
        const lIdx = (v * textureWidth + u) * 4;
        const color: RGBAColor = [
          lookupData[lIdx],
          lookupData[lIdx + 1],
          lookupData[lIdx + 2],
          lookupData[lIdx + 3],
        ];

        setHoverInfo({
          sourcePanel: panel,
          spriteX: px,
          spriteY: py,
          lookupU: u,
          lookupV: v,
          color,
        });
        return;
      }
    }
    setHoverInfo(null);
  }, [currentFrame, frameW, frameH, isFlipped, lookupData, setHoverInfo, textureWidth, textureHeight]);

  // Mouse handlers for LOOKUP hover & drawing
  const handleLookupMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = Math.floor(((e.clientX - rect.left) / rect.width) * textureWidth);
    const py = Math.floor(((e.clientY - rect.top) / rect.height) * textureHeight);

    if (px >= 0 && px < textureWidth && py >= 0 && py < textureHeight) {
      const idx = (py * textureWidth + px) * 4;
      const color: RGBAColor = [
        lookupData[idx],
        lookupData[idx + 1],
        lookupData[idx + 2],
        lookupData[idx + 3],
      ];

      setHoverInfo({
        sourcePanel: 'LOOKUP',
        spriteX: -1,
        spriteY: -1,
        lookupU: px,
        lookupV: py,
        color,
      });

      if (isMouseDownLookup && onPaintPixel) {
        onPaintPixel(px, py);
      }
    } else {
      setHoverInfo(null);
    }
  }, [textureWidth, textureHeight, lookupData, setHoverInfo, isMouseDownLookup, onPaintPixel]);

  const handleLookupMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsMouseDownLookup(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const px = Math.floor(((e.clientX - rect.left) / rect.width) * textureWidth);
    const py = Math.floor(((e.clientY - rect.top) / rect.height) * textureHeight);
    if (px >= 0 && px < textureWidth && py >= 0 && py < textureHeight && onPaintPixel) {
      onPaintPixel(px, py);
    }
  };

  const canvasDisplaySize = 32 * zoom;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0d1015]">
      {/* 3 Panels Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#222834] overflow-auto">
        {/* PANEL 1: SOURCE */}
        <div className="flex flex-col bg-[#14171e]/60 p-4 relative">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-mono text-xs font-bold tracking-widest text-gray-200">
                SOURCE
              </span>
              <p className="text-[10px] text-gray-500">
                UV coordinates (R = U, G = V)
              </p>
            </div>

            {/* Brightness Boost Toggle & Factor */}
            <div className="flex items-center gap-1.5 bg-[#1a202c] px-2 py-1 rounded border border-[#2b3548]">
              {/* Channel buttons */}
              <div className="flex items-center gap-0.5 mr-1 border-r border-[#2b3548] pr-1.5">
                {(['all', 'u', 'v'] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setSourceChannel(ch)}
                    className={`px-1 rounded text-[10px] font-mono transition-colors ${
                      sourceChannel === ch ? 'bg-[#26c6ba] text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                    title={ch === 'all' ? 'All Channels' : ch === 'u' ? 'U Channel (Red)' : 'V Channel (Green)'}
                  >
                    {ch.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setBoostEnabled(!boostEnabled)}
                className={`flex items-center gap-1 text-[11px] font-mono font-medium transition-colors ${
                  boostEnabled ? 'text-[#26c6ba]' : 'text-gray-400'
                }`}
                title="Brighten dark UV coordinates so they are visible to human eye"
              >
                <Sun size={12} className={boostEnabled ? 'text-[#26c6ba]' : 'text-gray-500'} />
                <span>Boost</span>
              </button>

              {boostEnabled && (
                <input
                  type="range"
                  min="2"
                  max="16"
                  step="1"
                  value={boostFactor}
                  onChange={(e) => setBoostFactor(Number(e.target.value))}
                  aria-label="UV coordinate brightness boost factor"
                  className="w-14 accent-[#26c6ba] cursor-pointer"
                  title={`Boost: ${boostFactor}x`}
                />
              )}
            </div>
          </div>

          {/* Viewport Center */}
          <div className="flex-1 flex items-center justify-center relative min-h-[260px]">
            <div
              onMouseMove={(e) => handleFrameMouseMove(e, 'SOURCE')}
              onMouseLeave={() => setHoverInfo(null)}
              className={`relative rounded-xl overflow-hidden shadow-2xl border border-[#283244] cursor-crosshair ${getBgClass()}`}
              style={{
                width: `${canvasDisplaySize}px`,
                height: `${canvasDisplaySize}px`,
                transform: isFlipped ? 'scaleX(-1)' : 'none',
              }}
            >
              <canvas
                ref={sourceCanvasRef}
                width={frameW}
                height={frameH}
                className="w-full h-full pixelated block"
              />

              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none pixel-grid"
                  style={{ backgroundSize: `${zoom}px ${zoom}px` }}
                />
              )}
            </div>
          </div>

          {/* Subtitle / Quote pill */}
          <div className="mt-2 text-center">
            <span className="text-[10px] text-gray-500 font-mono italic">
              {boostEnabled ? `Boosted ${boostFactor}x: UV gradient visible` : 'Raw UV: coordinates are dark (0..31)'}
            </span>
          </div>
        </div>

        {/* PANEL 2: RESULT */}
        <div className="flex flex-col bg-[#14171e] p-4 relative">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-mono text-xs font-bold tracking-widest text-[#26c6ba] flex items-center gap-1.5">
                <Sparkles size={13} />
                RESULT
              </span>
              <p className="text-[10px] text-gray-500">
                Rendered with Active Skin
              </p>
            </div>

            <div className="text-[11px] font-mono text-gray-400 bg-[#1a202c] px-2 py-0.5 rounded border border-[#2b3548]">
              Cel: {currentFrameIndex + 1}/{activeAnimation.frames.length}
            </div>
          </div>

          {/* Viewport Center */}
          <div className="flex-1 flex items-center justify-center relative min-h-[260px]">
            <div
              onMouseMove={(e) => handleFrameMouseMove(e, 'RESULT')}
              onMouseLeave={() => setHoverInfo(null)}
              className={`relative rounded-xl overflow-hidden shadow-2xl border border-[#283244] cursor-crosshair ${getBgClass()}`}
              style={{
                width: `${canvasDisplaySize}px`,
                height: `${canvasDisplaySize}px`,
                transform: isFlipped ? 'scaleX(-1)' : 'none',
              }}
            >
              <canvas
                ref={resultCanvasRef}
                width={frameW}
                height={frameH}
                className="w-full h-full pixelated block"
              />

              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none pixel-grid"
                  style={{ backgroundSize: `${zoom}px ${zoom}px` }}
                />
              )}
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-[10px] text-gray-400 font-mono">
              Real-time UV sampling at {activeAnimation.fps} FPS
            </span>
          </div>
        </div>

        {/* PANEL 3: LOOKUP */}
        <div className="flex flex-col bg-[#14171e]/60 p-4 relative">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-mono text-xs font-bold tracking-widest text-gray-200 flex items-center gap-1.5">
                <Layers size={13} />
                LOOKUP
              </span>
              <p className="text-[10px] text-gray-500">
                Skin Texture ({textureWidth}x{textureHeight}) - Click & drag to paint!
              </p>
            </div>

            <div className="text-[11px] font-mono text-gray-400 bg-[#1a202c] px-2 py-0.5 rounded border border-[#2b3548]">
              Unwrapped UV
            </div>
          </div>

          {/* Viewport Center */}
          <div className="flex-1 flex items-center justify-center relative min-h-[260px]">
            <div
              onMouseMove={handleLookupMouseMove}
              onMouseDown={handleLookupMouseDown}
              onMouseUp={() => setIsMouseDownLookup(false)}
              onMouseLeave={() => {
                setIsMouseDownLookup(false);
                setHoverInfo(null);
              }}
              className={`relative rounded-xl overflow-hidden shadow-2xl border border-[#283244] cursor-pointer ${getBgClass()}`}
              style={{
                width: `${canvasDisplaySize}px`,
                height: `${canvasDisplaySize}px`,
              }}
            >
              <canvas
                ref={lookupCanvasRef}
                width={textureWidth}
                height={textureHeight}
                className="w-full h-full pixelated block"
              />

              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none pixel-grid"
                  style={{ backgroundSize: `${zoom}px ${zoom}px` }}
                />
              )}
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-[10px] text-gray-500 font-mono">
              Hover to locate UVs; draw to update character live
            </span>
          </div>
        </div>
      </div>

      {/* Coordinate & Pixel Inspector Status Bar */}
      <div className="h-7 bg-[#101319] border-t border-[#1f2532] px-4 flex items-center justify-between text-[11px] font-mono text-gray-400 select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Crosshair size={12} className="text-[#26c6ba]" />
            Inspector:
          </span>

          {hoverInfo ? (
            <>
              <span>Panel: <strong className="text-white">{hoverInfo.sourcePanel}</strong></span>
              {hoverInfo.spriteX >= 0 && (
                <span>Sprite: <strong className="text-white">({hoverInfo.spriteX}, {hoverInfo.spriteY})</strong></span>
              )}
              <span>Lookup UV: <strong className="text-[#26c6ba]">({hoverInfo.lookupU}, {hoverInfo.lookupV})</strong></span>
              <span className="flex items-center gap-1.5">
                Color:
                <span
                  className="inline-block w-3 h-3 rounded border border-gray-600"
                  style={{
                    backgroundColor: `rgba(${hoverInfo.color[0]}, ${hoverInfo.color[1]}, ${hoverInfo.color[2]}, ${hoverInfo.color[3] / 255})`,
                  }}
                />
                <span className="text-gray-300">
                  rgba({hoverInfo.color.join(', ')})
                </span>
              </span>
            </>
          ) : (
            <span className="text-gray-600 italic">
              Hover over any pixel in SOURCE, RESULT, or LOOKUP to inspect UV mapping coordinates.
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-gray-500">
          <span>Grid: {textureWidth}x{textureHeight}</span>
          <span>•</span>
          <span>Zoom: {zoom}x</span>
        </div>
      </div>
    </div>
  );
};
