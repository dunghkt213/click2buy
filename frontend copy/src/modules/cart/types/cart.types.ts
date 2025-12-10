/** Item FE lưu */
export interface CartItem {
    productId: string;
    quantity: number;
    price: number;
    sellerId: string;
    name?: string;
    thumbnail?: string;

     /** UI state only (not from backend) */
  selected?: boolean;
  image?: string;
  }
  
  /** Response chuẩn cart */
  export interface CartResponse {
    success: boolean;
    message: string;
    itemCount?: number;
  }
  
  /** Response order sau checkout */
  export interface OrderResponse {
    success: boolean;
    message: string;
    orderId?: string;
    totalAmount?: number;
  }
  
  /** Payload FE → BE */
  export interface AddToCartPayload {
    productId: string;
    quantity: number;
    price: number;
    sellerId: string;
  }
  
  export interface UpdateCartPayload {
    productId: string;
    quantity: number;
    price: number;
    sellerId: string;
  }
  
  export interface RemoveCartPayload {
    productId: string;
    sellerId: string;
  }
  
  export interface UpdateQuantityPayload {
    productId: string;
    quantity: number;
    sellerId: string;
  }
  
  /** Checkout -> createOrder */
  export interface CreateOrderPayload {
    items: {
      productId: string;
      quantity: number;
      price: number;
      sellerId: string;
    }[];
    paymentMethod: "COD" | "BANKING";
  }
  