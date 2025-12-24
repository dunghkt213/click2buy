import { jsx as _jsx } from "react/jsx-runtime";
/**
 * PageTransition Component
 * Provides smooth page transition animations
 */
import { motion } from 'framer-motion';
const motionEase = [0.4, 0, 0.2, 1];
export const PageTransition = ({ children }) => (_jsx(motion.div, { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -24 }, transition: { duration: 0.35, ease: motionEase }, children: children }));
