/**
 * RevealSection Component
 * Provides scroll-triggered reveal animations
 */

import { motion, useInView } from 'framer-motion';
import React, { useRef } from 'react';

interface RevealSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const RevealSection = ({
  children,
  delay = 0,
  className,
}: RevealSectionProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, transition: { duration: 0.5, delay } }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
};

