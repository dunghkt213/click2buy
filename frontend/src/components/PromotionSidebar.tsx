import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';
import { 
  Tag,
  Gift,
  Clock,
  Star,
  Zap,
  Calendar,
  Percent,
  Trophy,
  ShoppingCart,
  Flame,
  Timer
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Promotion } from '../types';

interface PromotionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  promotions: Promotion[];
  onClaimPromotion: (id: string) => void;
  onUsePromotion: (id: string) => void;
}

export function PromotionSidebar({
  isOpen,
  onClose,
  promotions,
  onClaimPromotion,
  onUsePromotion
}: PromotionSidebarProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'flash-sale':
        return Zap;
      case 'discount':
        return Percent;
      case 'voucher':
        return Tag;
      case 'cashback':
        return Gift;
      case 'gift':
        return Trophy;
      case 'event':
        return Calendar;
      default:
        return Tag;
    }
  };

  const getPromotionColor = (type: string) => {
    switch (type) {
      case 'flash-sale':
        return 'text-red-600';
      case 'discount':
        return 'text-blue-600';
      case 'voucher':
        return 'text-green-600';
      case 'cashback':
        return 'text-purple-600';
      case 'gift':
        return 'text-yellow-600';
      case 'event':
        return 'text-pink-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Đã hết hạn';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Còn ${days} ngày`;
    }
    
    return `Còn ${hours}h ${minutes}m`;
  };

  const activePromotions = promotions.filter(p => p.isActive);
  const expiredPromotions = promotions.filter(p => !p.isActive);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[480px] flex flex-col p-0 h-full max-h-screen">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-card">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2>Khuyến mãi</h2>
                  <SheetDescription>
                    {activePromotions.length} ưu đãi đang diễn ra
                  </SheetDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  HOT
                </Badge>
              </div>
            </SheetTitle>
          </SheetHeader>
        </div>

        {activePromotions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 px-6">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
              <Tag className="w-16 h-16 text-orange-500" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Chưa có khuyến mãi</h3>
              <p className="text-muted-foreground text-sm max-w-[280px]">
                Theo dõi thường xuyên để không bỏ lỡ các chương trình khuyến mãi hấp dẫn
              </p>
            </div>
            <Button onClick={onClose} className="px-8">
              Khám phá sản phẩm
            </Button>
          </div>
        ) : (
          <>
            {/* Flash Sale Banner */}
            <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Flash Sale 12.12</h3>
                    <p className="text-sm opacity-90">Giảm tới 70% - Số lượng có hạn</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm font-mono">12:34:56</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Promotions List */}
            <ScrollArea className="flex-1 px-6 min-h-0">
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Ưu đãi đang diễn ra
                  </h3>
                  {activePromotions.map((promotion) => {
                    const IconComponent = getPromotionIcon(promotion.type);
                    const iconColor = getPromotionColor(promotion.type);
                    
                    return (
                      <div 
                        key={promotion.id} 
                        className="relative p-4 border border-border rounded-xl transition-all duration-200 hover:shadow-md hover:border-primary/20 bg-gradient-to-r from-white to-gray-50 dark:from-gray-950 dark:to-gray-900"
                      >
                        {/* Hot badge */}
                        {promotion.isHot && (
                          <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white z-10">
                            <Flame className="w-3 h-3 mr-1" />
                            HOT
                          </Badge>
                        )}

                        <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-muted/50 ${iconColor} flex-shrink-0`}>
                            <IconComponent className="w-6 h-6" />
                          </div>

                          <div className="flex-1 space-y-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm">{promotion.title}</h4>
                                {promotion.isLimited && (
                                  <Badge variant="outline" className="text-xs">
                                    Có hạn
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {promotion.description}
                              </p>
                            </div>

                            {/* Discount */}
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-primary">
                                {promotion.discount}
                              </span>
                              {promotion.minOrderValue && (
                                <span className="text-xs text-muted-foreground">
                                  Đơn tối thiểu {formatPrice(promotion.minOrderValue)}
                                </span>
                              )}
                            </div>

                            {/* Progress for limited promotions */}
                            {promotion.progress !== undefined && promotion.total && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span>Đã sử dụng: {promotion.claimed}/{promotion.total}</span>
                                  <span>{Math.round((promotion.claimed || 0) / promotion.total * 100)}%</span>
                                </div>
                                <Progress value={promotion.progress} className="h-2" />
                              </div>
                            )}

                            {/* Time remaining */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{getTimeRemaining(promotion.endDate)}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {promotion.code && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => navigator.clipboard.writeText(promotion.code!)}
                                  >
                                    {promotion.code}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  className="h-7 text-xs gap-1"
                                  onClick={() => onUsePromotion(promotion.id)}
                                >
                                  <ShoppingCart className="w-3 h-3" />
                                  Dùng ngay
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {expiredPromotions.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3 text-muted-foreground">
                        Đã hết hạn
                      </h3>
                      {expiredPromotions.slice(0, 3).map((promotion) => {
                        const IconComponent = getPromotionIcon(promotion.type);
                        
                        return (
                          <div 
                            key={promotion.id} 
                            className="p-4 border border-border rounded-xl bg-muted/30 opacity-60"
                          >
                            <div className="flex gap-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted text-muted-foreground flex-shrink-0">
                                <IconComponent className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">{promotion.title}</h4>
                                <p className="text-sm text-muted-foreground">{promotion.discount}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="bg-muted/30 border-t border-border p-6 space-y-4">
              <div className="flex items-center justify-center text-center space-y-2">
                <div className="text-sm text-muted-foreground">
                  <p>🎉 Đăng ký nhận thông báo khuyến mãi mới nhất</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={onClose}>
                Đóng
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}