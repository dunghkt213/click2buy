import { toast } from 'sonner';
import { orderService } from '../apis/order';
import { useCallback } from 'react';
import { CreateOrderDto } from '@/types/dto/order.dto';

export function useCheckout({
  onOrderCreated,
}: {
  onOrderCreated?: (order: any) => void;
}) {
  const handleCheckout = useCallback(
    async (checkoutData: any) => {
      console.log('🛒 useCheckout called with checkoutData:', checkoutData);

      try {
        // ✅ Chỉ type-safe ở boundary FE → BE
        const orderDto: CreateOrderDto = {
          orderCode: checkoutData.orderCode,
          paymentMethod: checkoutData.paymentMethod,

          carts: checkoutData.carts.map((cart: any) => ({
            sellerId: cart.sellerId,

            products: cart.products.map((p: any) => ({
              productId: p.productId,
              quantity: p.quantity,
            })),

            voucherCode: cart.voucherCode,
            shippingFee: cart.shippingFee,
            paymentDiscount: cart.paymentDiscount,
          })),
        };

        console.log('🛒 Final order payload:', orderDto);

        const newOrder = await orderService.create(orderDto);

        console.log('🛒 Order created successfully:', newOrder);
        onOrderCreated?.(newOrder);

        return newOrder;
      } catch (e) {
        console.error('Checkout failed:', e);
        toast.error('Checkout thất bại!');
        throw e;
      }
    },
    [onOrderCreated],
  );

  return { handleCheckout };
}
