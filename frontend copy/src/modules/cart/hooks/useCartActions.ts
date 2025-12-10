import { useCallback } from "react";
import { cartApi } from "../api/cart.api";
import {
  AddToCartPayload,
  UpdateCartPayload,
  RemoveCartPayload,
  UpdateQuantityPayload,
  CreateOrderPayload
} from "../types/cart.types";
import { useCartStore } from "./useCartStore";

export function useCartActions() {
  const { items, setItems, removeItem, clear } = useCartStore();

  /** Load full cart */
  /** Load full cart */
const loadCart = useCallback(async () => {
  const enriched = await cartApi.getAll(); 

  setItems(enriched);
}, [setItems]);

  /** Add cart */
  const addToCart = useCallback(async (payload: AddToCartPayload) => {
    const res = await cartApi.add(payload);
    if (res?.success) loadCart();
    return res;
  }, [loadCart]);

  /** Update cart item */
  const updateCart = useCallback(async (payload: UpdateCartPayload) => {
    const res = await cartApi.update(payload);
    if (res?.success) loadCart();
    return res;
  }, [loadCart]);

  /** Change quantity */
  const changeQuantity = useCallback(async (payload: UpdateQuantityPayload) => {
    const res = await cartApi.updateQuantity(payload);
    if (res?.success) loadCart();
    return res;
  }, [loadCart]);

  /** Remove item */
  const removeFromCart = useCallback(async (payload: RemoveCartPayload) => {
    const res = await cartApi.remove(payload);
    if (res?.success) {
      removeItem(payload.productId, payload.sellerId); // local remove → không cần reload
    }
    return res;
  }, [removeItem]);

  /** Checkout */
  const checkout = useCallback(async (data: CreateOrderPayload) => {
    const res = await cartApi.checkout(data);
    if (res?.success) {
      clear(); // reset store
    }
    return res;
  }, [clear]);

  /** UI Local Toggle */
  const toggleItem = useCallback((productId: string, sellerId: string) => {
    setItems(
      items.map(i =>
        i.productId === productId && i.sellerId === sellerId
          ? { ...i, selected: !i.selected }
          : i
      )
    );
  }, [items, setItems]);

  /** Select all */
  const selectAll = useCallback(() => {
    setItems(items.map(i => ({ ...i, selected: true })));
  }, [items, setItems]);

  /** Deselect all */
  const deselectAll = useCallback(() => {
    setItems(items.map(i => ({ ...i, selected: false })));
  }, [items, setItems]);

  return {
    /** server sync */
    loadCart,
    addToCart,
    updateCart,
    changeQuantity,
    removeFromCart,
    checkout,

    /** local UI state */
    toggleItem,
    selectAll,
    deselectAll
  };
}
