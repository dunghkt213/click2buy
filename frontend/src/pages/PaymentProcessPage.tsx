/**
 * PaymentProcessPage - Trang xử lý thanh toán với header/footer
 * Hiển thị loading → QR code → Payment confirmation
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  ArrowLeft,
  Clock,
  CreditCard,
  Smartphone,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
  Loader2,
  Home
} from 'lucide-react';
import { formatPrice } from '../utils/utils';
import { useSSE } from '../hooks/useSSE';
import { useAppContext } from '../providers/AppProvider';
import { toast } from 'sonner';

interface PaymentProcessState {
  orderCode: string;
  totalAmount: number;
  paymentMethod: string;
}

interface PaymentQR {
  orderId: string;
  checkoutUrl: string;
  qrCode: string;
  expireIn: number;
}

export function PaymentProcessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const app = useAppContext();
  const state = location.state as PaymentProcessState;

  const [currentStep, setCurrentStep] = useState<'connecting' | 'loading' | 'qr' | 'success'>('connecting');
  const [payments, setPayments] = useState<PaymentQR[]>([]);
  const [timeLeft, setTimeLeft] = useState(900);
  const [isExpired, setIsExpired] = useState(false);

  // Redirect if no order data
  useEffect(() => {
    if (!state?.orderCode) {
      toast.error('Không tìm thấy thông tin đơn hàng');
      navigate('/cart');
      return;
    }
  }, [state, navigate]);

  // SSE for real-time payment updates
  const { isConnected } = useSSE({
    userId: app.user?.id,
    isLoggedIn: app.isLoggedIn,
    onQRCreated: (newPayments: PaymentQR[]) => {
      console.log('💳 PaymentProcessPage: QR Created event received:', newPayments);
      toast.success('Mã QR thanh toán đã được tạo!');
      setPayments(newPayments);
      setCurrentStep('qr');
      if (newPayments.length > 0) {
        setTimeLeft(newPayments[0].expireIn || 900);
        setIsExpired(false);
      }
    },
    onPaymentSuccess: (data: any) => {
      console.log('💳 PaymentProcessPage: Payment Success event received');
      setCurrentStep('success');
      toast.success('Thanh toán thành công!');

      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    },
    onQRExpired: (data: any) => {
      console.log('💳 PaymentProcessPage: QR Expired event received');
      setIsExpired(true);
      toast.error('Mã QR đã hết hạn. Vui lòng thử lại.');
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
    if (currentStep !== 'qr' || isExpired) return;

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
  }, [currentStep, isExpired]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép vào clipboard');
  };

  const openPaymentUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 'connecting':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-semibold mb-2">Đang kết nối...</h1>
              <p className="text-muted-foreground">
                Đang thiết lập kết nối bảo mật để xử lý thanh toán
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                <span className="text-sm font-medium">
                  {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
                </span>
              </div>
            </div>
          </div>
        );

      case 'loading':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-semibold mb-2">Đang xử lý...</h1>
              <p className="text-muted-foreground">
                Đang tạo mã QR thanh toán cho đơn hàng của bạn
              </p>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>Mã đơn: {state.orderCode.substring(0, 8)}...</p>
              <p>Phương thức: {state.paymentMethod === 'BANKING' ? 'Chuyển khoản' : 'COD'}</p>
              <p>Số tiền: {formatPrice(state.totalAmount)}</p>
            </div>
          </div>
        );

      case 'qr':
        const firstPayment = payments[0];
        return (
          <div className="text-center space-y-6">
            <div>
              <h1 className="text-2xl font-semibold mb-2">Thanh toán qua QR Code</h1>
              <p className="text-muted-foreground">
                Quét mã QR bằng ứng dụng ngân hàng để thanh toán
              </p>
            </div>

            {/* Timer */}
            <div className="flex justify-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeLeft < 60
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : timeLeft < 300
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold">
                  {isExpired ? '00:00' : formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {timeLeft < 60 && !isExpired && (
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Mã QR sắp hết hạn!
              </p>
            )}

            {isExpired && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Mã QR đã hết hạn</span>
                </div>
                <p className="text-red-600 text-sm mt-1">
                  Vui lòng tạo đơn hàng mới để nhận mã QR mới.
                </p>
              </div>
            )}

            {/* QR Code */}
            {!isExpired && (
              <>
                <div className="flex justify-center">
                  <div className="p-6 bg-white rounded-lg border-2 border-gray-200">
                    <ImageWithFallback
                      src={firstPayment.qrCode}
                      alt="QR Code"
                      className="w-64 h-64"
                      fallback={
                        <div className="w-64 h-64 flex items-center justify-center bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">Không thể tải QR</p>
                        </div>
                      }
                    />
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Số tiền:</span>
                    <span className="font-semibold text-lg text-primary">
                      {formatPrice(state.totalAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mã đơn:</span>
                    <span className="font-mono text-sm">
                      {firstPayment.orderId.substring(0, 8)}...
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => openPaymentUrl(firstPayment.checkoutUrl)}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Mở ứng dụng thanh toán
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => copyToClipboard(firstPayment.checkoutUrl)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Sao chép link thanh toán
                  </Button>
                </div>
              </>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Hướng dẫn thanh toán:
              </h3>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>1. Mở ứng dụng ngân hàng hoặc ví điện tử</li>
                <li>2. Quét mã QR hoặc nhấn vào link thanh toán</li>
                <li>3. Xác nhận số tiền và hoàn tất thanh toán</li>
                <li>4. Chờ hệ thống xác nhận thanh toán tự động</li>
              </ol>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <CheckCircle className="w-16 h-16 text-green-600" />
                <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping"></div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-green-800 mb-2">
                Thanh toán thành công!
              </h1>
              <p className="text-muted-foreground">
                Đơn hàng của bạn đang được xử lý. Bạn sẽ được chuyển hướng trong giây lát...
              </p>
            </div>

            <Button onClick={() => navigate('/orders')} className="bg-green-600 hover:bg-green-700">
              Xem đơn hàng
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Về trang chủ
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Xử lý thanh toán</h1>
                {state?.orderCode && (
                  <p className="text-sm text-muted-foreground">
                    Đơn hàng: {state.orderCode.substring(0, 8)}...
                  </p>
                )}
              </div>
            </div>

            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
              isConnected ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
              {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            {getStepContent()}
          </Card>
        </div>
      </div>
    </div>
  );
}

