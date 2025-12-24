import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertCircle, Store } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { authStorage, normalizeUser } from '../../apis/auth/authApi';
import { userApi } from '../../apis/user';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
export function StoreRegistrationModal({ isOpen, onClose = () => { }, onRegister }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Vui lòng nhập tên cửa hàng';
        }
        else if (formData.name.trim().length < 3) {
            newErrors.name = 'Tên cửa hàng phải có ít nhất 3 ký tự';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Vui lòng nhập mô tả cửa hàng';
        }
        else if (formData.description.trim().length < 10) {
            newErrors.description = 'Mô tả phải có ít nhất 10 ký tự';
        }
        if (!formData.address.trim()) {
            newErrors.address = 'Vui lòng nhập địa chỉ';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        }
        else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Số điện thoại không hợp lệ (10 chữ số)';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            setIsSubmitting(true);
            // Map form data to API format
            const payload = {
                shopName: formData.name.trim(),
                shopDescription: formData.description.trim(),
                shopAddress: formData.address.trim(),
                shopPhone: formData.phone.trim().replace(/\s/g, ''),
                shopEmail: formData.email.trim(),
            };
            // Call API to update user role to seller
            const response = await userApi.updateRoleSeller(payload);
            // Lấy accessToken từ response và lưu vào localStorage
            if (response.accessToken) {
                // Update user info và token trong localStorage
                const user = normalizeUser(response.user);
                authStorage.save(user, response.accessToken);
                console.log('✅ Token mới đã được lưu vào localStorage sau khi upgrade seller');
            }
            else {
                console.warn('⚠️ Server không trả về accessToken sau khi upgrade seller');
            }
            toast.success('Đăng ký cửa hàng thành công! Vai trò của bạn đã được cập nhật thành seller.');
            // Reset form
            setFormData({
                name: '',
                description: '',
                address: '',
                phone: '',
                email: ''
            });
            setErrors({});
            // Close modal
            onClose();
            // Call onRegister callback for backward compatibility (parent can refresh user info)
            onRegister({
                name: payload.shopName,
                description: payload.shopDescription,
                address: payload.shopAddress,
                phone: payload.shopPhone,
                email: payload.shopEmail,
            });
            // Reload page to refresh user info and role
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
        catch (error) {
            console.error('Failed to register store:', error);
            const errorMessage = error?.message || error?.response?.data?.message || 'Không thể đăng ký cửa hàng. Vui lòng thử lại.';
            toast.error(errorMessage);
        }
        finally {
            setIsSubmitting(false);
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
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: (open) => {
            if (!open) {
                handleClose();
            }
            else {
                // Nếu mở lại thì giữ nguyên
            }
        }, children: _jsxs(DialogContent, { className: "max-w-2xl", onEscapeKeyDown: (e) => {
                e.preventDefault();
                handleClose();
            }, onPointerDownOutside: (e) => {
                e.preventDefault();
                handleClose();
            }, children: [_jsx(DialogHeader, { children: _jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center", children: _jsx(Store, { className: "w-6 h-6 text-primary" }) }), _jsxs("div", { children: [_jsx(DialogTitle, { className: "text-2xl", children: "\u0110\u0103ng k\u00FD m\u1EDF c\u1EEDa h\u00E0ng" }), _jsx(DialogDescription, { children: "\u0110i\u1EC1n th\u00F4ng tin \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u b\u00E1n h\u00E0ng tr\u00EAn Click2buy" })] })] }) }), _jsx(ScrollArea, { className: "max-h-[60vh] pr-4", children: _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsxs(Label, { htmlFor: "storeName", className: "text-base", children: ["T\u00EAn c\u1EEDa h\u00E0ng ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "storeName", value: formData.name, onChange: (e) => handleChange('name', e.target.value), placeholder: "V\u00ED d\u1EE5: Shop \u0110i\u1EC7n T\u1EED ABC", className: errors.name ? 'border-red-500' : '' }), errors.name && (_jsxs("p", { className: "text-sm text-red-500 mt-1 flex items-center gap-1", children: [_jsx(AlertCircle, { className: "w-3 h-3" }), errors.name] }))] }), _jsxs("div", { children: [_jsxs(Label, { htmlFor: "storeDescription", className: "text-base", children: ["M\u00F4 t\u1EA3 c\u1EEDa h\u00E0ng ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Textarea, { id: "storeDescription", value: formData.description, onChange: (e) => handleChange('description', e.target.value), placeholder: "Gi\u1EDBi thi\u1EC7u v\u1EC1 c\u1EEDa h\u00E0ng c\u1EE7a b\u1EA1n...", rows: 4, className: errors.description ? 'border-red-500' : '' }), errors.description && (_jsxs("p", { className: "text-sm text-red-500 mt-1 flex items-center gap-1", children: [_jsx(AlertCircle, { className: "w-3 h-3" }), errors.description] })), _jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [formData.description.length, " k\u00FD t\u1EF1 (t\u1ED1i thi\u1EC3u 10)"] })] }), _jsxs("div", { children: [_jsxs(Label, { htmlFor: "storeAddress", className: "text-base", children: ["\u0110\u1ECBa ch\u1EC9 c\u1EEDa h\u00E0ng ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "storeAddress", value: formData.address, onChange: (e) => handleChange('address', e.target.value), placeholder: "S\u1ED1 nh\u00E0, \u0111\u01B0\u1EDDng, ph\u01B0\u1EDDng/x\u00E3, qu\u1EADn/huy\u1EC7n, t\u1EC9nh/th\u00E0nh ph\u1ED1", className: errors.address ? 'border-red-500' : '' }), errors.address && (_jsxs("p", { className: "text-sm text-red-500 mt-1 flex items-center gap-1", children: [_jsx(AlertCircle, { className: "w-3 h-3" }), errors.address] }))] }), _jsxs("div", { children: [_jsxs(Label, { htmlFor: "storePhone", className: "text-base", children: ["S\u1ED1 \u0111i\u1EC7n tho\u1EA1i ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "storePhone", value: formData.phone, onChange: (e) => handleChange('phone', e.target.value), placeholder: "0901234567", className: errors.phone ? 'border-red-500' : '' }), errors.phone && (_jsxs("p", { className: "text-sm text-red-500 mt-1 flex items-center gap-1", children: [_jsx(AlertCircle, { className: "w-3 h-3" }), errors.phone] }))] }), _jsxs("div", { children: [_jsxs(Label, { htmlFor: "storeEmail", className: "text-base", children: ["Email li\u00EAn h\u1EC7 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "storeEmail", type: "email", value: formData.email, onChange: (e) => handleChange('email', e.target.value), placeholder: "store@example.com", className: errors.email ? 'border-red-500' : '' }), errors.email && (_jsxs("p", { className: "text-sm text-red-500 mt-1 flex items-center gap-1", children: [_jsx(AlertCircle, { className: "w-3 h-3" }), errors.email] }))] }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("div", { className: "flex gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "text-sm text-blue-900", children: [_jsx("p", { className: "font-medium mb-1", children: "L\u01B0u \u00FD khi \u0111\u0103ng k\u00FD:" }), _jsxs("ul", { className: "list-disc list-inside space-y-1 text-blue-800", children: [_jsx("li", { children: "Th\u00F4ng tin c\u1EEDa h\u00E0ng ph\u1EA3i ch\u00EDnh x\u00E1c v\u00E0 trung th\u1EF1c" }), _jsx("li", { children: "B\u1EA1n c\u00F3 th\u1EC3 ch\u1EC9nh s\u1EEDa th\u00F4ng tin sau khi \u0111\u0103ng k\u00FD" }), _jsx("li", { children: "Email v\u00E0 s\u1ED1 \u0111i\u1EC7n tho\u1EA1i s\u1EBD \u0111\u01B0\u1EE3c d\u00F9ng \u0111\u1EC3 x\u00E1c th\u1EF1c" }), _jsx("li", { children: "Tu\u00E2n th\u1EE7 c\u00E1c quy \u0111\u1ECBnh c\u1EE7a Click2buy v\u1EC1 b\u00E1n h\u00E0ng" })] })] })] }) })] }) }), _jsxs("div", { className: "flex gap-3 pt-4 border-t", children: [_jsx(Button, { variant: "outline", onClick: handleClose, className: "flex-1", children: "H\u1EE7y b\u1ECF" }), _jsx(Button, { onClick: handleSubmit, className: "flex-1", disabled: isSubmitting, children: isSubmitting ? 'Đang xử lý...' : 'Đăng ký cửa hàng' })] })] }) }));
}
