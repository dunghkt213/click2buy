import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
export function FlyingIcon({ icons, onComplete }) {
    return (_jsx("div", { className: "fixed inset-0 pointer-events-none z-[9999]", children: _jsx(AnimatePresence, { children: icons.map((icon) => (_jsx(motion.div, { initial: {
                    x: icon.startX,
                    y: icon.startY,
                    scale: 1,
                    opacity: 1,
                }, animate: {
                    x: icon.endX,
                    y: icon.endY,
                    scale: 0.3,
                    opacity: 0.8,
                }, exit: {
                    scale: 0,
                    opacity: 0,
                }, transition: {
                    duration: 0.8,
                    ease: [0.34, 1.56, 0.64, 1], // Bouncy easing
                }, onAnimationComplete: () => onComplete(icon.id), className: "absolute", children: _jsxs("div", { className: "relative", children: [icon.type === 'heart' ? (_jsx("div", { className: "w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg", children: _jsx(Heart, { className: "w-6 h-6 text-white fill-current" }) })) : (_jsx("div", { className: "w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg", children: _jsx(ShoppingCart, { className: "w-6 h-6 text-white" }) })), _jsx(motion.div, { className: "absolute inset-0 rounded-full", initial: { scale: 1, opacity: 0.5 }, animate: { scale: 2, opacity: 0 }, transition: { duration: 0.5 }, style: {
                                background: icon.type === 'heart'
                                    ? 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0) 70%)'
                                    : 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 70%)',
                            } })] }) }, icon.id))) }) }));
}
