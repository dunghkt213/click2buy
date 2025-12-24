import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * MyStorePage - Trang quản lý cửa hàng
 * - Fix lỗi vỡ giao diện do text dài (dùng break-all, min-w-0)
 * - Giới hạn mô tả 400 ký tự
 * - Merge sản phẩm trùng lặp
 */
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshAccessToken } from '../../apis/client/apiClient';
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
// Icons
import { CheckCircle, Clock, DollarSign, Edit, Filter, List, Loader2, Package, Plus, RotateCcw, Search, Trash2, TrendingUp, Truck, XCircle } from 'lucide-react';
// Types & Utils
import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { OrderList } from '../../components/order/OrderList';
import { formatPrice } from '../../utils/utils';
// Order tab configuration
const ORDER_TABS = [
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
const STATUS_MAP = {
    'all': 'Tất cả',
    'in_stock': 'Còn hàng',
    'out_of_stock': 'Hết hàng',
    'inactive': 'Ngừng kinh doanh'
};
const STOCK_MAP = {
    'all': 'Tất cả',
    'in-stock': 'Còn hàng',
    'low-stock': 'Sắp hết',
    'out-of-stock': 'Hết hàng'
};
const SORT_MAP = {
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
    const rawStoreProducts = app.store.storeProducts || [];
    // Logic gộp sản phẩm trùng nhau và cộng dồn số lượng
    const mergedStoreProducts = useMemo(() => {
        const map = new Map();
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
                const existing = map.get(key);
                existing.stock += product.stock;
                existing.sold = (existing.sold || 0) + (product.sold || 0);
                // Có thể cộng dồn review nếu cần
            }
            else {
                // Nếu chưa có, tạo mới (Clone object để tránh tham chiếu)
                map.set(key, { ...product });
            }
        });
        return Array.from(map.values());
    }, [rawStoreProducts]);
    // --- 3. STATE ---
    const [selectedTab, setSelectedTab] = useState('products');
    const [orderTab, setOrderTab] = useState('all');
    const [allOrders, setAllOrders] = useState([]); // Store all orders for both counting and filtering
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const isLoadingOrdersRef = useRef(false); // Prevent duplicate API calls
    // Load all orders when entering MyStorePage (only once)
    useEffect(() => {
        // Chỉ load khi:
        // 1. User đã đăng nhập và là seller
        // 2. Chưa đang load (tránh duplicate calls)
        if (app.isLoggedIn &&
            app.user?.role === 'seller' &&
            allOrders.length === 0 &&
            !isLoadingOrdersRef.current) {
            isLoadingOrdersRef.current = true;
            const loadAllOrders = async () => {
                setIsLoadingOrders(true);
                try {
                    // Refresh token trước khi load orders để tránh 401 errors
                    try {
                        await refreshAccessToken();
                    }
                    catch (error) {
                        console.warn('⚠️ [MyStorePage] Token refresh failed before loading orders:', error);
                        // Continue anyway, apiClient will handle 401 errors
                    }
                    const { orderService } = await import('../../apis/order');
                    const { mapOrderResponse } = await import('../../apis/order/order.mapper');
                    const allOrdersData = await orderService.getAllForSeller(); // Load all orders without status filter
                    const mappedOrders = allOrdersData.map(mapOrderResponse);
                    setAllOrders(mappedOrders);
                    // Also update app.orders for compatibility
                    app.orders.setOrders(mappedOrders);
                }
                catch (error) {
                    console.error('Failed to load orders:', error);
                }
                finally {
                    isLoadingOrdersRef.current = false;
                    setIsLoadingOrders(false);
                }
            };
            loadAllOrders();
        }
    }, [app.isLoggedIn, app.user?.role, allOrders.length]); // Loại bỏ app.orders khỏi dependency array
    // Filter orders based on selected tab (frontend filtering for better UX)
    const filteredOrders = useMemo(() => {
        if (orderTab === 'all') {
            return allOrders.filter((o) => o.status !== 'cancelled');
        }
        const tabConfig = ORDER_TABS.find(tab => tab.value === orderTab);
        if (!tabConfig?.frontendStatus) {
            return [];
        }
        return allOrders.filter((o) => o.status === tabConfig.frontendStatus);
    }, [allOrders, orderTab]);
    // Get order count for a specific tab
    const getOrderCount = (tab) => {
        if (tab === 'all') {
            return allOrders.filter((o) => o.status !== 'cancelled').length;
        }
        const tabConfig = ORDER_TABS.find(t => t.value === tab);
        if (!tabConfig?.frontendStatus) {
            return 0;
        }
        return allOrders.filter((o) => o.status === tabConfig.frontendStatus).length;
    };
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [isEditProductOpen, setIsEditProductOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [revenueData, setRevenueData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [timeRange, setTimeRange] = useState('WEEK');
    const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);
    const [revenueError, setRevenueError] = useState(null);
    // Filter state
    const [filters, setFilters] = useState({
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
        condition: 'new',
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
                // Refresh token trước khi fetch data để tránh 401 errors
                if (app.isLoggedIn) {
                    try {
                        await refreshAccessToken();
                    }
                    catch (error) {
                        console.warn('⚠️ [MyStorePage] Token refresh failed before fetching revenue:', error);
                        // Continue anyway, apiClient will handle 401 errors
                    }
                }
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
                    // Debug: Log response để kiểm tra
                    console.log('📊 [Revenue] Top products response:', topProdData);
                    // Nếu topProducts không có productName, fetch từ product service
                    const enrichedTopProducts = await Promise.all((topProdData || []).map(async (item) => {
                        // Debug: Log từng item
                        console.log('📦 [Revenue] Processing item:', {
                            productId: item.productId,
                            productName: item.productName,
                            hasProductName: !!item.productName
                        });
                        // Nếu đã có productName, giữ nguyên
                        if (item.productName) {
                            return item;
                        }
                        // Nếu không có productName, thử fetch từ product service
                        try {
                            console.log(`🔍 [Revenue] Fetching product name for ${item.productId}...`);
                            const { productService } = await import('../../apis/product');
                            const product = await productService.getById(item.productId);
                            console.log(`✅ [Revenue] Fetched product name: ${product.name}`);
                            return {
                                ...item,
                                productName: product.name || `Sản phẩm ${item.productId.substring(0, 8)}`
                            };
                        }
                        catch (error) {
                            console.warn(`⚠️ [Revenue] Failed to fetch product name for ${item.productId}:`, error);
                            // Nếu fetch fail, dùng fallback
                            return {
                                ...item,
                                productName: `Sản phẩm ${item.productId.substring(0, 8)}`
                            };
                        }
                    }));
                    console.log('✅ [Revenue] Enriched top products:', enrichedTopProducts);
                    setTopProducts(enrichedTopProducts);
                }
                catch (error) {
                    console.error('Error fetching revenue data:', error);
                    setRevenueError(error.message || 'Không thể tải dữ liệu doanh thu');
                    setRevenueData([]);
                    setTopProducts([]);
                }
                finally {
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
            name: item.productName || `Sản phẩm ${item.productId?.substring(0, 8) || 'N/A'}`,
            value: Number(item.totalSold), // Ép kiểu số cho chắc chắn
            revenue: Number(item.totalRevenue),
            productId: item.productId, // Giữ lại productId để có thể fetch sau nếu cần
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
    // Hàm render nhãn biểu đồ - chỉ hiển thị phần trăm, không hiển thị tên sản phẩm
    const renderCustomLabel = (props) => {
        const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
        if (percent < 0.05)
            return null;
        return (_jsx("text", { x: x, y: y, fill: "white", textAnchor: x > cx ? 'start' : 'end', dominantBaseline: "central", className: "text-xs font-medium", children: `${(percent * 100).toFixed(0)}%` }));
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
    const openEditDialog = (product) => {
        setSelectedProduct(product);
        // Map StoreProduct to productForm format
        const images = product.images || (product.image ? [product.image] : []);
        setProductForm({
            name: product.name,
            description: product.description || '',
            price: product.price,
            salePrice: product.originalPrice || product.price,
            stock: product.stock || 0,
            brand: product.brand || '',
            condition: 'new', // Default to 'new' if not available
            category: product.category || '',
            warehouseAddress: '' // Default empty if not available
        });
        // Set raw inputs for display
        setRawInputs({
            images: images.join('\n')
        });
        setIsEditProductOpen(true);
    };
    const handleUpdateOrderStatus = async (orderId, action) => {
        try {
            // Refresh token trước khi thao tác để tránh 401 errors
            try {
                await refreshAccessToken();
            }
            catch (error) {
                console.warn('⚠️ [MyStorePage] Token refresh failed before update order status:', error);
                // Continue anyway, apiClient will handle 401 errors
            }
            const { orderService } = await import('../../apis/order');
            const { mapOrderResponse } = await import('../../apis/order/order.mapper');
            const { toast } = await import('sonner');
            let updatedOrder;
            if (action === 'confirm') {
                // Xác nhận đơn hàng
                const backendOrder = await orderService.confirmOrder(orderId);
                updatedOrder = mapOrderResponse(backendOrder);
                toast.success('Đã xác nhận đơn hàng');
            }
            else if (action === 'reject') {
                // Từ chối đơn hàng
                const backendOrder = await orderService.rejectOrder(orderId);
                updatedOrder = mapOrderResponse(backendOrder);
                toast.success('Đã từ chối đơn hàng');
            }
            else if (action === 'accept_cancel') {
                // Chấp nhận yêu cầu hủy đơn hàng
                try {
                    const backendOrder = await orderService.acceptCancelRequest(orderId);
                    if (backendOrder && backendOrder._id) {
                        updatedOrder = mapOrderResponse(backendOrder);
                    }
                    toast.success('Đã chấp nhận yêu cầu hủy đơn hàng');
                }
                catch (apiError) {
                    // Backend có thể không trả về response (undefined), nhưng order đã được update trong DB
                    console.warn('Accept cancel request - backend may not return response:', apiError);
                    if (apiError?.status && apiError.status !== 400) {
                        throw apiError; // Re-throw nếu là lỗi thật
                    }
                    toast.success('Đã chấp nhận yêu cầu hủy đơn hàng');
                }
            }
            else if (action === 'reject_cancel') {
                // Từ chối yêu cầu hủy đơn hàng
                try {
                    const backendOrder = await orderService.rejectCancelRequest(orderId);
                    if (backendOrder && backendOrder._id) {
                        updatedOrder = mapOrderResponse(backendOrder);
                    }
                    toast.success('Đã từ chối yêu cầu hủy đơn hàng');
                }
                catch (apiError) {
                    // Backend có thể không trả về response (undefined), nhưng order đã được update trong DB
                    console.warn('Reject cancel request - backend may not return response:', apiError);
                    if (apiError?.status && apiError.status !== 400) {
                        throw apiError; // Re-throw nếu là lỗi thật
                    }
                    toast.success('Đã từ chối yêu cầu hủy đơn hàng');
                }
            }
            else {
                // Các action khác (shipping, completed, cancelled)
                // Giữ nguyên logic cũ nếu cần
                app.orders.setOrders((prev) => prev.map((order) => order.id === orderId
                    ? {
                        ...order,
                        status: action,
                        updatedAt: new Date().toISOString(),
                        timeline: [...order.timeline, { status: action, timestamp: new Date().toISOString(), description: `Đơn hàng đã chuyển sang trạng thái ${action}` }]
                    }
                    : order));
                return;
            }
            // Reload orders từ server để cập nhật danh sách (giống như OrdersPage)
            // Điều này đảm bảo UI luôn sync với database sau khi thao tác
            try {
                const allOrdersData = await orderService.getAllForSeller();
                const mappedOrders = allOrdersData.map(mapOrderResponse);
                setAllOrders(mappedOrders);
                app.orders.setOrders(mappedOrders);
            }
            catch (reloadError) {
                console.error('Failed to reload orders after update:', reloadError);
                // Nếu reload fail, vẫn cập nhật local state với updatedOrder (nếu có)
                if (updatedOrder) {
                    setAllOrders((prev) => prev.map((order) => order.id === orderId ? updatedOrder : order));
                    app.orders.setOrders((prev) => prev.map((order) => order.id === orderId ? updatedOrder : order));
                }
            }
        }
        catch (error) {
            console.error('Failed to update order status:', error);
            const { toast } = await import('sonner');
            toast.error(error.message || 'Không thể cập nhật trạng thái đơn hàng');
        }
    };
    // --- 5. FILTER LOGIC ---
    const categories = Array.from(new Set(mergedStoreProducts.map((p) => p.category)));
    const resetFilters = () => {
        setFilters({ productName: '', minPrice: '', maxPrice: '', status: 'all' });
        setSearchQuery('');
    };
    const filteredProducts = mergedStoreProducts
        .filter((product) => {
        // Lọc theo searchQuery (nếu có)
        if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()))
            return false;
        // Lọc theo tên sản phẩm trong filter (không phân biệt hoa thường)
        if (filters.productName) {
            const productNameLower = product.name.toLowerCase();
            const filterNameLower = filters.productName.toLowerCase();
            if (!productNameLower.includes(filterNameLower))
                return false;
        }
        // Lọc theo giá từ
        if (filters.minPrice && product.price < Number(filters.minPrice))
            return false;
        // Lọc theo giá đến
        if (filters.maxPrice && product.price > Number(filters.maxPrice))
            return false;
        // Lọc theo trạng thái
        if (filters.status !== 'all') {
            if (filters.status === 'in_stock') {
                // Còn hàng: stock > 0 và status !== 'inactive'
                if (product.stock <= 0 || product.status === 'inactive')
                    return false;
            }
            else if (filters.status === 'out_of_stock') {
                // Hết hàng: stock === 0
                if (product.stock !== 0)
                    return false;
            }
            else if (filters.status === 'inactive') {
                // Ngừng kinh doanh: status === 'inactive'
                if (product.status !== 'inactive')
                    return false;
            }
        }
        return true;
    });
    const salesData = mergedStoreProducts.map((product) => ({
        name: product.name,
        value: product.sold || 0,
        revenue: (product.sold || 0) * product.price,
        price: product.price
    })).filter(item => item.value > 0).sort((a, b) => b.value - a.value);
    const totalSold = salesData.reduce((sum, item) => sum + item.value, 0);
    const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
    if (!app.isLoggedIn || app.user?.role !== 'seller')
        return null;
    return (_jsx("div", { className: "w-full min-h-screen pt-16 overflow-visible", children: _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs(Tabs, { value: selectedTab, onValueChange: setSelectedTab, children: [_jsxs(TabsList, { className: "mb-6", children: [_jsx(TabsTrigger, { value: "products", className: "gap-2 transition-all duration-200 hover:scale-105", children: _jsxs(motion.div, { animate: selectedTab === 'products' ? { scale: 1.1 } : { scale: 1 }, transition: { duration: 0.2 }, className: "flex items-center gap-2", children: [_jsx(Package, { className: "w-4 h-4" }), "S\u1EA3n ph\u1EA9m (", mergedStoreProducts.length, ")"] }) }), _jsx(TabsTrigger, { value: "orders", className: "gap-2 transition-all duration-200 hover:scale-105", children: _jsxs(motion.div, { animate: selectedTab === 'orders' ? { scale: 1.1 } : { scale: 1 }, transition: { duration: 0.2 }, className: "flex items-center gap-2", children: [_jsx(Truck, { className: "w-4 h-4" }), "\u0110\u01A1n h\u00E0ng (", isLoadingOrders ? '...' : allOrders.filter((o) => o.status !== 'cancelled').length, ")"] }) }), _jsx(TabsTrigger, { value: "revenue", className: "gap-2 transition-all duration-200 hover:scale-105", children: _jsxs(motion.div, { animate: selectedTab === 'revenue' ? { scale: 1.1 } : { scale: 1 }, transition: { duration: 0.2 }, className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "Doanh thu"] }) })] }), _jsx(TabsContent, { value: "products", className: "space-y-4", children: _jsx(AnimatePresence, { mode: "wait", children: selectedTab === 'products' && (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "relative flex-1 max-w-md", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" }), _jsx(Input, { placeholder: "T\u00ECm s\u1EA3n ph\u1EA9m...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-10" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowFilters(!showFilters), children: [_jsx(Filter, { className: "w-4 h-4 mr-2" }), " L\u1ECDc"] }), _jsxs(Button, { onClick: () => navigate('/my-store/add-product'), className: "gap-2", children: [_jsx(Plus, { className: "w-4 h-4" }), " Th\u00EAm s\u1EA3n ph\u1EA9m"] })] })] }), showFilters && (_jsx(Card, { className: "mb-4", children: _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "T\u00EAn s\u1EA3n ph\u1EA9m" }), _jsx(Input, { type: "text", value: filters.productName, onChange: (e) => setFilters({ ...filters, productName: e.target.value }), placeholder: "Nh\u1EADp t\u00EAn s\u1EA3n ph\u1EA9m...", className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Gi\u00E1 t\u1EEB" }), _jsx(Input, { type: "number", value: filters.minPrice, onChange: (e) => setFilters({ ...filters, minPrice: e.target.value }), placeholder: "Gi\u00E1 t\u1ED1i thi\u1EC3u", className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Gi\u00E1 \u0111\u1EBFn" }), _jsx(Input, { type: "number", value: filters.maxPrice, onChange: (e) => setFilters({ ...filters, maxPrice: e.target.value }), placeholder: "Gi\u00E1 t\u1ED1i \u0111a", className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Tr\u1EA1ng th\u00E1i" }), _jsxs(Select, { value: filters.status, onValueChange: (value) => setFilters({ ...filters, status: value }), children: [_jsx(SelectTrigger, { className: "w-full mt-1", children: _jsx(SelectValue, { children: STATUS_MAP[filters.status] }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "T\u1EA5t c\u1EA3" }), _jsx(SelectItem, { value: "in_stock", children: "C\u00F2n h\u00E0ng" }), _jsx(SelectItem, { value: "out_of_stock", children: "H\u1EBFt h\u00E0ng" }), _jsx(SelectItem, { value: "inactive", children: "Ng\u1EEBng kinh doanh" })] })] })] })] }), _jsx("div", { className: "flex justify-end mt-4", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: resetFilters, children: [_jsx(RotateCcw, { className: "w-4 h-4 mr-2" }), "\u0110\u1EB7t l\u1EA1i"] }) })] }) })), _jsx(Card, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "border-b", children: _jsxs("tr", { className: "text-left", children: [_jsx("th", { className: "p-4 w-[40%] min-w-[200px]", children: "S\u1EA3n ph\u1EA9m" }), _jsx("th", { className: "p-4 w-[15%]", children: "Gi\u00E1" }), _jsx("th", { className: "p-4 w-[10%]", children: "Kho" }), _jsx("th", { className: "p-4 w-[10%]", children: "\u0110\u00E3 b\u00E1n" }), _jsx("th", { className: "p-4 w-[15%]", children: "Tr\u1EA1ng th\u00E1i" }), _jsx("th", { className: "p-4 w-[10%]", children: "Thao t\u00E1c" })] }) }), _jsx("tbody", { children: filteredProducts.map((product) => (_jsxs("tr", { className: "border-b hover:bg-muted/30", children: [_jsx("td", { className: "p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0", children: _jsx(ImageWithFallback, { src: product.image, alt: product.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium text-sm line-clamp-2 break-words whitespace-normal", title: product.name, children: product.name }), _jsx("p", { className: "text-sm text-muted-foreground line-clamp-1", children: product.category })] })] }) }), _jsxs("td", { className: "p-4", children: [_jsx("p", { className: "font-medium", children: formatPrice(product.price) }), product.originalPrice && _jsx("p", { className: "text-sm text-muted-foreground line-through", children: formatPrice(product.originalPrice) })] }), _jsx("td", { className: "p-4", children: _jsxs("div", { className: "flex flex-col", children: [_jsx("p", { className: `font-medium ${product.stock < 10 ? 'text-red-500' : 'text-foreground'}`, children: typeof product.stock === 'number' ? product.stock : 0 }), product.stock < 10 && product.stock > 0 && (_jsx("span", { className: "text-xs text-muted-foreground", children: "S\u1EAFp h\u1EBFt" })), product.stock === 0 && (_jsx("span", { className: "text-xs text-red-500", children: "H\u1EBFt h\u00E0ng" }))] }) }), _jsx("td", { className: "p-4", children: product.sold }), _jsx("td", { className: "p-4", children: _jsx(Badge, { variant: product.status === 'active' ? 'default' : product.status === 'inactive' ? 'secondary' : 'destructive', children: STATUS_MAP[product.status] || product.status }) }), _jsx("td", { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate(`/my-store/edit-product/${product.id}`), children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => { if (confirm('Bạn có chắc muốn xóa sản phẩm này?'))
                                                                                        app.store.handleDeleteProduct(product.id); }, children: _jsx(Trash2, { className: "w-4 h-4 text-red-500" }) })] }) })] }, product.id))) })] }) }) })] }, "products")) }) }), _jsx(TabsContent, { value: "orders", className: "space-y-4", children: _jsx(AnimatePresence, { mode: "wait", children: selectedTab === 'orders' && (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }, children: _jsxs(Tabs, { value: orderTab, onValueChange: (v) => setOrderTab(v), children: [_jsx(TabsList, { children: ORDER_TABS.map((tab) => {
                                                    const Icon = tab.icon;
                                                    const count = getOrderCount(tab.value);
                                                    return (_jsx(TabsTrigger, { value: tab.value, className: "gap-2 transition-all duration-200 hover:scale-105", children: _jsxs(motion.div, { animate: orderTab === tab.value ? { scale: 1.1 } : { scale: 1 }, transition: { duration: 0.2 }, className: "flex items-center gap-2", children: [_jsx(Icon, { className: "w-4 h-4" }), tab.label, count > 0 && (_jsx(Badge, { className: "ml-1 h-5 px-1.5 text-xs bg-red-500 text-white border-0", children: count }))] }) }, tab.value));
                                                }) }), ORDER_TABS.map((tab) => (_jsx(TabsContent, { value: tab.value, className: "space-y-4", children: _jsx(OrderList, { orders: filteredOrders, onUpdateStatus: handleUpdateOrderStatus, showActionButtons: tab.value !== 'all' }) }, tab.value)))] }) }, "orders")) }) }), _jsx(TabsContent, { value: "revenue", className: "space-y-6", children: _jsx(AnimatePresence, { mode: "wait", children: selectedTab === 'revenue' && (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }, children: [_jsxs("div", { className: "flex justify-end gap-2 mb-4", children: [_jsx(Button, { variant: timeRange === 'WEEK' ? 'default' : 'outline', onClick: () => setTimeRange('WEEK'), size: "sm", children: "Tu\u1EA7n n\u00E0y" }), _jsx(Button, { variant: timeRange === 'MONTH' ? 'default' : 'outline', onClick: () => setTimeRange('MONTH'), size: "sm", children: "Th\u00E1ng n\u00E0y" })] }), isLoadingRevenue && (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary mx-auto mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "\u0110ang t\u1EA3i d\u1EEF li\u1EC7u..." })] }) })), revenueError && !isLoadingRevenue && (_jsx(Card, { className: "p-6 border-destructive", children: _jsxs("div", { className: "text-center", children: [_jsx(XCircle, { className: "w-8 h-8 text-destructive mx-auto mb-2" }), _jsx("p", { className: "text-sm text-destructive font-medium", children: revenueError }), _jsx(Button, { variant: "outline", size: "sm", className: "mt-4", onClick: () => {
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
                                                                    }
                                                                    catch (error) {
                                                                        setRevenueError(error.message || 'Không thể tải dữ liệu doanh thu');
                                                                    }
                                                                    finally {
                                                                        setIsLoadingRevenue(false);
                                                                    }
                                                                };
                                                                fetchData();
                                                            }
                                                        }, children: "Th\u1EED l\u1EA1i" })] }) })), !isLoadingRevenue && !revenueError && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "T\u1ED5ng \u0111\u01A1n h\u00E0ng" }), _jsx(Package, { className: "w-5 h-5 text-primary" })] }), _jsx("p", { className: "text-3xl font-bold", children: apiTotalSold.toLocaleString() })] }), _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "T\u1ED5ng doanh thu" }), _jsx(DollarSign, { className: "w-5 h-5 text-green-500" })] }), _jsx("p", { className: "text-3xl font-bold text-green-600", children: formatPrice(apiTotalRevenue) })] }), _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "B\u00E1n ch\u1EA1y nh\u1EA5t" }), _jsx(TrendingUp, { className: "w-5 h-5 text-orange-500" })] }), _jsx("p", { className: "text-xl font-bold line-clamp-1", children: topProducts.length > 0 ? topProducts[0].productName : 'Chưa có dữ liệu' })] })] }), lineChartData.length > 0 && (_jsx(Card, { children: _jsxs("div", { className: "p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Doanh Thu Theo Th\u1EDDi Gian" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(AreaChart, { data: lineChartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date", tick: { fontSize: 12 }, angle: -45, textAnchor: "end", height: 60 }), _jsx(YAxis, { tick: { fontSize: 12 }, tickFormatter: (value) => `${(value / 1000000).toFixed(1)}M` }), _jsx(Tooltip, { formatter: (value) => formatPrice(value), labelFormatter: (label) => `Ngày: ${label}` }), _jsx(Legend, {}), _jsx(Area, { type: "monotone", dataKey: "revenue", stroke: "#10b981", fill: "#10b981", fillOpacity: 0.6, name: "Doanh thu" })] }) })] }) })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx(Card, { className: "lg:col-span-2", children: _jsxs("div", { className: "p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Top S\u1EA3n Ph\u1EA9m B\u00E1n Ch\u1EA1y" }), chartData.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 400, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: chartData, cx: "50%", cy: "50%", labelLine: false, label: renderCustomLabel, outerRadius: 140, fill: "#8884d8", dataKey: "value" // ✅ Key này map với chartData ở trên
                                                                                    , children: chartData.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { formatter: (value) => `${value} đã bán`, labelFormatter: () => '' })] }) })) : (_jsx("div", { className: "h-[400px] flex items-center justify-center text-muted-foreground", children: "Ch\u01B0a c\u00F3 d\u1EEF li\u1EC7u b\u00E1n h\u00E0ng trong th\u1EDDi gian n\u00E0y" }))] }) }), _jsx(Card, { className: "lg:col-span-1", children: _jsxs("div", { className: "p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Chi ti\u1EBFt" }), _jsx(ScrollArea, { className: "h-[400px] pr-4", children: _jsx("div", { className: "space-y-3", children: chartData.map((item, index) => (_jsxs("div", { className: "flex items-start gap-3 p-3 rounded-lg border", children: [_jsx("div", { className: "w-3 h-3 rounded-full mt-1 flex-shrink-0", style: { backgroundColor: COLORS[index % COLORS.length] } }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium text-sm line-clamp-2 break-all", children: item.name }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["SL: ", item.value, " - DT: ", formatPrice(item.revenue)] })] })] }, index))) }) })] }) })] })] }))] }, "revenue")) }) })] }), _jsx(Dialog, { open: isAddProductOpen, onOpenChange: setIsAddProductOpen, children: _jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] flex flex-col", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Th\u00EAm s\u1EA3n ph\u1EA9m m\u1EDBi" }), _jsx(DialogDescription, { children: "\u0110i\u1EC1n th\u00F4ng tin s\u1EA3n ph\u1EA9m \u0111\u1EC3 th\u00EAm v\u00E0o c\u1EEDa h\u00E0ng" })] }), _jsx(ScrollArea, { className: "flex-1 min-h-0 pr-4", children: _jsxs("div", { className: "space-y-4 p-1", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-base font-semibold", children: "Th\u00F4ng tin c\u01A1 b\u1EA3n" }), _jsxs("div", { children: [_jsx(Label, { children: "T\u00EAn s\u1EA3n ph\u1EA9m *" }), _jsx(Input, { value: productForm.name, onChange: (e) => setProductForm({ ...productForm, name: e.target.value }), placeholder: "iPhone 15 Pro Max" })] }), _jsxs("div", { children: [_jsx(Label, { children: "M\u00F4 t\u1EA3" }), _jsx(Textarea, { value: productForm.description, onChange: (e) => setProductForm({ ...productForm, description: e.target.value }), rows: 4, placeholder: "\u0110i\u1EC7n tho\u1EA1i cao c\u1EA5p 2025", className: "break-all whitespace-pre-wrap" })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-base font-semibold", children: "Gi\u00E1 c\u1EA3 & Kho h\u00E0ng" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Gi\u00E1 g\u1ED1c (VND) *" }), _jsx(Input, { type: "number", value: productForm.price || '', onChange: (e) => setProductForm({ ...productForm, price: Number(e.target.value) }), placeholder: "29990000" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Gi\u00E1 khuy\u1EBFn m\u00E3i (VND)" }), _jsx(Input, { type: "number", value: productForm.salePrice || '', onChange: (e) => setProductForm({ ...productForm, salePrice: Number(e.target.value) }), placeholder: "27990000" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "S\u1ED1 l\u01B0\u1EE3ng trong kho *" }), _jsx(Input, { type: "number", value: productForm.stock || '', onChange: (e) => setProductForm({ ...productForm, stock: Number(e.target.value) }), placeholder: "10" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Th\u01B0\u01A1ng hi\u1EC7u *" }), _jsx(Input, { value: productForm.brand, onChange: (e) => setProductForm({ ...productForm, brand: e.target.value }), placeholder: "Apple" })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "T\u00ECnh tr\u1EA1ng *" }), _jsxs(Select, { value: productForm.condition, onValueChange: (value) => setProductForm({ ...productForm, condition: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "new", children: "M\u1EDBi" }), _jsx(SelectItem, { value: "used", children: "\u0110\u00E3 qua s\u1EED d\u1EE5ng" })] })] })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-base font-semibold", children: "Lo\u1EA1i m\u1EB7t h\u00E0ng" }), _jsxs("div", { children: [_jsx(Label, { children: "Lo\u1EA1i m\u1EB7t h\u00E0ng *" }), _jsx(Input, { value: productForm.category, onChange: (e) => setProductForm({ ...productForm, category: e.target.value }), placeholder: "\u0110i\u1EC7n tho\u1EA1i, M\u00E1y t\u00EDnh, Qu\u1EA7n \u00E1o..." }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "V\u00ED d\u1EE5: \u0110i\u1EC7n tho\u1EA1i, M\u00E1y t\u00EDnh, Qu\u1EA7n \u00E1o" })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-base font-semibold", children: "\u1EA2nh" }), _jsxs("div", { children: [_jsx(Label, { children: "URL h\u00ECnh \u1EA3nh (m\u1ED7i URL m\u1ED9t d\u00F2ng) *" }), _jsx(Textarea, { value: rawInputs.images, onChange: (e) => setRawInputs({ ...rawInputs, images: e.target.value }), rows: 4, placeholder: "https://img.com/a.jpg\nhttps://img.com/b.jpg" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Nh\u1EADp m\u1ED7i URL tr\u00EAn m\u1ED9t d\u00F2ng" })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-base font-semibold", children: "\u0110\u1ECBa ch\u1EC9 kho h\u00E0ng" }), _jsxs("div", { children: [_jsx(Label, { children: "\u0110\u1ECBa ch\u1EC9 kho h\u00E0ng *" }), _jsx(Input, { value: productForm.warehouseAddress, onChange: (e) => setProductForm({ ...productForm, warehouseAddress: e.target.value }), placeholder: "123 Nguy\u1EC5n Tr\u00E3i, Thanh Xu\u00E2n, H\u00E0 N\u1ED9i" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Nh\u1EADp \u0111\u1ECBa ch\u1EC9 \u0111\u1EA7y \u0111\u1EE7 c\u1EE7a kho h\u00E0ng" })] })] })] }) }), _jsxs("div", { className: "flex justify-end gap-2 mt-4 pt-2 border-t", children: [_jsx(Button, { variant: "outline", onClick: () => setIsAddProductOpen(false), children: "H\u1EE7y" }), _jsx(Button, { onClick: handleAddProduct, children: "Th\u00EAm" })] })] }) }), _jsx(Dialog, { open: isEditProductOpen, onOpenChange: setIsEditProductOpen, children: _jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] flex flex-col", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "S\u1EEDa s\u1EA3n ph\u1EA9m" }) }), _jsx(ScrollArea, { className: "flex-1 min-h-0 pr-4", children: _jsxs("div", { className: "space-y-4 p-1", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-base font-semibold", children: "Th\u00F4ng tin c\u01A1 b\u1EA3n" }), _jsxs("div", { children: [_jsx(Label, { children: "T\u00EAn s\u1EA3n ph\u1EA9m *" }), _jsx(Input, { value: productForm.name, onChange: (e) => setProductForm({ ...productForm, name: e.target.value }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "M\u00F4 t\u1EA3" }), _jsx(Textarea, { value: productForm.description, onChange: (e) => setProductForm({ ...productForm, description: e.target.value }), rows: 4, className: "break-all whitespace-pre-wrap" })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-base font-semibold", children: "Gi\u00E1 c\u1EA3 & Kho h\u00E0ng" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Gi\u00E1 g\u1ED1c (VND) *" }), _jsx(Input, { type: "number", value: productForm.price || '', onChange: (e) => setProductForm({ ...productForm, price: Number(e.target.value) }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Gi\u00E1 khuy\u1EBFn m\u00E3i (VND)" }), _jsx(Input, { type: "number", value: productForm.salePrice || '', onChange: (e) => setProductForm({ ...productForm, salePrice: Number(e.target.value) }) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "S\u1ED1 l\u01B0\u1EE3ng trong kho *" }), _jsx(Input, { type: "number", value: productForm.stock || '', onChange: (e) => setProductForm({ ...productForm, stock: Number(e.target.value) }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Th\u01B0\u01A1ng hi\u1EC7u *" }), _jsx(Input, { value: productForm.brand, onChange: (e) => setProductForm({ ...productForm, brand: e.target.value }) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "T\u00ECnh tr\u1EA1ng *" }), _jsxs(Select, { value: productForm.condition, onValueChange: (value) => setProductForm({ ...productForm, condition: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "new", children: "M\u1EDBi" }), _jsx(SelectItem, { value: "used", children: "\u0110\u00E3 qua s\u1EED d\u1EE5ng" })] })] })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-base font-semibold", children: "Lo\u1EA1i m\u1EB7t h\u00E0ng" }), _jsxs("div", { children: [_jsx(Label, { children: "Lo\u1EA1i m\u1EB7t h\u00E0ng *" }), _jsx(Input, { value: productForm.category, onChange: (e) => setProductForm({ ...productForm, category: e.target.value }), placeholder: "\u0110i\u1EC7n tho\u1EA1i, M\u00E1y t\u00EDnh, Qu\u1EA7n \u00E1o..." }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "V\u00ED d\u1EE5: \u0110i\u1EC7n tho\u1EA1i, M\u00E1y t\u00EDnh, Qu\u1EA7n \u00E1o" })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-base font-semibold", children: "\u1EA2nh" }), _jsxs("div", { children: [_jsx(Label, { children: "URL h\u00ECnh \u1EA3nh (m\u1ED7i URL m\u1ED9t d\u00F2ng) *" }), _jsx(Textarea, { value: rawInputs.images, onChange: (e) => setRawInputs({ ...rawInputs, images: e.target.value }), rows: 4, placeholder: "https://img.com/a.jpg\nhttps://img.com/b.jpg" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Nh\u1EADp m\u1ED7i URL tr\u00EAn m\u1ED9t d\u00F2ng" })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-base font-semibold", children: "\u0110\u1ECBa ch\u1EC9 kho h\u00E0ng" }), _jsxs("div", { children: [_jsx(Label, { children: "\u0110\u1ECBa ch\u1EC9 kho h\u00E0ng *" }), _jsx(Input, { value: productForm.warehouseAddress, onChange: (e) => setProductForm({ ...productForm, warehouseAddress: e.target.value }), placeholder: "123 Nguy\u1EC5n Tr\u00E3i, Thanh Xu\u00E2n, H\u00E0 N\u1ED9i" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Nh\u1EADp \u0111\u1ECBa ch\u1EC9 \u0111\u1EA7y \u0111\u1EE7 c\u1EE7a kho h\u00E0ng" })] })] })] }) }), _jsxs("div", { className: "flex justify-end gap-2 mt-4 pt-2 border-t", children: [_jsx(Button, { variant: "outline", onClick: () => setIsEditProductOpen(false), children: "H\u1EE7y" }), _jsx(Button, { onClick: handleEditProduct, children: "L\u01B0u" })] })] }) })] }) }));
}
