import React, { useEffect, useState } from 'react';
import { type FilterType, filters } from '../utils/filters';
import { type LayoutType, stitchImages } from '../utils/stitcher';
import { QRCodeSVG } from 'qrcode.react';
import { stickers, type StickerInstance, drawStickers, loadStickerImages } from '../utils/stickers';
import { applyCartoonFilter } from '../utils/aiFilters';

interface ReviewProps {
  photos: string[];
  onRetake: () => void;
}

export const Review: React.FC<ReviewProps> = ({ photos, onRetake }) => {
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('strip');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('normal');
  const [frameColor, setFrameColor] = useState<string>('#ffffff');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCartoon, setIsCartoon] = useState(false);

  // Decoration State
  const [activeStickers, setActiveStickers] = useState<StickerInstance[]>([]);

  useEffect(() => {
    const processImage = async () => {
      setIsProcessing(true);
      try {
        let result = await stitchImages(photos, selectedLayout, selectedFilter, frameColor);

        // Apply effects (Cartoon + Stickers)
        if (activeStickers.length > 0 || isCartoon) {
            const canvas = document.createElement('canvas');
            const img = new Image();
            img.src = result;
            await new Promise((resolve) => { img.onload = resolve; });
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);

                if (isCartoon) {
                    applyCartoonFilter(ctx, canvas.width, canvas.height);
                }

                if (activeStickers.length > 0) {
                    const imageMap = await loadStickerImages(activeStickers);
                    drawStickers(ctx, activeStickers, imageMap);
                }

                result = canvas.toDataURL('image/png');
            }
        }

        setResultImage(result);
        setSavedUrl(null); // Reset saved URL when image changes
      } catch (error) {
        console.error("Error stitching images:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();
  }, [photos, selectedLayout, selectedFilter, activeStickers, frameColor, isCartoon]);

  const addSticker = (content: string, type: 'emoji' | 'image' = 'emoji') => {
      // Add random position near center
      const newSticker: StickerInstance = {
          id: Date.now(),
          type,
          content,
          x: 200 + Math.random() * 100,
          y: 300 + Math.random() * 100,
          scale: type === 'image' ? 1.0 : 2.0
      };
      setActiveStickers([...activeStickers, newSticker]);
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

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `photo-booth-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSaveToGallery = async () => {
    if (!resultImage) return;

    setIsSaving(true);
    try {
        const response = await fetch('/api/photos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: resultImage })
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
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-6">
        {isProcessing || !resultImage ? (
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        ) : (
          <div className="flex flex-col items-center gap-4">
              <img
                src={resultImage}
                alt="Result"
                className="max-h-[50vh] max-w-full shadow-lg rounded-sm object-contain"
              />
              {savedUrl && (
                  <div className="bg-white p-2 rounded-lg shadow-lg flex flex-col items-center">
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
                <input
                    type="color"
                    value={frameColor} // This state needs to be added back!
                    onChange={(e) => setFrameColor(e.target.value)} // This setter needs to be added back!
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
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
            <button
                onClick={() => setIsCartoon(!isCartoon)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors border ${
                    isCartoon
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-transparent border-purple-500 text-purple-400 hover:bg-purple-900/30'
                }`}
            >
                {isCartoon ? '✨ Cartoon On' : '✨ Apply Cartoon'}
            </button>
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
