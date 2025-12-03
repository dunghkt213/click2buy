/**
 * useModals - Custom hook for modal states
 */

import { useState, useCallback } from 'react';
import { Product } from '../types/interface';

export function useModals() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [isStoreRegistrationOpen, setIsStoreRegistrationOpen] = useState(false);
  const [showAuthCallback, setShowAuthCallback] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const openCheckout = useCallback(() => setIsCheckoutOpen(true), []);
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);

  const openAuth = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  }, []);
  const closeAuth = useCallback(() => setIsAuthOpen(false), []);

  const openProductDetail = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  }, []);
  const closeProductDetail = useCallback(() => {
    setIsProductDetailOpen(false);
    setSelectedProduct(null);
  }, []);

  const openStoreRegistration = useCallback(() => setIsStoreRegistrationOpen(true), []);
  const closeStoreRegistration = useCallback(() => setIsStoreRegistrationOpen(false), []);

  const showAuthCallbackModal = useCallback(() => setShowAuthCallback(true), []);
  const hideAuthCallbackModal = useCallback(() => setShowAuthCallback(false), []);

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  return {
    isCheckoutOpen,
    isAuthOpen,
    isProductDetailOpen,
    isStoreRegistrationOpen,
    isSearchOpen,
    showAuthCallback,
    authTab,
    selectedProduct,
    searchQuery,
    setSearchQuery,
    openCheckout,
    closeCheckout,
    openAuth,
    closeAuth,
    openProductDetail,
    closeProductDetail,
    openStoreRegistration,
    closeStoreRegistration,
    showAuthCallbackModal,
    hideAuthCallbackModal,
    openSearch,
    closeSearch,
  };
}

