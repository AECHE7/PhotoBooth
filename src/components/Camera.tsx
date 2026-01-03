import React, { useEffect, useState } from 'react';
import { type FilterType, filters } from '../utils/filters';

interface CameraProps {
  onRef: (ref: HTMLVideoElement | null) => void;
  filter: FilterType;
  isFlashing?: boolean;
}

export const Camera: React.FC<CameraProps> = ({ onRef, filter, isFlashing }) => {
  const [error, setError] = useState<string>('');
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user', // Default to front camera
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        const videoElement = document.querySelector('video');
        if (videoElement) {
          videoElement.srcObject = stream;
          onRef(videoElement);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError('Could not access camera. Please allow camera permissions.');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onRef]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-xl shadow-2xl group">
      {error ? (
        <div className="text-white p-4 text-center">
          <p>{error}</p>
        </div>
      ) : (
        <>
            <video
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]" // Mirror the video
                style={{ filter: filters[filter] }}
            />

            {/* Grid Overlay */}
            {showGrid && (
                <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3 opacity-50">
                    <div className="border-r border-b border-white/50"></div>
                    <div className="border-r border-b border-white/50"></div>
                    <div className="border-b border-white/50"></div>
                    <div className="border-r border-b border-white/50"></div>
                    <div className="border-r border-b border-white/50"></div>
                    <div className="border-b border-white/50"></div>
                    <div className="border-r border-white/50"></div>
                    <div className="border-r border-white/50"></div>
                    <div></div>
                </div>
            )}

            {/* Grid Toggle Button */}
            <button
                onClick={() => setShowGrid(!showGrid)}
                className="absolute top-4 right-4 z-20 bg-black/50 p-2 rounded-full text-white/70 hover:text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                title="Toggle Grid"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
            </button>

            {isFlashing && (
                <div className="absolute inset-0 bg-white animate-flash pointer-events-none opacity-0" />
            )}
        </>
      )}
    </div>
  );
};
