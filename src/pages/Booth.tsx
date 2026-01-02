import { useState } from 'react';
import { usePhotoBooth } from '../hooks/usePhotoBooth';
import { Camera } from '../components/Camera';
import { Countdown } from '../components/Countdown';
import { Review } from '../components/Review';
import { type FilterType, filters } from '../utils/filters';
import { Link } from 'react-router-dom';

export function Booth() {
  const { status, countdown, photos, videoRef, startSession, resetSession } = usePhotoBooth();
  const [currentFilter, setCurrentFilter] = useState<FilterType>('normal');

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">

        {status === 'review' ? (
          <Review photos={photos} onRetake={resetSession} />
        ) : (
          <div className="relative w-full h-full flex flex-col">
            <div className="flex-1 relative overflow-hidden">
                <Camera
                  onRef={(ref) => {
                      // @ts-ignore - assigning to ref object
                      videoRef.current = ref
                  }}
                  filter={currentFilter}
                  isFlashing={status === 'capturing'}
                />

                {status === 'countdown' && (
                  <Countdown count={countdown} />
                )}
            </div>

            {/* Controls */}
            {status === 'idle' && (
              <div className="p-6 bg-black flex flex-col gap-4 items-center justify-center">
                {/* Filter Selector (Live Preview) */}
                <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
                    <div className="flex gap-4 px-4 justify-center">
                        {(Object.keys(filters) as FilterType[]).map(f => (
                            <button
                                key={f}
                                onClick={() => setCurrentFilter(f)}
                                className={`flex flex-col items-center gap-2 group`}
                            >
                                <div className={`w-16 h-16 rounded-full border-2 overflow-hidden ${currentFilter === f ? 'border-blue-500' : 'border-gray-600 group-hover:border-gray-400'}`}>
                                    <div
                                        className="w-full h-full bg-gray-200"
                                        style={{
                                            filter: filters[f],
                                            background: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)'
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-gray-400 capitalize">{f}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <Link to="/gallery" className="text-white bg-gray-800 px-4 py-2 rounded-full font-medium hover:bg-gray-700 transition-colors">
                        View Gallery
                    </Link>

                    <button
                    onClick={startSession}
                    className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 shadow-lg active:scale-95 transition-transform flex items-center justify-center"
                    aria-label="Start Photo Booth"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-600 border-2 border-white"></div>
                    </button>

                    {/* Spacer for centering */}
                    <div className="w-[115px]"></div>
                </div>
                <p className="text-gray-400 text-sm mt-2">Tap to Start</p>
              </div>
            )}

            {status === 'capturing' && (
               <div className="absolute bottom-10 left-0 w-full text-center">
                  <p className="text-white text-xl font-bold shadow-black drop-shadow-md animate-bounce">Say Cheese!</p>
               </div>
            )}
          </div>
        )}
    </div>
  );
}
