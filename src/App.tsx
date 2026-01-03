import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Booth } from './pages/Booth';
import { Gallery } from './pages/Gallery';
import { AnimatePresence } from 'framer-motion';

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Booth />} />
                <Route path="/gallery" element={<Gallery />} />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white flex flex-col font-sans">
        {/* Header */}
        <header className="p-4 flex justify-center items-center absolute top-0 w-full z-10 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
          <h1 className="text-2xl font-bold tracking-tight uppercase drop-shadow-md">Photo Booth</h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative h-screen">
            <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
