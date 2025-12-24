import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Baby, BookOpen, Car, Check, Dumbbell, Home, Shirt, Sparkles, Star, X, Zap } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Slider } from '../ui/slider';
export function FilterSidebar({ isOpen, onClose, filters, onFiltersChange }) {
    const categories = [
        { id: 'all', name: 'Tất cả', icon: null },
        { id: 'fashion', name: 'Thời trang', icon: Shirt },
        { id: 'electronics', name: 'Điện tử', icon: Zap },
        { id: 'home', name: 'Nhà cửa', icon: Home },
        { id: 'books', name: 'Sách', icon: BookOpen },
        { id: 'sports', name: 'Thể thao', icon: Dumbbell },
        { id: 'beauty', name: 'Làm đẹp', icon: Sparkles },
        { id: 'baby', name: 'Mẹ & Bé', icon: Baby },
        { id: 'toys', name: 'Đồ chơi', icon: Car },
    ];
    const brands = ['Apple', 'Samsung', 'IKEA', 'Adidas', 'Nike', 'L\'Oreal', 'Aristino', 'ASUS', 'Dell', 'Giant'];
    const priceRanges = [
        { label: 'Dưới 500k', min: 0, max: 500000 },
        { label: '500k - 2tr', min: 500000, max: 2000000 },
        { label: '2tr - 10tr', min: 2000000, max: 10000000 },
        { label: 'Trên 10tr', min: 10000000, max: 100000000 },
    ];
    const formatPrice = (price) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(0)} tr`;
        }
        return `${(price / 1000).toFixed(0)}k`;
    };
    const handleCategoryChange = (category) => {
        onFiltersChange({ ...filters, category });
    };
    const handleBrandToggle = (brand) => {
        const newBrands = filters.brands.includes(brand)
            ? filters.brands.filter(b => b !== brand)
            : [...filters.brands, brand];
        onFiltersChange({ ...filters, brands: newBrands });
    };
    const handlePriceRangeChange = (range) => {
        onFiltersChange({ ...filters, priceRange: range });
    };
    const handleRatingChange = (rating) => {
        onFiltersChange({ ...filters, rating: filters.rating === rating ? 0 : rating });
    };
    const clearFilters = () => {
        onFiltersChange({
            category: 'all',
            priceRange: [0, 50000000],
            brands: [],
            rating: 0,
            inStock: true,
        });
    };
    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.category !== 'all')
            count++;
        if (filters.brands.length > 0)
            count++;
        if (filters.rating > 0)
            count++;
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000000)
            count++;
        return count;
    };
    const FilterContent = () => (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-semibold", children: "B\u1ED9 l\u1ECDc" }), getActiveFiltersCount() > 0 && (_jsxs(Button, { variant: "ghost", size: "sm", onClick: clearFilters, children: ["X\u00F3a t\u1EA5t c\u1EA3", _jsx(X, { className: "w-4 h-4 ml-1" })] }))] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-sm", children: "Danh m\u1EE5c" }), _jsx("div", { className: "space-y-2", children: categories.map((category) => (_jsxs("div", { className: `flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${filters.category === category.id
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-muted/50'}`, onClick: () => handleCategoryChange(category.id), children: [category.icon && _jsx(category.icon, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm", children: category.name }), filters.category === category.id && (_jsx(Check, { className: "w-4 h-4 ml-auto" }))] }, category.id))) })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-sm", children: "Kho\u1EA3ng gi\u00E1" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "px-2", children: [_jsx(Slider, { value: filters.priceRange, onValueChange: handlePriceRangeChange, max: 50000000, min: 0, step: 100000, className: "w-full" }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground mt-2", children: [_jsx("span", { children: formatPrice(filters.priceRange[0]) }), _jsx("span", { children: formatPrice(filters.priceRange[1]) })] })] }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: priceRanges.map((range, index) => (_jsx(Button, { variant: "outline", size: "sm", className: "text-xs h-8", onClick: () => handlePriceRangeChange([range.min, range.max]), children: range.label }, index))) })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-3", children: [_jsxs("h4", { className: "font-medium text-sm flex items-center justify-between", children: ["Th\u01B0\u01A1ng hi\u1EC7u", filters.brands.length > 0 && (_jsx(Badge, { variant: "secondary", className: "text-xs", children: filters.brands.length }))] }), _jsx("div", { className: "space-y-2", children: brands.map((brand) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: brand, checked: filters.brands.includes(brand), onCheckedChange: () => handleBrandToggle(brand) }), _jsx(Label, { htmlFor: brand, className: "text-sm font-normal cursor-pointer", children: brand })] }, brand))) })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-sm", children: "\u0110\u00E1nh gi\u00E1" }), _jsx("div", { className: "space-y-2", children: [5, 4, 3, 2, 1].map((rating) => (_jsxs("div", { className: `flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${filters.rating === rating
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-muted/50'}`, onClick: () => handleRatingChange(rating), children: [_jsx("div", { className: "flex items-center gap-1", children: [...Array(5)].map((_, i) => (_jsx(Star, { className: `w-4 h-4 ${i < rating
                                            ? 'text-yellow-500 fill-current'
                                            : 'text-muted-foreground'}` }, i))) }), _jsxs("span", { className: "text-sm", children: ["t\u1EEB ", rating, " sao"] }), filters.rating === rating && (_jsx(Check, { className: "w-4 h-4 ml-auto" }))] }, rating))) })] }), _jsx(Separator, {}), _jsx("div", { className: "space-y-3", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "inStock", checked: filters.inStock, onCheckedChange: (checked) => onFiltersChange({ ...filters, inStock: checked }) }), _jsx(Label, { htmlFor: "inStock", className: "text-sm font-normal cursor-pointer", children: "Ch\u1EC9 hi\u1EC3n th\u1ECB s\u1EA3n ph\u1EA9m c\u00F2n h\u00E0ng" })] }) })] }));
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "hidden lg:block w-80", children: _jsxs(Card, { className: "sticky top-24", children: [_jsx(CardHeader, { className: "pb-4", children: _jsx(CardTitle, { className: "text-lg", children: "B\u1ED9 l\u1ECDc s\u1EA3n ph\u1EA9m" }) }), _jsx(CardContent, { children: _jsx(FilterContent, {}) })] }) }), _jsx(Sheet, { open: isOpen, onOpenChange: onClose, children: _jsxs(SheetContent, { side: "left", className: "w-80", children: [_jsxs(SheetHeader, { children: [_jsx(SheetTitle, { children: "B\u1ED9 l\u1ECDc s\u1EA3n ph\u1EA9m" }), _jsx(SheetDescription, { children: "L\u1ECDc s\u1EA3n ph\u1EA9m theo danh m\u1EE5c, gi\u00E1, th\u01B0\u01A1ng hi\u1EC7u v\u00E0 \u0111\u00E1nh gi\u00E1" })] }), _jsx("div", { className: "mt-6", children: _jsx(FilterContent, {}) })] }) })] }));
}
