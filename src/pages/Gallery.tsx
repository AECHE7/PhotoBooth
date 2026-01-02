import React, { useEffect, useState } from 'react';
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
        <div className="flex-1 overflow-y-auto bg-gray-900 p-4">
            <div className="flex justify-between items-center mb-6">
                <Link to="/" className="text-white bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    ← Back to Booth
                </Link>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Gallery</h2>
                <div className="w-[100px]"></div> {/* Spacer */}
            </div>

            {loading ? (
                <div className="flex justify-center mt-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
            ) : photos.length === 0 ? (
                <div className="text-center mt-20 text-gray-400">
                    <p>No photos yet. Go take some!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map(photo => (
                        <div key={photo.id} className="relative group aspect-[2/3] overflow-hidden rounded-lg bg-black">
                            <img
                                src={photo.url}
                                alt={`Photo ${photo.id}`}
                                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <a
                                    href={photo.url}
                                    download
                                    className="text-white border border-white px-4 py-1 rounded-full hover:bg-white hover:text-black transition-colors text-sm"
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
