import React from 'react';
import { Badge } from '../ui/badge';
import { Zap, Star, Truck, Shield } from 'lucide-react';

export function Hero() {
  const features = [
    { icon: Zap, text: 'Giao hàng nhanh' },
    { icon: Shield, text: 'Bảo hành chính hãng' },
    { icon: Truck, text: 'Miễn phí vận chuyển' },
    { icon: Star, text: 'Đánh giá 5 sao' },
  ];

  return (
    <section className="relative bg-gradient-to-br from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        {/* Content - 2 columns: Text left, Features right */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Title & Description */}
          <div className="space-y-4">
            <Badge variant="secondary" className="w-fit">
              🔥 Khuyến mãi đặc biệt
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Mua sắm
              <span className="text-primary block">Thông minh</span>
              giá tốt nhất
            </h1>
            <p className="text-base text-muted-foreground max-w-xl">
              Khám phá hàng triệu sản phẩm chất lượng từ thời trang, điện tử đến nhà cửa với giá cả cạnh tranh nhất.
            </p>
          </div>

          {/* Right: Features */}
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center gap-2 text-sm p-3 bg-card/50 rounded-lg border border-border/50">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground text-center text-xs">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: '100K+', label: 'Khách hàng tin tưởng' },
              { number: '1M+', label: 'Sản phẩm đa dạng' },
              { number: '99%', label: 'Khách hàng hài lòng' },
              { number: '24/7', label: 'Hỗ trợ khách hàng' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}