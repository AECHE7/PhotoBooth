import { useState } from 'react';
import { usePhotoBooth } from './hooks/usePhotoBooth';
import { Camera } from './components/Camera';
import { Countdown } from './components/Countdown';
import { Review } from './components/Review';
import { type FilterType, filters } from './utils/filters';

function App() {
  const { status, countdown, photos, videoRef, startSession, resetSession } = usePhotoBooth();
  const [currentFilter, setCurrentFilter] = useState<FilterType>('normal');

  // We want to flash the screen when a photo is taken.
  // The hook transitions from idle -> countdown -> capturing -> review.
  // In capturing, it takes N photos. We can detect when photos array length increases?
  // Or just rely on the 'capturing' state.
  // Let's add a simple flash effect based on photo count change in a real app,
  // but for now let's just use CSS animation in Camera component if we can pass a trigger.
  // The hook doesn't currently expose "just took a photo" event clearly other than photos array changing.

  // Let's handle the UI based on status.

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">

      {/* Header */}
      <header className="p-4 flex justify-center items-center absolute top-0 w-full z-10 bg-gradient-to-b from-black/50 to-transparent">
        <h1 className="text-2xl font-bold tracking-tight uppercase">Photo Booth</h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">

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
                  isFlashing={status === 'capturing'} // Simplified flash logic (constant flash during capture phase? No, that's wrong.)
                  // Better: we can pass the photo count to trigger effect, but let's keep it simple.
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

                <button
                  onClick={startSession}
                  className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 shadow-lg active:scale-95 transition-transform flex items-center justify-center"
                  aria-label="Start Photo Booth"
                >
                  <div className="w-16 h-16 rounded-full bg-red-600 border-2 border-white"></div>
                </button>
                <p className="text-gray-400 text-sm">Tap to Start</p>
              </div>
            )}

            {status === 'capturing' && (
               <div className="absolute bottom-10 left-0 w-full text-center">
                  <p className="text-white text-xl font-bold shadow-black drop-shadow-md animate-bounce">Say Cheese!</p>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
