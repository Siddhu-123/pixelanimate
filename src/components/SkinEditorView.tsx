import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { AnimationClip, EditorTool } from '../types';
import { PALETTES, Palette } from '../data/palettes';
import { ShaderEngine } from '../engine/ShaderEngine';
import { SkinEditorToolbar } from './SkinEditorToolbar';

interface SkinEditorViewProps {
  activeAnimation: AnimationClip;
  currentFrameIndex: number;
  lookupData: Uint8ClampedArray;
  textureWidth: number;
  textureHeight: number;
  onUpdateLookup: (newData: Uint8ClampedArray) => void;
  bgStyle?: string;
  dirtAmount: number;
  faceShadow: boolean;
}

export const SkinEditorView: React.FC<SkinEditorViewProps> = ({
  activeAnimation,
  currentFrameIndex,
  lookupData,
  textureWidth,
  textureHeight,
  onUpdateLookup,
  dirtAmount,
  faceShadow,
}) => {
  // Drawing Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewShaderRef = useRef<ShaderEngine | null>(null);

  const [activeTool, setActiveTool] = useState<EditorTool>('pencil');
  const [activeColor, setActiveColor] = useState<string>('#ffffff');
  const [selectedPalette, setSelectedPalette] = useState<Palette>(PALETTES[0]);
  const [history, setHistory] = useState<Uint8ClampedArray[]>([new Uint8ClampedArray(lookupData)]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const currentFrame = activeAnimation.frames[currentFrameIndex] || activeAnimation.frames[0];

  // Initialize preview shader
  useEffect(() => {
    if (previewCanvasRef.current && !previewShaderRef.current) {
      previewShaderRef.current = new ShaderEngine(previewCanvasRef.current);
    }
    return () => {
      previewShaderRef.current?.destroy();
      previewShaderRef.current = null;
    };
  }, []);

  // Update preview canvas live
  useEffect(() => {
    if (!previewShaderRef.current || !currentFrame) return;
    previewShaderRef.current.render(
      currentFrame.uvData,
      activeAnimation.width,
      activeAnimation.height,
      lookupData,
      textureWidth,
      textureHeight,
      {
        mode: 'result',
        boostFactor: 1.0,
        dirtAmount,
        faceShadow,
        time: performance.now() / 1000,
      }
    );
  }, [currentFrame, lookupData, dirtAmount, faceShadow, activeAnimation, textureWidth, textureHeight]);

  // Render Drawing Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = ctx.createImageData(textureWidth, textureHeight);
    img.data.set(lookupData);
    ctx.putImageData(img, 0, 0);
  }, [lookupData, textureWidth, textureHeight]);

  // Push history
  const pushHistory = useCallback((newData: Uint8ClampedArray) => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, new Uint8ClampedArray(newData)];
    });
    setHistoryIndex((prev) => prev + 1);
    onUpdateLookup(newData);
  }, [historyIndex, onUpdateLookup]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      onUpdateLookup(new Uint8ClampedArray(history[nextIdx]));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      onUpdateLookup(new Uint8ClampedArray(history[nextIdx]));
    }
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const cleaned = hex.replace('#', '');
    const num = parseInt(cleaned, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  // Paint pixel logic
  const paintPixel = useCallback((x: number, y: number, currentData: Uint8ClampedArray): Uint8ClampedArray => {
    if (x < 0 || x >= textureWidth || y < 0 || y >= textureHeight) return currentData;

    const newData = new Uint8ClampedArray(currentData);
    const idx = (y * textureWidth + x) * 4;
    const [r, g, b] = hexToRgb(activeColor);

    if (activeTool === 'pencil') {
      newData[idx] = r;
      newData[idx + 1] = g;
      newData[idx + 2] = b;
      newData[idx + 3] = 255;
    } else if (activeTool === 'eraser') {
      newData[idx] = 0;
      newData[idx + 1] = 0;
      newData[idx + 2] = 0;
      newData[idx + 3] = 0;
    } else if (activeTool === 'bucket') {
      // Flood Fill
      const targetR = currentData[idx];
      const targetG = currentData[idx + 1];
      const targetB = currentData[idx + 2];
      const targetA = currentData[idx + 3];

      if (targetR === r && targetG === g && targetB === b && targetA === 255) {
        return currentData;
      }

      const queue: [number, number][] = [[x, y]];
      const visited = new Uint8Array(textureWidth * textureHeight);

      while (queue.length > 0) {
        const [qx, qy] = queue.pop()!;
        if (qx < 0 || qx >= textureWidth || qy < 0 || qy >= textureHeight) continue;
        const qIdx = (qy * textureWidth + qx) * 4;
        const vIdx = qy * textureWidth + qx;

        if (visited[vIdx]) continue;
        visited[vIdx] = 1;

        if (
          Math.abs(newData[qIdx] - targetR) < 5 &&
          Math.abs(newData[qIdx + 1] - targetG) < 5 &&
          Math.abs(newData[qIdx + 2] - targetB) < 5 &&
          Math.abs(newData[qIdx + 3] - targetA) < 5
        ) {
          newData[qIdx] = r;
          newData[qIdx + 1] = g;
          newData[qIdx + 2] = b;
          newData[qIdx + 3] = 255;

          queue.push([qx + 1, qy], [qx - 1, qy], [qx, qy + 1], [qx, qy - 1]);
        }
      }
    } else if (activeTool === 'picker') {
      const pr = currentData[idx];
      const pg = currentData[idx + 1];
      const pb = currentData[idx + 2];
      const hex = `#${((1 << 24) + (pr << 16) + (pg << 8) + pb).toString(16).slice(1)}`;
      setActiveColor(hex);
      setActiveTool('pencil');
      return currentData;
    } else if (activeTool === 'shade_dark') {
      newData[idx] = Math.max(0, Math.round(newData[idx] * 0.8));
      newData[idx + 1] = Math.max(0, Math.round(newData[idx + 1] * 0.8));
      newData[idx + 2] = Math.max(0, Math.round(newData[idx + 2] * 0.8));
    } else if (activeTool === 'shade_light') {
      newData[idx] = Math.min(255, Math.round(newData[idx] * 1.25) + 10);
      newData[idx + 1] = Math.min(255, Math.round(newData[idx + 1] * 1.25) + 10);
      newData[idx + 2] = Math.min(255, Math.round(newData[idx + 2] * 1.25) + 10);
    }

    return newData;
  }, [activeColor, activeTool, textureWidth, textureHeight]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsMouseDown(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const px = Math.floor(((e.clientX - rect.left) / rect.width) * textureWidth);
    const py = Math.floor(((e.clientY - rect.top) / rect.height) * textureHeight);

    const updated = paintPixel(px, py, lookupData);
    onUpdateLookup(updated);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = Math.floor(((e.clientX - rect.left) / rect.width) * textureWidth);
    const py = Math.floor(((e.clientY - rect.top) / rect.height) * textureHeight);

    if (activeTool === 'pencil' || activeTool === 'eraser' || activeTool === 'shade_dark' || activeTool === 'shade_light') {
      const updated = paintPixel(px, py, lookupData);
      onUpdateLookup(updated);
    }
  };

  const handleMouseUp = () => {
    if (isMouseDown) {
      setIsMouseDown(false);
      pushHistory(lookupData);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0d1015]">
      {/* Editor Toolbar */}
      <SkinEditorToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeColor={activeColor}
        setActiveColor={setActiveColor}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onResetSkin={() => {
          if (confirm('Reset skin to default?')) {
            pushHistory(history[0]);
          }
        }}
        selectedPalette={selectedPalette}
        onSelectPalette={setSelectedPalette}
      />

      {/* Editor Canvas Area */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-8 overflow-auto">
        {/* Main Drawing Canvas */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="font-mono text-xs font-bold text-gray-200">
              UNWRAPPED SKIN TEXTURE ({textureWidth}x{textureHeight})
            </span>
            <span className="text-[11px] font-mono text-gray-400">
              Tool: <strong className="text-[#26c6ba] uppercase">{activeTool}</strong>
            </span>
          </div>

          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-[384px] h-[384px] bg-checker rounded-xl border border-[#2b3548] shadow-2xl overflow-hidden relative cursor-crosshair"
          >
            <canvas
              ref={canvasRef}
              width={textureWidth}
              height={textureHeight}
              className="w-full h-full pixelated block"
            />
            {/* Grid overlay */}
            <div
              className="absolute inset-0 pointer-events-none pixel-grid opacity-60"
              style={{ backgroundSize: '12px 12px' }}
            />
          </div>

          <div className="flex items-center gap-4 mt-3 text-[11px] font-mono text-gray-400">
            <span>Left-click / drag to draw</span>
            <span>•</span>
            <span>Instant live preview</span>
          </div>
        </div>

        {/* Live Animated Character Preview Card */}
        <div className="flex flex-col items-center bg-[#141822] border border-[#262f40] rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="font-mono text-xs font-bold text-[#26c6ba] flex items-center gap-1.5">
              <Sparkles size={13} />
              LIVE PREVIEW
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c2330] text-gray-300">
              {activeAnimation.name}
            </span>
          </div>

          <div className="w-[192px] h-[192px] bg-checker rounded-lg border border-[#283244] overflow-hidden shadow-inner flex items-center justify-center p-2">
            <canvas
              ref={previewCanvasRef}
              width={activeAnimation.width}
              height={activeAnimation.height}
              className="w-full h-full pixelated block"
            />
          </div>

          {/* Region Legend Guide */}
          <div className="mt-4 w-full bg-[#181d28] rounded-lg p-3 border border-[#242d3d] text-[11px] font-mono">
            <div className="text-gray-300 font-semibold mb-1.5 text-[10px] uppercase tracking-wider text-gray-400">
              Texture Map Regions:
            </div>
            <div className="space-y-1 text-gray-400">
              <div className="flex items-center justify-between">
                <span>Top (y: 5..11):</span>
                <span className="text-white">Hair & Face</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Center (y: 13..20):</span>
                <span className="text-white">Arms & Torso</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Right Arm (x: 10, y: 16..18):</span>
                <span className="text-[#00adb5]">AST-1 Device</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Bottom (y: 21..30):</span>
                <span className="text-white">Pants & Boots</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
