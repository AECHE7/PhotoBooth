import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownProps {
  count: number;
}

export const Countdown: React.FC<CountdownProps> = ({ count }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-9xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
        >
          {count}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
