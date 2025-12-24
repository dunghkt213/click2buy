import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CreditCard, Facebook, Instagram, Mail, MapPin, Phone, RotateCcw, Shield, Truck, Twitter, Youtube } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
export function Footer() {
    const footerSections = [
        {
            title: 'Về TechStore',
            links: [
                'Giới thiệu',
                'Tuyển dụng',
                'Tin tức',
                'Hệ thống cửa hàng',
                'Liên hệ',
            ],
        },
        {
            title: 'Chính sách',
            links: [
                'Chính sách bảo hành',
                'Chính sách đổi trả',
                'Chính sách vận chuyển',
                'Chính sách bảo mật',
                'Điều khoản sử dụng',
            ],
        },
        {
            title: 'Hỗ trợ khách hàng',
            links: [
                'Hướng dẫn mua hàng',
                'Hướng dẫn thanh toán',
                'Câu hỏi thường gặp',
                'Bảo hành & sửa chữa',
                'Khiếu nại & góp ý',
            ],
        },
        {
            title: 'Danh mục sản phẩm',
            links: [
                'Thời trang',
                'Điện tử',
                'Nhà cửa',
                'Làm đẹp',
                'Thể thao',
            ],
        },
    ];
    const benefits = [
        {
            icon: Truck,
            title: 'Giao hàng toàn quốc',
            description: 'Miễn phí với đơn hàng trên 1 triệu',
        },
        {
            icon: Shield,
            title: 'Bảo hành chính hãng',
            description: 'Cam kết 100% hàng chính hãng',
        },
        {
            icon: RotateCcw,
            title: 'Đổi trả 15 ngày',
            description: 'Đổi trả miễn phí trong 15 ngày',
        },
        {
            icon: CreditCard,
            title: 'Thanh toán an toàn',
            description: 'Nhiều phương thức thanh toán',
        },
    ];
    return (_jsxs("footer", { className: "bg-card border-t border-border", children: [_jsx("div", { className: "border-b border-border", children: _jsx("div", { className: "container mx-auto px-4 py-12", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8", children: benefits.map((benefit, index) => (_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0", children: _jsx(benefit.icon, { className: "w-6 h-6 text-primary" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-sm", children: benefit.title }), _jsx("p", { className: "text-muted-foreground text-xs", children: benefit.description })] })] }, index))) }) }) }), _jsxs("div", { className: "container mx-auto px-4 py-12", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center", children: _jsx("div", { className: "w-4 h-4 bg-primary-foreground rounded-sm" }) }), _jsx("span", { className: "text-xl font-semibold", children: "Click2buy" })] }), _jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: "S\u00E0n th\u01B0\u01A1ng m\u1EA1i \u0111i\u1EC7n t\u1EED h\u00E0ng \u0111\u1EA7u Vi\u1EC7t Nam v\u1EDBi h\u01A1n 10 n\u0103m kinh nghi\u1EC7m. Cung c\u1EA5p \u0111a d\u1EA1ng s\u1EA3n ph\u1EA9m ch\u1EA5t l\u01B0\u1EE3ng v\u1EDBi gi\u00E1 c\u1EA3 c\u1EA1nh tranh nh\u1EA5t." }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(MapPin, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { children: "123 Nguyen Van A 144 Xuan Thuy" })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Phone, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { children: "1900 1234" })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Mail, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { children: "support@click2buy.vn" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", className: "w-10 h-10 p-0", children: _jsx(Facebook, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "sm", className: "w-10 h-10 p-0", children: _jsx(Instagram, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "sm", className: "w-10 h-10 p-0", children: _jsx(Twitter, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "sm", className: "w-10 h-10 p-0", children: _jsx(Youtube, { className: "w-4 h-4" }) })] })] }), footerSections.map((section, index) => (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "font-semibold", children: section.title }), _jsx("ul", { className: "space-y-2", children: section.links.map((link, linkIndex) => (_jsx("li", { children: _jsx("a", { href: "#", className: "text-muted-foreground hover:text-foreground text-sm transition-colors", children: link }) }, linkIndex))) })] }, index)))] }), _jsx("div", { className: "mt-12 pt-8 border-t border-border", children: _jsxs("div", { className: "grid md:grid-cols-2 gap-8 items-center", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: "\u0110\u0103ng k\u00FD nh\u1EADn tin khuy\u1EBFn m\u00E3i" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Nh\u1EADn th\u00F4ng tin v\u1EC1 s\u1EA3n ph\u1EA9m m\u1EDBi v\u00E0 c\u00E1c ch\u01B0\u01A1ng tr\u00ECnh khuy\u1EBFn m\u00E3i h\u1EA5p d\u1EABn" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: "Nh\u1EADp email c\u1EE7a b\u1EA1n...", className: "flex-1" }), _jsx(Button, { children: "\u0110\u0103ng k\u00FD" })] })] }) })] }), _jsx("div", { className: "border-t border-border bg-muted/30", children: _jsx("div", { className: "container mx-auto px-4 py-6", children: _jsxs("div", { className: "flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground", children: [_jsx("div", { className: "flex items-center gap-4", children: _jsx("span", { children: "\u00A9 2024 Click2buy. T\u1EA5t c\u1EA3 quy\u1EC1n \u0111\u01B0\u1EE3c b\u1EA3o l\u01B0u." }) }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { children: "Ph\u01B0\u01A1ng th\u1EE9c thanh to\u00E1n:" }), _jsx("div", { className: "flex items-center gap-2", children: ['VISA', 'MasterCard', 'Momo', 'ZaloPay'].map((method) => (_jsx("div", { className: "px-2 py-1 bg-card border border-border rounded text-xs", children: method }, method))) })] })] }) }) })] }));
}
