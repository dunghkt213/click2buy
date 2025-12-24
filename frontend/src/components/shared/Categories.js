import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Baby, BookOpen, Car, Dumbbell, Home, Shirt, Sparkles, Zap } from 'lucide-react';
import { Card } from '../ui/card';
export function Categories({ onCategorySelect, onCategoryClick }) {
    // Handler khi click category - chọn category và scroll xuống sản phẩm
    const handleCategoryClick = (categoryId) => {
        onCategorySelect(categoryId);
        onCategoryClick?.(); // Gọi callback để scroll xuống
    };
    const categories = [
        { id: 'fashion', name: 'Thời trang', icon: Shirt, color: 'from-pink-500/20 to-pink-600/20' },
        { id: 'electronics', name: 'Điện tử', icon: Zap, color: 'from-blue-500/20 to-blue-600/20' },
        { id: 'home', name: 'Nhà cửa', icon: Home, color: 'from-green-500/20 to-green-600/20' },
        { id: 'books', name: 'Sách', icon: BookOpen, color: 'from-amber-500/20 to-amber-600/20' },
        { id: 'sports', name: 'Thể thao', icon: Dumbbell, color: 'from-red-500/20 to-red-600/20' },
        { id: 'beauty', name: 'Làm đẹp', icon: Sparkles, color: 'from-purple-500/20 to-purple-600/20' },
        { id: 'baby', name: 'Mẹ & Bé', icon: Baby, color: 'from-cyan-500/20 to-cyan-600/20' },
        { id: 'toys', name: 'Đồ chơi', icon: Car, color: 'from-gray-500/20 to-gray-600/20' },
    ];
    return (_jsx("section", { className: "py-16 bg-muted/30", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "text-3xl font-bold mb-4", children: "Danh m\u1EE5c s\u1EA3n ph\u1EA9m" }), _jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto", children: "Kh\u00E1m ph\u00E1 c\u00E1c danh m\u1EE5c s\u1EA3n ph\u1EA9m \u0111a d\u1EA1ng v\u1EDBi ch\u1EA5t l\u01B0\u1EE3ng cao v\u00E0 gi\u00E1 c\u1EA3 ph\u1EA3i ch\u0103ng" })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8", children: categories.map((category) => (_jsx(Card, { className: "group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/80", onClick: () => handleCategoryClick(category.id), children: _jsxs("div", { className: "p-6 text-center", children: [_jsx("div", { className: `w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`, children: _jsx(category.icon, { className: "w-8 h-8 text-foreground" }) }), _jsx("h3", { className: "font-medium text-sm", children: category.name })] }) }, category.id))) })] }) }));
}
