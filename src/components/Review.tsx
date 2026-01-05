import React, { useEffect, useState } from 'react';
import { type FilterType, filters } from '../utils/filters';
import { type LayoutType, stitchImages } from '../utils/stitcher';
import { QRCodeSVG } from 'qrcode.react';
import Draggable from 'react-draggable';
import { stickers, type StickerInstance, drawStickers, loadStickerImages } from '../utils/stickers';
import { applyCartoonFilter } from '../utils/aiFilters';
import { sounds } from '../utils/sound';

interface ReviewProps {
  photos: string[];
  onRetake: () => void;
}

const AI_STYLES = [
  { id: 'cyberpunk', name: 'Cyberpunk' },
  { id: 'anime', name: 'Anime' },
  { id: 'oil-painting', name: 'Oil Painting' },
  { id: 'retro', name: 'Retro' },
  { id: 'pixar', name: '3D Character' },
];

const FRAME_PRESETS = [
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Pink', value: '#ffb7b2' },
    { name: 'Neon', value: '#ccff00' },
    { name: 'Blue', value: '#a6e3e9' },
];

export const Review: React.FC<ReviewProps> = ({ photos, onRetake }) => {
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('strip');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('normal');
  const [frameColor, setFrameColor] = useState<string>('#ffffff');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [baseResultImage, setBaseResultImage] = useState<string | null>(null); // Before AI
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCartoon, setIsCartoon] = useState(false);

  // Server-side AI
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Decoration State
  const [activeStickers, setActiveStickers] = useState<StickerInstance[]>([]);

  // 1. Base Processing (Stitch + Filters + Client-side Cartoon)
  // NOTE: Stickers are now overlayed in the DOM for interaction,
  // and only burned in during final save/download!
  useEffect(() => {
    const processImage = async () => {
      setIsProcessing(true);
      try {
        let result = await stitchImages(photos, selectedLayout, selectedFilter, frameColor);

        // Apply effects (Cartoon only here, stickers are separate now until save)
        if (isCartoon) {
            const canvas = document.createElement('canvas');
            const img = new Image();
            img.src = result;
            await new Promise((resolve) => { img.onload = resolve; });
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                applyCartoonFilter(ctx, canvas.width, canvas.height);
                result = canvas.toDataURL('image/png');
            }
        }

        setBaseResultImage(result);
        setResultImage(result);
        // Do NOT reset stickers here, they should persist across frame changes
        setSavedUrl(null);
      } catch (error) {
        console.error("Error stitching images:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();
  }, [photos, selectedLayout, selectedFilter, frameColor, isCartoon]);

  const handleAiGenerate = async (style: string) => {
      if (!baseResultImage) return;
      setIsGeneratingAi(true);
      try {
          const response = await fetch('/api/ai/transform', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: baseResultImage, style })
          });

          if (response.ok) {
              const data = await response.json();
              setResultImage(data.image);
          } else {
              alert('AI Generation Failed');
          }
      } catch (e) {
          console.error("AI Error", e);
          alert('AI Generation Error');
      } finally {
          setIsGeneratingAi(false);
      }
  };

  const addSticker = (content: string, type: 'emoji' | 'image' = 'emoji') => {
      sounds.playBeep(600, 0.05);
      // Add random position near center
      const newSticker: StickerInstance = {
          id: Date.now(),
          type,
          content,
          x: 100 + Math.random() * 50, // Initial DOM position
          y: 100 + Math.random() * 50,
          scale: type === 'image' ? 1.0 : 2.0
      };
      setActiveStickers([...activeStickers, newSticker]);
  };

  const updateStickerPosition = (id: number, x: number, y: number) => {
      setActiveStickers(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
  };

  const removeSticker = (id: number) => {
      setActiveStickers(prev => prev.filter(s => s.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (event) => {
              if (event.target?.result) {
                  addSticker(event.target.result as string, 'image');
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const clearStickers = () => {
      setActiveStickers([]);
  };

  // Helper to burn stickers into the image for saving/downloading
  const getFinalImageWithStickers = async () => {
      if (!resultImage) return null;
      if (activeStickers.length === 0) return resultImage;

      const canvas = document.createElement('canvas');
      const img = new Image();
      img.src = resultImage;
      await new Promise((resolve) => { img.onload = resolve; });

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(img, 0, 0);

      // We need to map DOM coordinates to Canvas coordinates.
      // The image is displayed with `object-contain` in a container.
      // This is tricky because the DOM coordinates are relative to the draggable container,
      // but the canvas is the full resolution image.

      // Simplification for MVP:
      // We assume the user placed stickers relative to the displayed image size.
      // But obtaining the exact displayed size of the image is hard in React without refs.

      // ALTERNATIVE APPROACH:
      // Since `react-draggable` uses pixel values, we can try to use a fixed container size
      // for the preview that matches the aspect ratio?

      // BETTER APPROACH:
      // Just burn them based on their relative position if we can normalize it?
      // Or, let's keep it simple: Render the stickers onto the canvas based on a fixed coordinate system?
      // No, `react-draggable` gives pixels.

      // Let's rely on the `activeStickers` x/y which are updated via `onStop`.
      // We need to know the scale factor between the DOM preview and the real image.

      const previewImg = document.getElementById('preview-image') as HTMLImageElement;
      if (previewImg) {
          const rect = previewImg.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;

          // Load sticker images
          const imageMap = await loadStickerImages(activeStickers);

          // Draw each sticker
          activeStickers.forEach(sticker => {
              // Adjust coordinates based on the preview image's position relative to the container?
              // The draggable container should overlay the image exactly.

              // If the Draggable container is the parent of the image, X/Y are relative to that.

              const finalX = sticker.x * scaleX;
              const finalY = sticker.y * scaleY;

              // Draw
              ctx.save();
              ctx.translate(finalX, finalY);
              // Scale sticker?
              // The sticker in DOM has a font-size or width.
              // Emoji font size usually ~24px or 2rem (32px).
              // Image width usually 100px.
              const domScale = sticker.scale; // internal scale logic

              if (sticker.type === 'emoji') {
                  // Emojis in DOM are roughly 30px?
                  const fontSize = 40 * domScale * scaleX; // Approximation
                  ctx.font = `${fontSize}px serif`;
                  ctx.fillText(sticker.content, 0, fontSize); // Baseline correction
              } else {
                  const sImg = imageMap[sticker.content];
                  if (sImg) {
                      const w = 100 * domScale * scaleX;
                      const h = (100 * (sImg.height / sImg.width)) * domScale * scaleY;
                      ctx.drawImage(sImg, 0, 0, w, h);
                  }
              }
              ctx.restore();
          });
      }

      return canvas.toDataURL('image/png');
  };

  const handleDownload = async () => {
    const finalImage = await getFinalImageWithStickers();
    if (finalImage) {
      const link = document.createElement('a');
      link.href = finalImage;
      link.download = `photo-booth-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSaveToGallery = async () => {
    const finalImage = await getFinalImageWithStickers();
    if (!finalImage) return;

    setIsSaving(true);
    try {
        const response = await fetch('/api/photos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: finalImage })
        });

        if (response.ok) {
            const data = await response.json();
            // Construct the full URL for the QR code
            // We need the accessible IP, which we can get from window.location
            const fullUrl = `${window.location.origin}${data.url}`;
            setSavedUrl(fullUrl);
            alert('Photo saved to gallery!');
        } else {
            console.error('Failed to save');
            alert('Failed to save photo.');
        }
    } catch (error) {
        console.error('Save error', error);
        alert('Error saving photo.');
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4 overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-6 relative">
        {isProcessing || !resultImage ? (
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        ) : (
          <div className="flex flex-col items-center gap-4 relative w-full h-full max-w-lg mx-auto">

              {/* Image Container with Drag Area */}
              <div className="relative inline-block w-full" style={{ touchAction: 'none' }}>
                <img
                    id="preview-image"
                    src={resultImage}
                    alt="Result"
                    className="w-full h-auto shadow-lg rounded-sm block select-none pointer-events-none"
                    style={{ maxHeight: '60vh', objectFit: 'contain' }}
                />

                {/* Loading Overlay */}
                {isGeneratingAi && (
                    <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center rounded-sm">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-2"></div>
                            <p className="text-white font-bold">Dreaming...</p>
                        </div>
                    </div>
                )}

                {/* Draggable Stickers Overlay */}
                <div className="absolute inset-0 overflow-hidden">
                    {activeStickers.map((sticker) => (
                        <Draggable
                            key={sticker.id}
                            defaultPosition={{ x: sticker.x, y: sticker.y }}
                            onStop={(_e, data) => updateStickerPosition(sticker.id, data.x, data.y)}
                            bounds="parent"
                        >
                            <div className="absolute cursor-move hover:scale-110 transition-transform active:cursor-grabbing group">
                                {sticker.type === 'emoji' ? (
                                    <div style={{ fontSize: '2.5rem', lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                        {sticker.content}
                                    </div>
                                ) : (
                                    <img
                                        src={sticker.content}
                                        alt="sticker"
                                        className="w-24 h-auto drop-shadow-md"
                                        draggable={false}
                                    />
                                )}
                                {/* Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent drag start
                                        // Use touchEnd for mobile? Draggable handles this mostly.
                                        removeSticker(sticker.id);
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    onTouchEnd={() => removeSticker(sticker.id)}
                                >
                                    ×
                                </button>
                            </div>
                        </Draggable>
                    ))}
                </div>
              </div>

              {savedUrl && (
                  <div className="bg-white p-2 rounded-lg shadow-lg flex flex-col items-center animate-in fade-in zoom-in duration-300">
                      <QRCodeSVG value={savedUrl} size={128} />
                      <p className="text-black text-xs mt-1 font-bold">Scan to Download</p>
                  </div>
              )}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-6">

        {/* Layout Selection */}
        <div>
          <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Layout</h3>
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-2">
                {(['strip', 'grid'] as LayoutType[]).map((layout) => (
                <button
                    key={layout}
                    onClick={() => setSelectedLayout(layout)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedLayout === layout
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                    {layout === 'strip' ? 'Strip' : '2x2 Grid'}
                </button>
                ))}
            </div>

            {/* Frame Color Picker */}
            <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-lg">
                <span className="text-xs text-gray-400 pl-2">Frame:</span>
                {FRAME_PRESETS.map(preset => (
                    <button
                        key={preset.name}
                        onClick={() => setFrameColor(preset.value)}
                        className={`w-6 h-6 rounded-full border-2 ${frameColor === preset.value ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-110'} transition-transform`}
                        style={{ backgroundColor: preset.value }}
                        title={preset.name}
                    />
                ))}
                <div className="w-px h-6 bg-gray-600 mx-1"></div>
                <input
                    type="color"
                    value={frameColor}
                    onChange={(e) => setFrameColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                    title="Custom Color"
                />
            </div>
          </div>
        </div>

        {/* Filter Selection */}
        <div>
          <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Filter</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {(Object.keys(filters) as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* AI Features */}
        <div>
            <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">AI Magic</h3>
            <div className="flex flex-col gap-3">
                {/* Client-side Toggle */}
                <button
                    onClick={() => setIsCartoon(!isCartoon)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors border w-fit ${
                        isCartoon
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-transparent border-purple-500 text-purple-400 hover:bg-purple-900/30'
                    }`}
                >
                    {isCartoon ? '✨ Client Cartoon (Instant)' : '✨ Client Cartoon'}
                </button>

                {/* Server-side Styles */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {AI_STYLES.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => handleAiGenerate(style.id)}
                            disabled={isGeneratingAi}
                            className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-pink-500 to-violet-600 text-white hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                        >
                            {isGeneratingAi ? 'Generating...' : `🤖 ${style.name}`}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Stickers Selection */}
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm uppercase tracking-wider text-gray-400">Decorate</h3>
                {activeStickers.length > 0 && (
                    <button onClick={clearStickers} className="text-xs text-red-400 hover:text-red-300">Clear</button>
                )}
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide items-center">
                {stickers.map((emoji) => (
                    <button
                        key={emoji}
                        onClick={() => addSticker(emoji)}
                        className="text-2xl hover:scale-125 transition-transform p-2 bg-gray-800 rounded-lg"
                    >
                        {emoji}
                    </button>
                ))}

                {/* Upload Face */}
                <label className="cursor-pointer text-sm bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-1 whitespace-nowrap">
                    <span>📷 Add Face</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
            </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-800 flex-wrap">
          <button
            onClick={onRetake}
            className="flex-1 py-3 px-6 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold transition-all whitespace-nowrap"
          >
            Retake
          </button>
          <button
             onClick={handleSaveToGallery}
             disabled={!resultImage || isSaving}
             className="flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
             {isSaving ? 'Saving...' : 'Save & Get QR'}
          </button>
          <button
            onClick={handleDownload}
            disabled={!resultImage}
            className="flex-1 py-3 px-6 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};
