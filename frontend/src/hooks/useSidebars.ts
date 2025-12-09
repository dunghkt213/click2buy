/**
 * useSidebars - Custom hook for sidebar states
 */

import { useState, useCallback } from 'react';

export function useSidebars() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isPromotionOpen, setIsPromotionOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const openFilter = useCallback(() => setIsFilterOpen(true), []);
  const closeFilter = useCallback(() => setIsFilterOpen(false), []);

  const openNotification = useCallback(() => setIsNotificationOpen(true), []);
  const closeNotification = useCallback(() => setIsNotificationOpen(false), []);

  const openPromotion = useCallback(() => setIsPromotionOpen(true), []);
  const closePromotion = useCallback(() => setIsPromotionOpen(false), []);

  const openSupport = useCallback(() => setIsSupportOpen(true), []);
  const closeSupport = useCallback(() => setIsSupportOpen(false), []);

  return {
    isCartOpen,
    isFilterOpen,
    isNotificationOpen,
    isPromotionOpen,
    isSupportOpen,
    openCart,
    closeCart,
    openFilter,
    closeFilter,
    openNotification,
    closeNotification,
    openPromotion,
    closePromotion,
    openSupport,
    closeSupport,
  };
}

