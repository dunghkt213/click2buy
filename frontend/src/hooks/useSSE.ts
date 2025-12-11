/**
 * useSSE - Custom hook for Server-Sent Events (SSE)
 * Handles payment-related real-time updates
 */

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export interface PaymentQR {
  orderId: string;
  checkoutUrl: string;
  qrCode: string;
  expireIn: number;
}

export interface SSEEvent {
  type: 'QR_CREATED' | 'PAYMENT_SUCCESS' | 'QR_EXPIRED';
  data: PaymentQR[] | any;
}

interface UseSSEProps {
  userId?: string;
  isLoggedIn: boolean;
  onQRCreated?: (payments: PaymentQR[]) => void;
  onPaymentSuccess?: (data: any) => void;
  onQRExpired?: (data: any) => void;
}

export function useSSE({
  userId,
  isLoggedIn,
  onQRCreated,
  onPaymentSuccess,
  onQRExpired,
}: UseSSEProps) {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

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
        const eventSource = new EventSource('/api/sse/payments', {
          withCredentials: true
        });

        eventSource.onopen = () => {
          console.log('📡 SSE Connected');
          setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const sseEvent: SSEEvent = JSON.parse(event.data);
            console.log('📡 SSE Event received:', sseEvent);

            switch (sseEvent.type) {
              case 'QR_CREATED':
                console.log('🆔 QR Code created:', sseEvent.data);
                if (onQRCreated) {
                  onQRCreated(sseEvent.data);
                }
                break;

              case 'PAYMENT_SUCCESS':
                console.log('💰 Payment successful:', sseEvent.data);
                toast.success('Thanh toán thành công!');
                if (onPaymentSuccess) {
                  onPaymentSuccess(sseEvent.data);
                }
                break;

              case 'QR_EXPIRED':
                console.log('⏰ QR Code expired:', sseEvent.data);
                toast.error('Mã QR đã hết hạn. Vui lòng thử lại.');
                if (onQRExpired) {
                  onQRExpired(sseEvent.data);
                }
                break;

              default:
                console.warn('Unknown SSE event type:', sseEvent.type);
            }
          } catch (error) {
            console.error('Failed to parse SSE event:', error);
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
      } catch (error) {
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
