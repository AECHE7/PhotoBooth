import { useState, useRef, useCallback } from 'react';

export type PhotoBoothStatus = 'idle' | 'countdown' | 'capturing' | 'review';

interface UsePhotoBoothProps {
  countdownTime?: number;
  photoCount?: number;
  intervalTime?: number; // Time between photos in ms
}

export const usePhotoBooth = ({
  countdownTime = 3,
  photoCount = 4,
  intervalTime = 1000
}: UsePhotoBoothProps = {}) => {
  const [status, setStatus] = useState<PhotoBoothStatus>('idle');
  const [countdown, setCountdown] = useState(countdownTime);
  const [photos, setPhotos] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startSession = useCallback(() => {
    setPhotos([]);
    setStatus('countdown');
    setCountdown(countdownTime);

    let currentCount = countdownTime;
    const timer = setInterval(() => {
      currentCount -= 1;
      setCountdown(currentCount);
      if (currentCount === 0) {
        clearInterval(timer);
        setStatus('capturing');
        captureSequence();
      }
    }, 1000);
  }, [countdownTime]);

  const captureSequence = useCallback(async () => {
    const newPhotos: string[] = [];

    for (let i = 0; i < photoCount; i++) {
        // Small delay before each shot to allow for flash or "get ready" feel
        // And also the interval between shots
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, intervalTime));
        }

        const photo = takePhoto();
        if (photo) {
            newPhotos.push(photo);
            setPhotos(prev => [...prev, photo]);
        }
    }

    setStatus('review');
  }, [photoCount, intervalTime]);


  const takePhoto = useCallback((): string | null => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Flip horizontally if using user-facing camera (usually desired for mirrors)
    // For now we assume we want to capture exactly what is shown on screen
    // If the video element is mirrored via CSS, we might want to mirror here too.
    // Let's assume CSS mirroring is visual only, but users expect the photo to match.
    // We will handle mirroring in the component CSS, but typically for the saved photo
    // people want the "non-mirrored" (true) version, or the mirrored one?
    // Photo booths usually mirror the preview, but the print is true.
    // However, for digital self-portraits, people often prefer the mirrored look.
    // Let's stick to raw capture for now.

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/png');
  }, []);

  const resetSession = useCallback(() => {
    setStatus('idle');
    setPhotos([]);
    setCountdown(countdownTime);
  }, [countdownTime]);

  return {
    status,
    countdown,
    photos,
    videoRef,
    startSession,
    resetSession
  };
};
