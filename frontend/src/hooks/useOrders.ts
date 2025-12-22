/**
 * useOrders - Custom hook for order management
 */

import { useState, useCallback, useMemo } from 'react';
import { orderService, mapOrderResponse } from '../apis/order';
import { Order } from '../types/interface';
import { toast } from 'sonner';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isOrdersPageOpen, setIsOrdersPageOpen] = useState(false);

  /**
   * Load orders for seller with optional status filter
   * @param status - Order status (PENDING_ACCEPT, REQUESTED_CANCEL, CONFIRMED, SHIPPING, DELIVERED)
   */
  const loadOrders = useCallback(async (status?: string) => {
    try {
      setLoadingOrders(true);
      const response = await orderService.getAllForSeller(status);
      
      // Handle different response formats
      let backendOrders: any[] = [];
      if (Array.isArray(response)) {
        backendOrders = response;
      } else if (response && typeof response === 'object') {
        // Check if it's an error object (has status, message, name)
        if (response.status && response.message && response.name) {
          // This is an error object, not a success response
          throw new Error(response.message || 'Failed to load orders');
        }
        
        // Try common response formats
        if (Array.isArray(response.data)) {
          backendOrders = response.data;
        } else if (Array.isArray(response.orders)) {
          backendOrders = response.orders;
        } else if (Array.isArray(response.result)) {
          backendOrders = response.result;
        } else {
          // If no array found, it might be empty or unexpected format
          console.warn('Unexpected response format, treating as empty:', response);
          backendOrders = [];
        }
      }
      
      const mappedOrders = backendOrders.map(mapOrderResponse);
      setOrders(mappedOrders);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      const errorMessage = error?.message || 'Không thể tải danh sách đơn hàng';
      
      // Don't show toast for authentication errors (user might not be logged in)
      if (error?.status === 401 || error?.status === 403) {
        console.warn('Authentication error, user might not be logged in');
      } else {
        toast.error(errorMessage);
      }
      
      setOrders([]); // Set empty array on error
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  /**
   * Load orders for user (buyer) with optional status filter
   * @param status - Order status (PENDING_PAYMENT, PENDING_ACCEPT, SHIPPING, DELIVERED, REJECTED)
   */
  const loadOrdersForUser = useCallback(async (status?: string) => {
    try {
      setLoadingOrders(true);
      const response = await orderService.getAllForUser(status);
      
      // Handle different response formats
      let backendOrders: any[] = [];
      if (Array.isArray(response)) {
        backendOrders = response;
      } else if (response && typeof response === 'object') {
        // Check if it's an error object (has status, message, name)
        if (response.status && response.message && response.name) {
          // This is an error object, not a success response
          throw new Error(response.message || 'Failed to load orders');
        }
        
        // Try common response formats
        if (Array.isArray(response.data)) {
          backendOrders = response.data;
        } else if (Array.isArray(response.orders)) {
          backendOrders = response.orders;
        } else if (Array.isArray(response.result)) {
          backendOrders = response.result;
        } else {
          // If no array found, it might be empty or unexpected format
          console.warn('Unexpected response format, treating as empty:', response);
          backendOrders = [];
        }
      }
      
      const mappedOrders = backendOrders.map(mapOrderResponse);
      setOrders(mappedOrders);
    } catch (error: any) {
      console.error('Failed to load user orders:', error);
      const errorMessage = error?.message || 'Không thể tải danh sách đơn hàng';
      
      // Don't show toast for authentication errors (user might not be logged in)
      if (error?.status === 401 || error?.status === 403) {
        console.warn('Authentication error, user might not be logged in');
      } else {
        toast.error(errorMessage);
      }
      
      setOrders([]); // Set empty array on error
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const handleUpdateOrderStatus = useCallback((orderId: string, status: string) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? {
            ...order,
            status: status as Order['status'],
            updatedAt: new Date().toISOString(),
            timeline: [
              ...order.timeline,
              {
                status: status as Order['status'],
                timestamp: new Date().toISOString(),
                description: `Đơn hàng đã chuyển sang trạng thái ${status}`
              }
            ]
          }
        : order
    ));
  }, []);

  const setOrdersCallback = useCallback((orders: Order[] | ((prev: Order[]) => Order[])) => {
    setOrders(orders);
  }, []);

  const setLoadingOrdersCallback = useCallback((loading: boolean) => {
    setLoadingOrders(loading);
  }, []);

  const setIsOrdersPageOpenCallback = useCallback((open: boolean) => {
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

