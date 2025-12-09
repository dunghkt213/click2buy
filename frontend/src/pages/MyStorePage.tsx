import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Package,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  Clock,
  Truck,
  CheckCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { StoreProduct, Order } from '../types';
import { formatPrice } from '../lib/utils';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MyStorePageProps {
  storeProducts: StoreProduct[];
  storeOrders: Order[];
  onAddProduct: (product: Omit<StoreProduct, 'id'>) => void;
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
  const [orderTab, setOrderTab] = useState<OrderTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    category: '',
    description: '',
    image: ''
  });

  const handleAddProduct = () => {
    onAddProduct({
      ...productForm,
      sold: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      rating: 0,
      reviews: 0
    });
    setIsAddProductOpen(false);
    setProductForm({
      name: '',
      price: 0,
      originalPrice: 0,
      stock: 0,
      category: '',
      description: '',
      image: ''
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
    setProductForm({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      stock: product.stock,
      category: product.category,
      description: product.description,
      image: product.image
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

  // Calculate sales data for pie chart
  const salesData = storeProducts.map(product => ({
    name: product.name,
    value: product.sold || 0,
    revenue: (product.sold || 0) * product.price,
    price: product.price
  })).filter(item => item.value > 0).sort((a, b) => b.value - a.value);

  const totalSold = salesData.reduce((sum, item) => sum + item.value, 0);
  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'];

  // Custom label for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    if (percent < 0.05) return null; // Hide labels for slices smaller than 5%

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cửa hàng của tôi</h1>
        <p className="text-muted-foreground">Quản lý sản phẩm và đơn hàng của bạn</p>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="products" className="gap-2">
            <Package className="w-4 h-4" />
            Sản phẩm ({storeProducts.length})
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <Truck className="w-4 h-4" />
            Đơn hàng ({storeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Doanh thu
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
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
          </div>

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
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-muted/30">
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
                              if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
                                onDeleteProduct(product.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          {/* Order Status Tabs */}
          <Tabs value={orderTab} onValueChange={(v) => setOrderTab(v as OrderTab)}>
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

            {/* Order Lists */}
            {['pending', 'shipping', 'completed'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <Card className="p-12">
                    <div className="text-center">
                      <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg mb-2">Chưa có đơn hàng</h3>
                      <p className="text-muted-foreground">
                        {tab === 'pending' && 'Chưa có đơn hàng chờ xử lý'}
                        {tab === 'shipping' && 'Chưa có đơn hàng đang giao'}
                        {tab === 'completed' && 'Chưa có đơn hàng hoàn thành'}
                      </p>
                    </div>
                  </Card>
                ) : (
                  filteredOrders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
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
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Tổng sản lượng bán ra</p>
                <Package className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{totalSold.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">sản phẩm</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">{formatPrice(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">VNĐ</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Sản phẩm bán chạy nhất</p>
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-xl font-bold line-clamp-1">{salesData[0]?.name || 'N/A'}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {salesData[0]?.value || 0} sản phẩm
              </p>
            </Card>
          </div>

          {/* Pie Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <Card className="lg:col-span-2">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Biểu đồ phân bổ sản phẩm bán ra</h3>
                {salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={salesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={140}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {salesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: any, props: any) => [
                          `${value} sản phẩm (${formatPrice(props.payload.revenue)})`,
                          props.payload.name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Chưa có dữ liệu bán hàng</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Product List */}
            <Card className="lg:col-span-1">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Chi tiết sản phẩm</h3>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {salesData.map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                      >
                        <div 
                          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2 mb-1">{item.name}</p>
                          <div className="space-y-0.5">
                            <p className="text-xs text-muted-foreground">
                              Số lượng: <span className="font-medium text-foreground">{item.value}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Giá bán: <span className="font-medium text-foreground">{formatPrice(item.price)}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Doanh thu: <span className="font-medium text-green-600">{formatPrice(item.revenue)}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Tỷ lệ: <span className="font-medium text-primary">
                                {((item.value / totalSold) * 100).toFixed(1)}%
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </Card>
          </div>

          {/* Additional Stats */}
          {salesData.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Thống kê chi tiết</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Giá trị trung bình/đơn</p>
                  <p className="text-xl font-bold">{formatPrice(totalRevenue / totalSold)}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Sản phẩm bán được</p>
                  <p className="text-xl font-bold">{salesData.length}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Doanh thu cao nhất</p>
                  <p className="text-xl font-bold">{formatPrice(Math.max(...salesData.map(s => s.revenue)))}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Doanh thu thấp nhất</p>
                  <p className="text-xl font-bold">{formatPrice(Math.min(...salesData.map(s => s.revenue)))}</p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm sản phẩm mới</DialogTitle>
            <DialogDescription>
              Điền thông tin sản phẩm để thêm vào cửa hàng của bạn
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-4">
              <div>
                <Label>Tên sản phẩm</Label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Nhập tên sản phẩm..."
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
                  <Label>Giá gốc (nếu có)</Label>
                  <Input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Số lượng trong kho</Label>
                  <Input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Danh mục</Label>
                  <Input
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    placeholder="Ví dụ: electronics"
                  />
                </div>
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Mô tả sản phẩm..."
                  rows={4}
                />
              </div>
              <div>
                <Label>URL hình ảnh</Label>
                <Input
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddProduct}>Thêm sản phẩm</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin sản phẩm của bạn
            </DialogDescription>
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
                  <Label>Giá gốc</Label>
                  <Input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Số lượng trong kho</Label>
                  <Input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Danh mục</Label>
                  <Input
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
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
                <Label>URL hình ảnh</Label>
                <Input
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
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