import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_ANIMATIONS, 
  DEFAULT_MAP_DATA, 
  ALICE_DEFAULT_LOOKUP, 
  PRESET_SKINS, 
  TEXTURE_WIDTH, 
  TEXTURE_HEIGHT 
} from './data/defaultAliceData';
import { AnimationClip, BackgroundStyle, PixelHoverInfo, PresetSkin, RuntimeEffects } from './types';
import { EffectsEngine } from './engine/EffectsEngine';
import { Header } from './components/Header';
import { PlaybackControls } from './components/PlaybackControls';
import { RuntimeEffectsBar } from './components/RuntimeEffectsBar';
import { ThreePanelView } from './components/ThreePanelView';
import { SkinEditorView } from './components/SkinEditorView';
import { PipelineView } from './components/PipelineView';
import { ExporterView } from './components/ExporterView';
import { HelpModal } from './components/HelpModal';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'inspector' | 'editor' | 'pipeline' | 'exporter'>('inspector');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Animations & Playback
  const [animations, setAnimations] = useState<AnimationClip[]>(DEFAULT_ANIMATIONS);
  const [activeAnimId, setActiveAnimId] = useState<string>(DEFAULT_ANIMATIONS[0].id);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [fps, setFps] = useState(DEFAULT_ANIMATIONS[0].fps);
  const [isLooping, setIsLooping] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [zoom, setZoom] = useState(8);
  const [showGrid, setShowGrid] = useState(true);
  const [bgStyle, setBgStyle] = useState<BackgroundStyle>('checker');

  // Skins & Lookup Texture
  const [presetSkins] = useState<PresetSkin[]>(PRESET_SKINS);
  const [activeSkinId, setActiveSkinId] = useState<string>(PRESET_SKINS[0].id);
  const [baseLookupData, setBaseLookupData] = useState<Uint8ClampedArray>(new Uint8ClampedArray(ALICE_DEFAULT_LOOKUP));
  const [effectiveLookupData, setEffectiveLookupData] = useState<Uint8ClampedArray>(new Uint8ClampedArray(ALICE_DEFAULT_LOOKUP));

  // Runtime Modifiers
  const [runtimeEffects, setRuntimeEffects] = useState<RuntimeEffects>({
    ast1Equipped: true,
    faceShadow: false,
    asymmetricHairpin: false,
    dirtAmount: 0,
    waterWashSpeed: 0,
    lightAngleDeg: 45,
  });

  // Cross-Inspector Hover State
  const [hoverInfo, setHoverInfo] = useState<PixelHoverInfo | null>(null);

  const activeAnimation = animations.find((a) => a.id === activeAnimId) || animations[0];

  // Update effective lookup texture when base lookup or runtime modifiers change
  useEffect(() => {
    const updated = EffectsEngine.applyEquipment(
      baseLookupData,
      TEXTURE_WIDTH,
      runtimeEffects.ast1Equipped,
      runtimeEffects.asymmetricHairpin,
      runtimeEffects.faceShadow
    );
    setEffectiveLookupData(updated);
  }, [baseLookupData, runtimeEffects.ast1Equipped, runtimeEffects.asymmetricHairpin, runtimeEffects.faceShadow]);

  // Sync animation FPS when switching clips
  useEffect(() => {
    setFps(activeAnimation.fps);
    setCurrentFrameIndex(0);
  }, [activeAnimation]);

  // Animation Playback Loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(16, 1000 / fps);
    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => {
        if (prev + 1 >= activeAnimation.frames.length) {
          return isLooping ? 0 : prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, fps, isLooping, activeAnimation.frames.length]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentFrameIndex((prev) => (prev > 0 ? prev - 1 : activeAnimation.frames.length - 1));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentFrameIndex((prev) => (prev + 1 < activeAnimation.frames.length ? prev + 1 : 0));
      } else if (e.key === '1') {
        setActiveTab('inspector');
      } else if (e.key === '2') {
        setActiveTab('editor');
      } else if (e.key === '3') {
        setActiveTab('pipeline');
      } else if (e.key === '4') {
        setActiveTab('exporter');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeAnimation.frames.length]);

  // Select Preset Skin
  const handleSelectSkin = (skin: PresetSkin) => {
    setActiveSkinId(skin.id);
    setBaseLookupData(new Uint8ClampedArray(skin.data));
    if (skin.id === 'alice_pre_ast1') {
      setRuntimeEffects((prev) => ({ ...prev, ast1Equipped: false }));
    } else if (skin.id === 'alice_classic') {
      setRuntimeEffects((prev) => ({ ...prev, ast1Equipped: true }));
    }
  };

  // Direct paint from 3-Panel view
  const handlePaintFromLookup = (x: number, y: number) => {
    const updated = new Uint8ClampedArray(baseLookupData);
    const idx = (y * TEXTURE_WIDTH + x) * 4;
    updated[idx] = 255;
    updated[idx + 1] = 220;
    updated[idx + 2] = 50;
    updated[idx + 3] = 255;
    setBaseLookupData(updated);
  };

  // Apply baked frames from Asset Importer
  const handleApplyBakedFrames = (newUvFrames: Uint8ClampedArray[]) => {
    setAnimations((prev) =>
      prev.map((anim) => {
        if (anim.id === activeAnimId) {
          const updatedFrames = anim.frames.map((f, i) => ({
            ...f,
            uvData: newUvFrames[i] || f.uvData,
          }));
          return { ...anim, frames: updatedFrames };
        }
        return anim;
      })
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0d1015] text-gray-100 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        animations={animations}
        activeAnimId={activeAnimId}
        setActiveAnimId={setActiveAnimId}
        presetSkins={presetSkins}
        activeSkinId={activeSkinId}
        onSelectSkin={handleSelectSkin}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Runtime Modifiers Bar */}
      <RuntimeEffectsBar
        effects={runtimeEffects}
        onChangeEffects={setRuntimeEffects}
        onResetEffects={() => {
          setRuntimeEffects({
            ast1Equipped: true,
            faceShadow: false,
            asymmetricHairpin: false,
            dirtAmount: 0,
            waterWashSpeed: 0,
            lightAngleDeg: 45,
          });
        }}
      />

      {/* Main View Area based on Tab */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {activeTab === 'inspector' && (
          <ThreePanelView
            activeAnimation={activeAnimation}
            currentFrameIndex={currentFrameIndex}
            lookupData={effectiveLookupData}
            textureWidth={TEXTURE_WIDTH}
            textureHeight={TEXTURE_HEIGHT}
            zoom={zoom}
            showGrid={showGrid}
            bgStyle={bgStyle}
            isFlipped={isFlipped}
            dirtAmount={runtimeEffects.dirtAmount}
            faceShadow={runtimeEffects.faceShadow}
            hoverInfo={hoverInfo}
            setHoverInfo={setHoverInfo}
            onPaintPixel={handlePaintFromLookup}
          />
        )}

        {activeTab === 'editor' && (
          <SkinEditorView
            activeAnimation={activeAnimation}
            currentFrameIndex={currentFrameIndex}
            lookupData={baseLookupData}
            textureWidth={TEXTURE_WIDTH}
            textureHeight={TEXTURE_HEIGHT}
            onUpdateLookup={setBaseLookupData}
            bgStyle={bgStyle}
            dirtAmount={runtimeEffects.dirtAmount}
            faceShadow={runtimeEffects.faceShadow}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineView
            activeAnimation={activeAnimation}
            mapData={DEFAULT_MAP_DATA}
            textureWidth={TEXTURE_WIDTH}
            textureHeight={TEXTURE_HEIGHT}
            onApplyBakedFrames={handleApplyBakedFrames}
          />
        )}

        {activeTab === 'exporter' && (
          <ExporterView
            activeAnimation={activeAnimation}
            currentLookupData={effectiveLookupData}
            mapData={DEFAULT_MAP_DATA}
            textureWidth={TEXTURE_WIDTH}
            textureHeight={TEXTURE_HEIGHT}
          />
        )}
      </main>

      {/* Bottom Transport Controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        currentFrameIndex={currentFrameIndex}
        totalFrames={activeAnimation.frames.length}
        onPrevFrame={() => {
          setIsPlaying(false);
          setCurrentFrameIndex((prev) => (prev > 0 ? prev - 1 : activeAnimation.frames.length - 1));
        }}
        onNextFrame={() => {
          setIsPlaying(false);
          setCurrentFrameIndex((prev) => (prev + 1 < activeAnimation.frames.length ? prev + 1 : 0));
        }}
        onSelectFrame={(idx) => {
          setIsPlaying(false);
          setCurrentFrameIndex(idx);
        }}
        fps={fps}
        onChangeFps={setFps}
        isLooping={isLooping}
        onToggleLoop={() => setIsLooping(!isLooping)}
        isFlipped={isFlipped}
        onToggleFlip={() => setIsFlipped(!isFlipped)}
        zoom={zoom}
        onChangeZoom={setZoom}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        bgStyle={bgStyle}
        onChangeBgStyle={setBgStyle}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

export default App;
