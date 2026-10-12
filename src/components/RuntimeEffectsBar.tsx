import React, { useEffect, useState } from 'react';
import { 
  Droplets, 
  Sparkles, 
  Moon, 
  Footprints,
  RotateCcw,
  Zap
} from 'lucide-react';
import { RuntimeEffects } from '../types';

interface RuntimeEffectsBarProps {
  effects: RuntimeEffects;
  onChangeEffects: (effects: RuntimeEffects) => void;
  onResetEffects: () => void;
}

export const RuntimeEffectsBar: React.FC<RuntimeEffectsBarProps> = ({
  effects,
  onChangeEffects,
  onResetEffects,
}) => {
  const [isWashing, setIsWashing] = useState(false);
  const [isMudRunning, setIsMudRunning] = useState(false);

  // Washing animation loop
  useEffect(() => {
    if (!isWashing) return;
    const interval = setInterval(() => {
      onChangeEffects({
        ...effects,
        dirtAmount: Math.max(0, effects.dirtAmount - 4),
      });
      if (effects.dirtAmount <= 0) {
        setIsWashing(false);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isWashing, effects, onChangeEffects]);

  // Mud accumulation loop
  useEffect(() => {
    if (!isMudRunning) return;
    const interval = setInterval(() => {
      onChangeEffects({
        ...effects,
        dirtAmount: Math.min(100, effects.dirtAmount + 5),
      });
      if (effects.dirtAmount >= 95) {
        setIsMudRunning(false);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [isMudRunning, effects, onChangeEffects]);

  return (
    <div className="bg-[#151921] border-b border-[#242b38] px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs select-none">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-300 flex items-center gap-1">
          <Zap size={13} className="text-[#26c6ba]" />
          Runtime Modifiers:
        </span>
        <span className="text-[11px] text-gray-500 hidden md:inline">
          (As showcased in Astortion devlog)
        </span>
      </div>

      {/* Toggles Group */}
      <div className="flex items-center gap-2">
        {/* AST-1 Device Toggle */}
        <button
          onClick={() => onChangeEffects({ ...effects, ast1Equipped: !effects.ast1Equipped })}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all ${
            effects.ast1Equipped
              ? 'bg-[#1e2e38] border-[#00adb5] text-white shadow-sm'
              : 'bg-[#181c24] border-[#293242] text-gray-400 hover:text-gray-200'
          }`}
          title="Equip or unequip AST-1 gravity distortion arm device"
        >
          <div className={`w-2 h-2 rounded-full ${effects.ast1Equipped ? 'bg-[#00adb5] animate-pulse' : 'bg-gray-600'}`} />
          <span className="font-mono text-[11px]">AST-1 Arm Device</span>
        </button>

        {/* 3D Asymmetric Hairpin Toggle */}
        <button
          onClick={() => onChangeEffects({ ...effects, asymmetricHairpin: !effects.asymmetricHairpin })}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all ${
            effects.asymmetricHairpin
              ? 'bg-[#1e2e38] border-[#00adb5] text-white shadow-sm'
              : 'bg-[#181c24] border-[#293242] text-gray-400 hover:text-gray-200'
          }`}
          title="Toggle hairpin accessory (visible from specific angles)"
        >
          <Sparkles size={11} className={effects.asymmetricHairpin ? 'text-[#00adb5]' : 'text-gray-500'} />
          <span className="font-mono text-[11px]">3D Angle Hairpin</span>
        </button>

        {/* Face Shadow Toggle */}
        <button
          onClick={() => onChangeEffects({ ...effects, faceShadow: !effects.faceShadow })}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all ${
            effects.faceShadow
              ? 'bg-[#272133] border-[#9b59b6] text-white shadow-sm'
              : 'bg-[#181c24] border-[#293242] text-gray-400 hover:text-gray-200'
          }`}
          title="Toggle dramatic face and chin shadow"
        >
          <Moon size={11} className={effects.faceShadow ? 'text-[#9b59b6]' : 'text-gray-500'} />
          <span className="font-mono text-[11px]">Face Shadow</span>
        </button>
      </div>

      {/* Dynamic Mud and Water Simulation */}
      <div className="flex items-center gap-2 bg-[#12151b] px-2.5 py-1 rounded border border-[#232936]">
        <Footprints size={12} className="text-[#a07855]" />
        <span className="text-[11px] text-gray-400">Mud Dirt:</span>
        <input
          type="range"
          min="0"
          max="100"
          value={effects.dirtAmount}
          onChange={(e) => onChangeEffects({ ...effects, dirtAmount: Number(e.target.value) })}
          aria-label="Mud and dirt intensity"
          className="w-20 accent-[#a07855] cursor-pointer"
        />
        <span className="font-mono text-[11px] text-gray-300 w-8">
          {effects.dirtAmount}%
        </span>

        {/* Run Through Mud Action */}
        <button
          onClick={() => {
            setIsWashing(false);
            setIsMudRunning(true);
          }}
          disabled={isMudRunning || effects.dirtAmount >= 100}
          className="px-2 py-0.5 rounded bg-[#2a221b] hover:bg-[#382d24] text-[#d4a373] text-[10px] font-mono border border-[#4a3a2d] transition-colors disabled:opacity-40"
          title="Simulate character running through wet mud"
        >
          Run In Mud
        </button>

        {/* Wash With Water Action */}
        <button
          onClick={() => {
            setIsMudRunning(false);
            setIsWashing(true);
          }}
          disabled={isWashing || effects.dirtAmount <= 0}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#172530] hover:bg-[#1d3242] text-[#48cae4] text-[10px] font-mono border border-[#234255] transition-colors disabled:opacity-40"
          title="Simulate water or rain washing mud off the character"
        >
          <Droplets size={10} />
          <span>Wash Clean</span>
        </button>
      </div>

      {/* Reset all button */}
      <button
        onClick={onResetEffects}
        className="p-1 rounded text-gray-500 hover:text-gray-300 transition-colors"
        title="Reset All Modifiers"
      >
        <RotateCcw size={13} />
      </button>
    </div>
  );
};
