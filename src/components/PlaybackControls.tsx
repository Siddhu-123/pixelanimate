import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  FlipHorizontal, 
  ZoomIn, 
  ZoomOut,
  Grid
} from 'lucide-react';
import { BackgroundStyle } from '../types';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentFrameIndex: number;
  totalFrames: number;
  onPrevFrame: () => void;
  onNextFrame: () => void;
  onSelectFrame: (idx: number) => void;
  fps: number;
  onChangeFps: (fps: number) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  isFlipped: boolean;
  onToggleFlip: () => void;
  zoom: number;
  onChangeZoom: (zoom: number) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  bgStyle: BackgroundStyle;
  onChangeBgStyle: (bg: BackgroundStyle) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onTogglePlay,
  currentFrameIndex,
  totalFrames,
  onPrevFrame,
  onNextFrame,
  onSelectFrame,
  fps,
  onChangeFps,
  isLooping,
  onToggleLoop,
  isFlipped,
  onToggleFlip,
  zoom,
  onChangeZoom,
  showGrid,
  onToggleGrid,
  bgStyle,
  onChangeBgStyle,
}) => {
  return (
    <div className="h-12 bg-[#12151b] border-t border-[#222732] px-4 flex items-center justify-between gap-4 select-none shrink-0 text-xs">
      {/* Playback Transport Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevFrame}
          className="p-1.5 rounded hover:bg-[#1f2633] text-gray-300 hover:text-white transition-colors"
          title="Previous Cel (Left Arrow)"
        >
          <SkipBack size={15} />
        </button>

        <button
          onClick={onTogglePlay}
          className="px-3 py-1.5 rounded-md bg-[#13857f] hover:bg-[#18a29b] text-white font-medium flex items-center gap-1.5 shadow-sm transition-all"
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? <Pause size={14} className="fill-white" /> : <Play size={14} className="fill-white" />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>

        <button
          onClick={onNextFrame}
          className="p-1.5 rounded hover:bg-[#1f2633] text-gray-300 hover:text-white transition-colors"
          title="Next Cel (Right Arrow)"
        >
          <SkipForward size={15} />
        </button>

        <button
          onClick={onToggleLoop}
          className={`p-1.5 rounded transition-colors ${
            isLooping ? 'text-[#26c6ba] bg-[#1a252e]' : 'text-gray-400 hover:bg-[#1f2633]'
          }`}
          title="Toggle Looping"
        >
          <Repeat size={15} />
        </button>

        {/* Frame scrubber pills */}
        <div className="flex items-center gap-1 ml-2 bg-[#171b24] p-1 rounded-md border border-[#232936]">
          {Array.from({ length: totalFrames }).map((_, i) => (
            <button
              key={i}
              onClick={() => onSelectFrame(i)}
              className={`w-6 h-6 rounded text-[10px] font-mono font-semibold transition-all ${
                currentFrameIndex === i
                  ? 'bg-[#26c6ba] text-black shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#202735]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <span className="text-gray-500 font-mono text-[11px] ml-1">
          {currentFrameIndex + 1}/{totalFrames}
        </span>
      </div>

      {/* FPS Slider & Presets */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-[11px]">Speed:</span>
        <input
          type="range"
          min="1"
          max="60"
          value={fps}
          onChange={(e) => onChangeFps(Number(e.target.value))}
          aria-label="Animation playback speed"
          className="w-20 accent-[#26c6ba] cursor-pointer"
        />
        <span className="font-mono text-white text-[11px] w-12 text-right">
          {fps} fps
        </span>

        <div className="flex items-center gap-1 ml-1">
          {[8, 12, 24].map((rate) => (
            <button
              key={rate}
              onClick={() => onChangeFps(rate)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                fps === rate
                  ? 'bg-[#1e2736] text-[#26c6ba] border border-[#2f3d54]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {rate}
            </button>
          ))}
        </div>
      </div>

      {/* Viewport View Controls: Zoom, Grid, Flip, Background */}
      <div className="flex items-center gap-2.5">
        {/* Flip Horizontal */}
        <button
          onClick={onToggleFlip}
          className={`p-1.5 rounded transition-colors ${
            isFlipped ? 'text-[#26c6ba] bg-[#1a252e]' : 'text-gray-400 hover:bg-[#1f2633]'
          }`}
          title="Flip Horizontal (Mirror View)"
        >
          <FlipHorizontal size={15} />
        </button>

        {/* Pixel Grid Toggle */}
        <button
          onClick={onToggleGrid}
          className={`p-1.5 rounded transition-colors ${
            showGrid ? 'text-[#26c6ba] bg-[#1a252e]' : 'text-gray-400 hover:bg-[#1f2633]'
          }`}
          title="Toggle Pixel Grid"
        >
          <Grid size={15} />
        </button>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-[#171b24] px-1.5 py-0.5 rounded border border-[#232936]">
          <button
            onClick={() => onChangeZoom(Math.max(1, zoom - 1))}
            className="text-gray-400 hover:text-white p-0.5"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="text-[11px] font-mono text-gray-300 w-8 text-center">
            {zoom}x
          </span>
          <button
            onClick={() => onChangeZoom(Math.min(24, zoom + 1))}
            className="text-gray-400 hover:text-white p-0.5"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
        </div>

        {/* Background Style Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 text-[11px]">BG:</span>
          <select
            value={bgStyle}
            onChange={(e) => onChangeBgStyle(e.target.value as BackgroundStyle)}
            aria-label="Viewport background style"
            className="bg-[#171b24] border border-[#27303f] rounded text-[11px] text-gray-300 px-1.5 py-1 focus:outline-none cursor-pointer"
          >
            <option value="checker">Checkerboard</option>
            <option value="astortion_teal">Astortion Teal</option>
            <option value="dark">Studio Dark</option>
            <option value="white">Clean White</option>
            <option value="green_screen">Green Screen</option>
          </select>
        </div>
      </div>
    </div>
  );
};
