/**
 * OrdersPage - Trang đơn hàng
 */

import { useNavigate } from 'react-router-dom';
import { OrdersPage as OrdersPageComponent } from '../../components/order/OrdersPage';
import { useAppContext } from '../../providers/AppProvider';
import { useEffect } from 'react';

export function OrdersPage() {
  const navigate = useNavigate();
  const app = useAppContext();

  useEffect(() => {
    // Load orders khi vào trang
    if (app.isLoggedIn) {
      app.orders.loadOrders();
    }
  }, [app.isLoggedIn, app.orders]);

  return (
    <OrdersPageComponent
      orders={app.orders.orders}
      onBack={() => navigate('/feed')}
      onViewDetail={app.handleViewOrderDetail}
      onCancelOrder={app.handleCancelOrder}
      onReorder={app.handleReorder}
      onReview={app.handleReview}
      onContactShop={app.handleContactShop}
    />
  );
}

