/**
 * Cache utility với localStorage
 * Hỗ trợ TTL (Time To Live) và auto-cleanup
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const CACHE_PREFIX = 'click2buy_cache_';
const CACHE_VERSION = '1.0';

/**
 * Tạo cache key với prefix và version
 */
function createCacheKey(key: string): string {
  return `${CACHE_PREFIX}${CACHE_VERSION}_${key}`;
}

/**
 * Lưu data vào cache với TTL
 */
export function setCache<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(createCacheKey(key), JSON.stringify(cacheItem));
  } catch (error) {
    console.error(`Failed to set cache for key ${key}:`, error);
    // Nếu localStorage đầy, xóa cache cũ nhất
    if (error instanceof DOMException && error.code === 22) {
      clearOldestCache();
      try {
        const cacheItem: CacheItem<T> = {
          data,
          timestamp: Date.now(),
          ttl,
        };
        localStorage.setItem(createCacheKey(key), JSON.stringify(cacheItem));
      } catch (retryError) {
        console.error('Failed to set cache after cleanup:', retryError);
      }
    }
  }
}

/**
 * Lấy data từ cache, trả về null nếu expired hoặc không tồn tại
 */
export function getCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(createCacheKey(key));
    if (!cached) return null;

    const cacheItem: CacheItem<T> = JSON.parse(cached);
    const now = Date.now();
    const age = now - cacheItem.timestamp;

    // Kiểm tra TTL
    if (age > cacheItem.ttl) {
      // Cache đã hết hạn, xóa nó
      localStorage.removeItem(createCacheKey(key));
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.error(`Failed to get cache for key ${key}:`, error);
    // Xóa cache bị lỗi
    try {
      localStorage.removeItem(createCacheKey(key));
    } catch (removeError) {
      console.error('Failed to remove corrupted cache:', removeError);
    }
    return null;
  }
}

/**
 * Xóa cache theo key
 */
export function removeCache(key: string): void {
  try {
    localStorage.removeItem(createCacheKey(key));
  } catch (error) {
    console.error(`Failed to remove cache for key ${key}:`, error);
  }
}

/**
 * Xóa tất cả cache
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear all cache:', error);
  }
}

/**
 * Xóa cache cũ nhất khi localStorage đầy
 */
function clearOldestCache(): void {
  try {
    const cacheItems: Array<{ key: string; timestamp: number }> = [];
    const keys = Object.keys(localStorage);

    // Thu thập tất cả cache items với timestamp
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheItem = JSON.parse(cached);
            cacheItems.push({
              key,
              timestamp: cacheItem.timestamp || 0,
            });
          }
        } catch (error) {
          // Nếu parse lỗi, xóa luôn
          localStorage.removeItem(key);
        }
      }
    });

    // Sort theo timestamp (cũ nhất trước)
    cacheItems.sort((a, b) => a.timestamp - b.timestamp);

    // Xóa 20% cache cũ nhất
    const toRemove = Math.ceil(cacheItems.length * 0.2);
    for (let i = 0; i < toRemove && i < cacheItems.length; i++) {
      localStorage.removeItem(cacheItems[i].key);
    }
  } catch (error) {
    console.error('Failed to clear oldest cache:', error);
  }
}

/**
 * Cleanup expired cache (nên gọi khi app start)
 */
export function cleanupExpiredCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let cleaned = 0;

    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheItem = JSON.parse(cached);
            const age = now - cacheItem.timestamp;

            if (age > cacheItem.ttl) {
              localStorage.removeItem(key);
              cleaned++;
            }
          }
        } catch (error) {
          // Cache bị lỗi, xóa luôn
          localStorage.removeItem(key);
          cleaned++;
        }
      }
    });

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired cache items`);
    }
  } catch (error) {
    console.error('Failed to cleanup expired cache:', error);
  }
}

/**
 * Cache keys constants
 */
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  PRODUCTS_PAGE: (page: number, categoryId?: string) => 
    `products_page_${page}_${categoryId || 'all'}`,
  HOT_DEALS: 'hot_deals',
  CART: 'cart',
  USER_PROFILE: 'user_profile',
} as const;

