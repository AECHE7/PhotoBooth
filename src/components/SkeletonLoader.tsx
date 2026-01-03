import React from 'react';

export const SkeletonLoader = () => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer" />
                </div>
            ))}
        </div>
    );
};
