import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShoppingCart } from 'lucide-react';

export interface FlyingIconConfig {
  id: string;
  type: 'heart' | 'cart';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface FlyingIconProps {
  icons: FlyingIconConfig[];
  onComplete: (id: string) => void;
}

export function FlyingIcon({ icons, onComplete }: FlyingIconProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {icons.map((icon) => (
          <motion.div
            key={icon.id}
            initial={{
              x: icon.startX,
              y: icon.startY,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: icon.endX,
              y: icon.endY,
              scale: 0.3,
              opacity: 0.8,
            }}
            exit={{
              scale: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.8,
              ease: [0.34, 1.56, 0.64, 1], // Bouncy easing
            }}
            onAnimationComplete={() => onComplete(icon.id)}
            className="absolute"
          >
            <div className="relative">
              {icon.type === 'heart' ? (
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white fill-current" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              )}
              {/* Particle effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  background: icon.type === 'heart' 
                    ? 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0) 70%)'
                    : 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 70%)',
                }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
