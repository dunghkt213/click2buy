/**
 * useOrders - Custom hook for order management
 */
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { mapOrderResponse, orderService } from '../apis/order';
export function useOrders() {
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [isOrdersPageOpen, setIsOrdersPageOpen] = useState(false);
    /**
     * Load orders for seller with optional status filter
     * @param status - Order status (PENDING_ACCEPT, REQUESTED_CANCEL, CONFIRMED, SHIPPING, DELIVERED)
     */
    const loadOrders = useCallback(async (status) => {
        try {
            setLoadingOrders(true);
            const response = await orderService.getAllForSeller(status);
            // Handle different response formats
            let backendOrders = [];
            if (Array.isArray(response)) {
                backendOrders = response;
            }
            else if (response && typeof response === 'object') {
                const resp = response;
                // Check if it's an error object (has status, message, name)
                if (resp.status && resp.message && resp.name) {
                    // This is an error object, not a success response
                    throw new Error(resp.message || 'Failed to load orders');
                }
                // Try common response formats
                if (Array.isArray(resp.data)) {
                    backendOrders = resp.data;
                }
                else if (Array.isArray(resp.orders)) {
                    backendOrders = resp.orders;
                }
                else if (Array.isArray(resp.result)) {
                    backendOrders = resp.result;
                }
                else {
                    // If no array found, it might be empty or unexpected format
                    console.warn('Unexpected response format, treating as empty:', response);
                    backendOrders = [];
                }
            }
            const mappedOrders = backendOrders.map(mapOrderResponse);
            setOrders(mappedOrders);
        }
        catch (error) {
            console.error('Failed to load orders:', error);
            const errorMessage = error?.message || 'Không thể tải danh sách đơn hàng';
            // Don't show toast for authentication errors (user might not be logged in)
            if (error?.status === 401 || error?.status === 403) {
                console.warn('Authentication error, user might not be logged in');
            }
            else {
                toast.error(errorMessage);
            }
            setOrders([]); // Set empty array on error
        }
        finally {
            setLoadingOrders(false);
        }
    }, []);
    /**
     * Load orders for user (buyer) with optional status filter
     * @param status - Order status (PENDING_PAYMENT, PENDING_ACCEPT, SHIPPING, DELIVERED, REJECTED)
     */
    const loadOrdersForUser = useCallback(async (status) => {
        try {
            setLoadingOrders(true);
            const response = await orderService.getAllForUser(status);
            // Handle different response formats
            let backendOrders = [];
            if (Array.isArray(response)) {
                backendOrders = response;
            }
            else if (response && typeof response === 'object') {
                const resp = response;
                // Check if it's an error object (has status, message, name)
                if (resp.status && resp.message && resp.name) {
                    // This is an error object, not a success response
                    throw new Error(resp.message || 'Failed to load orders');
                }
                // Try common response formats
                if (Array.isArray(resp.data)) {
                    backendOrders = resp.data;
                }
                else if (Array.isArray(resp.orders)) {
                    backendOrders = resp.orders;
                }
                else if (Array.isArray(resp.result)) {
                    backendOrders = resp.result;
                }
                else {
                    // If no array found, it might be empty or unexpected format
                    console.warn('Unexpected response format, treating as empty:', response);
                    backendOrders = [];
                }
            }
            const mappedOrders = backendOrders.map(mapOrderResponse);
            setOrders(mappedOrders);
        }
        catch (error) {
            console.error('Failed to load user orders:', error);
            const errorMessage = error?.message || 'Không thể tải danh sách đơn hàng';
            // Don't show toast for authentication errors (user might not be logged in)
            if (error?.status === 401 || error?.status === 403) {
                console.warn('Authentication error, user might not be logged in');
            }
            else {
                toast.error(errorMessage);
            }
            setOrders([]); // Set empty array on error
        }
        finally {
            setLoadingOrders(false);
        }
    }, []);
    const handleUpdateOrderStatus = useCallback((orderId, status) => {
        setOrders(prev => prev.map(order => order.id === orderId
            ? {
                ...order,
                status: status,
                updatedAt: new Date().toISOString(),
                timeline: [
                    ...order.timeline,
                    {
                        status: status,
                        timestamp: new Date().toISOString(),
                        description: `Đơn hàng đã chuyển sang trạng thái ${status}`
                    }
                ]
            }
            : order));
    }, []);
    const setOrdersCallback = useCallback((orders) => {
        setOrders(orders);
    }, []);
    const setLoadingOrdersCallback = useCallback((loading) => {
        setLoadingOrders(loading);
    }, []);
    const setIsOrdersPageOpenCallback = useCallback((open) => {
        setIsOrdersPageOpen(open);
    }, []);
    return useMemo(() => ({
        orders,
        loadingOrders,
        isOrdersPageOpen,
        setOrders: setOrdersCallback,
        setLoadingOrders: setLoadingOrdersCallback,
        setIsOrdersPageOpen: setIsOrdersPageOpenCallback,
        loadOrders,
        loadOrdersForUser,
        handleUpdateOrderStatus,
    }), [orders, loadingOrders, isOrdersPageOpen, setOrdersCallback, setLoadingOrdersCallback, setIsOrdersPageOpenCallback, loadOrders, loadOrdersForUser, handleUpdateOrderStatus]);
}
