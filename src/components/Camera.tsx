import React, { useEffect, useState } from 'react';
import { type FilterType, filters } from '../utils/filters';

interface CameraProps {
  onRef: (ref: HTMLVideoElement | null) => void;
  filter: FilterType;
  isFlashing?: boolean;
}

export const Camera: React.FC<CameraProps> = ({ onRef, filter, isFlashing }) => {
  const [error, setError] = useState<string>('');

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
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-xl shadow-2xl">
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
            {isFlashing && (
                <div className="absolute inset-0 bg-white animate-flash pointer-events-none opacity-0" />
            )}
        </>
      )}
    </div>
  );
};
