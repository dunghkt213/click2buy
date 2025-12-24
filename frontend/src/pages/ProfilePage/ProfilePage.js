import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ProfilePage - Trang profile người dùng
 * Đã sửa lỗi đường dẫn và tích hợp Context
 */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
// Sửa đường dẫn import cho đúng với cấu trúc dự án của bạn (../../)
import { useAppContext } from "../../providers/AppProvider";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "../../components/ui/tabs";
import { ArrowLeft, UserCircle, CreditCard, Lock, Trash2, AlertCircle, CheckCircle2, Settings, Moon, Sun, } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "../../components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { useTheme } from "../../hooks/useTheme";
import { Switch } from "../../components/ui/switch";
import { userService } from "../../apis/user";
const maskPhoneNumber = (phone) => {
    if (!phone || phone.length < 3)
        return phone;
    // Giữ lại phần đầu, thay 3 số cuối bằng ***
    return phone.slice(0, -3) + "***";
};
export function ProfilePage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user, isLoggedIn, handleLogout } = useAppContext(); // Lấy data từ Context
    const { theme, toggleTheme, isDark } = useTheme(); // Theme hook
    // --- STATE QUẢN LÝ GIAO DIỆN ---
    const [activeTab, setActiveTab] = useState(() => {
        const tab = searchParams.get('tab');
        return tab === 'settings' ? 'settings' : 'profile';
    });
    // Profile tab state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [profilePassword, setProfilePassword] = useState("");
    // Bank tab state
    const [accountNumber, setAccountNumber] = useState("");
    const [bankName, setBankName] = useState("");
    const [hasBankAccount, setHasBankAccount] = useState(false);
    // Change password tab state
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // Dialog state
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
    const displayPhone = maskPhoneNumber(phone);
    // Cập nhật state khi user load xong từ Context
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setPhone(user.phone || "");
        }
        else if (!isLoggedIn) {
            // Nếu chưa login thì đá về login
            navigate("/login");
        }
    }, [user, isLoggedIn, navigate]);
    // Sync activeTab với URL params khi component mount hoặc URL thay đổi
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['profile', 'bank', 'password', 'settings', 'delete'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);
    // --- CÁC HÀM XỬ LÝ (LOGIC GIẢ LẬP) ---
    // Handle profile update
    const handleProfileUpdate = async () => {
        if (!name.trim() || !email.trim() || !phone.trim()) {
            setDialogMessage("Vui lòng điền đầy đủ thông tin");
            setShowErrorDialog(true);
            return;
        }
        if (!profilePassword) {
            setDialogMessage("Vui lòng nhập mật khẩu để xác thực");
            setShowErrorDialog(true);
            return;
        }
        if (!user?.id) {
            setDialogMessage("Không tìm thấy thông tin người dùng");
            setShowErrorDialog(true);
            return;
        }
        try {
            // Gọi API cập nhật profile
            await userService.update(user.id, {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                currentPassword: profilePassword,
            });
            setDialogMessage("Cập nhật thông tin tài khoản thành công");
            setShowSuccessDialog(true);
            setProfilePassword("");
            // Reload user data from context (nếu có method refresh)
            // Hoặc navigate để reload page
            window.location.reload();
        }
        catch (error) {
            console.error("Failed to update profile:", error);
            setDialogMessage(error?.message || "Cập nhật thông tin thất bại. Vui lòng thử lại.");
            setShowErrorDialog(true);
        }
    };
    // Handle bank account update
    const handleBankUpdate = () => {
        if (!accountNumber.trim() || !bankName.trim()) {
            setDialogMessage("Vui lòng điền đầy đủ thông tin ngân hàng");
            setShowErrorDialog(true);
            return;
        }
        // TODO: Gọi API cập nhật ngân hàng
        console.log("Update Bank:", { accountNumber, bankName });
        setHasBankAccount(true);
        setDialogMessage("Liên kết tài khoản ngân hàng thành công (Demo)");
        setShowSuccessDialog(true);
    };
    // Handle password change
    const handlePasswordChange = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            setDialogMessage("Vui lòng điền đầy đủ thông tin");
            setShowErrorDialog(true);
            return;
        }
        if (newPassword !== confirmPassword) {
            setDialogMessage("Mật khẩu mới và xác nhận mật khẩu không khớp");
            setShowErrorDialog(true);
            return;
        }
        if (newPassword.length < 6) {
            setDialogMessage("Mật khẩu mới phải có ít nhất 6 ký tự");
            setShowErrorDialog(true);
            return;
        }
        if (!user?.id) {
            setDialogMessage("Không tìm thấy thông tin người dùng");
            setShowErrorDialog(true);
            return;
        }
        try {
            // Gọi API đổi mật khẩu
            await userService.update(user.id, {
                password: newPassword,
                currentPassword: oldPassword,
            });
            setDialogMessage("Đổi mật khẩu thành công");
            setShowSuccessDialog(true);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
        catch (error) {
            console.error("Failed to change password:", error);
            setDialogMessage(error?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.");
            setShowErrorDialog(true);
        }
    };
    // Handle account deletion
    const handleDeleteAccount = () => {
        setShowDeleteConfirmDialog(false);
        // TODO: Gọi API xóa tài khoản
        console.log("Delete Account Requested");
        handleLogout(); // Logout luôn
        navigate("/"); // Về trang chủ
    };
    // Handle dialog close
    const handleDialogClose = () => {
        setShowSuccessDialog(false);
        setShowErrorDialog(false);
    };
    // Nếu không có user (đang load hoặc chưa login), return null hoặc loading
    if (!user && isLoggedIn)
        return _jsx("div", { className: "pt-20 text-center", children: "\u0110ang t\u1EA3i..." });
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx(Header, { cartItemsCount: 0, unreadNotifications: 0, onCartClick: () => navigate("/cart"), onNotificationsClick: () => { }, onFilterClick: () => { }, onPromotionClick: () => { }, onSupportClick: () => { }, onStoreClick: () => { }, onLogoClick: () => navigate("/"), isLoggedIn: isLoggedIn, user: user, onLogin: () => navigate("/login"), onRegister: () => navigate("/register"), onLogout: handleLogout, onProfileClick: () => { }, onOrdersClick: () => navigate("/orders") }), _jsx("main", { className: "pt-16 pb-8", children: _jsxs("div", { className: "container mx-auto px-4 py-6 max-w-4xl", children: [_jsxs(Button, { variant: "ghost", onClick: () => navigate(-1), className: "mb-6", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Quay l\u1EA1i"] }), _jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl mb-2 font-bold", children: "Th\u00F4ng tin t\u00E0i kho\u1EA3n" }), _jsx("p", { className: "text-muted-foreground", children: "Qu\u1EA3n l\u00FD th\u00F4ng tin c\u00E1 nh\u00E2n v\u00E0 c\u00E0i \u0111\u1EB7t t\u00E0i kho\u1EA3n c\u1EE7a b\u1EA1n" })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5 mb-6", children: [_jsxs(TabsTrigger, { value: "profile", className: "gap-2", children: [_jsx(UserCircle, { className: "w-4 h-4" }), _jsx("span", { className: "hidden sm:inline", children: "H\u1ED3 s\u01A1" })] }), _jsxs(TabsTrigger, { value: "bank", className: "gap-2", children: [_jsx(CreditCard, { className: "w-4 h-4" }), _jsx("span", { className: "hidden sm:inline", children: "Ng\u00E2n h\u00E0ng" })] }), _jsxs(TabsTrigger, { value: "password", className: "gap-2", children: [_jsx(Lock, { className: "w-4 h-4" }), _jsx("span", { className: "hidden sm:inline", children: "\u0110\u1ED5i m\u1EADt kh\u1EA9u" })] }), _jsxs(TabsTrigger, { value: "settings", className: "gap-2", children: [_jsx(Settings, { className: "w-4 h-4" }), _jsx("span", { className: "hidden sm:inline", children: "C\u00E0i \u0111\u1EB7t" })] }), _jsxs(TabsTrigger, { value: "delete", className: "gap-2", children: [_jsx(Trash2, { className: "w-4 h-4" }), _jsx("span", { className: "hidden sm:inline", children: "X\u00F3a t\u00E0i kho\u1EA3n" })] })] }), _jsx(TabsContent, { value: "profile", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Th\u00F4ng tin c\u00E1 nh\u00E2n" }), _jsx(CardDescription, { children: "C\u1EADp nh\u1EADt th\u00F4ng tin c\u00E1 nh\u00E2n c\u1EE7a b\u1EA1n. C\u1EA7n nh\u1EADp m\u1EADt kh\u1EA9u \u0111\u1EC3 x\u00E1c th\u1EF1c." })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", children: "T\u00EAn" }), _jsx(Input, { id: "name", value: name, onChange: (e) => setName(e.target.value), placeholder: "Nh\u1EADp t\u00EAn c\u1EE7a b\u1EA1n" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "example@email.com", disabled // Thường email không cho sửa lung tung
                                                                : true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phone", children: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i" }), _jsx(Input, { id: "phone", type: "tel", value: phone, 
                                                                // value={maskPhoneNumber(phone)}
                                                                onChange: (e) => setPhone(e.target.value), placeholder: "0123456789" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "profilePassword", children: "M\u1EADt kh\u1EA9u x\u00E1c th\u1EF1c" }), _jsx(Input, { id: "profilePassword", type: "password", value: profilePassword, onChange: (e) => setProfilePassword(e.target.value), placeholder: "Nh\u1EADp m\u1EADt kh\u1EA9u \u0111\u1EC3 x\u00E1c th\u1EF1c" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Nh\u1EADp m\u1EADt kh\u1EA9u hi\u1EC7n t\u1EA1i \u0111\u1EC3 x\u00E1c nh\u1EADn thay \u0111\u1ED5i" })] }), _jsx(Button, { onClick: handleProfileUpdate, className: "w-full", children: "L\u01B0u th\u00F4ng tin" })] })] }) }), _jsx(TabsContent, { value: "bank", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "T\u00E0i kho\u1EA3n ng\u00E2n h\u00E0ng" }), _jsx(CardDescription, { children: "Li\u00EAn k\u1EBFt t\u00E0i kho\u1EA3n ng\u00E2n h\u00E0ng \u0111\u1EC3 nh\u1EADn thanh to\u00E1n" })] }), _jsxs(CardContent, { className: "space-y-4", children: [!hasBankAccount && !accountNumber && (_jsxs(Alert, { children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Ch\u01B0a li\u00EAn k\u1EBFt" }), _jsx(AlertDescription, { children: "B\u1EA1n ch\u01B0a li\u00EAn k\u1EBFt t\u00E0i kho\u1EA3n ng\u00E2n h\u00E0ng" })] })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "accountNumber", children: "S\u1ED1 t\u00E0i kho\u1EA3n" }), _jsx(Input, { id: "accountNumber", value: accountNumber, onChange: (e) => setAccountNumber(e.target.value), placeholder: "Nh\u1EADp s\u1ED1 t\u00E0i kho\u1EA3n" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "bankName", children: "T\u00EAn ng\u00E2n h\u00E0ng" }), _jsx(Input, { id: "bankName", value: bankName, onChange: (e) => setBankName(e.target.value), placeholder: "VD: Vietcombank, BIDV, Techcombank..." })] }), _jsx(Button, { onClick: handleBankUpdate, className: "w-full", children: hasBankAccount
                                                            ? "Cập nhật thông tin"
                                                            : "Liên kết tài khoản" })] })] }) }), _jsx(TabsContent, { value: "password", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "\u0110\u1ED5i m\u1EADt kh\u1EA9u" }), _jsx(CardDescription, { children: "Thay \u0111\u1ED5i m\u1EADt kh\u1EA9u \u0111\u1EC3 b\u1EA3o m\u1EADt t\u00E0i kho\u1EA3n c\u1EE7a b\u1EA1n" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "oldPassword", children: "M\u1EADt kh\u1EA9u c\u0169" }), _jsx(Input, { id: "oldPassword", type: "password", value: oldPassword, onChange: (e) => setOldPassword(e.target.value), placeholder: "Nh\u1EADp m\u1EADt kh\u1EA9u c\u0169" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "newPassword", children: "M\u1EADt kh\u1EA9u m\u1EDBi" }), _jsx(Input, { id: "newPassword", type: "password", value: newPassword, onChange: (e) => setNewPassword(e.target.value), placeholder: "Nh\u1EADp m\u1EADt kh\u1EA9u m\u1EDBi" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "M\u1EADt kh\u1EA9u ph\u1EA3i c\u00F3 \u00EDt nh\u1EA5t 6 k\u00FD t\u1EF1" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "confirmPassword", children: "X\u00E1c nh\u1EADn m\u1EADt kh\u1EA9u m\u1EDBi" }), _jsx(Input, { id: "confirmPassword", type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), placeholder: "Nh\u1EADp l\u1EA1i m\u1EADt kh\u1EA9u m\u1EDBi" })] }), _jsx(Button, { onClick: handlePasswordChange, className: "w-full", children: "\u0110\u1ED5i m\u1EADt kh\u1EA9u" })] })] }) }), _jsx(TabsContent, { value: "settings", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "C\u00E0i \u0111\u1EB7t" }), _jsx(CardDescription, { children: "Qu\u1EA3n l\u00FD c\u00E0i \u0111\u1EB7t giao di\u1EC7n v\u00E0 \u1EE9ng d\u1EE5ng" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [isDark ? (_jsx(Moon, { className: "w-5 h-5" })) : (_jsx(Sun, { className: "w-5 h-5" })), _jsx(Label, { htmlFor: "theme-toggle", className: "text-base font-semibold", children: "Giao di\u1EC7n" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Chuy\u1EC3n \u0111\u1ED5i gi\u1EEFa n\u1EC1n s\u00E1ng v\u00E0 n\u1EC1n t\u1ED1i" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: isDark ? 'Nền tối' : 'Nền sáng' }), _jsx(Switch, { id: "theme-toggle", checked: isDark, onCheckedChange: toggleTheme })] })] }) }), _jsx("div", { className: "border-t pt-4", children: _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-sm font-medium", children: "Th\u00F4ng tin" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "T\u00F9y ch\u1ECDn giao di\u1EC7n s\u1EBD \u0111\u01B0\u1EE3c l\u01B0u t\u1EF1 \u0111\u1ED9ng v\u00E0 \u00E1p d\u1EE5ng cho to\u00E0n b\u1ED9 \u1EE9ng d\u1EE5ng." })] }) })] })] }) }), _jsx(TabsContent, { value: "delete", children: _jsxs(Card, { className: "border-destructive", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-destructive", children: "X\u00F3a t\u00E0i kho\u1EA3n" }), _jsx(CardDescription, { children: "X\u00F3a v\u0129nh vi\u1EC5n t\u00E0i kho\u1EA3n v\u00E0 to\u00E0n b\u1ED9 d\u1EEF li\u1EC7u c\u1EE7a b\u1EA1n" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "C\u1EA3nh b\u00E1o" }), _jsx(AlertDescription, { children: "H\u00E0nh \u0111\u1ED9ng n\u00E0y kh\u00F4ng th\u1EC3 ho\u00E0n t\u00E1c. T\u1EA5t c\u1EA3 d\u1EEF li\u1EC7u c\u1EE7a b\u1EA1n s\u1EBD b\u1ECB x\u00F3a v\u0129nh vi\u1EC5n." })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Khi x\u00F3a t\u00E0i kho\u1EA3n, b\u1EA1n s\u1EBD m\u1EA5t:" }), _jsxs("ul", { className: "text-sm text-muted-foreground list-disc list-inside space-y-1", children: [_jsx("li", { children: "To\u00E0n b\u1ED9 th\u00F4ng tin c\u00E1 nh\u00E2n" }), _jsx("li", { children: "L\u1ECBch s\u1EED \u0111\u01A1n h\u00E0ng" }), _jsx("li", { children: "Danh s\u00E1ch y\u00EAu th\u00EDch" }), _jsx("li", { children: "\u0110i\u1EC3m th\u01B0\u1EDFng v\u00E0 \u01B0u \u0111\u00E3i" }), _jsx("li", { children: "C\u1EEDa h\u00E0ng (n\u1EBFu c\u00F3)" })] })] }), _jsxs(Button, { variant: "destructive", className: "w-full", onClick: () => setShowDeleteConfirmDialog(true), children: [_jsx(Trash2, { className: "w-4 h-4 mr-2" }), "X\u00F3a t\u00E0i kho\u1EA3n"] })] })] }) })] })] }) }), _jsx(Footer, {}), _jsx(Dialog, { open: showSuccessDialog, onOpenChange: handleDialogClose, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsxs("div", { className: "flex items-center gap-2 text-green-600", children: [_jsx(CheckCircle2, { className: "w-5 h-5" }), _jsx(DialogTitle, { children: "Th\u00E0nh c\u00F4ng" })] }), _jsx(DialogDescription, { className: "pt-2", children: dialogMessage })] }), _jsx(DialogFooter, { children: _jsx(Button, { onClick: handleDialogClose, children: "\u0110\u00F3ng" }) })] }) }), _jsx(Dialog, { open: showErrorDialog, onOpenChange: setShowErrorDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsxs("div", { className: "flex items-center gap-2 text-destructive", children: [_jsx(AlertCircle, { className: "w-5 h-5" }), _jsx(DialogTitle, { children: "L\u1ED7i" })] }), _jsx(DialogDescription, { className: "pt-2", children: dialogMessage })] }), _jsx(DialogFooter, { children: _jsx(Button, { variant: "outline", onClick: () => setShowErrorDialog(false), children: "\u0110\u00F3ng" }) })] }) }), _jsx(Dialog, { open: showDeleteConfirmDialog, onOpenChange: setShowDeleteConfirmDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsxs("div", { className: "flex items-center gap-2 text-destructive", children: [_jsx(AlertCircle, { className: "w-5 h-5" }), _jsx(DialogTitle, { children: "X\u00E1c nh\u1EADn x\u00F3a t\u00E0i kho\u1EA3n" })] }), _jsx(DialogDescription, { className: "pt-2", children: "B\u1EA1n c\u00F3 ch\u1EAFc ch\u1EAFn mu\u1ED1n x\u00F3a t\u00E0i kho\u1EA3n? H\u00E0nh \u0111\u1ED9ng n\u00E0y kh\u00F4ng th\u1EC3 ho\u00E0n t\u00E1c." })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowDeleteConfirmDialog(false), children: "H\u1EE7y" }), _jsx(Button, { variant: "destructive", onClick: handleDeleteAccount, children: "X\u00F3a t\u00E0i kho\u1EA3n" })] })] }) })] }));
}
