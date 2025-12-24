/**
 * useFlyingIcons - Custom hook for flying icons animation
 */
import { useState, useCallback, useRef } from 'react';
export function useFlyingIcons() {
    const [flyingIcons, setFlyingIcons] = useState([]);
    const cartIconRef = useRef(null);
    const triggerFlyingIcon = useCallback((type, element) => {
        if (!cartIconRef.current)
            return;
        const startRect = element.getBoundingClientRect();
        const startX = startRect.left + startRect.width / 2;
        const startY = startRect.top + startRect.height / 2;
        const endRect = cartIconRef.current.getBoundingClientRect();
        const endX = endRect.left + endRect.width / 2;
        const endY = endRect.top + endRect.height / 2;
        const newIcon = {
            id: `${type}-${Date.now()}-${Math.random()}`,
            type: 'cart',
            startX,
            startY,
            endX,
            endY,
        };
        setFlyingIcons(prev => [...prev, newIcon]);
    }, []);
    const handleAnimationComplete = useCallback((id) => {
        setFlyingIcons(prev => prev.filter(icon => icon.id !== id));
    }, []);
    return {
        flyingIcons,
        cartIconRef,
        triggerFlyingIcon,
        handleAnimationComplete,
    };
}
