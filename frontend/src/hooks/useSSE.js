/**
 * useSSE - Custom hook for Server-Sent Events (SSE)
 * Handles payment-related real-time updates
 */
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../apis/client/baseUrl';
export function useSSE({ userId, isLoggedIn, onQRCreated, onPaymentSuccess, onQRExpired, }) {
    const [isConnected, setIsConnected] = useState(false);
    const eventSourceRef = useRef(null);
    useEffect(() => {
        if (!isLoggedIn || !userId) {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
                setIsConnected(false);
            }
            return;
        }
        // Create SSE connection with credentials
        const connectSSE = () => {
            try {
                console.log('SSE: Creating EventSource with credentials');
                const eventSource = new EventSource(`${API_BASE_URL}/sse/payments`, {
                    withCredentials: true
                });
                eventSource.onopen = () => {
                    console.log('📡 SSE Connected');
                    setIsConnected(true);
                };
                eventSource.onmessage = (event) => {
                    try {
                        const sseEvent = JSON.parse(event.data);
                        // 👇 BỎ QUA EVENT HỆ THỐNG
                        if (sseEvent.type === 'CONNECTED' || sseEvent.type === 'PING') {
                            return;
                        }
                        console.log('📡 SSE Event received:', sseEvent);
                        switch (sseEvent.type) {
                            case 'QR_CREATED':
                                onQRCreated?.(sseEvent.data);
                                break;
                            case 'PAYMENT_SUCCESS':
                                toast.success('Thanh toán thành công!');
                                onPaymentSuccess?.(sseEvent.data);
                                break;
                            case 'QR_EXPIRED':
                                toast.error('Mã QR đã hết hạn. Vui lòng thử lại.');
                                onQRExpired?.(sseEvent.data);
                                break;
                            default:
                                console.warn('Unknown SSE event type:', sseEvent.type);
                        }
                    }
                    catch (err) {
                        console.error('Failed to parse SSE event:', err);
                    }
                };
                eventSource.onerror = (error) => {
                    console.error('SSE connection error:', error);
                    setIsConnected(false);
                    // Attempt to reconnect after 5 seconds
                    setTimeout(() => {
                        if (eventSource.readyState === EventSource.CLOSED) {
                            connectSSE();
                        }
                    }, 5000);
                };
                eventSourceRef.current = eventSource;
            }
            catch (error) {
                console.error('Failed to create SSE connection:', error);
            }
        };
        connectSSE();
        // Cleanup function
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
                setIsConnected(false);
            }
        };
    }, [isLoggedIn, userId, onQRCreated, onPaymentSuccess, onQRExpired]);
    return {
        isConnected,
    };
}
