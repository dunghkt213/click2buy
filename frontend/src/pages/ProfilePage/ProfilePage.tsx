/**
 * ProfilePage - Trang profile người dùng
 * Đã sửa lỗi đường dẫn và tích hợp Context
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
// Sửa đường dẫn import cho đúng với cấu trúc dự án của bạn (../../)
import { useAppContext } from "../../providers/AppProvider";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  ArrowLeft,
  UserCircle,
  CreditCard,
  Lock,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { useTheme } from "../../hooks/useTheme";
import { Switch } from "../../components/ui/switch";
const maskPhoneNumber = (phone: string) => {
  if (!phone || phone.length < 3) return phone;
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
    } else if (!isLoggedIn) {
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
  const handleProfileUpdate = () => {
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
    

    // TODO: Gọi API cập nhật profile ở đây
    console.log("Update Profile:", { name, email, phone });

    // Giả lập thành công
    setDialogMessage("Đổi thông tin tài khoản thành công");
    setShowSuccessDialog(true);
    setProfilePassword("");
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
  const handlePasswordChange = () => {
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

    // TODO: Gọi API đổi mật khẩu
    console.log("Change Password", { oldPassword, newPassword });

    setDialogMessage("Đổi mật khẩu thành công (Demo)");
    setShowSuccessDialog(true);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
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
    return <div className="pt-20 text-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER: Truyền props giả lập hoặc lấy từ Context. 
        Lưu ý: Nếu Header của bạn không nhận props, hãy xóa các dòng prop bên dưới đi.
      */}
      <Header
        cartItemsCount={0}
        unreadNotifications={0}
        onCartClick={() => navigate("/cart")}
        onNotificationsClick={() => {}}
        onFilterClick={() => {}}
        onPromotionClick={() => {}}
        onSupportClick={() => {}}
        onStoreClick={() => {}}
        onLogoClick={() => navigate("/")}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={() => navigate("/login")}
        onRegister={() => navigate("/register")}
        onLogout={handleLogout}
        onProfileClick={() => {}}
        onOrdersClick={() => navigate("/orders")}
        // Các props tùy chọn khác có thể bỏ qua nếu không cần
      />

      <main className="pt-16 pb-8">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-3xl mb-2 font-bold">Thông tin tài khoản</h1>
            <p className="text-muted-foreground">
              Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
            </p>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="profile" className="gap-2">
                <UserCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Hồ sơ</span>
              </TabsTrigger>
              <TabsTrigger value="bank" className="gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Ngân hàng</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="gap-2">
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Đổi mật khẩu</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Cài đặt</span>
              </TabsTrigger>
              <TabsTrigger value="delete" className="gap-2">
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Xóa tài khoản</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <CardDescription>
                    Cập nhật thông tin cá nhân của bạn. Cần nhập mật khẩu để xác
                    thực.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập tên của bạn"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      disabled // Thường email không cho sửa lung tung
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      // value={maskPhoneNumber(phone)}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0123456789"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profilePassword">Mật khẩu xác thực</Label>
                    <Input
                      id="profilePassword"
                      type="password"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      placeholder="Nhập mật khẩu để xác thực"
                    />
                    <p className="text-sm text-muted-foreground">
                      Nhập mật khẩu hiện tại để xác nhận thay đổi
                    </p>
                  </div>

                  <Button onClick={handleProfileUpdate} className="w-full">
                    Lưu thông tin
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bank Tab */}
            <TabsContent value="bank">
              <Card>
                <CardHeader>
                  <CardTitle>Tài khoản ngân hàng</CardTitle>
                  <CardDescription>
                    Liên kết tài khoản ngân hàng để nhận thanh toán
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!hasBankAccount && !accountNumber && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Chưa liên kết</AlertTitle>
                      <AlertDescription>
                        Bạn chưa liên kết tài khoản ngân hàng
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Số tài khoản</Label>
                    <Input
                      id="accountNumber"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Nhập số tài khoản"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankName">Tên ngân hàng</Label>
                    <Input
                      id="bankName"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="VD: Vietcombank, BIDV, Techcombank..."
                    />
                  </div>

                  <Button onClick={handleBankUpdate} className="w-full">
                    {hasBankAccount
                      ? "Cập nhật thông tin"
                      : "Liên kết tài khoản"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Change Password Tab */}
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Đổi mật khẩu</CardTitle>
                  <CardDescription>
                    Thay đổi mật khẩu để bảo mật tài khoản của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Nhập mật khẩu cũ"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                    />
                    <p className="text-sm text-muted-foreground">
                      Mật khẩu phải có ít nhất 6 ký tự
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Xác nhận mật khẩu mới
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>

                  <Button onClick={handlePasswordChange} className="w-full">
                    Đổi mật khẩu
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt</CardTitle>
                  <CardDescription>
                    Quản lý cài đặt giao diện và ứng dụng
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          {isDark ? (
                            <Moon className="w-5 h-5" />
                          ) : (
                            <Sun className="w-5 h-5" />
                          )}
                          <Label htmlFor="theme-toggle" className="text-base font-semibold">
                            Giao diện
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Chuyển đổi giữa nền sáng và nền tối
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {isDark ? 'Nền tối' : 'Nền sáng'}
                        </span>
                        <Switch
                          id="theme-toggle"
                          checked={isDark}
                          onCheckedChange={toggleTheme}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Thông tin</h3>
                      <p className="text-sm text-muted-foreground">
                        Tùy chọn giao diện sẽ được lưu tự động và áp dụng cho toàn bộ ứng dụng.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Delete Account Tab */}
            <TabsContent value="delete">
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">
                    Xóa tài khoản
                  </CardTitle>
                  <CardDescription>
                    Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Cảnh báo</AlertTitle>
                    <AlertDescription>
                      Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn
                      sẽ bị xóa vĩnh viễn.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Khi xóa tài khoản, bạn sẽ mất:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Toàn bộ thông tin cá nhân</li>
                      <li>Lịch sử đơn hàng</li>
                      <li>Danh sách yêu thích</li>
                      <li>Điểm thưởng và ưu đãi</li>
                      <li>Cửa hàng (nếu có)</li>
                    </ul>
                  </div>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowDeleteConfirmDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa tài khoản
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <DialogTitle>Thành công</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleDialogClose}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <DialogTitle>Lỗi</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowErrorDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirmDialog}
        onOpenChange={setShowDeleteConfirmDialog}
      >
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn
              tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirmDialog(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Xóa tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
