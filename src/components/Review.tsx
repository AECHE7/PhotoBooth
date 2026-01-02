import React, { useEffect, useState } from 'react';
import { type FilterType, filters } from '../utils/filters';
import { type LayoutType, stitchImages } from '../utils/stitcher';

interface ReviewProps {
  photos: string[];
  onRetake: () => void;
}

export const Review: React.FC<ReviewProps> = ({ photos, onRetake }) => {
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('strip');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('normal');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processImage = async () => {
      setIsProcessing(true);
      try {
        const result = await stitchImages(photos, selectedLayout, selectedFilter);
        setResultImage(result);
      } catch (error) {
        console.error("Error stitching images:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();
  }, [photos, selectedLayout, selectedFilter]);

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

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4 overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        {isProcessing || !resultImage ? (
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        ) : (
          <img
            src={resultImage}
            alt="Result"
            className="max-h-[60vh] max-w-full shadow-lg rounded-sm object-contain"
          />
        )}
      </div>

      <div className="mt-6 space-y-6">

        {/* Layout Selection */}
        <div>
          <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Layout</h3>
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

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-800">
          <button
            onClick={onRetake}
            className="flex-1 py-3 px-6 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold transition-all"
          >
            Retake
          </button>
          <button
            onClick={handleDownload}
            disabled={!resultImage}
            className="flex-1 py-3 px-6 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};
