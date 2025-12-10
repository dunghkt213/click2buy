import { Trash2, Minus, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPrice } from "@/utils";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";


export interface CartItemUIProps {
  image: string;
  name: string;
  price: number;
  quantity: number;
  selected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  onIncrease?: () => void;
  onDecrease?: () => void;
}

export function CartItemRow({
  image,
  name,
  price,
  quantity,
  selected,
  onSelect,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemUIProps) {
  return (
    <Card className={`p-4 group ${selected ? "border-primary shadow-md" : ""}`}>
      <div className="flex gap-4">
        <Checkbox checked={selected} onCheckedChange={onSelect} />

        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <ImageWithFallback src={image} alt={name} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <div className="flex justify-between">
            <h3 className="font-medium line-clamp-2">{name}</h3>
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-primary font-semibold">
              {formatPrice(price * quantity)}
            </span>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onDecrease} disabled={quantity <= 1}>
                <Minus className="w-3 h-3" />
              </Button>
              <span>{quantity}</span>
              <Button variant="outline" size="sm" onClick={onIncrease}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
