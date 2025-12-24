import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Clock, CreditCard, Smartphone, AlertCircle, Copy, ExternalLink, X } from 'lucide-react';
import { formatPrice } from '../../utils/utils';
import { toast } from 'sonner';
export function QRPaymentModal({ isOpen, onClose, payments, totalAmount, onPaymentSuccess }) {
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
    const [isExpired, setIsExpired] = useState(false);
    // Reset timer when modal opens with new payments
    useEffect(() => {
        if (isOpen && payments.length > 0) {
            setTimeLeft(900); // Reset to 15 minutes
            setIsExpired(false);
        }
    }, [isOpen, payments]);
    // Countdown timer
    useEffect(() => {
        if (!isOpen || isExpired)
            return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsExpired(true);
                    toast.error('Mã QR đã hết hạn. Vui lòng thử lại.');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen, isExpired]);
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
    if (!payments || payments.length === 0)
        return null;
    const firstPayment = payments[0];
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "max-w-md mx-auto", children: [_jsxs(DialogHeader, { className: "text-center", children: [_jsxs(DialogTitle, { className: "flex items-center justify-center gap-2", children: [_jsx(CreditCard, { className: "w-5 h-5" }), "Thanh to\u00E1n qua QR Code"] }), _jsx(DialogDescription, { children: "Qu\u00E9t m\u00E3 QR b\u1EB1ng \u1EE9ng d\u1EE5ng ng\u00E2n h\u00E0ng \u0111\u1EC3 thanh to\u00E1n" })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: `inline-flex items-center gap-2 px-3 py-2 rounded-lg ${timeLeft < 60
                                        ? 'bg-red-50 text-red-700 border border-red-200'
                                        : timeLeft < 300
                                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                            : 'bg-green-50 text-green-700 border border-green-200'}`, children: [_jsx(Clock, { className: "w-4 h-4" }), _jsx("span", { className: "font-mono font-semibold", children: isExpired ? '00:00' : formatTime(timeLeft) })] }), timeLeft < 60 && !isExpired && (_jsx("p", { className: "text-sm text-red-600 mt-1", children: "M\u00E3 QR s\u1EAFp h\u1EBFt h\u1EA1n!" })), isExpired && (_jsx("p", { className: "text-sm text-red-600 mt-1", children: "M\u00E3 QR \u0111\u00E3 h\u1EBFt h\u1EA1n. Vui l\u00F2ng th\u1EED l\u1EA1i." }))] }), _jsx("div", { className: "text-center", children: _jsxs("div", { className: "relative inline-block", children: [_jsx("div", { className: `p-4 bg-white rounded-lg border-2 ${isExpired ? 'border-red-200' : 'border-gray-200'}`, children: isExpired ? (_jsx("div", { className: "w-48 h-48 flex items-center justify-center bg-gray-50 rounded", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertCircle, { className: "w-12 h-12 text-red-500 mx-auto mb-2" }), _jsx("p", { className: "text-sm text-gray-600", children: "QR h\u1EBFt h\u1EA1n" })] }) })) : (_jsx(ImageWithFallback, { src: firstPayment.qrCode, alt: "QR Code", className: "w-48 h-48", fallback: _jsx("div", { className: "w-48 h-48 flex items-center justify-center bg-gray-50 rounded", children: _jsx("p", { className: "text-sm text-gray-600", children: "Kh\u00F4ng th\u1EC3 t\u1EA3i QR" }) }) })) }), isExpired && (_jsx("div", { className: "absolute inset-0 bg-red-500/10 rounded-lg flex items-center justify-center", children: _jsx(X, { className: "w-16 h-16 text-red-500" }) }))] }) }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "S\u1ED1 ti\u1EC1n:" }), _jsx("span", { className: "font-semibold text-lg text-primary", children: formatPrice(totalAmount) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "M\u00E3 \u0111\u01A1n:" }), _jsxs("span", { className: "font-mono text-sm", children: [firstPayment.orderId.substring(0, 8), "..."] })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-3", children: [!isExpired && (_jsxs(Button, { className: "w-full", onClick: () => openPaymentUrl(firstPayment.checkoutUrl), children: [_jsx(Smartphone, { className: "w-4 h-4 mr-2" }), "M\u1EDF \u1EE9ng d\u1EE5ng thanh to\u00E1n", _jsx(ExternalLink, { className: "w-4 h-4 ml-2" })] })), _jsxs(Button, { variant: "outline", className: "w-full", onClick: () => copyToClipboard(firstPayment.checkoutUrl), children: [_jsx(Copy, { className: "w-4 h-4 mr-2" }), "Sao ch\u00E9p link thanh to\u00E1n"] }), _jsx("div", { className: "text-center", children: _jsx("p", { className: "text-xs text-muted-foreground", children: "Ch\u1EDD thanh to\u00E1n th\u00E0nh c\u00F4ng t\u1EF1 \u0111\u1ED9ng c\u1EADp nh\u1EADt..." }) })] }), _jsxs("div", { className: "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-blue-900 dark:text-blue-100 mb-2", children: "H\u01B0\u1EDBng d\u1EABn thanh to\u00E1n:" }), _jsxs("ol", { className: "text-sm text-blue-800 dark:text-blue-200 space-y-1", children: [_jsx("li", { children: "1. M\u1EDF \u1EE9ng d\u1EE5ng ng\u00E2n h\u00E0ng ho\u1EB7c v\u00ED \u0111i\u1EC7n t\u1EED" }), _jsx("li", { children: "2. Qu\u00E9t m\u00E3 QR ho\u1EB7c nh\u1EA5n v\u00E0o link thanh to\u00E1n" }), _jsx("li", { children: "3. X\u00E1c nh\u1EADn s\u1ED1 ti\u1EC1n v\u00E0 ho\u00E0n t\u1EA5t thanh to\u00E1n" }), _jsx("li", { children: "4. Ch\u1EDD h\u1EC7 th\u1ED1ng x\u00E1c nh\u1EADn thanh to\u00E1n" })] })] })] }), _jsx(Button, { variant: "ghost", size: "sm", className: "absolute right-4 top-4", onClick: onClose, children: _jsx(X, { className: "w-4 h-4" }) })] }) }));
}
