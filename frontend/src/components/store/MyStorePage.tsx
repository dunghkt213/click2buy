import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  Edit,
  Filter,
  Package,
  Plus,
  Search,
  Trash2,
  Truck
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Order, StoreProduct } from 'types';
import { formatPrice } from '../../utils/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  salePrice: number;
  stock: number;
  brand: string;
  condition: 'new' | 'used';
  categoryIds: string[];
  tags: string[];
  images: string[];
  attributes: Record<string, any>;
  variants: Record<string, any>;
  warehouseAddress: {
    line1: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
  };
  isActive: boolean;
}

interface MyStorePageProps {
  storeProducts: StoreProduct[];
  storeOrders: Order[];
  onAddProduct: (productFormData: ProductFormData) => void;
  onUpdateProduct: (id: string, product: Partial<StoreProduct>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
}

type OrderTab = 'pending' | 'shipping' | 'completed';

export function MyStorePage({
  storeProducts,
  storeOrders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus
}: MyStorePageProps) {
  const [selectedTab, setSelectedTab] = useState('products');
  
  // Log khi storeProducts thay đổi
  useEffect(() => {
    console.log('🏪 [MyStorePage] Nhận được storeProducts:', storeProducts);
    console.log(`📦 [MyStorePage] Tổng số sản phẩm: ${storeProducts.length}`);
    if (storeProducts.length > 0) {
      console.log('✅ [MyStorePage] Sản phẩm đầu tiên:', storeProducts[0]);
    }
  }, [storeProducts]);
  const [orderTab, setOrderTab] = useState<OrderTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    salePrice: 0,
    stock: 0,
    brand: '',
    condition: 'new' as 'new' | 'used',
    categoryIds: [] as string[],
    tags: [] as string[],
    images: [] as string[],
    attributes: {} as Record<string, any>,
    variants: {} as Record<string, any>,
    warehouseAddress: {
      line1: '',
      city: '',
      province: '',
      country: 'Vietnam',
      postalCode: ''
    },
    isActive: true
  });

  // Raw input values để cho phép user gõ tự do
  const [rawInputs, setRawInputs] = useState({
    categories: '',
    tags: '',
    images: '',
    attributes: '',
    variants: ''
  });

  const handleAddProduct = () => {
    // Validate required fields
    if (!productForm.name || !productForm.brand || !productForm.price || productForm.images.length === 0) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc: Tên sản phẩm, Thương hiệu, Giá gốc, và ít nhất một hình ảnh');
      return;
    }

    if (productForm.categoryIds.length === 0) {
      alert('Vui lòng nhập ít nhất một danh mục');
      return;
    }

    // Pass form data directly to parent
    onAddProduct(productForm);
    setIsAddProductOpen(false);
    // Reset form
    setProductForm({
      name: '',
      description: '',
      price: 0,
      salePrice: 0,
      stock: 0,
      brand: '',
      condition: 'new',
      categoryIds: [],
      tags: [],
      images: [],
      attributes: {},
      variants: {},
      warehouseAddress: {
        line1: '',
        city: '',
        province: '',
        country: 'Vietnam',
        postalCode: ''
      },
      isActive: true
    });
    // Reset raw inputs
    setRawInputs({
      categories: '',
      tags: '',
      images: '',
      attributes: '',
      variants: ''
    });
  };

  const handleEditProduct = () => {
    if (selectedProduct) {
      onUpdateProduct(selectedProduct.id, productForm);
      setIsEditProductOpen(false);
      setSelectedProduct(null);
    }
  };

  const openEditDialog = (product: StoreProduct) => {
    setSelectedProduct(product);
    // Map StoreProduct to productForm format
    const categoryIds = product.category ? product.category.split(',').map(c => c.trim()) : [];
    const images = product.images || (product.image ? [product.image] : []);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.originalPrice || product.price,
      salePrice: product.price,
      stock: product.stock,
      brand: '', // StoreProduct doesn't have brand, will need to be filled manually
      condition: 'new',
      categoryIds: categoryIds,
      tags: [],
      images: images,
      attributes: {},
      variants: {},
      warehouseAddress: {
        line1: '',
        city: '',
        province: '',
        country: 'Vietnam',
        postalCode: ''
      },
      isActive: product.status === 'active'
    });
    // Set raw inputs for display
    setRawInputs({
      categories: categoryIds.join(', '),
      tags: '',
      images: images.join('\n'),
      attributes: '',
      variants: ''
    });
    setIsEditProductOpen(true);
  };

  // Filter products
  const filteredProducts = storeProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter orders by status
  const filteredOrders = storeOrders.filter(order => {
    if (orderTab === 'pending') return order.status === 'pending' || order.status === 'confirmed';
    if (orderTab === 'shipping') return order.status === 'shipping';
    if (orderTab === 'completed') return order.status === 'completed';
    return false;
  });

  const getOrderCount = (tab: OrderTab) => {
    if (tab === 'pending') return storeOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
    if (tab === 'shipping') return storeOrders.filter(o => o.status === 'shipping').length;
    if (tab === 'completed') return storeOrders.filter(o => o.status === 'completed').length;
    return 0;
  };

  const motionEase = [0.4, 0, 0.2, 1] as const;
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: motionEase } }
  };
  const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: motionEase } }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <motion.div
        className="mb-8"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-3xl font-bold mb-2">Cửa hàng của tôi</h1>
        <p className="text-muted-foreground">Quản lý sản phẩm và đơn hàng của bạn</p>
      </motion.div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              Sản phẩm ({storeProducts.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Truck className="w-4 h-4" />
              Đơn hàng ({storeOrders.length})
            </TabsTrigger>
          </TabsList>
        </motion.div>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <motion.div
            className="flex items-center justify-between"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Lọc
              </Button>
              <Button onClick={() => setIsAddProductOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Thêm sản phẩm
              </Button>
            </div>
          </motion.div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4">Sản phẩm</th>
                    <th className="p-4">Giá</th>
                    <th className="p-4">Kho</th>
                    <th className="p-4">Đã bán</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Thao tác</th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredProducts.map((product) => (
                    <motion.tr key={product.id} className="border-b hover:bg-muted/30" variants={itemVariants}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <ImageWithFallback
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{formatPrice(product.price)}</p>
                        {product.originalPrice && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <p className={product.stock < 10 ? 'text-red-500' : ''}>
                          {product.stock}
                        </p>
                      </td>
                      <td className="p-4">{product.sold}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            product.status === 'active'
                              ? 'default'
                              : product.status === 'inactive'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {product.status === 'active' && 'Đang bán'}
                          {product.status === 'inactive' && 'Tạm ngưng'}
                          {product.status === 'out_of_stock' && 'Hết hàng'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onDeleteProduct(product.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          {/* Order Status Tabs */}
          <Tabs value={orderTab} onValueChange={(v) => setOrderTab(v as OrderTab)}>
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
            >
              <TabsList>
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="w-4 h-4" />
                  Chờ xử lý
                  {getOrderCount('pending') > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {getOrderCount('pending')}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="shipping" className="gap-2">
                  <Truck className="w-4 h-4" />
                  Đang giao
                  {getOrderCount('shipping') > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {getOrderCount('shipping')}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Hoàn thành
                  {getOrderCount('completed') > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {getOrderCount('completed')}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </motion.div>

            {/* Order Lists */}
            {['pending', 'shipping', 'completed'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <Card className="p-12">
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { duration: 0.3 } }}
                    >
                      <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg mb-2">Chưa có đơn hàng</h3>
                      <p className="text-muted-foreground">
                        {tab === 'pending' && 'Chưa có đơn hàng chờ xử lý'}
                        {tab === 'shipping' && 'Chưa có đơn hàng đang giao'}
                        {tab === 'completed' && 'Chưa có đơn hàng hoàn thành'}
                      </p>
                    </motion.div>
                  </Card>
                ) : (
                  <motion.div
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    {filteredOrders.map((order) => (
                      <motion.div key={order.id} variants={itemVariants}>
                    <Card className="overflow-hidden">
                      <div className="p-4 bg-muted/30 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          <Badge>
                            {order.status === 'pending' && 'Chờ xác nhận'}
                            {order.status === 'confirmed' && 'Đã xác nhận'}
                            {order.status === 'shipping' && 'Đang giao'}
                            {order.status === 'completed' && 'Hoàn thành'}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="space-y-3 mb-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <ImageWithFallback
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium line-clamp-1">{item.name}</p>
                                {item.variant && (
                                  <p className="text-sm text-muted-foreground">{item.variant}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                                <p className="font-medium">{formatPrice(item.price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Khách hàng:</p>
                              <p className="font-medium">{order.shippingAddress.name}</p>
                              <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Tổng tiền:</p>
                              <p className="text-xl font-bold text-primary">{formatPrice(order.finalPrice)}</p>
                            </div>
                          </div>

                          {order.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => onUpdateOrderStatus(order.id, 'confirmed')}
                                className="flex-1"
                              >
                                Xác nhận đơn
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                                    onUpdateOrderStatus(order.id, 'cancelled');
                                  }
                                }}
                              >
                                Hủy đơn
                              </Button>
                            </div>
                          )}

                          {order.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => onUpdateOrderStatus(order.id, 'shipping')}
                              className="w-full"
                            >
                              Bắt đầu giao hàng
                            </Button>
                          )}

                          {order.status === 'shipping' && (
                            <Button
                              size="sm"
                              onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                              className="w-full"
                            >
                              Hoàn thành đơn hàng
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Thêm sản phẩm mới</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[75vh] pr-4">
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Thông tin cơ bản</h3>
                <div>
                  <Label>Tên sản phẩm *</Label>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Nhập tên sản phẩm..."
                  />
                </div>
                <div>
                  <Label>Mô tả</Label>
                  <Textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Mô tả sản phẩm..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Thương hiệu *</Label>
                    <Input
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      placeholder="Ví dụ: Adidas, Nike..."
                    />
                  </div>
                  <div>
                    <Label>Tình trạng</Label>
                    <Select
                      value={productForm.condition}
                      onValueChange={(value: 'new' | 'used') => setProductForm({ ...productForm, condition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Mới</SelectItem>
                        <SelectItem value="used">Đã qua sử dụng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Giá cả</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Giá gốc *</Label>
                    <Input
                      type="number"
                      value={productForm.price || ''}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) || 0 })}
                      placeholder="3200000"
                    />
                  </div>
                  <div>
                    <Label>Giá khuyến mãi</Label>
                    <Input
                      type="number"
                      value={productForm.salePrice || ''}
                      onChange={(e) => setProductForm({ ...productForm, salePrice: Number(e.target.value) || 0 })}
                      placeholder="2900000"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Kho hàng</h3>
                <div>
                  <Label>Số lượng trong kho *</Label>
                  <Input
                    type="number"
                    value={productForm.stock || ''}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) || 0 })}
                    placeholder="120"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={productForm.isActive}
                    onCheckedChange={(checked) => setProductForm({ ...productForm, isActive: checked === true })}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">Sản phẩm đang hoạt động</Label>
                </div>
              </div>

              {/* Categories & Tags */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Phân loại</h3>
                <div>
                  <Label>Danh mục *</Label>
                  <Input
                    value={rawInputs.categories}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRawInputs({ ...rawInputs, categories: value });
                      // Parse khi user gõ (cho phép dấu cách trong giá trị)
                      const categories = value ? value.split(',').map(c => c.trim()).filter(c => c) : [];
                      setProductForm({ ...productForm, categoryIds: categories });
                    }}
                    onBlur={(e) => {
                      // Khi blur, đảm bảo format đúng
                      const value = e.target.value;
                      const categories = value ? value.split(',').map(c => c.trim()).filter(c => c) : [];
                      setRawInputs({ ...rawInputs, categories: categories.join(', ') });
                      setProductForm({ ...productForm, categoryIds: categories });
                    }}
                    placeholder="giay, the-thao, phu-kien"
                  />
                </div>
                <div>
                  <Label>Tags</Label>
                  <Input
                    value={rawInputs.tags}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRawInputs({ ...rawInputs, tags: value });
                      const tags = value ? value.split(',').map(t => t.trim()).filter(t => t) : [];
                      setProductForm({ ...productForm, tags });
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      const tags = value ? value.split(',').map(t => t.trim()).filter(t => t) : [];
                      setRawInputs({ ...rawInputs, tags: tags.join(', ') });
                      setProductForm({ ...productForm, tags });
                    }}
                    placeholder="running, sport, adidas"
                  />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Hình ảnh</h3>
                <div>
                  <Label>URL hình ảnh *</Label>
                  <Textarea
                    value={rawInputs.images}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRawInputs({ ...rawInputs, images: value });
                      // Parse nhưng giữ nguyên dấu cách trong URL
                      const images = value ? value.split('\n').map(img => img.trim()).filter(img => img) : [];
                      setProductForm({ ...productForm, images });
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      const images = value ? value.split('\n').map(img => img.trim()).filter(img => img) : [];
                      setRawInputs({ ...rawInputs, images: images.join('\n') });
                      setProductForm({ ...productForm, images });
                    }}
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    rows={4}
                  />
                </div>
              </div>

              {/* Attributes */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Thuộc tính</h3>
                <div>
                  <Label>Thuộc tính sản phẩm</Label>
                  <Textarea
                    value={rawInputs.attributes}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRawInputs({ ...rawInputs, attributes: value });
                      // Parse nhưng giữ nguyên dấu cách trong giá trị
                      const attrs: Record<string, any> = {};
                      value.split('\n').forEach(line => {
                        const trimmedLine = line.trim();
                        if (trimmedLine) {
                          const colonIndex = trimmedLine.indexOf(':');
                          if (colonIndex > 0) {
                            const key = trimmedLine.substring(0, colonIndex).trim();
                            const val = trimmedLine.substring(colonIndex + 1).trim();
                            if (key && val) {
                              attrs[key] = val; // Giữ nguyên dấu cách trong value
                            }
                          }
                        }
                      });
                      setProductForm({ ...productForm, attributes: attrs });
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      const attrs: Record<string, any> = {};
                      value.split('\n').forEach(line => {
                        const trimmedLine = line.trim();
                        if (trimmedLine) {
                          const colonIndex = trimmedLine.indexOf(':');
                          if (colonIndex > 0) {
                            const key = trimmedLine.substring(0, colonIndex).trim();
                            const val = trimmedLine.substring(colonIndex + 1).trim();
                            if (key && val) {
                              attrs[key] = val;
                            }
                          }
                        }
                      });
                      // Format lại để hiển thị đẹp
                      const formatted = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join('\n');
                      setRawInputs({ ...rawInputs, attributes: formatted });
                      setProductForm({ ...productForm, attributes: attrs });
                    }}
                    placeholder="color: white&#10;material: Primeknit&#10;cushion: Boost&#10;weight: 300g"
                    rows={4}
                  />
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Biến thể</h3>
                <div>
                  <Label>Biến thể sản phẩm</Label>
                  <Textarea
                    value={rawInputs.variants}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRawInputs({ ...rawInputs, variants: value });
                      // Parse nhưng giữ nguyên dấu cách trong giá trị
                      const variants: Record<string, any> = {};
                      value.split('\n').forEach(line => {
                        const trimmedLine = line.trim();
                        if (trimmedLine) {
                          const colonIndex = trimmedLine.indexOf(':');
                          if (colonIndex > 0) {
                            const key = trimmedLine.substring(0, colonIndex).trim();
                            const val = trimmedLine.substring(colonIndex + 1).trim();
                            if (key && val) {
                              // Nếu có dấu phẩy, coi như array (nhưng giữ dấu cách trong mỗi giá trị)
                              if (val.includes(',')) {
                                variants[key] = val.split(',').map(v => v.trim());
                              } else {
                                variants[key] = val; // Giữ nguyên dấu cách
                              }
                            }
                          }
                        }
                      });
                      setProductForm({ ...productForm, variants });
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      const variants: Record<string, any> = {};
                      value.split('\n').forEach(line => {
                        const trimmedLine = line.trim();
                        if (trimmedLine) {
                          const colonIndex = trimmedLine.indexOf(':');
                          if (colonIndex > 0) {
                            const key = trimmedLine.substring(0, colonIndex).trim();
                            const val = trimmedLine.substring(colonIndex + 1).trim();
                            if (key && val) {
                              if (val.includes(',')) {
                                variants[key] = val.split(',').map(v => v.trim());
                              } else {
                                variants[key] = val;
                              }
                            }
                          }
                        }
                      });
                      // Format lại để hiển thị đẹp
                      const formatted = Object.entries(variants).map(([k, v]) => {
                        if (Array.isArray(v)) {
                          return `${k}: ${v.join(', ')}`;
                        }
                        return `${k}: ${v}`;
                      }).join('\n');
                      setRawInputs({ ...rawInputs, variants: formatted });
                      setProductForm({ ...productForm, variants });
                    }}
                    placeholder="size: 38,39,40,41,42&#10;color: white,black"
                    rows={3}
                  />
                </div>
              </div>

              {/* Warehouse Address */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Địa chỉ kho hàng</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Địa chỉ dòng 1 *</Label>
                    <Input
                      value={productForm.warehouseAddress.line1}
                      onChange={(e) => setProductForm({
                        ...productForm,
                        warehouseAddress: { ...productForm.warehouseAddress, line1: e.target.value }
                      })}
                      placeholder="Kho tổng Bình Tân"
                    />
                  </div>
                  <div>
                    <Label>Thành phố *</Label>
                    <Input
                      value={productForm.warehouseAddress.city}
                      onChange={(e) => setProductForm({
                        ...productForm,
                        warehouseAddress: { ...productForm.warehouseAddress, city: e.target.value }
                      })}
                      placeholder="Hồ Chí Minh"
                    />
                  </div>
                  <div>
                    <Label>Tỉnh/Thành phố</Label>
                    <Input
                      value={productForm.warehouseAddress.province}
                      onChange={(e) => setProductForm({
                        ...productForm,
                        warehouseAddress: { ...productForm.warehouseAddress, province: e.target.value }
                      })}
                      placeholder="Bình Tân"
                    />
                  </div>
                  <div>
                    <Label>Quốc gia</Label>
                    <Input
                      value={productForm.warehouseAddress.country}
                      onChange={(e) => setProductForm({
                        ...productForm,
                        warehouseAddress: { ...productForm.warehouseAddress, country: e.target.value }
                      })}
                      placeholder="Vietnam"
                    />
                  </div>
                  <div>
                    <Label>Mã bưu điện</Label>
                    <Input
                      value={productForm.warehouseAddress.postalCode}
                      onChange={(e) => setProductForm({
                        ...productForm,
                        warehouseAddress: { ...productForm.warehouseAddress, postalCode: e.target.value }
                      })}
                      placeholder="72000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddProduct} disabled={!productForm.name || !productForm.brand || !productForm.price || productForm.images.length === 0}>
              Thêm sản phẩm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-4">
              <div>
                <Label>Tên sản phẩm</Label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Giá bán</Label>
                  <Input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Giá khuyến mãi</Label>
                  <Input
                    type="number"
                    value={productForm.salePrice || ''}
                    onChange={(e) => setProductForm({ ...productForm, salePrice: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Số lượng trong kho</Label>
                  <Input
                    type="number"
                    value={productForm.stock || ''}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Danh mục (phân cách bằng dấu phẩy)</Label>
                  <Input
                    value={productForm.categoryIds.join(', ')}
                    onChange={(e) => {
                      const categories = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                      setProductForm({ ...productForm, categoryIds: categories });
                    }}
                  />
                </div>
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <Label>URL hình ảnh (mỗi URL một dòng)</Label>
                <Textarea
                  value={productForm.images.join('\n')}
                  onChange={(e) => {
                    const images = e.target.value.split('\n').map(img => img.trim()).filter(img => img);
                    setProductForm({ ...productForm, images });
                  }}
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditProductOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditProduct}>Lưu thay đổi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}