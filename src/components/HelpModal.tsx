import React from 'react';
import { X, ExternalLink, Play, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#141822] border border-[#273245] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#232c3d] flex items-center justify-between bg-[#11141c]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#13857f] flex items-center justify-center text-white font-bold text-xs">
              PA
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-white">
                HOW IT WORKS: PIXEL ART ANIMATION. REINVENTED
              </h2>
              <p className="text-[11px] text-gray-400">
                Technical concept breakdown from aarthificial's Astortion Devlog
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-[#1f2636] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-300 font-sans leading-relaxed">
          {/* Section 1 */}
          <div>
            <h3 className="font-mono text-xs font-bold text-[#26c6ba] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles size={14} />
              The Core UV Mapping Concept
            </h3>
            <p className="text-gray-400">
              In traditional 2D animation, changing a character's clothing, equipment, or lighting requires redrawing every cel of every animation.
              In 3D animation, this problem is solved by separating the <strong>mesh/skin</strong> from the <strong>bones/motion</strong>.
            </p>
            <p className="text-gray-400 mt-2">
              This system achieves that exact separation in pure 2D pixel art: each pixel in an animation cel stores <strong className="text-white">UV coordinates</strong> instead of color:
            </p>
            <ul className="mt-2 space-y-1 font-mono text-[11px] bg-[#0e1117] p-3 rounded-lg border border-[#222a3a]">
              <li><strong className="text-rose-400">Red Channel:</strong> U coordinate ($X$ position on the Lookup Skin texture)</li>
              <li><strong className="text-emerald-400">Green Channel:</strong> V coordinate ($Y$ position on the Lookup Skin texture)</li>
              <li><strong className="text-blue-400">Alpha Channel:</strong> Cel visibility (transparent vs solid)</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="font-mono text-xs font-bold text-[#26c6ba] uppercase tracking-wider mb-1.5">
              The Striped Map & Asset Importer Pipeline
            </h3>
            <p className="text-gray-400">
              Because UV coordinate values for small sprites are very low (e.g. $0..31$), raw UV frames look nearly pitch black and are impossible to animate visually.
              To solve this:
            </p>
            <ol className="mt-2 space-y-1.5 list-decimal list-inside text-gray-400">
              <li>An intermediate <strong className="text-white">Map</strong> texture is created where each coordinate has a unique, high-contrast, striped color (e.g. violet stripe = knee).</li>
              <li>The animator colors the character frames using these high-contrast Map colors.</li>
              <li>The <strong className="text-white">Asset Importer</strong> correlates each pixel color against the Map to bake the final UV source sprites.</li>
            </ol>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="font-mono text-xs font-bold text-[#26c6ba] uppercase tracking-wider mb-1.5">
              Runtime Gameplay Effects
            </h3>
            <p className="text-gray-400">
              Because the Lookup Texture is sampled in real-time by the shader:
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-[#181d28] p-2.5 rounded border border-[#273245]">
                <strong className="text-white block mb-0.5">Dynamic Mud & Water</strong>
                Running through mud spatters dirt on clothing; water/rain cleans it off dynamically.
              </div>
              <div className="bg-[#181d28] p-2.5 rounded border border-[#273245]">
                <strong className="text-white block mb-0.5">3D Unwrapped Angles</strong>
                Accessories like hairpins placed on one side of the head naturally disappear from opposing viewing angles.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#232c3d] bg-[#11141c] flex items-center justify-between">
          <a
            href="https://youtu.be/HsOKwUwL1bE"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#26c6ba] transition-colors"
          >
            <Play size={13} className="text-red-400 fill-red-400" />
            <span>Watch Original Devlog on YouTube</span>
            <ExternalLink size={12} className="text-gray-500" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1e2636] hover:bg-[#273246] text-white font-mono text-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
