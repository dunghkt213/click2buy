// Debug: Check if environment variable is loaded
console.log('Raw VITE_API_BASE_URL from env:', import.meta.env.VITE_API_BASE_URL);

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:3000';

// Debug: Log the final API_BASE_URL value
console.log('Final API_BASE_URL:', API_BASE_URL);
console.log(API_BASE_URL);
