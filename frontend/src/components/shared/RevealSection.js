import { jsx as _jsx } from "react/jsx-runtime";
/**
 * RevealSection Component
 * Provides scroll-triggered reveal animations
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
export const RevealSection = ({ children, delay = 0, className, }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    return (_jsx(motion.div, { ref: ref, className: className, initial: { opacity: 0, y: 32 }, animate: isInView
            ? { opacity: 1, y: 0, transition: { duration: 0.5, delay } }
            : undefined, children: children }));
};
