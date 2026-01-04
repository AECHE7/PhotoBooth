import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Booth } from './pages/Booth';
import { Gallery } from './pages/Gallery';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            {/* Header */}
            <header className="p-4 flex justify-center items-center absolute top-0 w-full z-10 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
            <h1 className="text-2xl font-bold tracking-tight uppercase drop-shadow-md">Photo Booth</h1>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative h-screen">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/booth" element={<Booth />} />
                    <Route path="/gallery" element={<Gallery />} />
                </Routes>
            </main>
        </div>
        </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
