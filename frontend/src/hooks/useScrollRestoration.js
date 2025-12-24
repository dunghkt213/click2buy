/**
 * useScrollRestoration - Custom hook để lưu và khôi phục scroll position khi navigate
 * Sử dụng sessionStorage để lưu scroll position theo pathname
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
const SCROLL_POSITIONS_KEY = 'scrollPositions';
/**
 * Lưu scroll position vào sessionStorage
 */
function saveScrollPosition(pathname, position) {
    try {
        const stored = sessionStorage.getItem(SCROLL_POSITIONS_KEY);
        const positions = stored ? JSON.parse(stored) : {};
        positions[pathname] = position;
        sessionStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(positions));
    }
    catch (error) {
        console.error('Failed to save scroll position:', error);
    }
}
/**
 * Lấy scroll position từ sessionStorage
 */
function getScrollPosition(pathname) {
    try {
        const stored = sessionStorage.getItem(SCROLL_POSITIONS_KEY);
        if (!stored)
            return null;
        const positions = JSON.parse(stored);
        return positions[pathname] ?? null;
    }
    catch (error) {
        console.error('Failed to get scroll position:', error);
        return null;
    }
}
/**
 * Xóa scroll position khỏi sessionStorage
 */
function clearScrollPosition(pathname) {
    try {
        const stored = sessionStorage.getItem(SCROLL_POSITIONS_KEY);
        if (!stored)
            return;
        const positions = JSON.parse(stored);
        delete positions[pathname];
        sessionStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(positions));
    }
    catch (error) {
        console.error('Failed to clear scroll position:', error);
    }
}
/**
 * Hook để lưu và khôi phục scroll position
 *
 * @param enabled - Bật/tắt scroll restoration (mặc định: true)
 * @param delay - Delay trước khi khôi phục scroll (mặc định: 100ms)
 */
export function useScrollRestoration(enabled = true, delay = 100) {
    const location = useLocation();
    const pathname = location.pathname;
    const isRestoredRef = useRef(false);
    const scrollTimeoutRef = useRef(null);
    // Lưu scroll position trước khi navigate
    useEffect(() => {
        if (!enabled)
            return;
        const handleBeforeUnload = () => {
            saveScrollPosition(pathname, window.scrollY || document.documentElement.scrollTop);
        };
        // Lưu scroll position khi scroll
        const handleScroll = () => {
            // Debounce để tránh lưu quá nhiều
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(() => {
                saveScrollPosition(pathname, window.scrollY || document.documentElement.scrollTop);
            }, 150);
        };
        // Lưu scroll position khi component unmount (navigate đi)
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            // Lưu scroll position cuối cùng trước khi unmount
            saveScrollPosition(pathname, window.scrollY || document.documentElement.scrollTop);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [pathname, enabled]);
    // Khôi phục scroll position khi component mount (quay lại trang)
    useEffect(() => {
        if (!enabled || isRestoredRef.current)
            return;
        const savedPosition = getScrollPosition(pathname);
        if (savedPosition !== null && savedPosition > 0) {
            // Delay một chút để đảm bảo DOM đã render xong
            const timeoutId = setTimeout(() => {
                window.scrollTo({
                    top: savedPosition,
                    behavior: 'auto', // Không animate để tránh flash
                });
                isRestoredRef.current = true;
            }, delay);
            return () => clearTimeout(timeoutId);
        }
        else {
            // Nếu không có saved position, scroll về đầu trang
            window.scrollTo({ top: 0, behavior: 'auto' });
            isRestoredRef.current = true;
        }
    }, [pathname, enabled, delay]);
    // Reset flag khi pathname thay đổi
    useEffect(() => {
        isRestoredRef.current = false;
    }, [pathname]);
}
/**
 * Hook để lưu scroll position của một element cụ thể
 *
 * @param elementRef - Ref của element cần lưu scroll position
 * @param enabled - Bật/tắt scroll restoration
 */
export function useElementScrollRestoration(elementRef, enabled = true) {
    const location = useLocation();
    const pathname = location.pathname;
    const isRestoredRef = useRef(false);
    useEffect(() => {
        if (!enabled || !elementRef.current)
            return;
        const element = elementRef.current;
        const storageKey = `${SCROLL_POSITIONS_KEY}_${pathname}_element`;
        // Lưu scroll position
        const handleScroll = () => {
            try {
                sessionStorage.setItem(storageKey, String(element.scrollTop));
            }
            catch (error) {
                console.error('Failed to save element scroll position:', error);
            }
        };
        element.addEventListener('scroll', handleScroll, { passive: true });
        // Khôi phục scroll position
        if (!isRestoredRef.current) {
            try {
                const savedPosition = sessionStorage.getItem(storageKey);
                if (savedPosition) {
                    const position = parseInt(savedPosition, 10);
                    if (!isNaN(position) && position > 0) {
                        setTimeout(() => {
                            element.scrollTop = position;
                            isRestoredRef.current = true;
                        }, 50);
                    }
                }
            }
            catch (error) {
                console.error('Failed to restore element scroll position:', error);
            }
        }
        return () => {
            element.removeEventListener('scroll', handleScroll);
            // Lưu scroll position cuối cùng
            try {
                sessionStorage.setItem(storageKey, String(element.scrollTop));
            }
            catch (error) {
                console.error('Failed to save element scroll position on unmount:', error);
            }
        };
    }, [pathname, enabled, elementRef]);
    useEffect(() => {
        isRestoredRef.current = false;
    }, [pathname]);
}
