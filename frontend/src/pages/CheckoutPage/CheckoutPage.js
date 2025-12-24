import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * CheckoutPage - Trang thanh toán đơn hàng
 * Chuyển từ modal sang page riêng với header, footer và nút quay lại
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Card } from '../../components/ui/card';
import { ArrowLeft, MapPin, CreditCard, Truck, Tag, Plus, Shield, CheckCircle, Star, Save } from 'lucide-react';
import { formatPrice } from '../../utils/utils';
import { useAppContext } from '../../providers/AppProvider';
import { toast } from 'sonner';
import { getCache, setCache } from '../../utils/cache';
const paymentMethods = [
    {
        id: 'BANKING',
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
        id: 'COD',
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
export function CheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const app = useAppContext();
    // Lấy items từ location.state (khi mua ngay) hoặc từ cart items đã chọn
    const [items] = useState(() => {
        // Nếu có items từ location.state (mua ngay)
        if (location.state?.items && Array.isArray(location.state.items)) {
            return location.state.items;
        }
        // Nếu không, lấy từ cart items đã chọn
        if (app.getSelectedItems) {
            return app.getSelectedItems();
        }
        return [];
    });
    const [addressInput, setAddressInput] = useState({
        name: '',
        phone: '',
        ward: '',
        district: '',
        city: ''
    });
    const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]);
    const [shops, setShops] = useState([]);
    const [systemVoucher, setSystemVoucher] = useState('');
    const [note, setNote] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    // QR Payment Modal states (temporarily disabled)
    // const [qrPayments, setQrPayments] = useState<PaymentQR[]>([]);
    // const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    // Group items by sellerId và tạo shop data
    useEffect(() => {
        if (!items || items.length === 0) {
            setShops([]);
            return;
        }
        const shopsMap = new Map();
        items.forEach((item) => {
            if (!item.sellerId) {
                console.warn("Item thiếu sellerId:", item);
                return;
            }
            const sellerId = item.sellerId;
            const subtotal = item.price * item.quantity;
            if (!shopsMap.has(sellerId)) {
                shopsMap.set(sellerId, {
                    sellerId,
                    sellerName: `Shop ${sellerId.slice(-4)}`,
                    items: [],
                    subtotal: 0,
                    shippingMethod: shippingMethods[0], // Default shipping method
                    shippingFee: 0, // Will be calculated later
                    voucher: '',
                    voucherDiscount: 0,
                    total: 0
                });
            }
            const shop = shopsMap.get(sellerId);
            shop.items.push(item);
            shop.subtotal += subtotal;
        });
        // Calculate shipping fee for each shop
        const shopsArray = Array.from(shopsMap.values()).map(shop => {
            const shippingFee = shop.subtotal >= 1000000 ? 0 : shop.shippingMethod.price;
            const total = shop.subtotal + shippingFee - shop.voucherDiscount;
            return {
                ...shop,
                shippingFee,
                total
            };
        });
        setShops(shopsArray);
    }, [items]);
    // Scroll to top khi mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        // Nếu không có items, chuyển về cart
        if (!items || items.length === 0) {
            toast.error('Vui lòng chọn sản phẩm để thanh toán');
            navigate('/cart');
        }
    }, []);
    // Load saved address from cache
    useEffect(() => {
        const savedAddress = getCache('checkout_address');
        if (savedAddress) {
            setAddressInput(savedAddress);
        }
    }, []);
    // SSE for payment updates - Temporarily disabled
    // const { isConnected } = usePaymentSocket({
    //   isLoggedIn: app.isLoggedIn,
    //   onQRCreated: (payments: PaymentQR[]) => {
    //     console.log('QR Created:', payments);
    //     setQrPayments(payments);
    //     setIsQrModalOpen(true);
    //     setIsProcessing(false); // Stop loading when QR is ready
    //   },
    //   onPaymentSuccess: (data: any) => {
    //     console.log('Payment Success:', data);
    //     setIsQrModalOpen(false);
    //     toast.success('Thanh toán thành công! Đang chuyển hướng...');
    //     // Navigate to orders page after a short delay
    //     setTimeout(() => {
    //       navigate('/orders');
    //     }, 2000);
    //   },
    //   onQRExpired: (data: any) => {
    //     console.log('QR Expired:', data);
    //     setIsQrModalOpen(false);
    //     toast.error('Mã QR đã hết hạn. Vui lòng thử lại.');
    //   },
    // });
    // Handlers for shop-specific data
    const updateShopShipping = (sellerId, shippingMethod) => {
        setShops(prev => prev.map(shop => {
            if (shop.sellerId === sellerId) {
                const shippingFee = shop.subtotal >= 1000000 ? 0 : shippingMethod.price;
                const total = shop.subtotal + shippingFee - shop.voucherDiscount;
                return {
                    ...shop,
                    shippingMethod,
                    shippingFee,
                    total
                };
            }
            return shop;
        }));
    };
    const updateShopVoucher = (sellerId, voucher) => {
        setShops(prev => prev.map(shop => {
            if (shop.sellerId === sellerId) {
                const voucherDiscount = voucher === 'SAVE10' ? Math.min(shop.subtotal * 0.1, 50000) : 0;
                const total = shop.subtotal + shop.shippingFee - voucherDiscount;
                return {
                    ...shop,
                    voucher,
                    voucherDiscount,
                    total
                };
            }
            return shop;
        }));
    };
    const applyShopVoucher = (sellerId) => {
        const shop = shops.find(s => s.sellerId === sellerId);
        if (shop?.voucher === 'SAVE10') {
            toast.success(`Mã giảm giá của shop ${shop.sellerName} đã được áp dụng!`);
        }
        else {
            toast.error('Mã giảm giá không hợp lệ');
        }
    };
    const applySystemVoucher = () => {
        if (systemVoucher === 'SYSTEM10') {
            toast.success('Mã giảm giá hệ thống đã được áp dụng!');
        }
        else {
            toast.error('Mã giảm giá hệ thống không hợp lệ');
        }
    };
    // Save address to cache
    const saveAddress = () => {
        const { name, phone, ward, district, city } = addressInput;
        if (!name.trim() || !phone.trim() || !ward.trim() || !district.trim() || !city.trim()) {
            toast.error('Vui lòng nhập đầy đủ thông tin địa chỉ');
            return;
        }
        setCache('checkout_address', addressInput, 30 * 24 * 60 * 60 * 1000); // Save for 30 days
        toast.success('Địa chỉ đã được lưu!');
    };
    // Validate address input
    const isAddressValid = () => {
        const { name, phone, ward, district, city } = addressInput;
        return name.trim() && phone.trim() && ward.trim() && district.trim() && city.trim();
    };
    // Calculate totals
    const totalItems = shops.reduce((sum, shop) => sum + shop.items.reduce((shopSum, item) => shopSum + item.quantity, 0), 0);
    const totalSubtotal = shops.reduce((sum, shop) => sum + shop.subtotal, 0);
    const totalShippingFee = shops.reduce((sum, shop) => sum + shop.shippingFee, 0);
    const totalShopVoucherDiscount = shops.reduce((sum, shop) => sum + shop.voucherDiscount, 0);
    const paymentDiscount = selectedPayment.discount ? (totalSubtotal * selectedPayment.discount / 100) : 0;
    const systemVoucherDiscount = systemVoucher === 'SYSTEM10' ? Math.min(totalSubtotal * 0.1, 100000) : 0;
    const totalDiscount = paymentDiscount + totalShopVoucherDiscount + systemVoucherDiscount;
    const finalTotal = totalSubtotal + totalShippingFee - totalDiscount;
    const handleCheckout = async () => {
        if (!app.isLoggedIn) {
            app.handleLogin();
            return;
        }
        // Validate address before checkout
        if (!isAddressValid()) {
            toast.error('Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng');
            return;
        }
        setIsProcessing(true);
        try {
            // Tạo carts payload từ shops data
            const carts = shops.map(shop => ({
                sellerId: shop.sellerId,
                products: shop.items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                })),
                voucherCode: shop.voucher || undefined,
                shippingFee: shop.shippingFee,
                paymentDiscount: selectedPayment.discount ? (shop.subtotal * selectedPayment.discount / 100) : 0
            }));
            const checkoutPayload = {
                orderCode: Date.now().toString(),
                paymentMethod: selectedPayment.id,
                carts,
                address: `${addressInput.name} - ${addressInput.phone} - ${addressInput.ward}, ${addressInput.district}, ${addressInput.city}`,
                note,
            };
            console.log('🛒 Checkout payload với shops:', checkoutPayload);
            const orderResult = await app.handleCheckout(checkoutPayload);
            console.log('🧪 orderResult RAW:', orderResult);
            // Logic xử lý theo payment method
            if (selectedPayment.id === 'COD') {
                // COD: redirect thẳng đến orders
                toast.success('Đặt hàng thành công! Đơn hàng sẽ được giao trong 3-5 ngày.');
                navigate('/orders');
            }
            else {
                if (!orderResult?.orderCode) {
                    toast.error('Không lấy được mã đơn hàng');
                    return;
                }
                // Banking/ZaloPay/MoMo/ShopeePay: redirect đến payment process để hiển thị QR
                navigate(`/payment/process/${orderResult.orderCode}`, {
                    state: {
                        orderCode: orderResult?.orderCode,
                        totalAmount: finalTotal,
                        paymentMethod: selectedPayment.type
                    }
                });
            }
        }
        catch (error) {
            console.error('Checkout error:', error);
            toast.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
            setIsProcessing(false);
        }
        setIsProcessing(false);
    };
    // applyVoucher function removed - now handled per shop
    if (!items || items.length === 0) {
        return null; // Sẽ redirect về cart
    }
    return (_jsxs("div", { className: "min-h-screen bg-background pt-16", children: [_jsx("div", { className: "sticky top-16 z-30 bg-card border-b border-border", children: _jsx("div", { className: "container mx-auto px-4 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => navigate(-1), className: "gap-2", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Quay l\u1EA1i"] }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Thanh to\u00E1n \u0111\u01A1n h\u00E0ng" }), _jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [shops.length, " shop \u2022 ", totalItems, " m\u00F3n h\u00E0ng"] })] })] }), _jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center", children: _jsx(CreditCard, { className: "w-5 h-5 text-primary-foreground" }) })] }) }) }), _jsx("div", { className: "container mx-auto px-4 py-6", children: _jsxs("div", { className: "flex flex-col xl:flex-row gap-6", children: [_jsxs("div", { className: "flex-1 space-y-6 min-w-0", children: [_jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-5 h-5 text-primary" }), _jsx("h3", { className: "font-semibold", children: "\u0110\u1ECBa ch\u1EC9 giao h\u00E0ng" })] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2", onClick: saveAddress, children: [_jsx(Save, { className: "w-4 h-4" }), "L\u01B0u \u0111\u1ECBa ch\u1EC9"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "name", className: "text-sm font-medium", children: ["H\u1ECD v\u00E0 t\u00EAn ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "name", placeholder: "Nh\u1EADp h\u1ECD v\u00E0 t\u00EAn", value: addressInput.name, onChange: (e) => setAddressInput(prev => ({ ...prev, name: e.target.value })), className: "w-full" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "phone", className: "text-sm font-medium", children: ["S\u1ED1 \u0111i\u1EC7n tho\u1EA1i ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "phone", placeholder: "Nh\u1EADp s\u1ED1 \u0111i\u1EC7n tho\u1EA1i", value: addressInput.phone, onChange: (e) => setAddressInput(prev => ({ ...prev, phone: e.target.value })), className: "w-full" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "ward", className: "text-sm font-medium", children: ["Ph\u01B0\u1EDDng/X\u00E3 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "ward", placeholder: "Nh\u1EADp ph\u01B0\u1EDDng/x\u00E3", value: addressInput.ward, onChange: (e) => setAddressInput(prev => ({ ...prev, ward: e.target.value })), className: "w-full" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "district", className: "text-sm font-medium", children: ["Qu\u1EADn/Huy\u1EC7n ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "district", placeholder: "Nh\u1EADp qu\u1EADn/huy\u1EC7n", value: addressInput.district, onChange: (e) => setAddressInput(prev => ({ ...prev, district: e.target.value })), className: "w-full" })] }), _jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsxs(Label, { htmlFor: "city", className: "text-sm font-medium", children: ["T\u1EC9nh/Th\u00E0nh ph\u1ED1 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "city", placeholder: "Nh\u1EADp t\u1EC9nh/th\u00E0nh ph\u1ED1", value: addressInput.city, onChange: (e) => setAddressInput(prev => ({ ...prev, city: e.target.value })), className: "w-full" })] })] }), !isAddressValid() && (_jsx("div", { className: "mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg", children: _jsx("p", { className: "text-sm text-yellow-700 dark:text-yellow-300", children: "Vui l\u00F2ng nh\u1EADp \u0111\u1EA7y \u0111\u1EE7 th\u00F4ng tin \u0111\u1ECBa ch\u1EC9 \u0111\u1EC3 ti\u1EBFp t\u1EE5c thanh to\u00E1n" }) }))] }), _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(CreditCard, { className: "w-5 h-5 text-primary" }), _jsx("h3", { className: "font-semibold", children: "Ph\u01B0\u01A1ng th\u1EE9c thanh to\u00E1n" })] }), _jsx(RadioGroup, { value: selectedPayment.id, onValueChange: (value) => {
                                                const method = paymentMethods.find(m => m.id === value);
                                                if (method)
                                                    setSelectedPayment(method);
                                            }, className: "space-y-3", children: paymentMethods.map((method) => (_jsxs("div", { className: `flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${selectedPayment.id === method.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50'}`, children: [_jsx(RadioGroupItem, { value: method.id }), _jsxs("div", { className: "flex items-center gap-3 flex-1", children: [_jsx("span", { className: "text-2xl", children: method.icon }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "font-medium", children: method.name }), method.isRecommended && (_jsx(Badge, { variant: "secondary", className: "text-xs bg-green-50 text-green-700", children: "Khuy\u00EAn d\u00F9ng" })), method.discount && (_jsxs(Badge, { variant: "secondary", className: "text-xs bg-red-50 text-red-700", children: ["-", method.discount, "%"] }))] }), _jsx("p", { className: "text-sm text-muted-foreground", children: method.description })] })] })] }, method.id))) })] }), shops.map((shop) => (_jsx(Card, { className: "p-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between pb-4 border-b", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg", children: shop.sellerName }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [shop.items.length, " s\u1EA3n ph\u1EA9m \u2022 ", shop.items.reduce((sum, item) => sum + item.quantity, 0), " m\u00F3n h\u00E0ng"] })] }), _jsx(Badge, { variant: "outline", className: "text-xs", children: "Shop ri\u00EAng" })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "S\u1EA3n ph\u1EA9m" }), _jsx("div", { className: "space-y-3", children: shop.items.map((item) => (_jsxs("div", { className: "flex gap-3 p-3 bg-muted/20 rounded-lg", children: [_jsxs("div", { className: "relative w-12 h-12 bg-muted/20 rounded-lg overflow-hidden flex-shrink-0", children: [_jsx(ImageWithFallback, { src: item.image, alt: item.name, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium", children: item.quantity })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h5", { className: "text-sm font-medium line-clamp-2 mb-1", children: item.name }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Star, { className: "w-3 h-3 text-yellow-500 fill-current" }), _jsx("span", { className: "text-xs text-muted-foreground", children: item.rating })] }), _jsx("span", { className: "text-sm font-medium", children: formatPrice(item.price * item.quantity) })] })] })] }, item.id))) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("h4", { className: "font-medium flex items-center gap-2", children: [_jsx(Truck, { className: "w-4 h-4" }), "Ph\u01B0\u01A1ng th\u1EE9c v\u1EADn chuy\u1EC3n"] }), _jsx(RadioGroup, { value: shop.shippingMethod.id, onValueChange: (value) => {
                                                            const method = shippingMethods.find(m => m.id === value);
                                                            if (method)
                                                                updateShopShipping(shop.sellerId, method);
                                                        }, className: "space-y-2", children: shippingMethods.map((method) => (_jsxs("div", { className: `flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${shop.shippingMethod.id === method.id
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-border hover:border-primary/50'}`, children: [_jsx(RadioGroupItem, { value: method.id }), _jsxs("div", { className: "flex items-center justify-between flex-1", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "font-medium text-sm", children: method.name }), method.isRecommended && (_jsx(Badge, { variant: "secondary", className: "text-xs bg-green-50 text-green-700", children: "Khuy\u00EAn d\u00F9ng" }))] }), _jsx("p", { className: "text-xs text-muted-foreground", children: method.description })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium text-sm", children: shop.subtotal >= 1000000 ? (_jsx("span", { className: "text-green-600", children: "Mi\u1EC5n ph\u00ED" })) : (formatPrice(method.price)) }), _jsx("div", { className: "text-xs text-muted-foreground", children: method.estimatedTime })] })] })] }, method.id))) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("h4", { className: "font-medium flex items-center gap-2", children: [_jsx(Tag, { className: "w-4 h-4" }), "M\u00E3 gi\u1EA3m gi\u00E1 shop"] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Input, { placeholder: "Nh\u1EADp m\u00E3 gi\u1EA3m gi\u00E1 shop (VD: SAVE10)", value: shop.voucher, onChange: (e) => updateShopVoucher(shop.sellerId, e.target.value), className: "flex-1" }), _jsx(Button, { onClick: () => applyShopVoucher(shop.sellerId), variant: "outline", size: "sm", children: "\u00C1p d\u1EE5ng" })] }), shop.voucher === 'SAVE10' && shop.voucherDiscount > 0 && (_jsx("div", { className: "p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg", children: _jsxs("div", { className: "flex items-center gap-2 text-green-700 dark:text-green-300", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), _jsxs("span", { className: "text-sm font-medium", children: ["M\u00E3 gi\u1EA3m gi\u00E1 \u0111\u00E3 \u0111\u01B0\u1EE3c \u00E1p d\u1EE5ng! Gi\u1EA3m ", formatPrice(shop.voucherDiscount)] })] }) }))] }), _jsxs("div", { className: "bg-muted/20 rounded-lg p-4 space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { children: ["T\u1EA1m t\u00EDnh (", shop.items.length, " s\u1EA3n ph\u1EA9m)"] }), _jsx("span", { children: formatPrice(shop.subtotal) })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Ph\u00ED v\u1EADn chuy\u1EC3n" }), _jsx("span", { className: shop.shippingFee === 0 ? "text-green-600 font-medium" : "", children: shop.shippingFee === 0 ? "Miễn phí" : formatPrice(shop.shippingFee) })] }), shop.voucherDiscount > 0 && (_jsxs("div", { className: "flex justify-between text-sm text-green-600", children: [_jsx("span", { children: "M\u00E3 gi\u1EA3m gi\u00E1 shop" }), _jsxs("span", { children: ["-", formatPrice(shop.voucherDiscount)] })] })), _jsx(Separator, {}), _jsxs("div", { className: "flex justify-between font-semibold", children: [_jsx("span", { children: "T\u1ED5ng c\u1ED9ng shop" }), _jsx("span", { className: "text-primary", children: formatPrice(shop.total) })] })] })] }) }, shop.sellerId))), _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Tag, { className: "w-5 h-5 text-primary" }), _jsx("h3", { className: "font-semibold", children: "M\u00E3 gi\u1EA3m gi\u00E1 h\u1EC7 th\u1ED1ng" })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Input, { placeholder: "Nh\u1EADp m\u00E3 gi\u1EA3m gi\u00E1 h\u1EC7 th\u1ED1ng (VD: SYSTEM10)", value: systemVoucher, onChange: (e) => setSystemVoucher(e.target.value), className: "flex-1" }), _jsx(Button, { onClick: applySystemVoucher, variant: "outline", children: "\u00C1p d\u1EE5ng" })] }), systemVoucher === 'SYSTEM10' && systemVoucherDiscount > 0 && (_jsx("div", { className: "mt-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg", children: _jsxs("div", { className: "flex items-center gap-2 text-green-700 dark:text-green-300", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), _jsxs("span", { className: "text-sm font-medium", children: ["M\u00E3 gi\u1EA3m gi\u00E1 h\u1EC7 th\u1ED1ng \u0111\u00E3 \u0111\u01B0\u1EE3c \u00E1p d\u1EE5ng! Gi\u1EA3m ", formatPrice(systemVoucherDiscount)] })] }) }))] }), _jsxs(Card, { className: "p-6", children: [_jsxs(Label, { htmlFor: "note", className: "flex items-center gap-2 mb-3", children: [_jsx(Plus, { className: "w-4 h-4" }), "Ghi ch\u00FA cho \u0111\u01A1n h\u00E0ng (t\u00F9y ch\u1ECDn)"] }), _jsx(Textarea, { id: "note", placeholder: "Ghi ch\u00FA cho ng\u01B0\u1EDDi b\u00E1n...", value: note, onChange: (e) => setNote(e.target.value), className: "resize-none", rows: 3 })] })] }), _jsxs("div", { className: "xl:w-96 w-full xl:flex-shrink-0 space-y-6", children: [_jsxs(Card, { className: "p-6", children: [_jsxs("h3", { className: "font-semibold mb-4", children: ["\u0110\u01A1n h\u00E0ng (", totalItems, " s\u1EA3n ph\u1EA9m)"] }), _jsx("div", { className: "border border-border rounded-lg overflow-hidden", children: _jsx(ScrollArea, { className: "h-[320px] w-full", children: _jsx("div", { className: "space-y-4 pr-4 py-2", children: shops.map((shop) => (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "flex items-center gap-2 pb-2 border-b border-border/50", children: _jsx(Badge, { variant: "outline", className: "text-xs", children: shop.sellerName }) }), shop.items.map((item) => (_jsxs("div", { className: "flex gap-3", children: [_jsxs("div", { className: "relative w-12 h-12 bg-muted/20 rounded-lg overflow-hidden flex-shrink-0", children: [_jsx(ImageWithFallback, { src: item.image, alt: item.name, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium", children: item.quantity })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "text-sm font-medium line-clamp-2 mb-1", children: item.name }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Star, { className: "w-3 h-3 text-yellow-500 fill-current" }), _jsx("span", { className: "text-xs text-muted-foreground", children: item.rating })] }), _jsx("span", { className: "text-sm font-medium", children: formatPrice(item.price * item.quantity) })] })] })] }, item.id)))] }, shop.sellerId))) }) }) })] }), _jsxs(Card, { className: "p-6", children: [_jsx("h3", { className: "font-semibold mb-4", children: "Chi ti\u1EBFt thanh to\u00E1n" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { children: ["T\u1EA1m t\u00EDnh (", totalItems, " s\u1EA3n ph\u1EA9m)"] }), _jsx("span", { children: formatPrice(totalSubtotal) })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Ph\u00ED v\u1EADn chuy\u1EC3n t\u1ED5ng" }), _jsx("span", { className: totalShippingFee === 0 ? "text-green-600 font-medium" : "", children: totalShippingFee === 0 ? "Miễn phí" : formatPrice(totalShippingFee) })] }), paymentDiscount > 0 && (_jsxs("div", { className: "flex justify-between text-sm text-green-600", children: [_jsx("span", { children: "Gi\u1EA3m gi\u00E1 thanh to\u00E1n" }), _jsxs("span", { children: ["-", formatPrice(paymentDiscount)] })] })), totalShopVoucherDiscount > 0 && (_jsxs("div", { className: "flex justify-between text-sm text-green-600", children: [_jsx("span", { children: "M\u00E3 gi\u1EA3m gi\u00E1 shops" }), _jsxs("span", { children: ["-", formatPrice(totalShopVoucherDiscount)] })] })), systemVoucherDiscount > 0 && (_jsxs("div", { className: "flex justify-between text-sm text-green-600", children: [_jsx("span", { children: "M\u00E3 gi\u1EA3m gi\u00E1 h\u1EC7 th\u1ED1ng" }), _jsxs("span", { children: ["-", formatPrice(systemVoucherDiscount)] })] })), _jsx(Separator, {}), _jsxs("div", { className: "flex justify-between font-semibold text-lg", children: [_jsx("span", { children: "T\u1ED5ng c\u1ED9ng" }), _jsx("span", { className: "text-primary", children: formatPrice(finalTotal) })] })] })] }), _jsxs(Card, { className: "p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Shield, { className: "w-5 h-5 text-green-600" }), _jsx("span", { className: "font-medium text-green-700 dark:text-green-300", children: "Giao d\u1ECBch \u0111\u01B0\u1EE3c b\u1EA3o m\u1EADt" })] }), _jsx("p", { className: "text-sm text-green-600 dark:text-green-400", children: "Th\u00F4ng tin thanh to\u00E1n c\u1EE7a b\u1EA1n \u0111\u01B0\u1EE3c m\u00E3 h\u00F3a v\u00E0 b\u1EA3o v\u1EC7 an to\u00E0n" })] }), _jsx(Button, { className: "w-full h-12 text-base font-semibold", onClick: handleCheckout, disabled: isProcessing || !isAddressValid(), children: isProcessing ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" }), "\u0110ang x\u1EED l\u00FD..."] })) : (_jsxs(_Fragment, { children: ["\u0110\u1EB7t h\u00E0ng \u2022 ", formatPrice(finalTotal)] })) })] })] }) })] }));
}
