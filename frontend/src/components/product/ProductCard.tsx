import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  Share2,
  Zap
} from 'lucide-react';
import { Product } from 'types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { formatPrice, calculateDiscount } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  viewMode?: 'grid' | 'list';
  onViewDetail?: (product: Product) => void; // THÊM: Callback khi click xem chi tiết
  onAddToWishlist?: (product: Product) => void; // THÊM: Callback khi thêm vào wishlist
  isInWishlist?: boolean; // THÊM: Check xem sản phẩm đã có trong wishlist chưa
  onTriggerFlyingIcon?: (type: 'heart' | 'cart', element: HTMLElement) => void; // THÊM: Trigger flying animation
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  viewMode = 'grid', 
  onViewDetail, 
  onAddToWishlist, 
  isInWishlist = false,
  onTriggerFlyingIcon 
}: ProductCardProps) {
  // SỬA: Không dùng local state nữa, sử dụng isInWishlist từ props
  const [isHovered, setIsHovered] = useState(false);

  const discountPercent = product.originalPrice 
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  // THÊM: Handler cho wishlist
  const handleWishlistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger flying animation
    if (onTriggerFlyingIcon) {
      onTriggerFlyingIcon('heart', e.currentTarget);
    }
    
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };

  // THÊM: Handler cho add to cart
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger flying animation
    if (onTriggerFlyingIcon) {
      onTriggerFlyingIcon('cart', e.currentTarget);
    }
    
    onAddToCart(product);
  };

  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300">
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
                      {product.rating} ({product.reviews})
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
                  className="flex-1 gap-2"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {product.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleWishlistClick}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current text-red-500' : ''}`} />
                </Button>
                
                <Button variant="outline" size="icon" onClick={() => onViewDetail && onViewDetail(product)}>
                  <Eye className="w-4 h-4" />
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
      className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                <Zap className="w-3 h-3" />
                Mới
              </Badge>
            )}
            {product.isSale && discountPercent > 0 && (
              <Badge variant="destructive">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {/* Quick actions */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}>
            <Button
              variant="secondary"
              size="sm"
              className="w-10 h-10 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={handleWishlistClick}
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current text-red-500' : ''}`} />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              className="w-10 h-10 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={() => onViewDetail && onViewDetail(product)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              className="w-10 h-10 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Stock status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Hết hàng
              </Badge>
            </div>
          )}

          {/* Quick add button */}
          <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <Button
              className="w-full gap-2 bg-white/90 backdrop-blur-sm text-foreground hover:bg-white"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="w-4 h-4" />
              Thêm vào giỏ
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {product.brand}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-muted-foreground">
                {product.rating}
              </span>
            </div>
          </div>

          <h3 className="font-semibold line-clamp-2 text-sm leading-tight">
            {product.name}
          </h3>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground">
              {product.reviews} đánh giá
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}