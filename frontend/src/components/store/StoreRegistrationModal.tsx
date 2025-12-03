import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Store, AlertCircle } from 'lucide-react';
import { StoreInfo } from 'types';

interface StoreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (storeInfo: Omit<StoreInfo, 'id' | 'rating' | 'totalReviews' | 'totalProducts' | 'followers' | 'joinedDate'>) => void;
}

export function StoreRegistrationModal({
  isOpen,
  onClose = () => {},
  onRegister
}: StoreRegistrationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên cửa hàng';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Tên cửa hàng phải có ít nhất 3 ký tự';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả cửa hàng';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Mô tả phải có ít nhất 10 ký tự';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10 chữ số)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onRegister(formData);
      // Reset form sau khi submit
      setFormData({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: ''
      });
      setErrors({});
      // Modal sẽ được đóng bởi onRegister handler
    }
  };

  const handleClose = () => {
    // Reset form khi đóng modal
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      email: ''
    });
    setErrors({});
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      } else {
        // Nếu mở lại thì giữ nguyên
      }
    }}>
      <DialogContent 
        className="max-w-2xl"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          handleClose();
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          handleClose();
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Đăng ký mở cửa hàng</DialogTitle>
              <DialogDescription>
                Điền thông tin để bắt đầu bán hàng trên Click2buy
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-5">
            {/* Store Name */}
            <div>
              <Label htmlFor="storeName" className="text-base">
                Tên cửa hàng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="storeName"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ví dụ: Shop Điện Tử ABC"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Store Description */}
            <div>
              <Label htmlFor="storeDescription" className="text-base">
                Mô tả cửa hàng <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="storeDescription"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Giới thiệu về cửa hàng của bạn..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.description}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {formData.description.length} ký tự (tối thiểu 10)
              </p>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="storeAddress" className="text-base">
                Địa chỉ cửa hàng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="storeAddress"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.address}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="storePhone" className="text-base">
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <Input
                id="storePhone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="0901234567"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="storeEmail" className="text-base">
                Email liên hệ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="storeEmail"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="store@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Lưu ý khi đăng ký:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Thông tin cửa hàng phải chính xác và trung thực</li>
                    <li>Bạn có thể chỉnh sửa thông tin sau khi đăng ký</li>
                    <li>Email và số điện thoại sẽ được dùng để xác thực</li>
                    <li>Tuân thủ các quy định của Click2buy về bán hàng</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="flex-1"
          >
            Hủy bỏ
          </Button>
          <Button 
            onClick={handleSubmit}
            className="flex-1"
          >
            Đăng ký cửa hàng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
