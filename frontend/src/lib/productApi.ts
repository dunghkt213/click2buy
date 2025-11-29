import axios from "axios";
import { Product } from "../types"; // đường dẫn bạn chỉnh lại tuỳ project

// Base URL đi qua API Gateway giống authApi
const API_BASE = import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:3000";

const client = axios.create({
  baseURL: `${API_BASE}/products`,
  withCredentials: true,
});

// -------------------------------
// Mapping response về đúng Product types
// -------------------------------
export function mapProductResponse(data: any): Product {
  return {
    id: data._id || data.id,
    name: data.name,
    price: data.price,
    originalPrice: data.originalPrice,
    discount: data.discount,
    image: data.image,
    images: data.images,
    category: data.category,
    rating: data.rating || 0,
    reviews: data.reviews || 0,
    description: data.description || "",
    brand: data.brand || "",
    inStock: data.inStock ?? true,
    isNew: data.isNew,
    isSale: data.isSale,
    isBestSeller: data.isBestSeller,
    soldCount: data.soldCount,
    timeLeft: data.timeLeft,
    specifications: data.specifications,
  };
}

// -------------------------------
// Lấy danh sách sản phẩm
// -------------------------------
async function getAll(): Promise<Product[]> {
  try {
    const res = await client.get("/");
    // Kiểm tra xem backend trả về object có data không
    const products = Array.isArray(res.data) ? res.data : res.data?.data;
    if (!products || !Array.isArray(products)) throw new Error("Dữ liệu sản phẩm không hợp lệ");
    return products.map(mapProductResponse);
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Không thể tải danh sách sản phẩm");
  }
}

// -------------------------------
// Lấy 1 sản phẩm chi tiết
// -------------------------------
async function getById(id: string): Promise<Product> {
  try {
    const res = await client.get(`/${id}`);
    return mapProductResponse(res.data?.data || res.data);
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Không thể tải chi tiết sản phẩm");
  }
}

// -------------------------------
// Lấy sản phẩm flash sale, best seller, new...
// -------------------------------
async function getHighlighted(type: "flash-sale" | "best-seller" | "new"): Promise<Product[]> {
  try {
    const res = await client.get(`/highlight/${type}`);
    const products = Array.isArray(res.data) ? res.data : res.data?.data;
    if (!products || !Array.isArray(products)) throw new Error("Dữ liệu nổi bật không hợp lệ");
    return products.map(mapProductResponse);
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Không thể tải dữ liệu nổi bật");
  }
}

// -------------------------------
// Export giống authApi
// -------------------------------
export const productApi = {
  getAll,
  getById,
  getHighlighted,
};
