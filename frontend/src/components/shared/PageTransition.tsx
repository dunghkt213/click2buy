/**
 * PageTransition Component
 * Provides smooth page transition animations
 */

import { motion } from 'framer-motion';
import React from 'react';

const motionEase = [0.4, 0, 0.2, 1] as const;

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -24 }}
    transition={{ duration: 0.35, ease: motionEase }}
  >
    {children}
  </motion.div>
);

