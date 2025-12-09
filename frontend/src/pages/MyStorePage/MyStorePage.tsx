/**
 * MyStorePage - Trang quản lý cửa hàng
 */

import { useNavigate } from 'react-router-dom';
import { MyStorePage as MyStorePageComponent } from '../../components/store/MyStorePage';
import { useAppContext } from '../../providers/AppProvider';
import { useEffect } from 'react';

export function MyStorePage() {
  const navigate = useNavigate();
  const app = useAppContext();

  useEffect(() => {
    // Redirect nếu chưa đăng nhập hoặc không phải seller
    if (!app.isLoggedIn) {
      navigate('/login');
      return;
    }
    if (app.user?.role !== 'seller') {
      // Nếu chưa có store, mở modal đăng ký store
      if (!app.store.hasStore) {
        app.modals.openStoreRegistration();
        navigate('/feed');
      }
    }
  }, [app.isLoggedIn, app.user?.role, app.store.hasStore, navigate, app.modals]);

  // Load store products khi vào trang
  useEffect(() => {
    if (app.isLoggedIn && app.user?.role === 'seller') {
      // Trigger load products bằng cách set isMyStorePageOpen
      app.store.setIsMyStorePageOpen(true);
    }
  }, [app.isLoggedIn, app.user?.role, app.store]);

  if (!app.isLoggedIn || app.user?.role !== 'seller') {
    return null; // Sẽ redirect
  }

  return (
    <MyStorePageComponent
      storeProducts={app.store.storeProducts}
      storeOrders={app.orders.orders.filter(o => o.status !== 'cancelled')}
      onAddProduct={app.store.handleAddProduct}
      onUpdateProduct={app.store.handleUpdateProduct}
      onDeleteProduct={app.store.handleDeleteProduct}
      onUpdateOrderStatus={(orderId, status) => {
        app.orders.setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: status as any,
                updatedAt: new Date().toISOString(),
                timeline: [
                  ...order.timeline,
                  {
                    status: status as any,
                    timestamp: new Date().toISOString(),
                    description: `Đơn hàng đã chuyển sang trạng thái ${status}`
                  }
                ]
              }
            : order
        ));
      }}
    />
  );
}

