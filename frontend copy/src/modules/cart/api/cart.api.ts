import { request } from "@/apis/apiClient";
import {
  AddToCartPayload,
  UpdateCartPayload,
  RemoveCartPayload,
  UpdateQuantityPayload,
  CreateOrderPayload,
  CartResponse,
  OrderResponse,
  CartItem
} from "../types/cart.types";

export const cartApi = {
  getAll: async () => {
    const carts = await request<any[]>("/cart", { method: "GET" });
  
    // 1️⃣ Flatten items
    const flatItems = carts.flatMap(c => c.items || []);
  
    // 2️⃣ Remove orphan
    const cleaned = flatItems.filter(i => !!i.productId);
  
    // 3️⃣ Enrich
    const enriched = await Promise.all(
      cleaned.map(async (item) => {
        try {
          const product = await request<any>(`/products/${item.productId}`, { method: "GET" });
  
          const norm = {
            productId: item.productId,
            sellerId: item.sellerId,
            quantity: item.quantity ?? 1,
  
            name: product?.name ?? "Sản phẩm",
            image: product?.images?.[0] ?? product?.image ?? "",
            price: product?.salePrice ?? product?.price ?? 0,
            originalPrice: product?.originalPrice ?? null,
            selected: false
          };
  
          return norm;
        } catch {

          await request("/cart/product", {
            method: "DELETE",
            body: JSON.stringify({ productId: item.productId, sellerId: item.sellerId })
          });
  
          return null;
        }
      })
    );
  
    const final = enriched.filter(Boolean) as CartItem[];
  
    return final;
  },
  
  
  
  

  add: (data: AddToCartPayload) =>
    request<CartResponse>("/cart", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  update: (data: UpdateCartPayload) =>
    request<CartResponse>("/cart/update", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (data: RemoveCartPayload) =>
    request<CartResponse>("/cart/product", {
      method: "DELETE",
      body: JSON.stringify(data),
    }),

  updateQuantity: (data: UpdateQuantityPayload) =>
    request<CartResponse>("/cart/productQuantity", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  checkout: (payload: CreateOrderPayload) =>
    request<OrderResponse>("/cart/order", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
