import { useEffect } from "react";
import { CartEmptyState } from "./components/CartEmptyState";
import { CartHeader } from "./components/CartHeader";
import { CartItemRow } from "./components/CartItemRow";
import { CartSummary } from "./components/CartSummary";
import { useCartActions } from "./hooks/useCartActions";
import { useCartStore } from "./hooks/useCartStore";

export function CartPageNew() {
  const { items } = useCartStore();
  const {
    loadCart,
    changeQuantity,
    removeFromCart,
    toggleItem,
    selectAll,
    deselectAll,
    checkout
  } = useCartActions();

  const selected = items.filter(i => i.selected);
  const selectedTotal = selected.reduce((sum, i) => sum + i.price * i.quantity, 0);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <CartHeader count={0} />
        <div className="container mx-auto px-4 py-8">
          <CartEmptyState />
        </div>
      </div>
    );
  }

  const allSelected = items.length > 0 && items.every(i => i.selected);

  return (
    <div className="min-h-screen bg-background">
      <CartHeader count={items.length} />

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Select all */}
          <div className="flex items-center gap-3 mb-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => (allSelected ? deselectAll() : selectAll())}
            />
            <span>Chọn tất cả ({items.length} sản phẩm)</span>
          </div>

          {items.map(item => (
            <CartItemRow
              key={item.productId + item.sellerId}
              image={item.image!}
              name={item.name!}
              price={item.price}
              quantity={item.quantity}
              selected={item.selected}
              onSelect={() => toggleItem(item.productId, item.sellerId)}
              onRemove={() => removeFromCart({ productId: item.productId, sellerId: item.sellerId })}
              onIncrease={() => changeQuantity({ ...item, quantity: item.quantity + 1 })}
              onDecrease={() => changeQuantity({ ...item, quantity: item.quantity - 1 })}
            />
          ))}
        </div>

        {/* Summary */}
        <CartSummary
          total={selectedTotal}
          count={selected.length}
          onCheckout={() => checkout({ items: selected, paymentMethod: "BANKING" })}
        />
      </div>
    </div>
  );
}
