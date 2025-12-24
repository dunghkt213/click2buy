import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { API_BASE_URL } from '../apis/client/baseUrl';
export function usePaymentSocket({ isLoggedIn, onQRCreated, onPaymentSuccess, onQRExpired, }) {
    const socketRef = useRef(null);
    const callbacksRef = useRef({
        onQRCreated,
        onPaymentSuccess,
        onQRExpired,
    });
    const [isConnected, setIsConnected] = useState(false);
    // ✅ LUÔN CẬP NHẬT CALLBACK MỚI NHẤT
    useEffect(() => {
        callbacksRef.current = {
            onQRCreated,
            onPaymentSuccess,
            onQRExpired,
        };
    }, [onQRCreated, onPaymentSuccess, onQRExpired]);
    // ✅ CHỈ KẾT NỐI / NGẮT KHI LOGIN THAY ĐỔI
    useEffect(() => {
        if (!isLoggedIn)
            return;
        // ❗ ĐÃ CÓ SOCKET → KHÔNG TẠO LẠI
        if (socketRef.current)
            return;
        const socket = io(API_BASE_URL, {
            withCredentials: true,
            transports: ['websocket'],
        });
        socketRef.current = socket;
        socket.on('connect', () => {
            console.log('🔌 WS connected');
            setIsConnected(true);
        });
        socket.on('disconnect', () => {
            console.log('❌ WS disconnected');
            setIsConnected(false);
        });
        socket.on('payment', (event) => {
            console.log('📡 WS RAW EVENT:', event);
            console.log('📡 WS TYPE:', event?.type);
            console.log('📡 WS DATA:', event?.data);
            console.log('📡 WS DATA LENGTH:', Array.isArray(event?.data) ? event.data.length : 'N/A');
            const { type, data } = event;
            switch (type) {
                case 'QR_CREATED':
                    callbacksRef.current.onQRCreated?.(data);
                    break;
                case 'PAYMENT_SUCCESS':
                    toast.success('Thanh toán thành công!');
                    callbacksRef.current.onPaymentSuccess?.(data);
                    break;
                case 'QR_EXPIRED':
                    toast.error('Mã QR đã hết hạn');
                    callbacksRef.current.onQRExpired?.(data);
                    break;
            }
        });
        return () => {
            console.log('🧹 WS cleanup');
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isLoggedIn]);
    return { isConnected };
}
