/**
 * Format price to Vietnamese currency
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (originalPrice: number, currentPrice: number): number => {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Format date to Vietnamese format
 */
export const formatDate = (dateString: string): string => {
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
export const formatRelativeTime = (time: string): string => {
  // This is a simple implementation - you can enhance it
  return time;
};

/**
 * Generate ticket ID
 */
export const generateTicketId = (count: number): string => {
  return `TK${String(count + 1).padStart(3, '0')}`;
};