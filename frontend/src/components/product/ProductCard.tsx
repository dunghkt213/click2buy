import {
  ShoppingCart,
  Star,
  Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { Product } from 'types';
import { calculateDiscount, formatPrice } from '../../utils/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  viewMode?: 'grid' | 'list';
  onViewDetail?: (product: Product) => void; // THÊM: Callback khi click xem chi tiết
  onTriggerFlyingIcon?: (type: 'cart', element: HTMLElement) => void; // THÊM: Trigger flying animation
  isLoggedIn?: boolean; // THÊM: Kiểm tra đăng nhập
  onLogin?: () => void; // THÊM: Callback để mở modal đăng nhập
}

export function ProductCard({
  product,
  onAddToCart,
  viewMode = 'grid',
  onViewDetail,
  onTriggerFlyingIcon,
  isLoggedIn = false,
  onLogin
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const discountPercent = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  // THÊM: Handler cho add to cart
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Ngăn không cho trigger xem chi tiết

    if (!isLoggedIn) {
      e.preventDefault();
      onLogin?.();
      return;
    }

    // Trigger flying animation
    if (onTriggerFlyingIcon) {
      onTriggerFlyingIcon('cart', e.currentTarget);
    }

    onAddToCart(product);
  };

  // Handler để xem chi tiết sản phẩm khi click vào card
  const handleCardClick = () => {
    if (onViewDetail) {
      onViewDetail(product);
    }
  };

  if (viewMode === 'list') {
    return (
      <Card
        className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          <div className="flex gap-6">
            {/* Image */}
            <div className="relative w-48 h-48 bg-muted/20 rounded-l-lg overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isNew && (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    Mới
                  </Badge>
                )}
                {product.isSale && discountPercent > 0 && (
                  <Badge variant="destructive">
                    -{discountPercent}%
                  </Badge>
                )}
              </div>

              {/* Stock status */}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="secondary">Hết hàng</Badge>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {product.brand}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-muted-foreground">
                      {product.ratingAvg || product.rating} ({product.reviews})
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {product.name}
                </h3>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  className="flex-1 gap-2 text-black [&>svg]:text-black"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-4 h-4 text-black" />
                  <span className="text-black">{product.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative aspect-square bg-muted/20 overflow-hidden">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.isNew && (
              <Badge className="bg-green-500 hover:bg-green-600 gap-1 text-xs px-1.5 py-0.5">
                <Zap className="w-2.5 h-2.5" />
                Mới
              </Badge>
            )}
            {product.isSale && discountPercent > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                -{discountPercent}%
              </Badge>
            )}
          </div>


          {/* Stock status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm px-3 py-1.5">
                Hết hàng
              </Badge>
            </div>
          )}

          {/* Quick add button */}
          <div className={`absolute bottom-3 left-3 right-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
            <Button
              className="w-full gap-1.5 bg-white/90 backdrop-blur-sm text-black hover:bg-white hover:text-black [&>svg]:text-black text-xs h-8"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="w-3.5 h-3.5 text-black" />
              <span className="text-black text-xs">Thêm vào giỏ</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
              {product.brand}
            </Badge>
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-xs text-muted-foreground">
                {product.ratingAvg || product.rating}
              </span>
            </div>
          </div>

          <h3 className="font-medium line-clamp-2 text-xs leading-tight min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="text-[10px] text-muted-foreground">
              {product.reviews} đánh giá
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}