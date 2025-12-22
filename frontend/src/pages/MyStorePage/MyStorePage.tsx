/**
 * MyStorePage - Trang quản lý cửa hàng
 * - Fix lỗi vỡ giao diện do text dài (dùng break-all, min-w-0)
 * - Giới hạn mô tả 400 ký tự
 * - Merge sản phẩm trùng lặp
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../providers/AppProvider';

// Import UI Components
import { sellerService } from '../../apis/seller-analytics/sellerAnalyticsApi';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Textarea } from '../../components/ui/textarea';
import { RevenueDataItem, TopProductItem } from '../../types/dto/seller-analytics.dto';
// Icons
import {
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Filter,
  List,
  Loader2,
  Package,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  TrendingUp,
  Truck,
  XCircle
} from 'lucide-react';

// Types & Utils
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Area, AreaChart } from 'recharts';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { OrderList } from '../../components/order/OrderList';
import { Order, StoreProduct } from '../../types';
import { formatPrice } from '../../utils/utils';

// --- TYPES ---
interface ProductFilters {
  productName: string;
  minPrice: string;
  maxPrice: string;
  status: string; // 'all' | 'in_stock' | 'out_of_stock' | 'inactive'
}

type OrderTab = 'all' | 'pending' | 'cancel_request' | 'shipping' | 'completed';

// Order tab configuration
const ORDER_TABS: Array<{
  value: OrderTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  backendStatus?: string;
  frontendStatus?: Order['status'];
}> = [
  {
    value: 'all',
    label: 'Tất cả',
    icon: List,
  },
  {
    value: 'pending',
    label: 'Chờ xử lý',
    icon: Clock,
    backendStatus: 'PENDING_ACCEPT',
    frontendStatus: 'confirmed', // PENDING_ACCEPT maps to 'confirmed'
  },
  {
    value: 'cancel_request',
    label: 'Yêu cầu hủy',
    icon: XCircle,
    backendStatus: 'REQUESTED_CANCEL',
    frontendStatus: 'cancel_request',
  },
  {
    value: 'shipping',
    label: 'Đang giao',
    icon: Truck,
    backendStatus: 'CONFIRMED',
    frontendStatus: 'shipping',
  },
  {
    value: 'completed',
    label: 'Hoàn thành',
    icon: CheckCircle,
    backendStatus: 'DELIVERED',
    frontendStatus: 'completed',
  },
];

// --- MAPPING (VIỆT HÓA) ---
const STATUS_MAP: Record<string, string> = {
  'all': 'Tất cả',
  'in_stock': 'Còn hàng',
  'out_of_stock': 'Hết hàng',
  'inactive': 'Ngừng kinh doanh'
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

  // Không scroll về đầu trang nữa, để useScrollRestoration xử lý
  // useEffect(() => {
  //   window.scrollTo({ top: 0, behavior: 'auto' });
  //   // Force scroll bằng cách set scrollTop trực tiếp
  //   document.documentElement.scrollTop = 0;
  //   document.body.scrollTop = 0;
  // }, []);

  useEffect(() => {
    if (app.isLoggedIn && app.user?.role === 'seller') {
      app.store.setIsMyStorePageOpen(true);
    }
    
    // Cleanup: set false khi component unmount
    return () => {
      app.store.setIsMyStorePageOpen(false);
    };
  }, [app.isLoggedIn, app.user?.role]); // Loại bỏ app.store khỏi dependencies

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

  // --- 3. STATE ---
  const [selectedTab, setSelectedTab] = useState('products');
  const [orderTab, setOrderTab] = useState<OrderTab>('all');
  const [allOrders, setAllOrders] = useState<Order[]>([]); // Store all orders for both counting and filtering
  const isLoadingOrdersRef = useRef(false); // Prevent duplicate API calls

  // Load all orders when entering orders tab (only once)
  useEffect(() => {
    // Chỉ load khi:
    // 1. User đã đăng nhập và là seller
    // 2. Đang ở tab orders
    // 3. Chưa đang load (tránh duplicate calls)
    if (
      app.isLoggedIn && 
      app.user?.role === 'seller' && 
      selectedTab === 'orders' && 
      !isLoadingOrdersRef.current
    ) {
      isLoadingOrdersRef.current = true;
      const loadAllOrders = async () => {
        try {
          const { orderService } = await import('../../apis/order');
          const { mapOrderResponse } = await import('../../apis/order/order.mapper');
          const allOrdersData = await orderService.getAllForSeller(); // Load all orders without status filter
          const mappedOrders = allOrdersData.map(mapOrderResponse);
          setAllOrders(mappedOrders);
          // Also update app.orders for compatibility
          app.orders.setOrders(mappedOrders);
        } catch (error) {
          console.error('Failed to load orders:', error);
        } finally {
          isLoadingOrdersRef.current = false;
        }
      };
      loadAllOrders();
    }
  }, [app.isLoggedIn, app.user?.role, selectedTab]); // Loại bỏ app.orders khỏi dependency array

  // Filter orders based on selected tab (frontend filtering for better UX)
  const filteredOrders: Order[] = useMemo(() => {
    if (orderTab === 'all') {
      return allOrders.filter((o: Order) => o.status !== 'cancelled');
    }
    
    const tabConfig = ORDER_TABS.find(tab => tab.value === orderTab);
    if (!tabConfig?.frontendStatus) {
      return [];
    }
    
    return allOrders.filter((o: Order) => o.status === tabConfig.frontendStatus);
  }, [allOrders, orderTab]);

  // Get order count for a specific tab
  const getOrderCount = (tab: OrderTab): number => {
    if (tab === 'all') {
      return allOrders.filter((o: Order) => o.status !== 'cancelled').length;
    }
    
    const tabConfig = ORDER_TABS.find(t => t.value === tab);
    if (!tabConfig?.frontendStatus) {
      return 0;
    }
    
    return allOrders.filter((o: Order) => o.status === tabConfig.frontendStatus).length;
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueDataItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [timeRange, setTimeRange] = useState<'WEEK' | 'MONTH'>('WEEK');
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);
  // Filter state
  const [filters, setFilters] = useState<ProductFilters>({
    productName: '',
    minPrice: '',
    maxPrice: '',
    status: 'all'
  });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    salePrice: 0,
    stock: 0,
    brand: '',
    condition: 'new' as 'new' | 'used',
    category: '',
    warehouseAddress: ''
  });

  // Raw input strings for images (for user input)
  const [rawInputs, setRawInputs] = useState({
    images: ''
  });

  useEffect(() => {
    if (selectedTab === 'revenue') {
      const fetchData = async () => {
        setIsLoadingRevenue(true);
        setRevenueError(null);
        try {
          const [revData, topProdData] = await Promise.all([
            // ✅ Sẽ gọi lại getRevenue khi timeRange thay đổi
            sellerService.getRevenue(timeRange),
            // ⚠️ API getTopProducts không nhận timeRange. Ta vẫn gọi lại.
            sellerService.getTopProducts(10) // Lấy top 10 sản phẩm
          ]);
          setRevenueData(revData || []);
          setTopProducts(topProdData || []);
        } catch (error: any) {
          console.error('Error fetching revenue data:', error);
          setRevenueError(error.message || 'Không thể tải dữ liệu doanh thu');
          setRevenueData([]);
          setTopProducts([]);
        } finally {
          setIsLoadingRevenue(false);
        }
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

// Format revenue data for Line Chart - Doanh thu theo thời gian
const lineChartData = useMemo(() => {
  return revenueData.map((item) => ({
    date: new Date(item.date).toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit' 
    }),
    fullDate: item.date,
    revenue: Number(item.totalRevenue || 0),
    orders: Number(item.totalOrders || 0),
  }));
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
  // Parse images from raw input (mỗi URL một dòng)
  const images = rawInputs.images.split('\n').map(url => url.trim()).filter(url => url.length > 0);

  const productData = {
    name: productForm.name,
    description: productForm.description,
    price: productForm.price,
    salePrice: productForm.salePrice || 0,
    stock: productForm.stock,
    brand: productForm.brand,
    condition: productForm.condition,
    category: productForm.category,
    images: images,
    warehouseAddress: productForm.warehouseAddress,
    isActive: true
  };

  app.store.handleAddProduct(productData);
  
  // Reset form
  setIsAddProductOpen(false);
  setProductForm({
    name: '',
    description: '',
    price: 0,
    salePrice: 0,
    stock: 0,
    brand: '',
    condition: 'new',
    category: '',
    warehouseAddress: ''
  });
  setRawInputs({
    images: ''
  });
};

const handleEditProduct = () => {
  if (selectedProduct) {
    // Parse images from raw input (mỗi URL một dòng)
    const images = rawInputs.images.split('\n').map(url => url.trim()).filter(url => url.length > 0);

    const productData = {
      name: productForm.name,
      description: productForm.description,
      price: productForm.price,
      salePrice: productForm.salePrice || 0,
      stock: productForm.stock,
      brand: productForm.brand,
      condition: productForm.condition,
      category: productForm.category,
      images: images,
      warehouseAddress: productForm.warehouseAddress
    };

    app.store.handleUpdateProduct(selectedProduct.id, productData);
    setIsEditProductOpen(false);
    setSelectedProduct(null);
  }
};

const openEditDialog = (product: StoreProduct) => {
  setSelectedProduct(product);
  
  // Map StoreProduct to productForm format
  const images = product.images || (product.image ? [product.image] : []);
  
  setProductForm({
    name: product.name,
    description: product.description || '',
    price: product.price,
    salePrice: product.originalPrice || product.price,
    stock: product.stock || 0,
    brand: (product as any).brand || '',
    condition: 'new' as 'new' | 'used', // Default to 'new' if not available
    category: product.category || '',
    warehouseAddress: '' // Default empty if not available
  });
  
  // Set raw inputs for display
  setRawInputs({
    images: images.join('\n')
  });
  
  setIsEditProductOpen(true);
};

const handleUpdateOrderStatus = async (orderId: string, action: string) => {
  try {
    const { orderService } = await import('../../apis/order');
    const { mapOrderResponse } = await import('../../apis/order/order.mapper');
    const { toast } = await import('sonner');

    let updatedOrder;
    
    if (action === 'confirm') {
      // Xác nhận đơn hàng
      const backendOrder = await orderService.confirmOrder(orderId);
      updatedOrder = mapOrderResponse(backendOrder);
      toast.success('Đã xác nhận đơn hàng');
    } else if (action === 'reject') {
      // Từ chối đơn hàng
      const backendOrder = await orderService.rejectOrder(orderId);
      updatedOrder = mapOrderResponse(backendOrder);
      toast.success('Đã từ chối đơn hàng');
    } else if (action === 'accept_cancel') {
      // Chấp nhận yêu cầu hủy đơn hàng
      const backendOrder = await orderService.acceptCancelRequest(orderId);
      updatedOrder = mapOrderResponse(backendOrder);
      toast.success('Đã chấp nhận yêu cầu hủy đơn hàng');
    } else if (action === 'reject_cancel') {
      // Từ chối yêu cầu hủy đơn hàng
      const backendOrder = await orderService.rejectCancelRequest(orderId);
      updatedOrder = mapOrderResponse(backendOrder);
      toast.success('Đã từ chối yêu cầu hủy đơn hàng');
    } else {
      // Các action khác (shipping, completed, cancelled)
      // Giữ nguyên logic cũ nếu cần
      app.orders.setOrders((prev: Order[]) => prev.map((order: Order) =>
        order.id === orderId
          ? {
              ...order,
              status: action as any,
              updatedAt: new Date().toISOString(),
              timeline: [...order.timeline, { status: action as any, timestamp: new Date().toISOString(), description: `Đơn hàng đã chuyển sang trạng thái ${action}` }]
            }
          : order
      ));
      return;
    }

    // Cập nhật allOrders với order mới
    setAllOrders((prev: Order[]) => prev.map((order: Order) =>
      order.id === orderId ? updatedOrder : order
    ));

    // Cập nhật app.orders để tương thích
    app.orders.setOrders((prev: Order[]) => prev.map((order: Order) =>
      order.id === orderId ? updatedOrder : order
    ));
  } catch (error: any) {
    console.error('Failed to update order status:', error);
    const { toast } = await import('sonner');
    toast.error(error.message || 'Không thể cập nhật trạng thái đơn hàng');
  }
};

// --- 5. FILTER LOGIC ---
const categories = Array.from(new Set(mergedStoreProducts.map((p: StoreProduct) => p.category)));

const resetFilters = () => {
  setFilters({ productName: '', minPrice: '', maxPrice: '', status: 'all' });
  setSearchQuery('');
};

const filteredProducts = mergedStoreProducts
  .filter((product: StoreProduct) => {
    // Lọc theo searchQuery (nếu có)
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // Lọc theo tên sản phẩm trong filter (không phân biệt hoa thường)
    if (filters.productName) {
      const productNameLower = product.name.toLowerCase();
      const filterNameLower = filters.productName.toLowerCase();
      if (!productNameLower.includes(filterNameLower)) return false;
    }

    // Lọc theo giá từ
    if (filters.minPrice && product.price < Number(filters.minPrice)) return false;

    // Lọc theo giá đến
    if (filters.maxPrice && product.price > Number(filters.maxPrice)) return false;

    // Lọc theo trạng thái
    if (filters.status !== 'all') {
      if (filters.status === 'in_stock') {
        // Còn hàng: stock > 0 và status !== 'inactive'
        if (product.stock <= 0 || product.status === 'inactive') return false;
      } else if (filters.status === 'out_of_stock') {
        // Hết hàng: stock === 0
        if (product.stock !== 0) return false;
      } else if (filters.status === 'inactive') {
        // Ngừng kinh doanh: status === 'inactive'
        if (product.status !== 'inactive') return false;
      }
    }

    return true;
  });


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
  <div className="w-full min-h-screen pt-16 overflow-visible">
    <div className="container mx-auto px-4 py-8">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
      <TabsList className="mb-6">
        <TabsTrigger 
          value="products" 
          className="gap-2 transition-all duration-200 hover:scale-105"
        >
          <motion.div
            animate={selectedTab === 'products' ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <Package className="w-4 h-4" /> 
            Sản phẩm ({mergedStoreProducts.length})
          </motion.div>
        </TabsTrigger>
        <TabsTrigger 
          value="orders" 
          className="gap-2 transition-all duration-200 hover:scale-105"
        >
          <motion.div
            animate={selectedTab === 'orders' ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <Truck className="w-4 h-4" /> 
            Đơn hàng ({allOrders.filter((o: Order) => o.status !== 'cancelled').length})
          </motion.div>
        </TabsTrigger>
        <TabsTrigger 
          value="revenue" 
          className="gap-2 transition-all duration-200 hover:scale-105"
        >
          <motion.div
            animate={selectedTab === 'revenue' ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" /> 
            Doanh thu
          </motion.div>
        </TabsTrigger>
      </TabsList>

      {/* --- PRODUCTS TAB --- */}
      <TabsContent value="products" className="space-y-4">
        <AnimatePresence mode="wait">
          {selectedTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm sản phẩm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}><Filter className="w-4 h-4 mr-2" /> Lọc</Button>
            <Button onClick={() => navigate('/my-store/add-product')} className="gap-2"><Plus className="w-4 h-4" /> Thêm sản phẩm</Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="mb-4">
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Tên sản phẩm</Label>
                  <Input 
                    type="text" 
                    value={filters.productName} 
                    onChange={(e) => setFilters({ ...filters, productName: e.target.value })} 
                    placeholder="Nhập tên sản phẩm..." 
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Giá từ</Label>
                  <Input 
                    type="number" 
                    value={filters.minPrice} 
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} 
                    placeholder="Giá tối thiểu" 
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Giá đến</Label>
                  <Input 
                    type="number" 
                    value={filters.maxPrice} 
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} 
                    placeholder="Giá tối đa" 
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue>{STATUS_MAP[filters.status]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="in_stock">Còn hàng</SelectItem>
                      <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                      <SelectItem value="inactive">Ngừng kinh doanh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <RotateCcw className="w-4 h-4 mr-2" /> 
                  Đặt lại
                </Button>
              </div>
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
                    <td className="p-4">
                      <div className="flex flex-col">
                        <p className={`font-medium ${product.stock < 10 ? 'text-red-500' : 'text-foreground'}`}>
                          {typeof product.stock === 'number' ? product.stock : 0}
                        </p>
                        {product.stock < 10 && product.stock > 0 && (
                          <span className="text-xs text-muted-foreground">Sắp hết</span>
                        )}
                        {product.stock === 0 && (
                          <span className="text-xs text-red-500">Hết hàng</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">{product.sold}</td>
                    <td className="p-4">
                      <Badge variant={product.status === 'active' ? 'default' : product.status === 'inactive' ? 'secondary' : 'destructive'}>
                        {STATUS_MAP[product.status] || product.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/my-store/edit-product/${product.id}`)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) app.store.handleDeleteProduct(product.id); }}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </TabsContent>

      {/* --- ORDERS TAB --- */}
      <TabsContent value="orders" className="space-y-4">
        <AnimatePresence mode="wait">
          {selectedTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <Tabs value={orderTab} onValueChange={(v) => setOrderTab(v as OrderTab)}>
                <TabsList>
                  {ORDER_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const count = getOrderCount(tab.value);
                    return (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="gap-2 transition-all duration-200 hover:scale-105"
                      >
                        <motion.div
                          animate={orderTab === tab.value ? { scale: 1.1 } : { scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-2"
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                          {count > 0 && (
                            <Badge className="ml-1 h-5 px-1.5 text-xs bg-red-500 text-white border-0">
                              {count}
                            </Badge>
                          )}
                        </motion.div>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {/* Single TabsContent for all tabs - uses dynamic filtering */}
                {ORDER_TABS.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value} className="space-y-4">
                    <OrderList
                      orders={filteredOrders}
                      onUpdateStatus={handleUpdateOrderStatus}
                      showActionButtons={tab.value !== 'all'} // Hide action buttons in "Tất cả" tab
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </TabsContent>

      {/* --- REVENUE TAB --- */}
      <TabsContent value="revenue" className="space-y-6">
        <AnimatePresence mode="wait">
          {selectedTab === 'revenue' && (
            <motion.div
              key="revenue"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
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

        {/* Loading State */}
        {isLoadingRevenue && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {revenueError && !isLoadingRevenue && (
          <Card className="p-6 border-destructive">
            <div className="text-center">
              <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-destructive font-medium">{revenueError}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setRevenueError(null);
                  if (selectedTab === 'revenue') {
                    const fetchData = async () => {
                      setIsLoadingRevenue(true);
                      try {
                        const [revData, topProdData] = await Promise.all([
                          sellerService.getRevenue(timeRange),
                          sellerService.getTopProducts(10),
                        ]);
                        setRevenueData(revData || []);
                        setTopProducts(topProdData || []);
                      } catch (error: any) {
                        setRevenueError(error.message || 'Không thể tải dữ liệu doanh thu');
                      } finally {
                        setIsLoadingRevenue(false);
                      }
                    };
                    fetchData();
                  }
                }}
              >
                Thử lại
              </Button>
            </div>
          </Card>
        )}

        {/* Content khi không có lỗi và không đang load */}
        {!isLoadingRevenue && !revenueError && (
          <>
            {/* Các thẻ Card thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">{apiTotalSold.toLocaleString()}</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600">{formatPrice(apiTotalRevenue)}</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Bán chạy nhất</p>
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-xl font-bold line-clamp-1">
                  {topProducts.length > 0 ? topProducts[0].productName : 'Chưa có dữ liệu'}
                </p>
              </Card>
            </div>

            {/* Biểu đồ doanh thu theo thời gian */}
            {lineChartData.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Doanh Thu Theo Thời Gian</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip 
                        formatter={(value: any) => formatPrice(value)}
                        labelFormatter={(label) => `Ngày: ${label}`}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.6}
                        name="Doanh thu"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

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
          </>
        )}
            </motion.div>
          )}
        </AnimatePresence>
      </TabsContent>
    </Tabs>

    {/* --- ADD PRODUCT DIALOG --- */}
    <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm mới</DialogTitle>
          <DialogDescription>Điền thông tin sản phẩm để thêm vào cửa hàng</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 min-h-0 pr-4">
          <div className="space-y-4 p-1">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Thông tin cơ bản</Label>
              <div>
                <Label>Tên sản phẩm *</Label>
                <Input 
                  value={productForm.name} 
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} 
                  placeholder="iPhone 15 Pro Max" 
                />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={4}
                  placeholder="Điện thoại cao cấp 2025"
                  className="break-all whitespace-pre-wrap"
                />
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Giá cả & Kho hàng</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Giá gốc (VND) *</Label>
                  <Input 
                    type="number" 
                    value={productForm.price || ''} 
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })} 
                    placeholder="29990000" 
                  />
                </div>
                <div>
                  <Label>Giá khuyến mãi (VND)</Label>
                  <Input 
                    type="number" 
                    value={productForm.salePrice || ''} 
                    onChange={(e) => setProductForm({ ...productForm, salePrice: Number(e.target.value) })} 
                    placeholder="27990000" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Số lượng trong kho *</Label>
                  <Input 
                    type="number" 
                    value={productForm.stock || ''} 
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })} 
                    placeholder="10" 
                  />
                </div>
                <div>
                  <Label>Thương hiệu *</Label>
                  <Input 
                    value={productForm.brand} 
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} 
                    placeholder="Apple" 
                  />
                </div>
              </div>
              <div>
                <Label>Tình trạng *</Label>
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

            <Separator />

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Loại mặt hàng</Label>
              <div>
                <Label>Loại mặt hàng *</Label>
                <Input 
                  value={productForm.category} 
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} 
                  placeholder="Điện thoại, Máy tính, Quần áo..." 
                />
                <p className="text-xs text-muted-foreground mt-1">Ví dụ: Điện thoại, Máy tính, Quần áo</p>
              </div>
            </div>

            <Separator />

            {/* Images */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Ảnh</Label>
              <div>
                <Label>URL hình ảnh (mỗi URL một dòng) *</Label>
                <Textarea
                  value={rawInputs.images}
                  onChange={(e) => setRawInputs({ ...rawInputs, images: e.target.value })}
                  rows={4}
                  placeholder="https://img.com/a.jpg&#10;https://img.com/b.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">Nhập mỗi URL trên một dòng</p>
              </div>
            </div>

            <Separator />

            {/* Warehouse Address */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Địa chỉ kho hàng</Label>
              <div>
                <Label>Địa chỉ kho hàng *</Label>
                <Input 
                  value={productForm.warehouseAddress} 
                  onChange={(e) => setProductForm({ ...productForm, warehouseAddress: e.target.value })} 
                  placeholder="123 Nguyễn Trãi, Thanh Xuân, Hà Nội" 
                />
                <p className="text-xs text-muted-foreground mt-1">Nhập địa chỉ đầy đủ của kho hàng</p>
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 mt-4 pt-2 border-t"><Button variant="outline" onClick={() => setIsAddProductOpen(false)}>Hủy</Button><Button onClick={handleAddProduct}>Thêm</Button></div>
      </DialogContent>
    </Dialog>

    {/* --- EDIT PRODUCT DIALOG --- */}
    <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Sửa sản phẩm</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 min-h-0 pr-4">
          <div className="space-y-4 p-1">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Thông tin cơ bản</Label>
              <div>
                <Label>Tên sản phẩm *</Label>
                <Input 
                  value={productForm.name} 
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} 
                />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={4}
                  className="break-all whitespace-pre-wrap"
                />
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Giá cả & Kho hàng</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Giá gốc (VND) *</Label>
                  <Input 
                    type="number" 
                    value={productForm.price || ''} 
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })} 
                  />
                </div>
                <div>
                  <Label>Giá khuyến mãi (VND)</Label>
                  <Input 
                    type="number" 
                    value={productForm.salePrice || ''} 
                    onChange={(e) => setProductForm({ ...productForm, salePrice: Number(e.target.value) })} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Số lượng trong kho *</Label>
                  <Input 
                    type="number" 
                    value={productForm.stock || ''} 
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })} 
                  />
                </div>
                <div>
                  <Label>Thương hiệu *</Label>
                  <Input 
                    value={productForm.brand} 
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} 
                  />
                </div>
              </div>
              <div>
                <Label>Tình trạng *</Label>
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

            <Separator />

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Loại mặt hàng</Label>
              <div>
                <Label>Loại mặt hàng *</Label>
                <Input 
                  value={productForm.category} 
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} 
                  placeholder="Điện thoại, Máy tính, Quần áo..." 
                />
                <p className="text-xs text-muted-foreground mt-1">Ví dụ: Điện thoại, Máy tính, Quần áo</p>
              </div>
            </div>

            <Separator />

            {/* Images */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Ảnh</Label>
              <div>
                <Label>URL hình ảnh (mỗi URL một dòng) *</Label>
                <Textarea
                  value={rawInputs.images}
                  onChange={(e) => setRawInputs({ ...rawInputs, images: e.target.value })}
                  rows={4}
                  placeholder="https://img.com/a.jpg&#10;https://img.com/b.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">Nhập mỗi URL trên một dòng</p>
              </div>
            </div>

            <Separator />

            {/* Warehouse Address */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Địa chỉ kho hàng</Label>
              <div>
                <Label>Địa chỉ kho hàng *</Label>
                <Input 
                  value={productForm.warehouseAddress} 
                  onChange={(e) => setProductForm({ ...productForm, warehouseAddress: e.target.value })} 
                  placeholder="123 Nguyễn Trãi, Thanh Xuân, Hà Nội" 
                />
                <p className="text-xs text-muted-foreground mt-1">Nhập địa chỉ đầy đủ của kho hàng</p>
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 mt-4 pt-2 border-t"><Button variant="outline" onClick={() => setIsEditProductOpen(false)}>Hủy</Button><Button onClick={handleEditProduct}>Lưu</Button></div>
      </DialogContent>
    </Dialog>
    </div>
  </div>
);
}