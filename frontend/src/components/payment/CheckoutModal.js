import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { MapPin, Edit, CreditCard, Truck, Shield, CheckCircle, Star, Tag, Plus } from 'lucide-react';
import { formatPrice } from '../../utils/utils';
const defaultAddresses = [
    {
        id: '1',
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        address: '123 Nguyen Van A',
        ward: 'Phường Xuân Thủy',
        district: 'Quận Cầu Giấy',
        city: 'Hà Nội',
        isDefault: true
    },
    {
        id: '2',
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        address: '144 Xuan Thuy',
        ward: 'Phường Dịch Vọng Hậu',
        district: 'Quận Cầu Giấy',
        city: 'Hà Nội',
        isDefault: false
    }
];
const paymentMethods = [
    {
        id: 'bank',
        type: 'BANKING',
        name: 'Chuyển khoản ngân hàng',
        description: 'Chuyển khoản qua ứng dụng ngân hàng',
        icon: '🏦',
        isRecommended: true,
        discount: 2
    },
    {
        id: 'zalopay',
        type: 'zalopay',
        name: 'ZaloPay',
        description: 'Thanh toán nhanh chóng, bảo mật',
        icon: '💙',
        discount: 1
    },
    {
        id: 'momo',
        type: 'momo',
        name: 'Ví MoMo',
        description: 'Thanh toán với ví điện tử MoMo',
        icon: '🟡'
    },
    {
        id: 'shopeepay',
        type: 'shopeepay',
        name: 'ShopeePay',
        description: 'Thanh toán với ví ShopeePay',
        icon: '🔶'
    },
    {
        id: 'credit-card',
        type: 'credit-card',
        name: 'Thẻ tín dụng/Ghi nợ',
        description: 'Visa, Mastercard, JCB',
        icon: '💳'
    },
    {
        id: 'cod',
        type: 'cod',
        name: 'Thanh toán khi nhận hàng',
        description: 'Thanh toán bằng tiền mặt khi nhận hàng',
        icon: '💰'
    }
];
const shippingMethods = [
    {
        id: 'standard',
        name: 'Giao hàng tiêu chuẩn',
        description: 'Giao trong 3-5 ngày làm việc',
        estimatedTime: '3-5 ngày',
        price: 30000,
        isRecommended: true
    },
    {
        id: 'express',
        name: 'Giao hàng nhanh',
        description: 'Giao trong 1-2 ngày làm việc',
        estimatedTime: '1-2 ngày',
        price: 50000
    },
    {
        id: 'same-day',
        name: 'Giao hàng trong ngày',
        description: 'Giao trong 4-6 giờ (khu vực nội thành)',
        estimatedTime: '4-6 giờ',
        price: 80000
    }
];
export function CheckoutModal({ isOpen, onClose, items, totalPrice, onCheckout }) {
    const [selectedAddress, setSelectedAddress] = useState(defaultAddresses[0]);
    const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]);
    const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0]);
    const [voucher, setVoucher] = useState('');
    const [note, setNote] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const shippingFee = totalPrice >= 1000000 ? 0 : selectedShipping.price;
    const paymentDiscount = selectedPayment.discount ? (totalPrice * selectedPayment.discount / 100) : 0;
    const voucherDiscount = voucher === 'SAVE10' ? Math.min(totalPrice * 0.1, 100000) : 0;
    const totalDiscount = paymentDiscount + voucherDiscount;
    const finalTotal = totalPrice + shippingFee - totalDiscount;
    const handleCheckout = async () => {
        setIsProcessing(true);
        // Simulate processing
        setTimeout(() => {
            const checkoutData = {
                shippingAddress: selectedAddress,
                paymentMethod: selectedPayment,
                shippingMethod: selectedShipping,
                items,
                subtotal: totalPrice,
                shippingFee,
                discount: totalDiscount,
                voucher: voucher || undefined,
                total: finalTotal,
                note: note || undefined
            };
            onCheckout(checkoutData);
            setIsProcessing(false);
            onClose();
        }, 2000);
    };
    const applyVoucher = () => {
        // Simple voucher logic
        if (voucher === 'SAVE10') {
            // Already applied in calculations
        }
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsx(DialogContent, { className: "!max-w-none !w-[70vw] !max-h-[98vh] p-0 overflow-hidden sm:rounded-xl", children: _jsxs("div", { className: "flex flex-col h-[98vh]", children: [_jsxs(DialogHeader, { className: "px-6 py-4 border-b border-border bg-card flex-shrink-0", children: [_jsxs(DialogTitle, { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center", children: _jsx(CreditCard, { className: "w-5 h-5 text-primary-foreground" }) }), _jsx("div", { children: _jsx("span", { children: "Thanh to\u00E1n \u0111\u01A1n h\u00E0ng" }) })] }), _jsxs(DialogDescription, { className: "text-sm text-muted-foreground ml-13", children: [items.length, " s\u1EA3n ph\u1EA9m \u2022 ", totalItems, " m\u00F3n h\u00E0ng"] })] }), _jsx("div", { className: "flex-1 overflow-hidden", children: _jsx(ScrollArea, { className: "h-full", children: _jsxs("div", { className: "flex flex-col xl:flex-row gap-6 p-6", children: [_jsxs("div", { className: "flex-1 space-y-6 min-w-0", children: [_jsxs("div", { className: "bg-card border border-border rounded-xl p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-5 h-5 text-primary" }), _jsx("h3", { className: "font-semibold", children: "\u0110\u1ECBa ch\u1EC9 giao h\u00E0ng" })] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2", children: [_jsx(Edit, { className: "w-4 h-4" }), "Thay \u0111\u1ED5i"] })] }), _jsx("div", { className: "space-y-3", children: defaultAddresses.map((address) => (_jsx("div", { className: `p-4 border rounded-lg cursor-pointer transition-all ${selectedAddress.id === address.id
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-border hover:border-primary/50'}`, onClick: () => setSelectedAddress(address), children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "font-medium", children: address.name }), _jsx("span", { className: "text-muted-foreground", children: "|" }), _jsx("span", { className: "text-muted-foreground", children: address.phone }), address.isDefault && (_jsx(Badge, { variant: "secondary", className: "text-xs", children: "M\u1EB7c \u0111\u1ECBnh" }))] }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [address.address, ", ", address.ward, ", ", address.district, ", ", address.city] })] }), selectedAddress.id === address.id && (_jsx(CheckCircle, { className: "w-5 h-5 text-primary flex-shrink-0" }))] }) }, address.id))) })] }), _jsxs("div", { className: "bg-card border border-border rounded-xl p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(CreditCard, { className: "w-5 h-5 text-primary" }), _jsx("h3", { className: "font-semibold", children: "Ph\u01B0\u01A1ng th\u1EE9c thanh to\u00E1n" })] }), _jsx(RadioGroup, { value: selectedPayment.id, onValueChange: (value) => {
                                                            const method = paymentMethods.find(m => m.id === value);
                                                            if (method)
                                                                setSelectedPayment(method);
                                                        }, className: "space-y-3", children: paymentMethods.map((method) => (_jsxs("div", { className: `flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${selectedPayment.id === method.id
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-border hover:border-primary/50'}`, children: [_jsx(RadioGroupItem, { value: method.id }), _jsxs("div", { className: "flex items-center gap-3 flex-1", children: [_jsx("span", { className: "text-2xl", children: method.icon }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "font-medium", children: method.name }), method.isRecommended && (_jsx(Badge, { variant: "secondary", className: "text-xs bg-green-50 text-green-700", children: "Khuy\u00EAn d\u00F9ng" })), method.discount && (_jsxs(Badge, { variant: "secondary", className: "text-xs bg-red-50 text-red-700", children: ["-", method.discount, "%"] }))] }), _jsx("p", { className: "text-sm text-muted-foreground", children: method.description })] })] })] }, method.id))) })] }), _jsxs("div", { className: "bg-card border border-border rounded-xl p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Truck, { className: "w-5 h-5 text-primary" }), _jsx("h3", { className: "font-semibold", children: "Ph\u01B0\u01A1ng th\u1EE9c v\u1EADn chuy\u1EC3n" })] }), _jsx(RadioGroup, { value: selectedShipping.id, onValueChange: (value) => {
                                                            const method = shippingMethods.find(m => m.id === value);
                                                            if (method)
                                                                setSelectedShipping(method);
                                                        }, className: "space-y-3", children: shippingMethods.map((method) => (_jsxs("div", { className: `flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${selectedShipping.id === method.id
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-border hover:border-primary/50'}`, children: [_jsx(RadioGroupItem, { value: method.id }), _jsxs("div", { className: "flex items-center justify-between flex-1", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "font-medium", children: method.name }), method.isRecommended && (_jsx(Badge, { variant: "secondary", className: "text-xs bg-green-50 text-green-700", children: "Khuy\u00EAn d\u00F9ng" }))] }), _jsx("p", { className: "text-sm text-muted-foreground", children: method.description })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium", children: totalPrice >= 1000000 ? (_jsx("span", { className: "text-green-600", children: "Mi\u1EC5n ph\u00ED" })) : (formatPrice(method.price)) }), _jsx("div", { className: "text-xs text-muted-foreground", children: method.estimatedTime })] })] })] }, method.id))) })] }), _jsxs("div", { className: "bg-card border border-border rounded-xl p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Tag, { className: "w-5 h-5 text-primary" }), _jsx("h3", { className: "font-semibold", children: "M\u00E3 gi\u1EA3m gi\u00E1" })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Input, { placeholder: "Nh\u1EADp m\u00E3 gi\u1EA3m gi\u00E1 (VD: SAVE10)", value: voucher, onChange: (e) => setVoucher(e.target.value), className: "flex-1" }), _jsx(Button, { onClick: applyVoucher, variant: "outline", children: "\u00C1p d\u1EE5ng" })] }), voucher === 'SAVE10' && (_jsx("div", { className: "mt-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg", children: _jsxs("div", { className: "flex items-center gap-2 text-green-700 dark:text-green-300", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), _jsxs("span", { className: "text-sm font-medium", children: ["M\u00E3 gi\u1EA3m gi\u00E1 \u0111\u00E3 \u0111\u01B0\u1EE3c \u00E1p d\u1EE5ng! Gi\u1EA3m ", formatPrice(voucherDiscount)] })] }) }))] }), _jsxs("div", { className: "bg-card border border-border rounded-xl p-6", children: [_jsxs(Label, { htmlFor: "note", className: "flex items-center gap-2 mb-3", children: [_jsx(Plus, { className: "w-4 h-4" }), "Ghi ch\u00FA cho \u0111\u01A1n h\u00E0ng (t\u00F9y ch\u1ECDn)"] }), _jsx(Textarea, { id: "note", placeholder: "Ghi ch\u00FA cho ng\u01B0\u1EDDi b\u00E1n...", value: note, onChange: (e) => setNote(e.target.value), className: "resize-none", rows: 3 })] })] }), _jsxs("div", { className: "xl:w-96 w-full xl:flex-shrink-0 space-y-6", children: [_jsxs("div", { className: "bg-card border border-border rounded-xl p-6", children: [_jsxs("h3", { className: "font-semibold mb-4", children: ["\u0110\u01A1n h\u00E0ng (", items.length, " s\u1EA3n ph\u1EA9m)"] }), _jsx("div", { className: "space-y-4 max-h-48 overflow-y-auto", children: items.map((item) => (_jsxs("div", { className: "flex gap-3", children: [_jsxs("div", { className: "relative w-12 h-12 bg-muted/20 rounded-lg overflow-hidden flex-shrink-0", children: [_jsx(ImageWithFallback, { src: item.image, alt: item.name, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium", children: item.quantity })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "text-sm font-medium line-clamp-2 mb-1", children: item.name }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Star, { className: "w-3 h-3 text-yellow-500 fill-current" }), _jsx("span", { className: "text-xs text-muted-foreground", children: item.rating })] }), _jsx("span", { className: "text-sm font-medium", children: formatPrice(item.price * item.quantity) })] })] })] }, item.id))) })] }), _jsxs("div", { className: "bg-card border border-border rounded-xl p-6", children: [_jsx("h3", { className: "font-semibold mb-4", children: "Chi ti\u1EBFt thanh to\u00E1n" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { children: ["T\u1EA1m t\u00EDnh (", totalItems, " s\u1EA3n ph\u1EA9m)"] }), _jsx("span", { children: formatPrice(totalPrice) })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Ph\u00ED v\u1EADn chuy\u1EC3n" }), _jsx("span", { className: shippingFee === 0 ? "text-green-600 font-medium" : "", children: shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee) })] }), paymentDiscount > 0 && (_jsxs("div", { className: "flex justify-between text-sm text-green-600", children: [_jsx("span", { children: "Gi\u1EA3m gi\u00E1 thanh to\u00E1n" }), _jsxs("span", { children: ["-", formatPrice(paymentDiscount)] })] })), voucherDiscount > 0 && (_jsxs("div", { className: "flex justify-between text-sm text-green-600", children: [_jsx("span", { children: "M\u00E3 gi\u1EA3m gi\u00E1" }), _jsxs("span", { children: ["-", formatPrice(voucherDiscount)] })] })), _jsx(Separator, {}), _jsxs("div", { className: "flex justify-between font-semibold text-lg", children: [_jsx("span", { children: "T\u1ED5ng c\u1ED9ng" }), _jsx("span", { className: "text-primary", children: formatPrice(finalTotal) })] })] })] }), _jsxs("div", { className: "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Shield, { className: "w-5 h-5 text-green-600" }), _jsx("span", { className: "font-medium text-green-700 dark:text-green-300", children: "Giao d\u1ECBch \u0111\u01B0\u1EE3c b\u1EA3o m\u1EADt" })] }), _jsx("p", { className: "text-sm text-green-600 dark:text-green-400", children: "Th\u00F4ng tin thanh to\u00E1n c\u1EE7a b\u1EA1n \u0111\u01B0\u1EE3c m\u00E3 h\u00F3a v\u00E0 b\u1EA3o v\u1EC7 an to\u00E0n" })] }), _jsx(Button, { className: "w-full h-12 text-base font-semibold", onClick: handleCheckout, disabled: isProcessing, children: isProcessing ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" }), "\u0110ang x\u1EED l\u00FD..."] })) : (_jsxs(_Fragment, { children: ["\u0110\u1EB7t h\u00E0ng \u2022 ", formatPrice(finalTotal)] })) })] })] }) }) })] }) }) }));
}
