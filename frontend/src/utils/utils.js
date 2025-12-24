/**
 * Format price to Vietnamese currency
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(price);
};
/**
 * Calculate discount percentage
 */
export const calculateDiscount = (originalPrice, currentPrice) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};
/**
 * Format date to Vietnamese format
 */
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
};
/**
 * Format relative time
 */
export const formatRelativeTime = (time) => {
    // This is a simple implementation - you can enhance it
    return time;
};
/**
 * Generate ticket ID
 */
export const generateTicketId = (count) => {
    return `TK${String(count + 1).padStart(3, '0')}`;
};
/**
 * Utility function to merge class names
 */
export function cn(...inputs) {
    return inputs.filter(Boolean).join(' ');
}
