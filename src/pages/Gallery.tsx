import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbox } from '../components/Lightbox';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { PageTransition } from '../components/PageTransition';
import { motion } from 'framer-motion';

interface Photo {
    id: number;
    url: string;
    createdAt: string;
}

export function Gallery() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const nextPhoto = () => setLightboxIndex(prev => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
    const prevPhoto = () => setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));

    return (
        <PageTransition>
        <div className="flex-1 overflow-y-auto bg-gray-900 p-4 h-full">
            <div className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm py-2">
                <Link to="/">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-white bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                        ← Back
                    </motion.div>
                </Link>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Gallery</h2>
                <div className="w-[100px]"></div> {/* Spacer */}
            </div>

            {loading ? (
                <SkeletonLoader />
            ) : photos.length === 0 ? (
                <div className="text-center mt-20 text-gray-400 flex flex-col items-center">
                    <p className="text-xl mb-4">No photos yet.</p>
                    <Link to="/" className="text-blue-400 hover:text-blue-300 underline">Go take some!</Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                    {photos.map((photo, index) => (
                        <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative group cursor-pointer"
                            onClick={() => openLightbox(index)}
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
                        </motion.div>
                    ))}
                </div>
            )}

            <Lightbox
                isOpen={lightboxIndex !== null}
                imageSrc={lightboxIndex !== null ? photos[lightboxIndex].url : null}
                onClose={closeLightbox}
                onNext={nextPhoto}
                onPrev={prevPhoto}
            />
        </div>
        </PageTransition>
    );
}
