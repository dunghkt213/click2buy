import { toast } from 'sonner';
import { orderService } from '../apis/order';
import { useCallback } from 'react';  // ⚠ import lại ở đây

export function useCheckout({ getSelectedItems, removeFromCart, refreshCart, onOrderCreated }: any) {

  const handleCheckout = useCallback(async (checkoutData: any) => {
    try {
      if (!checkoutData.carts || checkoutData.carts.length === 0) {
        throw new Error("Không có sản phẩm để checkout");
      }
  
      console.log("🚚 Payload gửi BE:", checkoutData);
  
      const newOrder = await orderService.create(checkoutData);
  
      toast.success("Đặt hàng thành công!");
  
      // xóa cart
      const selectedItems = getSelectedItems();
      for (const item of selectedItems) {
        await removeFromCart(item.id);
      }
  
      await refreshCart();
      onOrderCreated?.(newOrder);
  
      return newOrder;
  
    } catch (error: any) {
      console.error("Checkout failed:", error);
      toast.error("Checkout thất bại!");
      throw error;
    }
  }, []);
  
  return { handleCheckout };
}
