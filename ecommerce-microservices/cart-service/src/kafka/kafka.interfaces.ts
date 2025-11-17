/**
 * Kafka Event Interfaces
 */

// Inventory Events (Published by cart-service)
export interface InventoryReserveEvent {
  event: 'inventory.reserve';
  userId: string;
  productId: string;
  quantity: number;
  timestamp: string;
}

export interface InventoryUpdateReservationEvent {
  event: 'inventory.update-reservation';
  userId: string;
  productId: string;
  oldQuantity: number;
  newQuantity: number;
  timestamp: string;
}

// Order Events (Published by cart-service)
export interface OrderCreateEvent {
  event: 'order.create';
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  timestamp: string;
}

// Inventory Updates (Consumed by cart-service)
export interface InventoryStockUpdatedEvent {
  event: 'inventory.stock-updated';
  productId: string;
  availableStock: number;
  timestamp: string;
}
