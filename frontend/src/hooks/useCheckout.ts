import { toast } from 'sonner';
import { orderService } from '../apis/order';
import { useCallback } from 'react';  // ⚠ import lại ở đây

export function useCheckout({ getSelectedItems, removeFromCart, refreshCart, onOrderCreated }: any) {

  const handleCheckout = useCallback(async (checkoutData: any) => {
    console.log('🛒 useCheckout called with checkoutData:', checkoutData);

    try {
      // Generate unique order code to prevent duplicate orders
      const orderCode = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Group items by seller
      const sellerGroups = checkoutData.items.reduce((groups: any, item: any) => {
        const sellerId = item.sellerId || 'default-seller';
        const cartId = item.cartId;

        if (!cartId) {
          console.warn(`Item ${item.id} missing cartId for seller ${sellerId}`);
          return groups; // Skip items without cartId
        }

        if (!groups[sellerId]) {
          groups[sellerId] = {
            cartId: cartId,
            sellerId,
            products: []
          };
        }

        // Verify cartId is consistent for same seller
        if (groups[sellerId].cartId !== cartId) {
          console.warn(`Inconsistent cartId for seller ${sellerId}: ${groups[sellerId].cartId} vs ${cartId}`);
        }

        groups[sellerId].products.push({
          productId: item.id,
          quantity: item.quantity
        });
        return groups;
      }, {});

      // Transform to carts array
      const carts = Object.values(sellerGroups);

      const paymentMethod = checkoutData.paymentMethod.type === 'cod' ? 'COD' :
                           checkoutData.paymentMethod.type.toUpperCase();

      console.log('🛒 Payment method:', paymentMethod, 'from:', checkoutData.paymentMethod.type);

      const orderDto = {
        orderCode,
        paymentMethod: paymentMethod,
        carts,
        shippingAddress: {
          name: checkoutData.shippingAddress.name,
          phone: checkoutData.shippingAddress.phone,
          address: checkoutData.shippingAddress.address,
          ward: checkoutData.shippingAddress.ward,
          district: checkoutData.shippingAddress.district,
          city: checkoutData.shippingAddress.city,
        },
        shippingMethod: checkoutData.shippingMethod?.name || 'standard',
        note: checkoutData.note,
      };

      console.log('🛒 Final order payload:', orderDto);

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
      console.error("Checkout failed:", error);
      toast.error("Checkout thất bại!");
      throw error;
    }
  }, []);
  
  return { handleCheckout };
}
