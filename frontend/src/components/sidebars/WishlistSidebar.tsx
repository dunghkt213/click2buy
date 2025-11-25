import { motion } from "framer-motion";
import {
  Eye,
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Trash2,
} from "lucide-react";
import { Product } from "types";
import { formatPrice } from "../../lib/utils";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

interface WishlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveItem: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (productId: string) => void;
}

export function WishlistSidebar({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onAddToCart,
  onViewProduct,
}: WishlistSidebarProps) {
  const shareWishlist = () => {
    if (navigator.share) {
      navigator.share({
        title: "Danh sách yêu thích của tôi - Click2buy",
        text: `Xem ${items.length} sản phẩm trong danh sách yêu thích của tôi`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const motionEase = [0.4, 0, 0.2, 1] as const;
  const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: motionEase } },
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[480px] flex flex-col p-0 h-full max-h-screen">
        <motion.div
          className="flex flex-col h-full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: motionEase } }}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border bg-card">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2>Yêu thích</h2>
                    <SheetDescription>
                      {items.length} sản phẩm
                    </SheetDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={shareWishlist}
                        className="w-8 h-8 p-0"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary"
                      >
                        {items.length}
                      </Badge>
                    </>
                  )}
                </div>
              </SheetTitle>
            </SheetHeader>
          </div>

          {items.length === 0 ? (
            <motion.div
              className="flex-1 flex flex-col items-center justify-center space-y-6 px-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.35, ease: motionEase } }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center">
                <Heart className="w-16 h-16 text-primary/60" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  Danh sách yêu thích trống
                </h3>
                <p className="text-muted-foreground text-sm max-w-[280px]">
                  Thêm sản phẩm yêu thích để dễ dàng tìm lại và
                  mua sắm sau này
                </p>
              </div>
              <Button onClick={onClose} className="px-8">
                Khám phá sản phẩm
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Wishlist Items */}
              <ScrollArea className="flex-1 px-6 min-h-0">
                <motion.div
                  className="space-y-4 py-4"
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      className="group relative bg-card border border-border rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-primary/20"
                    >
                      {/* Sale badge */}
                      {item.isSale && (
                        <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground z-10">
                          SALE
                        </Badge>
                      )}

                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 bg-muted/20 rounded-xl overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm line-clamp-2 leading-relaxed">
                                {item.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted-foreground">
                                  {item.brand}
                                </p>
                                {item.rating > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs text-muted-foreground">
                                      {item.rating}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-8 h-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              onClick={() => onRemoveItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-semibold text-primary">
                                {formatPrice(item.price)}
                              </div>
                              {item.originalPrice && (
                                <div className="text-xs text-muted-foreground line-through">
                                  {formatPrice(item.originalPrice)}
                                </div>
                              )}
                              <div
                                className={`text-xs ${item.inStock ? "text-green-600" : "text-red-600"}`}
                              >
                                {item.inStock ? "Còn hàng" : "Hết hàng"}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewProduct(item.id)}
                                className="w-8 h-8 p-0"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => onAddToCart(item)}
                                disabled={!item.inStock}
                                className="gap-1"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                Thêm
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </ScrollArea>

              {/* Footer Actions */}
              <motion.div
                className="bg-muted/30 border-t border-border p-6 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.3 } }}
              >
                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      items
                        .filter((item) => item.inStock)
                        .forEach((item) => onAddToCart(item));
                    }}
                    disabled={
                      items.filter((item) => item.inStock)
                        .length === 0
                    }
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Thêm tất cả
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={shareWishlist}
                  >
                    <Share2 className="w-4 h-4" />
                    Chia sẻ
                  </Button>
                </div>

                <Separator />

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onClose}
                >
                  Tiếp tục mua sắm
                </Button>
              </motion.div>
            </>
          )}
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}