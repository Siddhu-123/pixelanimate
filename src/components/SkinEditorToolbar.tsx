import React from 'react';
import { 
  Pencil, 
  Eraser, 
  PaintBucket, 
  Pipette, 
  Minus, 
  Square, 
  SunMedium, 
  Moon, 
  Undo2, 
  Redo2,
  RotateCcw
} from 'lucide-react';
import { EditorTool } from '../types';
import { PALETTES, Palette } from '../data/palettes';

interface SkinEditorToolbarProps {
  activeTool: EditorTool;
  setActiveTool: (tool: EditorTool) => void;
  activeColor: string;
  setActiveColor: (color: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onResetSkin: () => void;
  selectedPalette: Palette;
  onSelectPalette: (pal: Palette) => void;
}

export const SkinEditorToolbar: React.FC<SkinEditorToolbarProps> = ({
  activeTool,
  setActiveTool,
  activeColor,
  setActiveColor,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onResetSkin,
  selectedPalette,
  onSelectPalette,
}) => {
  const tools: { id: EditorTool; name: string; icon: React.ReactNode }[] = [
    { id: 'pencil', name: 'Pencil (P)', icon: <Pencil size={15} /> },
    { id: 'eraser', name: 'Eraser (E)', icon: <Eraser size={15} /> },
    { id: 'bucket', name: 'Fill Bucket (B)', icon: <PaintBucket size={15} /> },
    { id: 'picker', name: 'Eyedropper (I)', icon: <Pipette size={15} /> },
    { id: 'line', name: 'Line Tool (L)', icon: <Minus size={15} /> },
    { id: 'rect', name: 'Rectangle (R)', icon: <Square size={15} /> },
    { id: 'shade_dark', name: 'Shade Darken', icon: <Moon size={15} /> },
    { id: 'shade_light', name: 'Shade Lighten', icon: <SunMedium size={15} /> },
  ];

  return (
    <div className="bg-[#12161f] border-b border-[#232936] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      {/* Drawing Tools */}
      <div className="flex items-center gap-1 bg-[#171c26] p-1 rounded-lg border border-[#273040]">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            className={`p-1.5 rounded transition-all flex items-center justify-center ${
              activeTool === t.id
                ? 'bg-[#26c6ba] text-black shadow-sm font-semibold'
                : 'text-gray-400 hover:text-white hover:bg-[#202735]'
            }`}
            title={t.name}
          >
            {t.icon}
          </button>
        ))}
      </div>

      {/* Color Swatch & Custom Hex Input */}
      <div className="flex items-center gap-2 bg-[#171c26] px-2.5 py-1 rounded-lg border border-[#273040]">
        <label className="relative cursor-pointer flex items-center">
          <input
            type="color"
            value={activeColor}
            onChange={(e) => setActiveColor(e.target.value)}
            className="sr-only"
          />
          <div
            className="w-6 h-6 rounded-md border border-white/20 shadow-sm cursor-pointer"
            style={{ backgroundColor: activeColor }}
            title="Click to open color picker"
          />
        </label>

        <input
          type="text"
          value={activeColor}
          onChange={(e) => setActiveColor(e.target.value)}
          aria-label="Hex color value"
          className="bg-transparent font-mono text-[11px] text-gray-200 w-16 uppercase focus:outline-none border-b border-gray-700 focus:border-[#26c6ba]"
        />
      </div>

      {/* Curated Color Palette */}
      <div className="flex items-center gap-2">
        <select
          value={selectedPalette.id}
          onChange={(e) => {
            const p = PALETTES.find((pal) => pal.id === e.target.value);
            if (p) onSelectPalette(p);
          }}
          aria-label="Palette selection"
          className="bg-[#171c26] border border-[#273040] rounded text-[11px] text-gray-300 px-2 py-1 focus:outline-none cursor-pointer"
        >
          {PALETTES.map((pal) => (
            <option key={pal.id} value={pal.id} className="bg-[#141820]">
              {pal.name}
            </option>
          ))}
        </select>

        {/* Palette Color Swatches */}
        <div className="flex items-center gap-1 max-w-[280px] overflow-x-auto py-1 scrollbar-none">
          {selectedPalette.colors.map((c, i) => (
            <button
              key={i}
              onClick={() => setActiveColor(c.hex)}
              style={{ backgroundColor: c.hex }}
              className={`w-5 h-5 rounded shrink-0 border transition-all ${
                activeColor.toLowerCase() === c.hex.toLowerCase()
                  ? 'border-white scale-110 shadow-md ring-1 ring-white/50'
                  : 'border-black/30 hover:scale-105'
              }`}
              title={`${c.name} (${c.hex})`}
            />
          ))}
        </div>
      </div>

      {/* Undo, Redo, Reset */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded text-gray-400 hover:text-white disabled:opacity-30 hover:bg-[#1e2533] transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={15} />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded text-gray-400 hover:text-white disabled:opacity-30 hover:bg-[#1e2533] transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={15} />
        </button>

        <button
          onClick={onResetSkin}
          className="p-1.5 rounded text-gray-400 hover:text-rose-400 hover:bg-[#1e2533] transition-colors ml-1"
          title="Reset Skin to Default"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  );
};
