import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * PaymentProcessPage - Trang xử lý thanh toán với header/footer
 * Hiển thị loading → QR code → Payment confirmation
 */
import { paymentApi } from '@/apis/payment/payment';
import { usePaymentSocket } from '@/hooks/usePaymentSocket';
import { AlertCircle, CheckCircle, Clock, Copy, CreditCard, ExternalLink, Home, Loader2, Smartphone } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAppContext } from '../providers/AppProvider';
import { formatPrice } from '../utils/utils';
//test add
export function PaymentProcessPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const app = useAppContext();
    const state = location.state ?? null;
    const [currentStep, setCurrentStep] = useState('connecting');
    const [payments, setPayments] = useState([]);
    const [timeLeft, setTimeLeft] = useState(900);
    const [isExpired, setIsExpired] = useState(false);
    const { orderCode } = useParams();
    const orderCodeRef = useRef(orderCode ?? null);
    const [expiredAt, setExpiredAt] = useState(null);
    console.log('🚀 PaymentProcessPage render', {
        orderCode,
        now: new Date().toISOString(),
    });
    // Redirect if no order data
    useEffect(() => {
        if (orderCode && !orderCodeRef.current) {
            orderCodeRef.current = orderCode;
        }
    }, [orderCode]);
    const { isConnected } = usePaymentSocket({
        isLoggedIn: app.isLoggedIn,
        onQRCreated: (data) => {
            console.log('🧪 onQRCreated CALLED', data);
            if (!data?.orderCode)
                return;
            if (data.orderCode !== orderCodeRef.current) {
                console.log('data.orderCode', data.orderCode);
                console.log('orderCodeRef.current', orderCodeRef.current);
                console.warn('⚠️ QR không thuộc đơn hiện tại – bỏ qua');
                return;
            }
            setPayments([{
                    orderCode: data.orderCode,
                    qrCode: data.qrCode,
                    checkoutUrl: data.checkoutUrl,
                    expireIn: 0,
                }]);
            setExpiredAt(new Date(data.expiredAt));
            setIsExpired(false);
            setCurrentStep('qr');
        },
        onPaymentSuccess: () => {
            setCurrentStep('success');
            toast.success('Thanh toán thành công!');
            setTimeout(() => navigate('/orders'), 3000);
        },
        onQRExpired: () => {
            setIsExpired(true);
            toast.error('Mã QR đã hết hạn');
        },
    });
    // Update step when SSE connects
    useEffect(() => {
        if (isConnected && currentStep === 'connecting') {
            setCurrentStep('loading');
            console.log('💳 SSE connected, moving to loading step');
        }
    }, [isConnected, currentStep]);
    // Countdown timer for QR
    useEffect(() => {
        if (!expiredAt || currentStep !== 'qr')
            return;
        const tick = () => {
            const diff = Math.floor((expiredAt.getTime() - Date.now()) / 1000);
            if (diff <= 0) {
                setTimeLeft(0);
                setIsExpired(true);
                return;
            }
            setTimeLeft(diff);
        };
        tick(); // chạy ngay
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [expiredAt, currentStep]);
    useEffect(() => {
        if (!orderCode)
            return;
        orderCodeRef.current = orderCode;
        const fetchPayment = async () => {
            try {
                console.log('🔁 CALL getPaymentByOrder', {
                    orderCode,
                    time: new Date().toISOString(),
                });
                const res = await paymentApi.getPaymentByOrder(orderCode);
                const payment = res.data;
                console.log('✅ API RESPONSE getPaymentByOrder', payment);
                if (!payment.exists) {
                    // chưa từng tạo payment
                    setIsExpired(true);
                    setPayments([]);
                    setCurrentStep('qr');
                    return;
                }
                console.log('💳 Payment status:', payment.status);
                if (payment.status === 'EXPIRED') {
                    setIsExpired(true);
                    setPayments([]);
                    setCurrentStep('qr');
                    return;
                }
                if (payment.status === 'SUCCESS') {
                    setCurrentStep('success');
                    return;
                }
                if (payment.status === 'PENDING') {
                    if (!payment.qrCode || !payment.checkoutUrl) {
                        setCurrentStep('loading');
                        return;
                    }
                    setPayments([{
                            orderCode: payment.orderCode,
                            qrCode: payment.qrCode,
                            checkoutUrl: payment.checkoutUrl,
                            expireIn: payment.expireIn ?? 0,
                        }]);
                    if (payment.expiredAt) {
                        setExpiredAt(new Date(payment.expiredAt));
                    }
                    setTimeLeft(payment.expireIn ?? 0);
                    setIsExpired(false);
                    setCurrentStep('qr');
                }
            }
            catch (err) {
                console.error('❌ getPaymentByOrder failed', err);
                toast.error('Không lấy được trạng thái thanh toán');
            }
        };
        fetchPayment();
    }, [orderCode]);
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Đã sao chép vào clipboard');
    };
    const openPaymentUrl = (url) => {
        window.open(url, '_blank');
    };
    const handleBackToHome = () => {
        navigate('/');
    };
    const handleRegenerateQR = async () => {
        if (!orderCodeRef.current)
            return;
        try {
            toast.loading('Đang tạo mã QR mới...', { id: 'regen-qr' });
            await paymentApi.createPayment({
                orderCode: orderCodeRef.current,
            });
            toast.success('Đã yêu cầu tạo mã QR mới', { id: 'regen-qr' });
        }
        catch (err) {
            console.error('❌ regenerate QR failed', err);
            toast.error('Không thể tạo mã QR mới');
        }
        finally {
            toast.dismiss('regen-qr');
        }
    };
    const getStepContent = () => {
        if (!orderCodeRef.current) {
            return (_jsx("div", { className: "text-center text-red-500", children: "Kh\u00F4ng t\u00ECm th\u1EA5y m\u00E3 \u0111\u01A1n h\u00E0ng" }));
        }
        switch (currentStep) {
            case 'connecting':
                return (_jsxs("div", { className: "text-center space-y-6", children: [_jsx("div", { className: "flex justify-center", children: _jsxs("div", { className: "relative", children: [_jsx(Loader2, { className: "w-16 h-16 animate-spin text-primary" }), _jsx("div", { className: "absolute inset-0 rounded-full border-4 border-primary/20" })] }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold mb-2", children: "\u0110ang k\u1EBFt n\u1ED1i..." }), _jsx("p", { className: "text-muted-foreground", children: "\u0110ang thi\u1EBFt l\u1EADp k\u1EBFt n\u1ED1i b\u1EA3o m\u1EADt \u0111\u1EC3 x\u1EED l\u00FD thanh to\u00E1n" })] }), _jsx("div", { className: "space-y-3", children: _jsxs("div", { className: "flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}` }), _jsx("span", { className: "text-sm font-medium", children: isConnected ? 'Đã kết nối' : 'Đang kết nối...' })] }) })] }));
            case 'loading':
                return (_jsxs("div", { className: "text-center space-y-6", children: [_jsx("div", { className: "flex justify-center", children: _jsxs("div", { className: "relative", children: [_jsx(Loader2, { className: "w-16 h-16 animate-spin text-primary" }), _jsx("div", { className: "absolute inset-0 rounded-full border-4 border-primary/20" })] }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold mb-2", children: "\u0110ang x\u1EED l\u00FD..." }), _jsx("p", { className: "text-muted-foreground", children: "\u0110ang t\u1EA1o m\u00E3 QR thanh to\u00E1n cho \u0111\u01A1n h\u00E0ng c\u1EE7a b\u1EA1n" })] }), _jsxs("div", { className: "text-sm text-muted-foreground space-y-1", children: [_jsxs("p", { children: ["M\u00E3 \u0111\u01A1n: ", state?.orderCode ?? '---'] }), state && (_jsxs(_Fragment, { children: [_jsxs("p", { children: ["Ph\u01B0\u01A1ng th\u1EE9c: ", state.paymentMethod === 'BANKING' ? 'Chuyển khoản' : 'COD'] }), _jsxs("p", { children: ["S\u1ED1 ti\u1EC1n: ", formatPrice(state?.totalAmount ?? 0)] })] }))] })] }));
            case 'qr':
                if (isExpired) {
                    return (_jsxs("div", { className: "text-center space-y-6", children: [_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-red-700", children: [_jsx(AlertCircle, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "M\u00E3 QR \u0111\u00E3 h\u1EBFt h\u1EA1n" })] }), _jsx("p", { className: "text-red-600 text-sm mt-1", children: "Vui l\u00F2ng t\u1EA1o m\u00E3 QR m\u1EDBi \u0111\u1EC3 ti\u1EBFp t\u1EE5c thanh to\u00E1n." })] }), _jsxs(Button, { className: "w-full bg-primary hover:bg-primary/90", onClick: handleRegenerateQR, children: [_jsx(CreditCard, { className: "w-4 h-4 mr-2" }), "T\u1EA1o m\u00E3 QR m\u1EDBi"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "M\u00E3 QR m\u1EDBi s\u1EBD c\u00F3 hi\u1EC7u l\u1EF1c trong 15 ph\u00FAt" })] }));
                }
                const firstPayment = payments[0];
                if (!firstPayment) {
                    return (_jsxs("div", { className: "text-center space-y-6", children: [_jsx(Loader2, { className: "w-12 h-12 animate-spin mx-auto text-primary" }), _jsx("p", { className: "text-muted-foreground", children: "\u0110ang t\u1EA3i m\u00E3 QR thanh to\u00E1n..." })] }));
                }
                return (_jsxs("div", { className: "text-center space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold mb-2", children: "Thanh to\u00E1n qua QR Code" }), _jsx("p", { className: "text-muted-foreground", children: "Qu\u00E9t m\u00E3 QR b\u1EB1ng \u1EE9ng d\u1EE5ng ng\u00E2n h\u00E0ng \u0111\u1EC3 thanh to\u00E1n" })] }), _jsx("div", { className: "flex justify-center", children: _jsxs("div", { className: `inline-flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 60
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : timeLeft < 300
                                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                        : 'bg-green-50 text-green-700 border border-green-200'}`, children: [_jsx(Clock, { className: "w-4 h-4" }), _jsx("span", { className: "font-mono font-semibold", children: isExpired ? '00:00' : formatTime(timeLeft) })] }) }), timeLeft < 60 && !isExpired && (_jsx("p", { className: "text-sm text-red-600 font-medium", children: "\u26A0\uFE0F M\u00E3 QR s\u1EAFp h\u1EBFt h\u1EA1n!" })), isExpired && (_jsxs("div", { className: "space-y-3", children: [_jsxs(Button, { className: "w-full bg-primary hover:bg-primary/90", onClick: handleRegenerateQR, children: [_jsx(CreditCard, { className: "w-4 h-4 mr-2" }), "T\u1EA1o m\u00E3 QR m\u1EDBi"] }), _jsx("p", { className: "text-xs text-muted-foreground text-center", children: "M\u00E3 QR m\u1EDBi s\u1EBD c\u00F3 hi\u1EC7u l\u1EF1c trong 15 ph\u00FAt" })] })), !isExpired && (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex justify-center", children: _jsx("div", { className: "p-6 bg-white rounded-lg border-2 border-gray-200", children: _jsx("div", { className: "flex justify-center", children: _jsx("div", { className: "p-6 bg-white rounded-lg border-2 border-gray-200", children: _jsx(QRCodeCanvas, { value: firstPayment.qrCode, size: 256, level: "M", includeMargin: true }) }) }) }) }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "S\u1ED1 ti\u1EC1n:" }), _jsx("span", { className: "font-semibold text-lg text-primary", children: formatPrice(state?.totalAmount ?? 0) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "M\u00E3 \u0111\u01A1n:" }), _jsxs("span", { className: "font-mono text-sm", children: [firstPayment.orderCode.substring(0, 8), "..."] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs(Button, { className: "w-full", onClick: () => openPaymentUrl(firstPayment.checkoutUrl), children: [_jsx(Smartphone, { className: "w-4 h-4 mr-2" }), "M\u1EDF \u1EE9ng d\u1EE5ng thanh to\u00E1n", _jsx(ExternalLink, { className: "w-4 h-4 ml-2" })] }), _jsxs(Button, { variant: "outline", className: "w-full", onClick: () => copyToClipboard(firstPayment.checkoutUrl), children: [_jsx(Copy, { className: "w-4 h-4 mr-2" }), "Sao ch\u00E9p link thanh to\u00E1n"] })] })] })), _jsxs("div", { className: "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4", children: [_jsx("h3", { className: "font-medium text-blue-900 dark:text-blue-100 mb-2", children: "H\u01B0\u1EDBng d\u1EABn thanh to\u00E1n:" }), _jsxs("ol", { className: "text-sm text-blue-800 dark:text-blue-200 space-y-1", children: [_jsx("li", { children: "1. M\u1EDF \u1EE9ng d\u1EE5ng ng\u00E2n h\u00E0ng ho\u1EB7c v\u00ED \u0111i\u1EC7n t\u1EED" }), _jsx("li", { children: "2. Qu\u00E9t m\u00E3 QR ho\u1EB7c nh\u1EA5n v\u00E0o link thanh to\u00E1n" }), _jsx("li", { children: "3. X\u00E1c nh\u1EADn s\u1ED1 ti\u1EC1n v\u00E0 ho\u00E0n t\u1EA5t thanh to\u00E1n" }), _jsx("li", { children: "4. Ch\u1EDD h\u1EC7 th\u1ED1ng x\u00E1c nh\u1EADn thanh to\u00E1n t\u1EF1 \u0111\u1ED9ng" })] })] })] }));
            case 'success':
                return (_jsxs("div", { className: "text-center space-y-6", children: [_jsx("div", { className: "flex justify-center", children: _jsxs("div", { className: "relative", children: [_jsx(CheckCircle, { className: "w-16 h-16 text-green-600" }), _jsx("div", { className: "absolute inset-0 rounded-full border-4 border-green-200 animate-ping" })] }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold text-green-800 mb-2", children: "Thanh to\u00E1n th\u00E0nh c\u00F4ng!" }), _jsx("p", { className: "text-muted-foreground", children: "\u0110\u01A1n h\u00E0ng c\u1EE7a b\u1EA1n \u0111ang \u0111\u01B0\u1EE3c x\u1EED l\u00FD. B\u1EA1n s\u1EBD \u0111\u01B0\u1EE3c chuy\u1EC3n h\u01B0\u1EDBng trong gi\u00E2y l\u00E1t..." })] }), _jsx(Button, { onClick: () => navigate('/orders'), className: "bg-green-600 hover:bg-green-700", children: "Xem \u0111\u01A1n h\u00E0ng" })] }));
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx("div", { className: "sticky top-0 z-30 bg-card border-b border-border", children: _jsx("div", { className: "container mx-auto px-4 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: handleBackToHome, className: "gap-2", children: [_jsx(Home, { className: "w-4 h-4" }), "V\u1EC1 trang ch\u1EE7"] }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-semibold", children: "X\u1EED l\u00FD thanh to\u00E1n" }), orderCodeRef.current && (_jsxs("p", { className: "text-sm text-muted-foreground", children: ["\u0110\u01A1n h\u00E0ng: ", orderCodeRef.current.slice(0, 8), "..."] }))] })] }), _jsxs("div", { className: `flex items-center gap-2 px-3 py-1 rounded-full text-xs ${isConnected ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}` }), isConnected ? 'Đã kết nối' : 'Đang kết nối...'] })] }) }) }), _jsx("div", { className: "container mx-auto px-4 py-12", children: _jsx("div", { className: "max-w-2xl mx-auto", children: _jsx(Card, { className: "p-8", children: getStepContent() }) }) })] }));
}
