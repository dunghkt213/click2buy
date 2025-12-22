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
      const backendOrders = await orderService.getAllForSeller(status);
      const mappedOrders = backendOrders.map(mapOrderResponse);
      setOrders(mappedOrders);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
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
      const backendOrders = await orderService.getAllForUser(status);
      const mappedOrders = backendOrders.map(mapOrderResponse);
      setOrders(mappedOrders);
    } catch (error: any) {
      console.error('Failed to load user orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
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

