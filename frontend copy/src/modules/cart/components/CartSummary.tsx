import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/utils";

interface SummaryProps {
  total: number;
  count: number;
  onCheckout?: () => void;
}

export function CartSummary({ total, count, onCheckout }: SummaryProps) {
  return (
    <Card className="p-6 sticky top-24">
      <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
      <Separator className="mb-4" />
      <div className="text-sm flex justify-between mb-4">
        <span>Số sản phẩm đã chọn</span>
        <span>{count}</span>
      </div>
      <Separator className="mb-4" />
      <div className="flex justify-between font-bold text-xl mb-6">
        <span>Tổng cộng</span>
        <span className="text-primary">{formatPrice(total)}</span>
      </div>
      <Button disabled={count === 0} onClick={onCheckout} className="w-full">
        Thanh toán ({count})
      </Button>
    </Card>
  );
}
