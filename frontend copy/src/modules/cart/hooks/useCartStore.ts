import { create } from "zustand";
import { CartItem } from "../types/cart.types";

interface CartStore {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItem: (item: CartItem) => void;
  removeItem: (productId: string, sellerId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartStore>()((set) => ({
    items: [],
  
    setItems: (items) => set({ items }),
  
    addItem: (item) =>
      set((state) => ({
        items: [...state.items, item],
      })),
  
    updateItem: (item) =>
      set((state) => ({
        items: state.items.map((i) =>
          i.productId === item.productId && i.sellerId === item.sellerId
            ? item
            : i
        ),
      })),
  
    removeItem: (productId, sellerId) =>
      set((state) => ({
        items: state.items.filter(
          (i) => !(i.productId === productId && i.sellerId === sellerId)
        ),
      })),
  
    clear: () => set({ items: [] }),
  }));
  