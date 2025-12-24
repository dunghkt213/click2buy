/**
 * usePageNavigation - Custom hook for page navigation state
 */
import { useState, useCallback } from 'react';
export function usePageNavigation() {
    const [currentPage, setCurrentPage] = useState('home');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigateToHome = useCallback(() => {
        setCurrentPage('home');
        setIsSearchOpen(false);
        setSearchQuery('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
    const navigateToCart = useCallback(() => {
        setCurrentPage('cart');
        setIsSearchOpen(false);
    }, []);
    const navigateToOrders = useCallback(() => {
        setCurrentPage('orders');
        setIsSearchOpen(false);
    }, []);
    const navigateToMyStore = useCallback(() => {
        setCurrentPage('my-store');
        setIsSearchOpen(false);
    }, []);
    const navigateToSearch = useCallback((query) => {
        if (query) {
            setSearchQuery(query);
        }
        setIsSearchOpen(true);
        setCurrentPage('search');
    }, []);
    const closeSearch = useCallback(() => {
        setIsSearchOpen(false);
        setSearchQuery('');
        if (currentPage === 'search') {
            setCurrentPage('home');
        }
    }, [currentPage]);
    return {
        currentPage,
        isSearchOpen,
        searchQuery,
        setCurrentPage,
        setIsSearchOpen,
        setSearchQuery,
        navigateToHome,
        navigateToCart,
        navigateToOrders,
        navigateToMyStore,
        navigateToSearch,
        closeSearch,
    };
}
