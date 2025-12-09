/**
 * useCheckout - Custom hook for checkout functionality
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { mapOrderResponse, orderService } from '../apis/order';
import { CartItem } from '../types/interface';

interface UseCheckoutProps {
  getSelectedItems: () => CartItem[];
  removeFromCart: (productId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  onOrderCreated?: (order: any) => void;
}

export function useCheckout({
  getSelectedItems,
  removeFromCart,
  refreshCart,
  onOrderCreated,
}: UseCheckoutProps) {
  const handleCheckout = useCallback(async (checkoutData: any) => {
    try {
      // Transform checkoutData thành format của orderService
      const orderDto = {
        items: checkoutData.items.map((item: any) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          sellerId: (item as any).sellerId || 'default-seller',
        })),
        shippingAddress: {
          name: checkoutData.shippingAddress.name,
          phone: checkoutData.shippingAddress.phone,
          address: checkoutData.shippingAddress.address,
          ward: checkoutData.shippingAddress.ward,
          district: checkoutData.shippingAddress.district,
          city: checkoutData.shippingAddress.city,
        },
        paymentMethod: checkoutData.paymentMethod.type,
        shippingMethod: checkoutData.shippingMethod?.name || 'standard',
        note: checkoutData.note,
      };
      
      const newOrder = await orderService.create(orderDto);
      const mappedOrder = mapOrderResponse(newOrder);
      
      toast.success('Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại ShopMart.');
      
      // Xóa các items đã checkout khỏi giỏ hàng
      const selectedItems = getSelectedItems();
      for (const item of selectedItems) {
        await removeFromCart(item.id);
      }
      
      // Refresh cart để cập nhật UI
      await refreshCart();
      
      // Callback để update orders
      if (onOrderCreated) {
        onOrderCreated(mappedOrder);
      }
      
      return mappedOrder;
    } catch (error: any) {
      console.error('Checkout failed:', error);
      toast.error(error.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
      throw error;
    }
  }, [getSelectedItems, removeFromCart, refreshCart, onOrderCreated]);

  return {
    handleCheckout,
  };
}

