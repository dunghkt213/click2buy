/**
 * PaymentProcessPage - Trang xử lý thanh toán với header/footer
 * Hiển thị loading → QR code → Payment confirmation
 */

import { paymentApi } from '@/apis/payment/payment';
import { usePaymentSocket } from '@/hooks/usePaymentSocket';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  Home,
  Loader2,
  Smartphone
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAppContext } from '../providers/AppProvider';
import { formatPrice } from '../utils/utils';

interface PaymentProcessState {
  orderCode: string;
  totalAmount: number;
  paymentMethod: string;
}

interface PaymentQR {
  orderCode: string,
  checkoutUrl: string;
  qrCode: string;
  expireIn: number;
}
//test add
export function PaymentProcessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const app = useAppContext();
  const state = (location.state as PaymentProcessState) ?? null;

  const [currentStep, setCurrentStep] = useState<'connecting' | 'loading' | 'qr' | 'success'>('connecting');
  const [payments, setPayments] = useState<PaymentQR[]>([]);
  const [timeLeft, setTimeLeft] = useState(900);
  const [isExpired, setIsExpired] = useState(false);
  const { orderCode } = useParams<{ orderCode: string }>();
  const orderCodeRef = useRef<string | null>(orderCode ?? null);
  const [expiredAt, setExpiredAt] = useState<Date | null>(null);
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

      if (!data?.orderCode) return;

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
    if (!expiredAt || currentStep !== 'qr') return;

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
    if (!orderCode) return;

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
            orderCode: payment.orderCode!,
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

      } catch (err) {
        console.error('❌ getPaymentByOrder failed', err);
        toast.error('Không lấy được trạng thái thanh toán');
      }
    };

    fetchPayment();
  }, [orderCode]);

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
  const handleRegenerateQR = async () => {
    if (!orderCodeRef.current) return;

    try {
      toast.loading('Đang tạo mã QR mới...', { id: 'regen-qr' });

      await paymentApi.createPayment({
        orderCode: orderCodeRef.current,
      });

      toast.success('Đã yêu cầu tạo mã QR mới', { id: 'regen-qr' });
    } catch (err) {
      console.error('❌ regenerate QR failed', err);
      toast.error('Không thể tạo mã QR mới');
    } finally {
      toast.dismiss('regen-qr');
    }
  };

  const getStepContent = () => {
    if (!orderCodeRef.current) {
      return (
        <div className="text-center text-red-500">
          Không tìm thấy mã đơn hàng
        </div>
      );
    }
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
              <p>Mã đơn: {state?.orderCode ?? '---'}</p>
              {state && (
                <>
                  <p>Phương thức: {state.paymentMethod === 'BANKING' ? 'Chuyển khoản' : 'COD'}</p>
                  <p>Số tiền: {formatPrice(state?.totalAmount ?? 0)}</p>
                </>
              )}
            </div>
          </div>
        );

      case 'qr':
        if (isExpired) {
          return (
            <div className="text-center space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Mã QR đã hết hạn</span>
                </div>
                <p className="text-red-600 text-sm mt-1">
                  Vui lòng tạo mã QR mới để tiếp tục thanh toán.
                </p>
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleRegenerateQR}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Tạo mã QR mới
              </Button>

              <p className="text-xs text-muted-foreground">
                Mã QR mới sẽ có hiệu lực trong 15 phút
              </p>
            </div>
          );
        }

        const firstPayment = payments[0];

        if (!firstPayment) {
          return (
            <div className="text-center space-y-6">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">
                Đang tải mã QR thanh toán...
              </p>
            </div>
          );
        }

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
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 60
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
              <div className="space-y-3">
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleRegenerateQR}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Tạo mã QR mới
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Mã QR mới sẽ có hiệu lực trong 15 phút
                </p>
              </div>
            )}

            {/* QR Code */}
            {!isExpired && (
              <>
                <div className="flex justify-center">
                  <div className="p-6 bg-white rounded-lg border-2 border-gray-200">
                    <div className="flex justify-center">
                      <div className="p-6 bg-white rounded-lg border-2 border-gray-200">
                        <QRCodeCanvas
                          value={firstPayment.qrCode}
                          size={256}
                          level="M"
                          includeMargin
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Số tiền:</span>
                    <span className="font-semibold text-lg text-primary">
                      {formatPrice(state?.totalAmount ?? 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mã đơn:</span>
                    <span className="font-mono text-sm">
                      {firstPayment.orderCode.substring(0, 8)}...
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
                {orderCodeRef.current && (
                  <p className="text-sm text-muted-foreground">
                    Đơn hàng: {orderCodeRef.current.slice(0, 8)}...
                  </p>
                )}

              </div>
            </div>

            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${isConnected ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
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

