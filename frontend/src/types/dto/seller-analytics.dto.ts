// Dựa trên schema: RevenueDataItem
export interface RevenueDataItem {
  date: string;          // ex: "2025-12-01"
  totalRevenue: number;  // ex: 1500000
  totalOrders: number;   // ex: 5
}

// Dựa trên schema: TopProductItem
export interface TopProductItem {
  productId: string;
  productName: string;   // ex: "iPhone 15 Pro Max"
  totalSold: number;     // ex: 150
  totalRevenue: number;  // ex: 4500000000
}