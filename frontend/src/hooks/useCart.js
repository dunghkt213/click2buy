import { useState } from 'react';
export const useCart = (initialItems = []) => {
    const [cartItems, setCartItems] = useState(initialItems);
    const addToCart = (product) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.id === product.id);
            if (existingItem) {
                return prev.map(item => item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item);
            }
            return [...prev, { ...product, quantity: 1, selected: true }];
        });
    };
    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item.id !== productId));
    };
    const updateQuantity = (productId, quantity) => {
        if (quantity === 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
    };
    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };
    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };
    const getSelectedTotalPrice = () => {
        return cartItems
            .filter(item => item.selected)
            .reduce((total, item) => total + item.price * item.quantity, 0);
    };
    const getSelectedItems = () => {
        return cartItems.filter(item => item.selected);
    };
    const toggleSelectItem = (productId) => {
        setCartItems(prev => prev.map(item => item.id === productId ? { ...item, selected: !item.selected } : item));
    };
    const selectAllItems = () => {
        setCartItems(prev => prev.map(item => ({ ...item, selected: true })));
    };
    const deselectAllItems = () => {
        setCartItems(prev => prev.map(item => ({ ...item, selected: false })));
    };
    const clearCart = () => {
        setCartItems([]);
    };
    return {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        getTotalPrice,
        getSelectedTotalPrice,
        getSelectedItems,
        toggleSelectItem,
        selectAllItems,
        deselectAllItems,
        clearCart
    };
};
