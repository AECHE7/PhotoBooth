import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Photo {
    id: number;
    url: string;
    createdAt: string;
}

export function Gallery() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/photos')
            .then(res => res.json())
            .then(data => {
                setPhotos(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load photos", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="flex-1 overflow-y-auto bg-gray-900 p-4 h-full">
            <div className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm py-2">
                <Link to="/">
                    <div
                        className="text-white bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                        ← Home
                    </div>
                </Link>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Gallery</h2>
                <div className="w-[100px]"></div> {/* Spacer */}
            </div>

            {loading ? (
                <div className="flex justify-center mt-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
            ) : photos.length === 0 ? (
                <div className="text-center mt-20 text-gray-400 flex flex-col items-center">
                    <p className="text-xl mb-4">No photos yet.</p>
                    <Link to="/" className="text-blue-400 hover:text-blue-300 underline">Go take some!</Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                    {photos.map((photo) => (
                        <div
                            key={photo.id}
                            className="relative group cursor-pointer"
                        >
                            {/* Film Strip Effect */}
                            <div className="bg-white p-2 pb-8 shadow-md transform transition-transform duration-300 group-hover:rotate-1 group-hover:scale-105">
                                <div className="aspect-[2/3] overflow-hidden bg-black border border-gray-200">
                                    <img
                                        src={photo.url}
                                        alt={`Photo ${photo.id}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="mt-2 flex justify-between items-end opacity-50 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                        {new Date(photo.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                    href={photo.url}
                                    download
                                    className="bg-black/50 text-white px-4 py-2 rounded-full hover:bg-black/80 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Download
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
