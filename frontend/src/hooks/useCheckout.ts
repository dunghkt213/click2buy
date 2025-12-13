import { toast } from 'sonner';
import { orderService } from '../apis/order';
import { useCallback } from 'react';  // ⚠ import lại ở đây

export function useCheckout({ onOrderCreated }: any) {
  const handleCheckout = useCallback(async (checkoutData: any) => {
    console.log('🛒 useCheckout called with checkoutData:', checkoutData);

    try {
      const orderDto = {
        orderCode: checkoutData.orderCode,
        paymentMethod: checkoutData.paymentMethod,
        carts: checkoutData.carts, // ✅ DÙNG TRỰC TIẾP
        shippingAddress: checkoutData.shippingAddress,
        shippingMethod: checkoutData.shippingMethod,
        note: checkoutData.note,
        discount: checkoutData.discount,
        shippingFee: checkoutData.shippingFee,
        total: checkoutData.total,
      };

      console.log('🛒 Final order payload:', orderDto);

      const newOrder = await orderService.create(orderDto);

      console.log('🛒 Order created successfully:', newOrder);
      onOrderCreated?.(newOrder); // Chỉ update state, không redirect

      return newOrder;
    } catch (e) {
      console.error('Checkout failed:', e);
      toast.error('Checkout thất bại!');
      throw e;
    }
  }, []);

  return { handleCheckout };
}

