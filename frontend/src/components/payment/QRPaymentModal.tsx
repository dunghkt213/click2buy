import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  Clock,
  CreditCard,
  Smartphone,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
  X
} from 'lucide-react';
import { formatPrice } from '../../utils/utils';
import { PaymentQR } from '../../hooks/useSSE';
import { toast } from 'sonner';

interface QRPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: PaymentQR[];
  totalAmount: number;
  onPaymentSuccess?: () => void;
}

export function QRPaymentModal({
  isOpen,
  onClose,
  payments,
  totalAmount,
  onPaymentSuccess
}: QRPaymentModalProps) {
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
    if (!isOpen || isExpired) return;

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

  if (!payments || payments.length === 0) return null;

  const firstPayment = payments[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            Thanh toán qua QR Code
          </DialogTitle>
          <DialogDescription>
            Quét mã QR bằng ứng dụng ngân hàng để thanh toán
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Timer */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
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
            {timeLeft < 60 && !isExpired && (
              <p className="text-sm text-red-600 mt-1">
                Mã QR sắp hết hạn!
              </p>
            )}
            {isExpired && (
              <p className="text-sm text-red-600 mt-1">
                Mã QR đã hết hạn. Vui lòng thử lại.
              </p>
            )}
          </div>

          {/* QR Code */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className={`p-4 bg-white rounded-lg border-2 ${
                isExpired ? 'border-red-200' : 'border-gray-200'
              }`}>
                {isExpired ? (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">QR hết hạn</p>
                    </div>
                  </div>
                ) : (
                  <ImageWithFallback
                    src={firstPayment.qrCode}
                    alt="QR Code"
                    className="w-48 h-48"
                    fallback={
                      <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Không thể tải QR</p>
                      </div>
                    }
                  />
                )}
              </div>

              {/* Overlay khi hết hạn */}
              {isExpired && (
                <div className="absolute inset-0 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <X className="w-16 h-16 text-red-500" />
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Số tiền:</span>
              <span className="font-semibold text-lg text-primary">
                {formatPrice(totalAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Mã đơn:</span>
              <span className="font-mono text-sm">
                {firstPayment.orderId.substring(0, 8)}...
              </span>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isExpired && (
              <Button
                className="w-full"
                onClick={() => openPaymentUrl(firstPayment.checkoutUrl)}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Mở ứng dụng thanh toán
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => copyToClipboard(firstPayment.checkoutUrl)}
            >
              <Copy className="w-4 h-4 mr-2" />
              Sao chép link thanh toán
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Chờ thanh toán thành công tự động cập nhật...
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Hướng dẫn thanh toán:
            </h4>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>1. Mở ứng dụng ngân hàng hoặc ví điện tử</li>
              <li>2. Quét mã QR hoặc nhấn vào link thanh toán</li>
              <li>3. Xác nhận số tiền và hoàn tất thanh toán</li>
              <li>4. Chờ hệ thống xác nhận thanh toán</li>
            </ol>
          </div>
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
