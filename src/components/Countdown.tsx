import React from 'react';

interface CountdownProps {
  count: number;
}

export const Countdown: React.FC<CountdownProps> = ({ count }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="text-9xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] animate-pulse">
        {count}
      </div>
    </div>
  );
};
