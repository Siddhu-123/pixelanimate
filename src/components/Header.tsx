import React from 'react';
import { 
  Play, 
  Layers, 
  Paintbrush, 
  Cpu, 
  Download, 
  HelpCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { AnimationClip, PresetSkin } from '../types';

interface HeaderProps {
  activeTab: 'inspector' | 'editor' | 'pipeline' | 'exporter';
  setActiveTab: (tab: 'inspector' | 'editor' | 'pipeline' | 'exporter') => void;
  animations: AnimationClip[];
  activeAnimId: string;
  setActiveAnimId: (id: string) => void;
  presetSkins: PresetSkin[];
  activeSkinId: string;
  onSelectSkin: (skin: PresetSkin) => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  animations,
  activeAnimId,
  setActiveAnimId,
  presetSkins,
  activeSkinId,
  onSelectSkin,
  onOpenHelp,
}) => {
  return (
    <header className="h-14 bg-[#14171d] border-b border-[#262c36] px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Devlog Citation */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#13857f] to-[#00adb5] flex items-center justify-center shadow-md shadow-teal-950/50">
            <span className="font-pixel text-[10px] text-white font-bold tracking-tighter">PA</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5 font-mono">
                PIXEL<span className="text-[#26c6ba]">ANIMATE</span>
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1f2530] text-[#26c6ba] font-mono border border-[#2c3545]">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-gray-400 -mt-0.5">
              Pixel Art Animation. Reinvented <span className="text-gray-500">(Astortion by aarthificial)</span>
            </p>
          </div>
        </div>

        <a
          href="https://youtu.be/HsOKwUwL1bE"
          target="_blank"
          rel="noreferrer"
          className="ml-2 hidden lg:flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#26c6ba] transition-colors bg-[#1a1f28] hover:bg-[#202733] px-2 py-1 rounded border border-[#2a3240]"
          title="Watch original devlog by aarthificial"
        >
          <Play size={11} className="text-red-400 fill-red-400" />
          <span>Original Devlog</span>
          <ExternalLink size={10} className="text-gray-500 ml-0.5" />
        </a>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center bg-[#101318] p-1 rounded-lg border border-[#222834]">
        <button
          onClick={() => setActiveTab('inspector')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'inspector'
              ? 'bg-[#1e2532] text-white shadow-sm border border-[#333d4e]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers size={13} className={activeTab === 'inspector' ? 'text-[#26c6ba]' : ''} />
          <span>3-Panel Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'editor'
              ? 'bg-[#1e2532] text-white shadow-sm border border-[#333d4e]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Paintbrush size={13} className={activeTab === 'editor' ? 'text-[#26c6ba]' : ''} />
          <span>Skin Painter</span>
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'pipeline'
              ? 'bg-[#1e2532] text-white shadow-sm border border-[#333d4e]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Cpu size={13} className={activeTab === 'pipeline' ? 'text-[#26c6ba]' : ''} />
          <span>Asset Importer & Baker</span>
        </button>

        <button
          onClick={() => setActiveTab('exporter')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'exporter'
              ? 'bg-[#1e2532] text-white shadow-sm border border-[#333d4e]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Download size={13} className={activeTab === 'exporter' ? 'text-[#26c6ba]' : ''} />
          <span>Engine Shaders</span>
        </button>
      </div>

      {/* Animation & Skin Selectors */}
      <div className="flex items-center gap-2.5">
        {/* Animation Selector */}
        <div className="flex items-center gap-1.5 bg-[#171b22] px-2.5 py-1 rounded-md border border-[#27303f]">
          <span className="text-[11px] text-gray-400">Clip:</span>
          <select
            value={activeAnimId}
            onChange={(e) => setActiveAnimId(e.target.value)}
            aria-label="Active animation clip"
            className="bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer font-medium"
          >
            {animations.map((a) => (
              <option key={a.id} value={a.id} className="bg-[#171b22] text-white">
                {a.name} ({a.frames.length} cels)
              </option>
            ))}
          </select>
        </div>

        {/* Preset Skin Selector */}
        <div className="flex items-center gap-1.5 bg-[#171b22] px-2.5 py-1 rounded-md border border-[#27303f]">
          <Sparkles size={12} className="text-[#26c6ba]" />
          <span className="text-[11px] text-gray-400">Skin:</span>
          <select
            value={activeSkinId}
            onChange={(e) => {
              const skin = presetSkins.find((s) => s.id === e.target.value);
              if (skin) onSelectSkin(skin);
            }}
            aria-label="Active character skin preset"
            className="bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer font-medium max-w-[150px] truncate"
          >
            {presetSkins.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#171b22] text-white">
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          className="p-1.5 rounded-md text-gray-400 hover:text-white bg-[#1a1f28] hover:bg-[#232b38] border border-[#2b3444] transition-colors"
          title="Explain Astortion Concept & Workflow"
        >
          <HelpCircle size={15} />
        </button>
      </div>
    </header>
  );
};
