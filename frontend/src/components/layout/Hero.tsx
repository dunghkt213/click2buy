import { motion } from 'framer-motion';
import { ArrowRight, Shield, ShoppingBag, Sparkles, Star, Truck, Zap } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export function Hero() {
  const features = [
    { icon: Zap, text: 'Giao hàng nhanh', color: 'text-yellow-500' },
    { icon: Shield, text: 'Bảo hành chính hãng', color: 'text-blue-500' },
    { icon: Truck, text: 'Miễn phí vận chuyển', color: 'text-green-500' },
    { icon: Star, text: 'Đánh giá 5 sao', color: 'text-amber-500' },
  ];

  const stats = [
    { number: '100K+', label: 'Khách hàng tin tưởng', icon: '👥' },
    { number: '1M+', label: 'Sản phẩm đa dạng', icon: '📦' },
    { number: '99%', label: 'Khách hàng hài lòng', icon: '😊' },
    { number: '24/7', label: 'Hỗ trợ khách hàng', icon: '💬' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  } as const;

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left: Main Content */}
          <div className="space-y-6 z-10">
            <motion.div variants={itemVariants}>
              <Badge 
                variant="secondary" 
                className="w-fit mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <Sparkles className="w-3 h-3 mr-2" />
                Khuyến mãi đặc biệt - Giảm đến 50%
              </Badge>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight"
            >
              <span className="block text-foreground">Mua sắm</span>
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Thông minh
              </span>
              <span className="block text-foreground">Giá tốt nhất</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed"
            >
              Khám phá hàng triệu sản phẩm chất lượng từ thời trang, điện tử đến nhà cửa với giá cả cạnh tranh nhất thị trường.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <Button 
                size="lg" 
                className="group text-base px-8 py-6 h-auto font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <ShoppingBag className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Mua sắm ngay
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-base px-8 py-6 h-auto font-semibold border-2 hover:bg-primary/5"
              >
                Xem thêm
              </Button>
            </motion.div>

            {/* Features Grid */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex flex-col items-center gap-2 p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all`}>
                    <feature.icon className={`w-6 h-6 ${feature.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground text-center font-medium group-hover:text-foreground transition-colors">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Visual Element */}
          <motion.div 
            variants={itemVariants}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-8 border border-primary/20 shadow-2xl backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl" />
                
                {/* Floating Elements */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-2xl backdrop-blur-sm border border-primary/30 flex items-center justify-center"
                >
                  <Star className="w-10 h-10 text-primary" />
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                  }}
                  className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/20 rounded-2xl backdrop-blur-sm border border-primary/30 flex items-center justify-center"
                >
                  <Zap className="w-8 h-8 text-primary" />
                </motion.div>

                {/* Content */}
                <div className="relative z-10 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-primary">50%</div>
                    <div className="text-sm text-muted-foreground">Giảm giá hôm nay</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {stats.slice(0, 4).map((stat, index) => (
                      <div
                        key={index}
                        className="text-center p-4 bg-background/50 rounded-xl border border-border/50"
                      >
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className="text-lg font-bold text-foreground">{stat.number}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="relative border-t border-border/50 bg-card/30 backdrop-blur-md"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-colors border border-border/30 hover:border-primary/30"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
