import {
  Baby,
  BookOpen,
  Car,
  Dumbbell,
  Home,
  Shirt,
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface CategoriesProps {
  onCategorySelect: (category: string) => void;
}

export function Categories({ onCategorySelect }: CategoriesProps) {
  const categories = [
    { id: 'fashion', name: 'Thời trang', icon: Shirt, color: 'from-pink-500/20 to-pink-600/20' },
    { id: 'electronics', name: 'Điện tử', icon: Zap, color: 'from-blue-500/20 to-blue-600/20' },
    { id: 'home', name: 'Nhà cửa', icon: Home, color: 'from-green-500/20 to-green-600/20' },
    { id: 'books', name: 'Sách', icon: BookOpen, color: 'from-amber-500/20 to-amber-600/20' },
    { id: 'sports', name: 'Thể thao', icon: Dumbbell, color: 'from-red-500/20 to-red-600/20' },
    { id: 'beauty', name: 'Làm đẹp', icon: Sparkles, color: 'from-purple-500/20 to-purple-600/20' },
    { id: 'baby', name: 'Mẹ & Bé', icon: Baby, color: 'from-cyan-500/20 to-cyan-600/20' },
    { id: 'automotive', name: 'Ô tô', icon: Car, color: 'from-gray-500/20 to-gray-600/20' },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Danh mục sản phẩm</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Khám phá các danh mục sản phẩm đa dạng với chất lượng cao và giá cả phải chăng
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/80"
              onClick={() => onCategorySelect(category.id)}
            >
              <div className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="w-8 h-8 text-foreground" />
                </div>
                <h3 className="font-medium text-sm">{category.name}</h3>
              </div>
            </Card>
          ))}
        </div>

        {/* Featured categories */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
            <div className="aspect-[4/3] bg-gradient-to-br from-pink-500/10 to-pink-600/20 p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Thời trang Hot Trend</h3>
                <p className="text-muted-foreground text-sm mb-4">Giảm giá lên đến 50%</p>
                <Button size="sm" onClick={() => onCategorySelect('fashion')}>
                  Xem ngay
                </Button>
              </div>
              <div className="self-end">
                <Shirt className="w-16 h-16 text-pink-500/30" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Card>

          <Card className="relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
            <div className="aspect-[4/3] bg-gradient-to-br from-green-500/10 to-green-600/20 p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Nhà cửa & Đời sống</h3>
                <p className="text-muted-foreground text-sm mb-4">Trang trí nhà đẹp</p>
                <Button size="sm" onClick={() => onCategorySelect('home')}>
                  Khám phá
                </Button>
              </div>
              <div className="self-end">
                <Home className="w-16 h-16 text-green-500/30" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Card>

          <Card className="relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
            <div className="aspect-[4/3] bg-gradient-to-br from-purple-500/10 to-purple-600/20 p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Làm đẹp & Sức khỏe</h3>
                <p className="text-muted-foreground text-sm mb-4">Chăm sóc toàn diện</p>
                <Button size="sm" onClick={() => onCategorySelect('beauty')}>
                  Mua ngay
                </Button>
              </div>
              <div className="self-end">
                <Sparkles className="w-16 h-16 text-purple-500/30" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Card>
        </div>
      </div>
    </section>
  );
}