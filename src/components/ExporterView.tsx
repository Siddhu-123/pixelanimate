import React, { useState } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  Code2, 
  FileImage 
} from 'lucide-react';
import { AnimationClip } from '../types';
import { 
  UNITY_SHADER, 
  UNITY_IMPORTER_CS, 
  GODOT_SHADER, 
  GAMEMAKER_SHADER, 
  GAMEMAKER_GML 
} from '../utils/engineTemplates';
import { ImageExporter } from '../utils/imageExporter';

interface ExporterViewProps {
  activeAnimation: AnimationClip;
  currentLookupData: Uint8ClampedArray;
  mapData: Uint8ClampedArray;
  textureWidth: number;
  textureHeight: number;
}

export const ExporterView: React.FC<ExporterViewProps> = ({
  activeAnimation,
  currentLookupData,
  mapData,
  textureWidth,
  textureHeight,
}) => {
  const [selectedEngine, setSelectedEngine] = useState<'unity' | 'godot' | 'gamemaker' | 'webgl'>('unity');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0d1015] p-6 overflow-auto">
      <div className="max-w-5xl mx-auto w-full">
        {/* Title */}
        <div className="mb-6">
          <h2 className="font-mono text-base font-bold text-white tracking-wide flex items-center gap-2">
            <Download className="text-[#26c6ba]" size={20} />
            EXPORT ASSETS & ENGINE SHADERS
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Export ready-to-use textures, spritesheets, and drop-in shaders for Unity, Godot 4, GameMaker, and WebGL.
          </p>
        </div>

        {/* Section 1: Image & Texture Asset Exports */}
        <div className="bg-[#141820] border border-[#242c3b] rounded-xl p-5 mb-8 shadow-lg">
          <h3 className="font-mono text-xs font-bold text-gray-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileImage size={15} className="text-[#26c6ba]" />
            Graphic Assets & Spritesheets
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Active Lookup Skin */}
            <div className="bg-[#181d27] border border-[#2b3548] rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold text-white">Skin / Lookup Texture</span>
                  <span className="text-[10px] text-gray-400 font-mono">32x32</span>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">
                  The active unwrapped appearance texture. Modifying this in-game changes all animations.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    ImageExporter.downloadImageData(currentLookupData, textureWidth, textureHeight, 'alice_skin_32x32.png', 1);
                  }}
                  className="flex-1 py-1.5 rounded bg-[#202735] hover:bg-[#283245] text-[11px] font-mono text-white flex items-center justify-center gap-1 border border-[#354157] transition-colors"
                >
                  <Download size={12} />
                  <span>1x PNG</span>
                </button>
                <button
                  onClick={() => {
                    ImageExporter.downloadImageData(currentLookupData, textureWidth, textureHeight, 'alice_skin_512.png', 16);
                  }}
                  className="flex-1 py-1.5 rounded bg-[#13857f] hover:bg-[#18a29b] text-[11px] font-mono text-white flex items-center justify-center gap-1 transition-colors"
                >
                  <Download size={12} />
                  <span>16x PNG</span>
                </button>
              </div>
            </div>

            {/* UV Source Spritesheet */}
            <div className="bg-[#181d27] border border-[#2b3548] rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold text-white">Source UV Spritesheet</span>
                  <span className="text-[10px] text-gray-400 font-mono">{activeAnimation.frames.length} cels</span>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">
                  All cels encoded with UV coordinates (R=U, G=V). Feed this into the shader in Unity/Godot.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const frames = activeAnimation.frames.map((f) => f.uvData);
                    ImageExporter.exportSpritesheet(frames, activeAnimation.width, activeAnimation.height, `${activeAnimation.name.toLowerCase()}_uv_strip.png`, 1);
                  }}
                  className="flex-1 py-1.5 rounded bg-[#202735] hover:bg-[#283245] text-[11px] font-mono text-white flex items-center justify-center gap-1 border border-[#354157] transition-colors"
                >
                  <Download size={12} />
                  <span>1x Strip</span>
                </button>
                <button
                  onClick={() => {
                    const frames = activeAnimation.frames.map((f) => f.uvData);
                    ImageExporter.exportSpritesheet(frames, activeAnimation.width, activeAnimation.height, `${activeAnimation.name.toLowerCase()}_uv_strip_8x.png`, 8);
                  }}
                  className="flex-1 py-1.5 rounded bg-[#13857f] hover:bg-[#18a29b] text-[11px] font-mono text-white flex items-center justify-center gap-1 transition-colors"
                >
                  <Download size={12} />
                  <span>8x Strip</span>
                </button>
              </div>
            </div>

            {/* Reference Map Texture */}
            <div className="bg-[#181d27] border border-[#2b3548] rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold text-white">Reference Map Template</span>
                  <span className="text-[10px] text-gray-400 font-mono">Template</span>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">
                  The high-contrast striped palette map for authoring new animations in Aseprite or Photoshop.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    ImageExporter.downloadImageData(mapData, textureWidth, textureHeight, 'astortion_map_template_32x32.png', 1);
                  }}
                  className="flex-1 py-1.5 rounded bg-[#202735] hover:bg-[#283245] text-[11px] font-mono text-white flex items-center justify-center gap-1 border border-[#354157] transition-colors"
                >
                  <Download size={12} />
                  <span>1x PNG</span>
                </button>
                <button
                  onClick={() => {
                    ImageExporter.downloadImageData(mapData, textureWidth, textureHeight, 'astortion_map_template_512.png', 16);
                  }}
                  className="flex-1 py-1.5 rounded bg-[#13857f] hover:bg-[#18a29b] text-[11px] font-mono text-white flex items-center justify-center gap-1 transition-colors"
                >
                  <Download size={12} />
                  <span>16x PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Game Engine Shaders & Integration Code */}
        <div className="bg-[#141820] border border-[#242c3b] rounded-xl p-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="font-mono text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Code2 size={16} className="text-[#26c6ba]" />
              Game Engine Shaders & Scripts
            </h3>

            {/* Engine Tabs */}
            <div className="flex items-center bg-[#101319] p-1 rounded-lg border border-[#212734]">
              {(['unity', 'godot', 'gamemaker'] as const).map((eng) => (
                <button
                  key={eng}
                  onClick={() => setSelectedEngine(eng)}
                  className={`px-3 py-1 rounded text-xs font-mono capitalize transition-all ${
                    selectedEngine === eng
                      ? 'bg-[#1e2533] text-[#26c6ba] font-bold border border-[#303c50]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {eng === 'gamemaker' ? 'GameMaker' : eng}
                </button>
              ))}
            </div>
          </div>

          {/* Engine Content */}
          {selectedEngine === 'unity' && (
            <div className="space-y-4">
              <div className="bg-[#101318] rounded-lg border border-[#232936] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-gray-300 font-semibold">
                    AstortionPixelArt.shader (Unity HLSL / ShaderLab)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(UNITY_SHADER, 'unity_shader')}
                      className="flex items-center gap-1 text-[11px] font-mono text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#191f2b] border border-[#2b3548]"
                    >
                      {copiedKey === 'unity_shader' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{copiedKey === 'unity_shader' ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => ImageExporter.downloadText(UNITY_SHADER, 'AstortionPixelArt.shader')}
                      className="flex items-center gap-1 text-[11px] font-mono text-[#26c6ba] hover:text-white px-2 py-0.5 rounded bg-[#191f2b] border border-[#2b3548]"
                    >
                      <Download size={11} />
                      <span>Download .shader</span>
                    </button>
                  </div>
                </div>
                <pre className="text-[11px] font-mono text-gray-300 bg-[#0d0f14] p-3 rounded overflow-x-auto max-h-60">
                  {UNITY_SHADER}
                </pre>
              </div>

              <div className="bg-[#101318] rounded-lg border border-[#232936] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-gray-300 font-semibold">
                    PixelArtImporter.cs (Unity C# AssetPostprocessor)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(UNITY_IMPORTER_CS, 'unity_cs')}
                      className="flex items-center gap-1 text-[11px] font-mono text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#191f2b] border border-[#2b3548]"
                    >
                      {copiedKey === 'unity_cs' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{copiedKey === 'unity_cs' ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => ImageExporter.downloadText(UNITY_IMPORTER_CS, 'PixelArtImporter.cs', 'text/plain')}
                      className="flex items-center gap-1 text-[11px] font-mono text-[#26c6ba] hover:text-white px-2 py-0.5 rounded bg-[#191f2b] border border-[#2b3548]"
                    >
                      <Download size={11} />
                      <span>Download .cs</span>
                    </button>
                  </div>
                </div>
                <pre className="text-[11px] font-mono text-gray-300 bg-[#0d0f14] p-3 rounded overflow-x-auto max-h-60">
                  {UNITY_IMPORTER_CS}
                </pre>
              </div>
            </div>
          )}

          {selectedEngine === 'godot' && (
            <div className="bg-[#101318] rounded-lg border border-[#232936] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-gray-300 font-semibold">
                  astortion_uv.gdshader (Godot 4 CanvasItem Shader)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(GODOT_SHADER, 'godot_shader')}
                    className="flex items-center gap-1 text-[11px] font-mono text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#191f2b] border border-[#2b3548]"
                  >
                    {copiedKey === 'godot_shader' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    <span>{copiedKey === 'godot_shader' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => ImageExporter.downloadText(GODOT_SHADER, 'astortion_uv.gdshader')}
                    className="flex items-center gap-1 text-[11px] font-mono text-[#26c6ba] hover:text-white px-2 py-0.5 rounded bg-[#191f2b] border border-[#2b3548]"
                  >
                    <Download size={11} />
                    <span>Download .gdshader</span>
                  </button>
                </div>
              </div>
              <pre className="text-[11px] font-mono text-gray-300 bg-[#0d0f14] p-3 rounded overflow-x-auto max-h-60">
                {GODOT_SHADER}
              </pre>
            </div>
          )}

          {selectedEngine === 'gamemaker' && (
            <div className="space-y-4">
              <div className="bg-[#101318] rounded-lg border border-[#232936] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-gray-300 font-semibold">
                    shd_rpaa.fsh (GameMaker Fragment Shader)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(GAMEMAKER_SHADER, 'gm_fsh')}
                      className="flex items-center gap-1 text-[11px] font-mono text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#191f2b] border border-[#2b3548]"
                    >
                      {copiedKey === 'gm_fsh' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{copiedKey === 'gm_fsh' ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => ImageExporter.downloadText(GAMEMAKER_SHADER, 'shd_rpaa.fsh')}
                      className="flex items-center gap-1 text-[11px] font-mono text-[#26c6ba] hover:text-white px-2 py-0.5 rounded bg-[#191f2b] border border-[#2b3548]"
                    >
                      <Download size={11} />
                      <span>Download .fsh</span>
                    </button>
                  </div>
                </div>
                <pre className="text-[11px] font-mono text-gray-300 bg-[#0d0f14] p-3 rounded overflow-x-auto max-h-60">
                  {GAMEMAKER_SHADER}
                </pre>
              </div>

              <div className="bg-[#101318] rounded-lg border border-[#232936] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-gray-300 font-semibold">
                    rpaa_draw.gml (GameMaker Script)
                  </span>
                  <button
                    onClick={() => copyToClipboard(GAMEMAKER_GML, 'gm_gml')}
                    className="flex items-center gap-1 text-[11px] font-mono text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#191f2b] border border-[#2b3548]"
                  >
                    {copiedKey === 'gm_gml' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    <span>{copiedKey === 'gm_gml' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-gray-300 bg-[#0d0f14] p-3 rounded overflow-x-auto max-h-60">
                  {GAMEMAKER_GML}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
