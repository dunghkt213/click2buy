import { useState } from 'react';
export const useWishlist = (initialItems = []) => {
    const [wishlistItems, setWishlistItems] = useState(initialItems);
    const addToWishlist = (product) => {
        setWishlistItems(prev => {
            const exists = prev.find(item => item.id === product.id);
            if (!exists) {
                return [...prev, product];
            }
            return prev;
        });
    };
    const removeFromWishlist = (productId) => {
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
    };
    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.id === productId);
    };
    const toggleWishlist = (product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        }
        else {
            addToWishlist(product);
        }
    };
    const clearWishlist = () => {
        setWishlistItems([]);
    };
    return {
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        clearWishlist
    };
};
