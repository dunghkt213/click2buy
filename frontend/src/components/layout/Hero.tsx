import React from 'react';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { ArrowRight, Star, Zap, Truck, Shield } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback.tsx';

export function Hero() {
  const features = [
    { icon: Zap, text: 'Giao hàng nhanh' },
    { icon: Shield, text: 'Bảo hành chính hãng' },
    { icon: Truck, text: 'Miễn phí vận chuyển' },
    { icon: Star, text: 'Đánh giá 5 sao' },
  ];

  return (
    <section className="relative bg-gradient-to-br from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                🔥 Khuyến mãi đặc biệt
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Mua sắm
                <span className="text-primary block">Thông minh</span>
                giá tốt nhất
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Khám phá hàng triệu sản phẩm chất lượng từ thời trang, điện tử đến nhà cửa với giá cả cạnh tranh nhất.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2">
                Mua ngay
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg">
                Xem sản phẩm
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="aspect-square lg:aspect-[4/5] relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-primary/20">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1624176195342-19344221ca1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXRwbGFjZSUyMHNob3BwaW5nJTIwZGl2ZXJzZSUyMHByb2R1Y3RzfGVufDF8fHx8MTc1ODA5OTY5Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Diverse shopping products"
                className="w-full h-full object-cover"
              />
              
              {/* Floating cards */}
              <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">4.9/5</span>
                </div>
                <p className="text-xs text-muted-foreground">Đánh giá từ khách hàng</p>
              </div>

              <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Còn hàng</span>
                </div>
                <p className="text-xs text-muted-foreground">Giao hàng trong 24h</p>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl"></div>
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