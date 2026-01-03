import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface LightboxProps {
    isOpen: boolean;
    imageSrc: string | null;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ isOpen, imageSrc, onClose, onNext, onPrev }) => {
    return (
        <AnimatePresence>
            {isOpen && imageSrc && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative max-w-full max-h-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={imageSrc}
                            alt="Full screen"
                            className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl"
                        />

                        <button
                            onClick={onClose}
                            className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
                        >
                            <X size={32} />
                        </button>

                        <a
                            href={imageSrc}
                            download
                            className="absolute -top-12 left-0 p-2 text-white/70 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <Download size={24} />
                            <span className="text-sm font-medium">Download</span>
                        </a>

                        {/* Navigation */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onPrev(); }}
                            className="absolute top-1/2 -left-16 transform -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
                        >
                            <ChevronLeft size={32} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onNext(); }}
                            className="absolute top-1/2 -right-16 transform -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
                        >
                            <ChevronRight size={32} />
                        </button>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
