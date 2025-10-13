import {
  Baby,
  BookOpen,
  Car,
  Check,
  Dumbbell,
  Home,
  Shirt,
  Sparkles,
  Star,
  X,
  Zap
} from 'lucide-react';
import { FilterState } from 'types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Slider } from '../ui/slider';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function FilterSidebar({ isOpen, onClose, filters, onFiltersChange }: FilterSidebarProps) {
  const categories = [
    { id: 'all', name: 'Tất cả', icon: null },
    { id: 'fashion', name: 'Thời trang', icon: Shirt },
    { id: 'electronics', name: 'Điện tử', icon: Zap },
    { id: 'home', name: 'Nhà cửa', icon: Home },
    { id: 'books', name: 'Sách', icon: BookOpen },
    { id: 'sports', name: 'Thể thao', icon: Dumbbell },
    { id: 'beauty', name: 'Làm đẹp', icon: Sparkles },
    { id: 'baby', name: 'Mẹ & Bé', icon: Baby },
    { id: 'automotive', name: 'Ô tô', icon: Car },
  ];

  const brands = ['Apple', 'Samsung', 'IKEA', 'Adidas', 'Nike', 'L\'Oreal', 'Aristino', 'ASUS', 'Dell', 'Giant'];

  const priceRanges = [
    { label: 'Dưới 500k', min: 0, max: 500000 },
    { label: '500k - 2tr', min: 500000, max: 2000000 },
    { label: '2tr - 10tr', min: 2000000, max: 10000000 },
    { label: 'Trên 10tr', min: 10000000, max: 100000000 },
  ];

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} tr`;
    }
    return `${(price / 1000).toFixed(0)}k`;
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category });
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    onFiltersChange({ ...filters, brands: newBrands });
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    onFiltersChange({ ...filters, priceRange: range });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({ ...filters, rating });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: 'all',
      priceRange: [0, 50000000],
      brands: [],
      rating: 0,
      inStock: true,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.brands.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000000) count++;
    return count;
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Bộ lọc</h3>
        {getActiveFiltersCount() > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Xóa tất cả
            <X className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Danh mục</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                filters.category === category.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.icon && <category.icon className="w-4 h-4" />}
              <span className="text-sm">{category.name}</span>
              {filters.category === category.id && (
                <Check className="w-4 h-4 ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Khoảng giá</h4>
        <div className="space-y-4">
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceRangeChange}
              max={50000000}
              min={0}
              step={100000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{formatPrice(filters.priceRange[0])}</span>
              <span>{formatPrice(filters.priceRange[1])}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {priceRanges.map((range, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => handlePriceRangeChange([range.min, range.max])}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Brands */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm flex items-center justify-between">
          Thương hiệu
          {filters.brands.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.brands.length}
            </Badge>
          )}
        </h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={brand}
                checked={filters.brands.includes(brand)}
                onCheckedChange={() => handleBrandToggle(brand)}
              />
              <Label
                htmlFor={brand}
                className="text-sm font-normal cursor-pointer"
              >
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Đánh giá</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div
              key={rating}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                filters.rating === rating
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => handleRatingChange(rating)}
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating
                        ? 'text-yellow-500 fill-current'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm">từ {rating} sao</span>
              {filters.rating === rating && (
                <Check className="w-4 h-4 ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Stock Status */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={filters.inStock}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, inStock: checked as boolean })
            }
          />
          <Label htmlFor="inStock" className="text-sm font-normal cursor-pointer">
            Chỉ hiển thị sản phẩm còn hàng
          </Label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80">
        <Card className="sticky top-24">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Bộ lọc sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <FilterContent />
          </CardContent>
        </Card>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
            <SheetDescription>
              Lọc sản phẩm theo danh mục, giá, thương hiệu và đánh giá
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}