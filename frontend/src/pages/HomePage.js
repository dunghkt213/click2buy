import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * HomePage - Trang chủ của ứng dụng
 */
import { useRef } from 'react';
import { Hero } from '../components/layout/Hero';
import { ProductGrid } from '../components/product';
import { HotDealsSection } from '../components/product/HotDealsSection';
import { Categories, RevealSection } from '../components/shared';
import { FilterSidebar } from '../components/sidebars/FilterSidebar';
export function HomePage({ filters, isFilterOpen, onFiltersChange, onFilterClose, onAddToCart, onViewProductDetail, onTriggerFlyingIcon, isLoggedIn, onLogin, }) {
    const productSectionRef = useRef(null);
    const scrollToProducts = () => {
        if (productSectionRef.current) {
            const headerOffset = 80;
            const elementPosition = productSectionRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    };
    return (_jsxs("main", { className: "pt-16", children: [_jsx(RevealSection, { children: _jsx(Hero, {}) }), _jsx(RevealSection, { delay: 0.1, children: _jsx(Categories, { onCategorySelect: (category) => onFiltersChange({ ...filters, category }), onCategoryClick: scrollToProducts }) }), _jsx(RevealSection, { delay: 0.2, children: _jsx(HotDealsSection, { onAddToCart: onAddToCart, onViewDetail: onViewProductDetail, onTriggerFlyingIcon: onTriggerFlyingIcon, isLoggedIn: isLoggedIn, onLogin: onLogin }) }), _jsx(RevealSection, { delay: 0.3, children: _jsx("div", { ref: productSectionRef, className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "flex gap-8", children: [_jsx(FilterSidebar, { isOpen: isFilterOpen, onClose: onFilterClose, filters: filters, onFiltersChange: onFiltersChange }), _jsx("div", { className: "flex-1", children: _jsx(ProductGrid, { filters: filters, onAddToCart: onAddToCart, onViewDetail: onViewProductDetail, onTriggerFlyingIcon: onTriggerFlyingIcon, isLoggedIn: isLoggedIn, onLogin: onLogin }) })] }) }) })] }));
}
