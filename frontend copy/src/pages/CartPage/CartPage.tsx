/**
 * CartPage - Trang giỏ hàng
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartPage as CartPageComponent } from '../../components/cart/CartPage';
import { useAppContext } from '../../providers/AppProvider';

export function CartPage() {
  const navigate = useNavigate();
  const app = useAppContext();

  // Scroll về đầu trang khi vào trang cart
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <CartPageComponent
      items={app.cartItems}
      onUpdateQuantity={app.updateQuantity}
      onRemoveItem={app.removeFromCart}
      onToggleSelectItem={app.toggleSelectItem}
      onSelectAllItems={app.selectAllItems}
      onDeselectAllItems={app.deselectAllItems}
      selectedTotalPrice={app.getSelectedTotalPrice()}
      selectedItems={app.getSelectedItems()}
      onCheckout={app.handleCheckout}
      onBack={() => navigate('/feed')}
    />
  );
}

