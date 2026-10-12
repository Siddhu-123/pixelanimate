import React, { useState } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  RefreshCw
} from 'lucide-react';
import { AnimationClip, BakeResult } from '../types';
import { UVCompiler } from '../engine/UVCompiler';
import { ImageExporter } from '../utils/imageExporter';

interface PipelineViewProps {
  activeAnimation: AnimationClip;
  mapData: Uint8ClampedArray;
  textureWidth: number;
  textureHeight: number;
  onApplyBakedFrames: (newFrames: Uint8ClampedArray[]) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  activeAnimation,
  mapData,
  textureWidth,
  textureHeight,
  onApplyBakedFrames,
}) => {
  const [tolerance, setTolerance] = useState(5);
  const [bakeResult, setBakeResult] = useState<BakeResult | null>(null);

  const activeCel = activeAnimation.frames[0];

  // Run bake
  const handleRunBake = () => {
    const mappedFrames = activeAnimation.frames.map((f) => f.mappedData || f.uvData);
    const res = UVCompiler.compileFrames(
      mapData,
      textureWidth,
      textureHeight,
      mappedFrames,
      activeAnimation.width,
      activeAnimation.height,
      tolerance
    );
    setBakeResult(res);
    if (res.success || res.uvFrames.length > 0) {
      onApplyBakedFrames(res.uvFrames);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0d1015] p-6 overflow-auto">
      {/* Workflow Explanation Banner */}
      <div className="max-w-5xl mx-auto w-full mb-6">
        <div className="bg-[#141820] border border-[#262e3d] rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="text-[#26c6ba]" size={18} />
            <h2 className="font-mono text-sm font-bold text-white tracking-wide">
              AUTHORING PIPELINE & ASSET IMPORTER (ASTORTION WORKFLOW)
            </h2>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Raw UV coordinates ($0..31$) are nearly pitch black and impossible for humans to animate directly. 
            In Astortion, the artist colors animation cels with an intermediate <strong className="text-gray-200">Map</strong> of distinctive high-contrast colors (e.g. violet stripe = knee). 
            The Unity/In-Engine Asset Importer then searches every pixel color in the Map to bake the final UV coordinate sprites.
          </p>
        </div>
      </div>

      {/* 4-Step Interactive Pipeline Flow */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Step 1: Base Animation */}
        <div className="bg-[#131720] border border-[#232a38] rounded-xl p-4 flex flex-col items-center text-center relative group">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c222e] text-[#26c6ba] mb-2">
            STEP 1
          </span>
          <h3 className="font-mono text-xs font-bold text-gray-200 mb-1">Base Animation</h3>
          <p className="text-[11px] text-gray-500 mb-3">Traditional character silhouette & motion keyframes</p>

          <div className="w-24 h-24 bg-checker rounded-lg border border-[#283244] flex items-center justify-center p-2 mb-2">
            <canvas
              ref={(c) => {
                if (!c || !activeCel) return;
                const ctx = c.getContext('2d');
                if (!ctx) return;
                const img = ctx.createImageData(32, 32);
                for (let i = 0; i < 32 * 32 * 4; i += 4) {
                  const a = activeCel.uvData[i + 3];
                  if (a > 10) {
                    img.data[i] = 40;
                    img.data[i + 1] = 45;
                    img.data[i + 2] = 50;
                    img.data[i + 3] = 255;
                  }
                }
                ctx.putImageData(img, 0, 0);
              }}
              width={32}
              height={32}
              className="w-full h-full pixelated"
            />
          </div>
          <span className="text-[10px] text-gray-400 font-mono">Silhouette Cel</span>
        </div>

        {/* Step 2: Intermediate Map */}
        <div className="bg-[#131720] border border-[#232a38] rounded-xl p-4 flex flex-col items-center text-center relative group">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c222e] text-[#26c6ba] mb-2">
            STEP 2
          </span>
          <h3 className="font-mono text-xs font-bold text-gray-200 mb-1">Striped Map</h3>
          <p className="text-[11px] text-gray-500 mb-3">High-contrast palette template (knee = violet)</p>

          <div className="w-24 h-24 bg-checker rounded-lg border border-[#283244] flex items-center justify-center p-2 mb-2">
            <canvas
              ref={(c) => {
                if (!c) return;
                const ctx = c.getContext('2d');
                if (!ctx) return;
                const img = ctx.createImageData(textureWidth, textureHeight);
                img.data.set(mapData);
                ctx.putImageData(img, 0, 0);
              }}
              width={textureWidth}
              height={textureHeight}
              className="w-full h-full pixelated"
            />
          </div>
          <span className="text-[10px] text-gray-400 font-mono">Map Template</span>
        </div>

        {/* Step 3: Mapped Cel */}
        <div className="bg-[#131720] border border-[#232a38] rounded-xl p-4 flex flex-col items-center text-center relative group">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c222e] text-[#26c6ba] mb-2">
            STEP 3
          </span>
          <h3 className="font-mono text-xs font-bold text-gray-200 mb-1">Mapped Animation</h3>
          <p className="text-[11px] text-gray-500 mb-3">Artist paints frames using Map colors</p>

          <div className="w-24 h-24 bg-checker rounded-lg border border-[#283244] flex items-center justify-center p-2 mb-2">
            <canvas
              ref={(c) => {
                if (!c || !activeCel?.mappedData) return;
                const ctx = c.getContext('2d');
                if (!ctx) return;
                const img = ctx.createImageData(32, 32);
                img.data.set(activeCel.mappedData);
                ctx.putImageData(img, 0, 0);
              }}
              width={32}
              height={32}
              className="w-full h-full pixelated"
            />
          </div>
          <span className="text-[10px] text-gray-400 font-mono">Authoring Sprite</span>
        </div>

        {/* Step 4: UV Baked Output */}
        <div className="bg-[#131720] border border-[#232a38] rounded-xl p-4 flex flex-col items-center text-center relative group">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c222e] text-[#26c6ba] mb-2">
            STEP 4
          </span>
          <h3 className="font-mono text-xs font-bold text-gray-200 mb-1">Baked UV Sprite</h3>
          <p className="text-[11px] text-gray-500 mb-3">Asset Importer compiles to (R=U, G=V)</p>

          <div className="w-24 h-24 bg-[#18202c] rounded-lg border border-[#283244] flex items-center justify-center p-2 mb-2">
            <canvas
              ref={(c) => {
                if (!c || !activeCel) return;
                const ctx = c.getContext('2d');
                if (!ctx) return;
                const img = ctx.createImageData(32, 32);
                for (let i = 0; i < 32 * 32 * 4; i += 4) {
                  const r = activeCel.uvData[i];
                  const g = activeCel.uvData[i + 1];
                  const a = activeCel.uvData[i + 3];
                  if (a > 10) {
                    img.data[i] = Math.min(255, r * 8); // boost for preview
                    img.data[i + 1] = Math.min(255, g * 8);
                    img.data[i + 2] = 20;
                    img.data[i + 3] = a;
                  }
                }
                ctx.putImageData(img, 0, 0);
              }}
              width={32}
              height={32}
              className="w-full h-full pixelated"
            />
          </div>
          <span className="text-[10px] text-[#26c6ba] font-mono">Baked UV Source</span>
        </div>
      </div>

      {/* Compiler Action & Controls */}
      <div className="max-w-5xl mx-auto w-full bg-[#141820] border border-[#262e3d] rounded-xl p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-mono text-sm font-bold text-white mb-1">
              Bake Animation Cels with Asset Importer
            </h3>
            <p className="text-xs text-gray-400">
              Scan all {activeAnimation.frames.length} cels in "{activeAnimation.name}", correlate each pixel against the Map, and compile UV Source coordinates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#191f2b] px-3 py-1.5 rounded-lg border border-[#2c374a]">
              <span className="text-xs text-gray-300 font-mono">Color Tolerance:</span>
              <input
                type="range"
                min="0"
                max="25"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                aria-label="Color matching tolerance"
                className="w-20 accent-[#26c6ba] cursor-pointer"
              />
              <span className="text-xs font-mono text-[#26c6ba] w-6">{tolerance}</span>
            </div>

            <button
              onClick={handleRunBake}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#13857f] to-[#00adb5] hover:brightness-110 text-white font-mono text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
            >
              <RefreshCw size={14} />
              <span>Bake UV Sprites</span>
            </button>
          </div>
        </div>

        {/* Compiler Results & Diagnostics */}
        {bakeResult && (
          <div className="mt-4 pt-4 border-t border-[#232a38]">
            <div className="flex items-center gap-2 mb-2">
              {bakeResult.success ? (
                <CheckCircle2 size={16} className="text-emerald-400" />
              ) : (
                <AlertTriangle size={16} className="text-amber-400" />
              )}
              <span className="font-mono text-xs font-bold text-white">
                {bakeResult.success ? 'Compilation Succeeded: 100% Exact UV Match' : 'Compilation Completed with Warnings'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-[#191f2b] p-3 rounded-lg border border-[#293345]">
                <div className="text-gray-400 text-[11px]">Total Pixels Processed</div>
                <div className="text-lg font-bold text-white mt-0.5">{bakeResult.totalPixelsProcessed}</div>
              </div>
              <div className="bg-[#191f2b] p-3 rounded-lg border border-[#293345]">
                <div className="text-gray-400 text-[11px]">Matched Pixels</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  {bakeResult.matchedPixels} ({Math.round((bakeResult.matchedPixels / (bakeResult.totalPixelsProcessed || 1)) * 100)}%)
                </div>
              </div>
              <div className="bg-[#191f2b] p-3 rounded-lg border border-[#293345]">
                <div className="text-gray-400 text-[11px]">Unmatched Pixels</div>
                <div className="text-lg font-bold text-amber-400 mt-0.5">{bakeResult.unmatchedPixels}</div>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  ImageExporter.exportSpritesheet(
                    bakeResult.uvFrames,
                    activeAnimation.width,
                    activeAnimation.height,
                    `${activeAnimation.name.toLowerCase().replace(/\s+/g, '_')}_baked_uv_strip.png`,
                    4
                  );
                }}
                className="px-3 py-1.5 rounded bg-[#1e2533] hover:bg-[#283244] text-xs font-mono text-white flex items-center gap-1.5 border border-[#354156] transition-colors"
              >
                <Download size={13} />
                <span>Export Baked UV Spritesheet (PNG)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
