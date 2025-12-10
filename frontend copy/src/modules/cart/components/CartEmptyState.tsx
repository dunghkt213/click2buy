import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CartEmptyState({ onBack }: { onBack?: () => void }) {
  return (
    <Card className="p-12 text-center">
      <ShoppingCart className="w-24 h-24 mx-auto mb-4 text-muted-foreground" />
      <h2 className="text-2xl mb-2">Giỏ hàng trống</h2>
      <p className="text-muted-foreground mb-6">
        Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
      </p>
      <Button onClick={onBack}>Tiếp tục mua sắm</Button>
    </Card>
  );
}
