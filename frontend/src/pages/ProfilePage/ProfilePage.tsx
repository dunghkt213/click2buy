/**
 * ProfilePage - Trang profile người dùng và cài đặt tài khoản
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../providers/AppProvider';

// UI Components
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../components/ui/alert';

// Layout
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';

// Icons
import {
  ArrowLeft,
  UserCircle,
  CreditCard,
  Lock,
  Trash2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

// Types
import { User } from '../../types';

export type ProfilePageProps = {
  onUpdateProfile?: (data: { name: string; email: string; phone: string }) => void;
  onUpdateBankAccount?: (data: { accountNumber: string; bankName: string }) => void;
  onChangePassword?: (data: { oldPassword: string; newPassword: string }) => void;
  onDeleteAccount?: () => void;
  cartItemsCount?: number;
  wishlistItemsCount?: number;
  unreadNotifications?: number;
  onCartClick?: () => void;
  onWishlistClick?: () => void;
  onNotificationsClick?: () => void;
  onFilterClick?: () => void;
  onPromotionClick?: () => void;
  onSupportClick?: () => void;
  onStoreClick?: () => void;
  onLogoClick?: () => void;
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onRegister?: () => void;
  onLogout?: () => void;
  onProfileClick?: () => void;
  onOrdersClick?: () => void;
  cartIconRef?: React.RefObject<HTMLButtonElement>;
  wishlistIconRef?: React.RefObject<HTMLButtonElement>;
  cartItems?: any[];
  totalPrice?: number;
  hasStore?: boolean;
  onMyStoreClick?: () => void;
  user?: User | null;
};

export function ProfilePage(props: ProfilePageProps = {}) {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const app = useAppContext();

  // Redirect nếu chưa đăng nhập và không có userId
  useEffect(() => {
    if (!app.isLoggedIn && !userId) {
      navigate('/login');
    }
  }, [app.isLoggedIn, userId, navigate]);

  // Lấy thông tin user (ưu tiên user từ context nếu là trang cá nhân)
  const user = app.user;

  // --- State quản lý các Tab ---
  const [activeTab, setActiveTab] = useState('profile');

  // Profile tab state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePassword, setProfilePassword] = useState('');

  // Cập nhật state khi user thay đổi
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Bank tab state
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [hasBankAccount, setHasBankAccount] = useState(false);

  // Change password tab state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Dialog state
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

  // Prefer handlers passed via props, otherwise fall back to simple defaults
  const {
    onUpdateProfile: propOnUpdateProfile,
    onUpdateBankAccount: propOnUpdateBankAccount,
    onChangePassword: propOnChangePassword,
    onDeleteAccount: propOnDeleteAccount,
  } = props;

  const onUpdateProfile = propOnUpdateProfile ?? ((data: { name: string; email: string; phone: string }) => {
    console.log('Updating profile (default):', data);
  });

  const onUpdateBankAccount = propOnUpdateBankAccount ?? ((data: { accountNumber: string; bankName: string }) => {
    console.log('Updating bank account (default):', data);
  });

  const onChangePassword = propOnChangePassword ?? ((data: { oldPassword: string; newPassword: string }) => {
    console.log('Changing password (default):', data);
  });

  const onDeleteAccount = propOnDeleteAccount ?? (() => {
    console.log('Deleting account (default)...');
    app.handleLogout();
    navigate('/');
  });

  // --- Logic xử lý form ---

  // Handle profile update
  const handleProfileUpdate = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setDialogMessage('Vui lòng điền đầy đủ thông tin');
      setShowErrorDialog(true);
      return;
    }

    if (!profilePassword) {
      setDialogMessage('Vui lòng nhập mật khẩu để xác thực');
      setShowErrorDialog(true);
      return;
    }

    // Giả sử mật khẩu đúng là "123456" (demo purposes)
    if (profilePassword === '123456') {
      onUpdateProfile({ name, email, phone });
      setDialogMessage('Đổi thông tin tài khoản thành công');
      setShowSuccessDialog(true);
      setProfilePassword('');
    } else {
      setDialogMessage('Mật khẩu không đúng, lưu thông tin thất bại');
      setShowErrorDialog(true);
      setProfilePassword('');
    }
  };

  // Handle bank account update
  const handleBankUpdate = () => {
    if (!accountNumber.trim() || !bankName.trim()) {
      setDialogMessage('Vui lòng điền đầy đủ thông tin ngân hàng');
      setShowErrorDialog(true);
      return;
    }

    onUpdateBankAccount({ accountNumber, bankName });
    setHasBankAccount(true);
    setDialogMessage('Liên kết tài khoản ngân hàng thành công');
    setShowSuccessDialog(true);
  };

  // Handle password change
  const handlePasswordChange = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setDialogMessage('Vui lòng điền đầy đủ thông tin');
      setShowErrorDialog(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setDialogMessage('Mật khẩu mới và xác nhận mật khẩu không khớp');
      setShowErrorDialog(true);
      return;
    }

    if (newPassword.length < 6) {
      setDialogMessage('Mật khẩu mới phải có ít nhất 6 ký tự');
      setShowErrorDialog(true);
      return;
    }

    // Giả sử mật khẩu cũ đúng là "123456" (demo purposes)
    if (oldPassword === '123456') {
      onChangePassword({ oldPassword, newPassword });
      setDialogMessage('Đổi mật khẩu thành công');
      setShowSuccessDialog(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setDialogMessage('Mật khẩu cũ không đúng');
      setShowErrorDialog(true);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    setShowDeleteConfirmDialog(false);
    onDeleteAccount();
    setDialogMessage('Tài khoản đã được xóa thành công');
    setShowSuccessDialog(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    setShowErrorDialog(false);
  };

  if (!app.isLoggedIn && !userId) {
    return null; // Đã xử lý redirect ở useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItemsCount={props.cartItemsCount ?? (app.cart?.length || 0)}
        wishlistItemsCount={props.wishlistItemsCount ?? (app.wishlist?.length || 0)}
        unreadNotifications={props.unreadNotifications ?? 0}
        onCartClick={props.onCartClick ?? (() => navigate('/cart'))}
        onWishlistClick={props.onWishlistClick ?? (() => navigate('/wishlist'))}
        onNotificationsClick={props.onNotificationsClick ?? (() => {})}
        onFilterClick={props.onFilterClick ?? (() => {})}
        onPromotionClick={props.onPromotionClick ?? (() => {})}
        onSupportClick={props.onSupportClick ?? (() => {})}
        onStoreClick={props.onStoreClick ?? (() => navigate('/store'))}
        onLogoClick={props.onLogoClick ?? (() => navigate('/'))}
        isLoggedIn={props.isLoggedIn ?? app.isLoggedIn}
        user={props.user ?? user}
        onLogin={props.onLogin ?? (() => navigate('/login'))}
        onRegister={props.onRegister ?? (() => navigate('/register'))}
        onLogout={props.onLogout ?? (() => { app.handleLogout(); navigate('/'); })}
        onProfileClick={props.onProfileClick ?? (() => {})}
        onOrdersClick={props.onOrdersClick ?? (() => navigate('/orders'))}
        cartItems={props.cartItems ?? app.cart}
        hasStore={props.hasStore ?? (user?.role === 'seller')}
        onMyStoreClick={props.onMyStoreClick ?? (() => navigate('/my-store'))}
      />

      <main className="pt-16 pb-8">
        <div className="container mx-auto px-4 py-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-3xl mb-2">Thông tin tài khoản</h1>
            <p className="text-muted-foreground">
              Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
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
                    Cập nhật thông tin cá nhân của bạn. Cần nhập mật khẩu để xác thực.
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
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
                      Nhập mật khẩu hiện tại để xác nhận thay đổi (Demo: 123456)
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
                    {hasBankAccount ? 'Cập nhật thông tin' : 'Liên kết tài khoản'}
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
                      placeholder="Nhập mật khẩu cũ (Demo: 123456)"
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
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
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

            {/* Delete Account Tab */}
            <TabsContent value="delete">
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Xóa tài khoản</CardTitle>
                  <CardDescription>
                    Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Cảnh báo</AlertTitle>
                    <AlertDescription>
                      Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
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
            <Button onClick={handleDialogClose}>
              Đóng
            </Button>
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
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirmDialog(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
            >
              Xóa tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}