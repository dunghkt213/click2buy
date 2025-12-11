/**
 * MyStorePage - Trang quản lý cửa hàng
 * - Fix lỗi vỡ giao diện do text dài (dùng break-all, min-w-0)
 * - Giới hạn mô tả 400 ký tự
 * - Merge sản phẩm trùng lặp
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../providers/AppProvider';

// Import UI Components
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { sellerService } from '../../apis/seller-analytics/sellerAnalyticsApi';
import { RevenueDataItem, TopProductItem } from '../../types/dto/seller-analytics.dto';
// Icons
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
  DollarSign,
  RotateCcw
} from 'lucide-react';

// Types & Utils
import { StoreProduct, Order } from '../../types';
import { formatPrice } from '../../utils/utils';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- TYPES ---
interface ProductFilters {
  category: string;
  status: string;
  minPrice: string;
  maxPrice: string;
  stockStatus: string;
  sortBy: string;
}

type OrderTab = 'pending' | 'shipping' | 'completed';

// --- MAPPING (VIỆT HÓA) ---
const STATUS_MAP: Record<string, string> = {
  'all': 'Tất cả',
  'active': 'Đang bán',
  'inactive': 'Tạm ngưng',
  'out_of_stock': 'Hết hàng'
};

const STOCK_MAP: Record<string, string> = {
  'all': 'Tất cả',
  'in-stock': 'Còn hàng',
  'low-stock': 'Sắp hết',
  'out-of-stock': 'Hết hàng'
};

const SORT_MAP: Record<string, string> = {
  'name-asc': 'Tên (A-Z)',
  'name-desc': 'Tên (Z-A)',
  'price-asc': 'Giá tăng dần',
  'price-desc': 'Giá giảm dần',
  'stock-asc': 'Tồn kho tăng dần',
  'stock-desc': 'Tồn kho giảm dần',
  'sold-desc': 'Bán chạy nhất',
  'date-desc': 'Mới nhất',
  'date-asc': 'Cũ nhất'
};

export function MyStorePage() {
  const navigate = useNavigate();
  const app = useAppContext();

  // --- 1. LOGIC BẢO VỆ & REDIRECT ---
  useEffect(() => {
    if (!app.isLoggedIn) {
      navigate('/login');
      return;
    }
    if (app.user?.role !== 'seller') {
      if (!app.store.hasStore) {
        app.modals.openStoreRegistration();
        navigate('/feed');
      }
    }
  }, [app.isLoggedIn, app.user?.role, app.store.hasStore, navigate, app.modals]);

  useEffect(() => {
    if (app.isLoggedIn && app.user?.role === 'seller') {
      app.store.setIsMyStorePageOpen(true);
    }
  }, [app.isLoggedIn, app.user?.role, app.store]);

  // --- 2. XỬ LÝ DỮ LIỆU: MERGE SẢN PHẨM TRÙNG ---
  const rawStoreProducts: StoreProduct[] = app.store.storeProducts || [];

  // Logic gộp sản phẩm trùng nhau và cộng dồn số lượng
  const mergedStoreProducts = useMemo(() => {
    const map = new Map<string, StoreProduct>();

    rawStoreProducts.forEach((product) => {
      // Tạo key định danh duy nhất. Nếu Tên, Giá, Ảnh, Danh mục giống nhau => Coi là 1
      // Ta không gộp Description vào key để tránh việc sai lệch nhỏ tạo ra 2 dòng.
      // Tuy nhiên, nếu bạn muốn Description khác nhau thì tách ra, hãy thêm vào key.
      const key = JSON.stringify({
        name: product.name.trim().toLowerCase(),
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category,
        image: product.image
      });

      if (map.has(key)) {
        // Nếu đã tồn tại, cộng dồn Kho và Đã bán
        const existing = map.get(key)!;
        existing.stock += product.stock;
        existing.sold = (existing.sold || 0) + (product.sold || 0);
        // Có thể cộng dồn review nếu cần
      } else {
        // Nếu chưa có, tạo mới (Clone object để tránh tham chiếu)
        map.set(key, { ...product });
      }
    });

    return Array.from(map.values());
  }, [rawStoreProducts]);

  const storeOrders: Order[] = app.orders.orders.filter((o: Order) => o.status !== 'cancelled');

  // --- 3. STATE ---
  const [selectedTab, setSelectedTab] = useState('products');
  const [orderTab, setOrderTab] = useState<OrderTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueDataItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [timeRange, setTimeRange] = useState<'WEEK' | 'MONTH'>('WEEK');
  // Filter state
  const [filters, setFilters] = useState<ProductFilters>({
    category: 'all',
    status: 'all',
    minPrice: '',
    maxPrice: '',
    stockStatus: 'all',
    sortBy: 'name-asc'
  });

  const [productForm, setProductForm] = useState({
    name: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    category: '',
    description: '',
    image: ''
  });

  useEffect(() => {
    if (selectedTab === 'revenue') {
      const fetchData = async () => {
        // ... loading state ...
        try {
          const [revData, topProdData] = await Promise.all([
            sellerService.getRevenue(timeRange),
            sellerService.getTopProducts(10) // Lấy top 10 sản phẩm
          ]);
          setRevenueData(revData);
          setTopProducts(topProdData);
        } catch (error) {
          console.error(error);
        }
        // ... set loading false ...
      };
      fetchData();
    }
  }, [selectedTab, timeRange]);

  // 4. QUAN TRỌNG: Mapping dữ liệu Swagger -> Recharts
  // Swagger trả về: { productName, totalSold, totalRevenue }
  // Recharts cần:   { name, value, revenue }

  const chartData = useMemo(() => {
    return topProducts.map((item) => ({
      name: item.productName,
      value: Number(item.totalSold),       // Ép kiểu số cho chắc chắn
      revenue: Number(item.totalRevenue),
    }));
  }, [topProducts]);

  const apiTotalRevenue = useMemo(() => {
    return revenueData.reduce((sum, item) => sum + Number(item.totalRevenue || 0), 0);
  }, [revenueData]);

  // Cách 2: Tính tổng sản lượng bán ra (Nếu API revenue có field totalOrders thì dùng, không thì tạm dùng tổng top products)
  // Ở đây tôi dùng tổng từ revenueData (số đơn hàng) vì nó phản ánh đúng "Tổng quan" hơn là chỉ top 5 sp
  const apiTotalSold = useMemo(() => {
    return revenueData.reduce((sum, item) => sum + Number(item.totalOrders || 0), 0);
  }, [revenueData]);

  // Màu sắc biểu đồ (Giữ nguyên như mẫu)
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'];

  // Hàm render nhãn biểu đồ (Giữ nguyên như mẫu)
  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    if (percent < 0.05) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  // --- 4. HANDLERS ---
  const handleAddProduct = () => {
    app.store.handleAddProduct({
      ...productForm,
      sold: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      rating: 0,
      reviews: 0
    });
    setIsAddProductOpen(false);
    setProductForm({ name: '', price: 0, originalPrice: 0, stock: 0, category: '', description: '', image: '' });
  };

  const handleEditProduct = () => {
    if (selectedProduct) {
      app.store.handleUpdateProduct(selectedProduct.id, productForm);
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

  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    app.orders.setOrders((prev: Order[]) => prev.map((order: Order) =>
      order.id === orderId
        ? {
          ...order,
          status: status as any,
          updatedAt: new Date().toISOString(),
          timeline: [...order.timeline, { status: status as any, timestamp: new Date().toISOString(), description: `Đơn hàng đã chuyển sang trạng thái ${status}` }]
        }
        : order
    ));
  };

  // --- 5. FILTER LOGIC ---
  const categories = Array.from(new Set(mergedStoreProducts.map((p: StoreProduct) => p.category)));

  const resetFilters = () => {
    setFilters({ category: 'all', status: 'all', minPrice: '', maxPrice: '', stockStatus: 'all', sortBy: 'name-asc' });
    setSearchQuery('');
  };

  const filteredProducts = mergedStoreProducts
    .filter((product: StoreProduct) => {
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filters.category !== 'all' && product.category !== filters.category) return false;
      if (filters.status !== 'all' && product.status !== filters.status) return false;
      if (filters.minPrice && product.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && product.price > Number(filters.maxPrice)) return false;
      if (filters.stockStatus === 'in-stock' && product.stock === 0) return false;
      if (filters.stockStatus === 'low-stock' && (product.stock === 0 || product.stock >= 10)) return false;
      if (filters.stockStatus === 'out-of-stock' && product.stock > 0) return false;
      return true;
    })
    .sort((a: StoreProduct, b: StoreProduct) => {
      switch (filters.sortBy) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'stock-asc': return a.stock - b.stock;
        case 'stock-desc': return b.stock - a.stock;
        case 'sold-desc': return (b.sold || 0) - (a.sold || 0);
        case 'date-desc': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: return 0;
      }
    });

  const filteredOrders = storeOrders.filter((order: Order) => {
    if (orderTab === 'pending') return order.status === 'pending' || order.status === 'confirmed';
    if (orderTab === 'shipping') return order.status === 'shipping';
    if (orderTab === 'completed') return order.status === 'completed';
    return false;
  });

  const getOrderCount = (tab: OrderTab) => {
    if (tab === 'pending') return storeOrders.filter((o: Order) => o.status === 'pending' || o.status === 'confirmed').length;
    if (tab === 'shipping') return storeOrders.filter((o: Order) => o.status === 'shipping').length;
    if (tab === 'completed') return storeOrders.filter((o: Order) => o.status === 'completed').length;
    return 0;
  };

  const salesData = mergedStoreProducts.map((product: StoreProduct) => ({
    name: product.name,
    value: product.sold || 0,
    revenue: (product.sold || 0) * product.price,
    price: product.price
  })).filter(item => item.value > 0).sort((a, b) => b.value - a.value);

  const totalSold = salesData.reduce((sum, item) => sum + item.value, 0);
  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);

  if (!app.isLoggedIn || app.user?.role !== 'seller') return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cửa hàng của tôi</h1>
        <p className="text-muted-foreground">Quản lý sản phẩm và đơn hàng của bạn</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="products" className="gap-2"><Package className="w-4 h-4" /> Sản phẩm ({mergedStoreProducts.length})</TabsTrigger>
          <TabsTrigger value="orders" className="gap-2"><Truck className="w-4 h-4" /> Đơn hàng ({storeOrders.length})</TabsTrigger>
          <TabsTrigger value="revenue" className="gap-2"><TrendingUp className="w-4 h-4" /> Doanh thu</TabsTrigger>
        </TabsList>

        {/* --- PRODUCTS TAB --- */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tìm sản phẩm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}><Filter className="w-4 h-4 mr-2" /> Lọc</Button>
              <Button onClick={() => setIsAddProductOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Thêm sản phẩm</Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="mb-4">
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><Label>Danh mục</Label><Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}><SelectTrigger className="w-full"><SelectValue>{filters.category === 'all' ? 'Tất cả' : filters.category}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">Tất cả</SelectItem>{categories.map(category => (<SelectItem key={category} value={category}>{category}</SelectItem>))}</SelectContent></Select></div>
                  <div><Label>Trạng thái</Label><Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}><SelectTrigger className="w-full"><SelectValue>{STATUS_MAP[filters.status]}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">Tất cả</SelectItem><SelectItem value="active">Đang bán</SelectItem><SelectItem value="inactive">Tạm ngưng</SelectItem><SelectItem value="out_of_stock">Hết hàng</SelectItem></SelectContent></Select></div>
                  <div><Label>Giá từ</Label><Input type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} placeholder="Min" /></div>
                  <div><Label>Giá đến</Label><Input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} placeholder="Max" /></div>
                  <div><Label>Tình trạng kho</Label><Select value={filters.stockStatus} onValueChange={(value) => setFilters({ ...filters, stockStatus: value })}><SelectTrigger className="w-full"><SelectValue>{STOCK_MAP[filters.stockStatus]}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">Tất cả</SelectItem><SelectItem value="in-stock">Còn hàng</SelectItem><SelectItem value="low-stock">Sắp hết</SelectItem><SelectItem value="out-of-stock">Hết hàng</SelectItem></SelectContent></Select></div>
                  <div><Label>Sắp xếp theo</Label><Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}><SelectTrigger className="w-full"><SelectValue>{SORT_MAP[filters.sortBy]}</SelectValue></SelectTrigger><SelectContent><SelectItem value="name-asc">Tên (A-Z)</SelectItem><SelectItem value="name-desc">Tên (Z-A)</SelectItem><SelectItem value="price-asc">Giá tăng dần</SelectItem><SelectItem value="price-desc">Giá giảm dần</SelectItem><SelectItem value="stock-asc">Tồn kho tăng dần</SelectItem><SelectItem value="stock-desc">Tồn kho giảm dần</SelectItem><SelectItem value="date-desc">Mới nhất</SelectItem><SelectItem value="date-asc">Cũ nhất</SelectItem></SelectContent></Select></div>
                </div>
                <div className="flex justify-end mt-4"><Button variant="outline" size="sm" onClick={resetFilters}><RotateCcw className="w-4 h-4 mr-2" /> Đặt lại</Button></div>
              </div>
            </Card>
          )}

          {/* Product Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 w-[40%] min-w-[200px]">Sản phẩm</th>
                    <th className="p-4 w-[15%]">Giá</th>
                    <th className="p-4 w-[10%]">Kho</th>
                    <th className="p-4 w-[10%]">Đã bán</th>
                    <th className="p-4 w-[15%]">Trạng thái</th>
                    <th className="p-4 w-[10%]">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product: StoreProduct) => (
                    <tr key={product.id} className="border-b hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          {/* FIX: min-w-0 để flex child co lại được, break-words để xuống dòng */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-2 break-words whitespace-normal" title={product.name}>
                              {product.name}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{formatPrice(product.price)}</p>
                        {product.originalPrice && <p className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>}
                      </td>
                      <td className="p-4"><p className={product.stock < 10 ? 'text-red-500' : ''}>{product.stock}</p></td>
                      <td className="p-4">{product.sold}</td>
                      <td className="p-4">
                        <Badge variant={product.status === 'active' ? 'default' : product.status === 'inactive' ? 'secondary' : 'destructive'}>
                          {STATUS_MAP[product.status] || product.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => { if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) app.store.handleDeleteProduct(product.id); }}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* --- ORDERS TAB --- */}
        <TabsContent value="orders" className="space-y-4">
          <Tabs value={orderTab} onValueChange={(v) => setOrderTab(v as OrderTab)}>
            <TabsList>
              <TabsTrigger value="pending" className="gap-2"><Clock className="w-4 h-4" /> Chờ xử lý {getOrderCount('pending') > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{getOrderCount('pending')}</Badge>}</TabsTrigger>
              <TabsTrigger value="shipping" className="gap-2"><Truck className="w-4 h-4" /> Đang giao {getOrderCount('shipping') > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{getOrderCount('shipping')}</Badge>}</TabsTrigger>
              <TabsTrigger value="completed" className="gap-2"><CheckCircle className="w-4 h-4" /> Hoàn thành {getOrderCount('completed') > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{getOrderCount('completed')}</Badge>}</TabsTrigger>
            </TabsList>

            {['pending', 'shipping', 'completed'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <Card className="p-12"><div className="text-center"><Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" /><h3 className="text-lg mb-2">Chưa có đơn hàng</h3></div></Card>
                ) : (
                  filteredOrders.map((order: Order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <div className="p-4 bg-muted/30 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
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
                          {order.items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0"><ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium line-clamp-1 break-words">{item.name}</p>
                                {item.variant && <p className="text-sm text-muted-foreground">{item.variant}</p>}
                              </div>
                              <div className="text-right"><p className="text-sm text-muted-foreground">x{item.quantity}</p><p className="font-medium">{formatPrice(item.price)}</p></div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between mb-3"><div><p className="text-sm text-muted-foreground">Khách hàng: {order.shippingAddress.name}</p></div><div className="text-right"><p className="text-sm text-muted-foreground">Tổng tiền:</p><p className="text-xl font-bold text-primary">{formatPrice(order.finalPrice)}</p></div></div>
                          {order.status === 'pending' && (<div className="flex gap-2"><Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')} className="flex-1">Xác nhận đơn</Button><Button variant="outline" size="sm" onClick={() => { if (confirm('Hủy đơn?')) handleUpdateOrderStatus(order.id, 'cancelled'); }}>Hủy đơn</Button></div>)}
                          {order.status === 'confirmed' && (<Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, 'shipping')} className="w-full">Bắt đầu giao hàng</Button>)}
                          {order.status === 'shipping' && (<Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, 'completed')} className="w-full">Hoàn thành đơn hàng</Button>)}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* --- REVENUE TAB --- */}
        <TabsContent value="revenue" className="space-y-6">

          {/* Thêm nút chọn thời gian nếu chưa có */}
          <div className="flex justify-end gap-2 mb-4">
            <Button
              variant={timeRange === 'WEEK' ? 'default' : 'outline'}
              onClick={() => setTimeRange('WEEK')} size="sm"
            >
              Tuần này
            </Button>
            <Button
              variant={timeRange === 'MONTH' ? 'default' : 'outline'}
              onClick={() => setTimeRange('MONTH')} size="sm"
            >
              Tháng này
            </Button>
          </div>

          {/* Các thẻ Card thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
                <Package className="w-5 h-5 text-primary" />
              </div>
              {/* 👇 Dùng biến apiTotalSold */}
              <p className="text-3xl font-bold">{apiTotalSold.toLocaleString()}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              {/* 👇 Dùng biến apiTotalRevenue */}
              <p className="text-3xl font-bold text-green-600">{formatPrice(apiTotalRevenue)}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Bán chạy nhất</p>
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              {/* 👇 Dùng topProducts[0] */}
              <p className="text-xl font-bold line-clamp-1">
                {topProducts.length > 0 ? topProducts[0].productName : 'Chưa có dữ liệu'}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Biểu đồ tròn */}
            <Card className="lg:col-span-2">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Top Sản Phẩm Bán Chạy</h3>
                {/* 👇 Dùng chartData thay vì salesData */}
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={chartData} // ✅ Biến mới
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={140}
                        fill="#8884d8"
                        dataKey="value" // ✅ Key này map với chartData ở trên
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any, name: any, props: any) => [
                        `${value} đã bán - ${formatPrice(props.payload.revenue)}`, // Custom tooltip
                        props.payload.name
                      ]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    Chưa có dữ liệu bán hàng trong thời gian này
                  </div>
                )}
              </div>
            </Card>

            {/* Danh sách chi tiết bên phải */}
            <Card className="lg:col-span-1">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Chi tiết</h3>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {/* 👇 Dùng chartData để lặp */}
                    {chartData.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div
                          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2 break-all">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            SL: {item.value} - DT: {formatPrice(item.revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* --- ADD PRODUCT DIALOG --- */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Thêm sản phẩm mới</DialogTitle>
            <DialogDescription>Điền thông tin sản phẩm để thêm vào cửa hàng</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 p-1">
              <div><Label>Tên sản phẩm</Label><Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Giá bán</Label><Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })} /></div><div><Label>Giá gốc</Label><Input type="number" value={productForm.originalPrice} onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })} /></div></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Kho</Label><Input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })} /></div><div><Label>Danh mục</Label><Input value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} /></div></div>

              {/* FIX: Thêm giới hạn 400 ký tự và break-all cho text dài */}
              <div>
                <Label>Mô tả</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={4}
                  maxLength={400}
                  placeholder="Mô tả sản phẩm (tối đa 400 ký tự)..."
                  className="break-all whitespace-pre-wrap" // Giúp xuống dòng kể cả từ dài
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {productForm.description.length}/400
                </p>
              </div>

              <div><Label>Ảnh URL</Label><Input value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} /></div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4 pt-2 border-t"><Button variant="outline" onClick={() => setIsAddProductOpen(false)}>Hủy</Button><Button onClick={handleAddProduct}>Thêm</Button></div>
        </DialogContent>
      </Dialog>

      {/* --- EDIT PRODUCT DIALOG --- */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Sửa sản phẩm</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 p-1">
              <div><Label>Tên</Label><Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Giá</Label><Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })} /></div><div><Label>Giá gốc</Label><Input type="number" value={productForm.originalPrice} onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })} /></div></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Kho</Label><Input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })} /></div><div><Label>Danh mục</Label><Input value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} /></div></div>

              {/* FIX: Thêm giới hạn 400 ký tự và break-all */}
              <div>
                <Label>Mô tả</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={4}
                  maxLength={400}
                  className="break-all whitespace-pre-wrap"
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {productForm.description.length}/400
                </p>
              </div>

              <div><Label>Ảnh URL</Label><Input value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} /></div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4 pt-2 border-t"><Button variant="outline" onClick={() => setIsEditProductOpen(false)}>Hủy</Button><Button onClick={handleEditProduct}>Lưu</Button></div>
        </DialogContent>
      </Dialog>

    </div>
  );
}