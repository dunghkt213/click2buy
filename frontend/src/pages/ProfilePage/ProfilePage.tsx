/**
 * ProfilePage - Trang profile người dùng
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../providers/AppProvider';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { User, Mail, Phone, MapPin, LogOut } from 'lucide-react';

export function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const app = useAppContext();
  
  const profileUser = userId ? null : app.user; // TODO: Fetch user by userId if provided

  if (!app.isLoggedIn && !userId) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Chưa đăng nhập</CardTitle>
            <CardDescription>Vui lòng đăng nhập để xem profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = profileUser || app.user;

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-3xl">{user?.name || 'Người dùng'}</CardTitle>
                <CardDescription className="text-lg mt-2">
                  {user?.role === 'seller' ? 'Người bán' : 'Khách hàng'}
                </CardDescription>
              </div>
              {!userId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    app.handleLogout();
                    navigate('/');
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email || 'Chưa có'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                <p className="font-medium">{user?.phone || 'Chưa có'}</p>
              </div>
            </div>

            {user?.role === 'seller' && (
              <div className="pt-4 border-t">
                <Button
                  onClick={() => navigate('/my-store')}
                  className="w-full"
                >
                  Quản lý cửa hàng
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

