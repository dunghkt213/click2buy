/**
 * useFlyingIcons - Custom hook for flying icons animation
 */

import { useState, useCallback, useRef } from 'react';
import { FlyingIconConfig } from '../components/animation/FlyingIcon';

export function useFlyingIcons() {
  const [flyingIcons, setFlyingIcons] = useState<FlyingIconConfig[]>([]);
  const cartIconRef = useRef<HTMLButtonElement>(null);

  const triggerFlyingIcon = useCallback((type: 'cart', element: HTMLElement) => {
    if (!cartIconRef.current) return;
    
    const startRect = element.getBoundingClientRect();
    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;
    
    const endRect = cartIconRef.current.getBoundingClientRect();
    const endX = endRect.left + endRect.width / 2;
    const endY = endRect.top + endRect.height / 2;
    
    const newIcon: FlyingIconConfig = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type: 'cart',
      startX,
      startY,
      endX,
      endY,
    };
    
    setFlyingIcons(prev => [...prev, newIcon]);
  }, []);

  const handleAnimationComplete = useCallback((id: string) => {
    setFlyingIcons(prev => prev.filter(icon => icon.id !== id));
  }, []);

  return {
    flyingIcons,
    cartIconRef,
    triggerFlyingIcon,
    handleAnimationComplete,
  };
}

