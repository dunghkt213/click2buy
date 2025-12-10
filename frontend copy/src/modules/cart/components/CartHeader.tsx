import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CartHeaderProps {
  count: number;
  onBack?: () => void;
}

export function CartHeader({ count, onBack }: CartHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Button>
        <h1 className="text-2xl font-semibold">Giỏ hàng của bạn</h1>
        <Badge variant="secondary">{count} sản phẩm</Badge>
      </div>
    </div>
  );
}
