import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Edit, Filter, Package, Plus, Search, Trash2, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
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
export function MyStorePage({ storeProducts, storeOrders, onAddProduct, onUpdateProduct, onDeleteProduct, onUpdateOrderStatus }) {
    const [selectedTab, setSelectedTab] = useState('products');
    // Scroll lên đầu trang khi component mount để đảm bảo có thể scroll lên trên
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
        // Force scroll bằng cách set scrollTop trực tiếp
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, []);
    // Log khi storeProducts thay đổi
    useEffect(() => {
        console.log('🏪 [MyStorePage] Nhận được storeProducts:', storeProducts);
        console.log(`📦 [MyStorePage] Tổng số sản phẩm: ${storeProducts.length}`);
        if (storeProducts.length > 0) {
            console.log('✅ [MyStorePage] Sản phẩm đầu tiên:', storeProducts[0]);
        }
    }, [storeProducts]);
    const [orderTab, setOrderTab] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [isEditProductOpen, setIsEditProductOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    // Product form state
    const [productForm, setProductForm] = useState({
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
    const openEditDialog = (product) => {
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
    const filteredProducts = storeProducts.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()));
    // Filter orders by status
    const filteredOrders = storeOrders.filter(order => {
        if (orderTab === 'pending')
            return order.status === 'pending' || order.status === 'confirmed';
        if (orderTab === 'shipping')
            return order.status === 'shipping';
        if (orderTab === 'completed')
            return order.status === 'completed';
        return false;
    });
    const getOrderCount = (tab) => {
        if (tab === 'pending')
            return storeOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
        if (tab === 'shipping')
            return storeOrders.filter(o => o.status === 'shipping').length;
        if (tab === 'completed')
            return storeOrders.filter(o => o.status === 'completed').length;
        return 0;
    };
    const motionEase = [0.4, 0, 0.2, 1];
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
    return (_jsx("div", { className: "w-full min-h-screen pt-16 overflow-visible", children: _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs(Tabs, { value: selectedTab, onValueChange: setSelectedTab, children: [_jsx(motion.div, { variants: sectionVariants, initial: "hidden", animate: "visible", children: _jsxs(TabsList, { className: "mb-6", children: [_jsxs(TabsTrigger, { value: "products", className: "gap-2", children: [_jsx(Package, { className: "w-4 h-4" }), "S\u1EA3n ph\u1EA9m (", storeProducts.length, ")"] }), _jsxs(TabsTrigger, { value: "orders", className: "gap-2", children: [_jsx(Truck, { className: "w-4 h-4" }), "\u0110\u01A1n h\u00E0ng (", storeOrders.length, ")"] })] }) }), _jsxs(TabsContent, { value: "products", className: "space-y-4", children: [_jsxs(motion.div, { className: "flex items-center justify-between", variants: sectionVariants, initial: "hidden", animate: "visible", children: [_jsxs("div", { className: "relative flex-1 max-w-md", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" }), _jsx(Input, { placeholder: "T\u00ECm s\u1EA3n ph\u1EA9m...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-10" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Filter, { className: "w-4 h-4 mr-2" }), "L\u1ECDc"] }), _jsxs(Button, { onClick: () => setIsAddProductOpen(true), className: "gap-2", children: [_jsx(Plus, { className: "w-4 h-4" }), "Th\u00EAm s\u1EA3n ph\u1EA9m"] })] })] }), _jsx(Card, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "border-b", children: _jsxs("tr", { className: "text-left", children: [_jsx("th", { className: "p-4", children: "S\u1EA3n ph\u1EA9m" }), _jsx("th", { className: "p-4", children: "Gi\u00E1" }), _jsx("th", { className: "p-4", children: "Kho" }), _jsx("th", { className: "p-4", children: "\u0110\u00E3 b\u00E1n" }), _jsx("th", { className: "p-4", children: "Tr\u1EA1ng th\u00E1i" }), _jsx("th", { className: "p-4", children: "Thao t\u00E1c" })] }) }), _jsx(motion.tbody, { variants: listVariants, initial: "hidden", animate: "visible", children: filteredProducts.map((product) => (_jsxs(motion.tr, { className: "border-b hover:bg-muted/30", variants: itemVariants, children: [_jsx("td", { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0", children: _jsx(ImageWithFallback, { src: product.image, alt: product.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium line-clamp-1", children: product.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: product.category })] })] }) }), _jsxs("td", { className: "p-4", children: [_jsx("p", { className: "font-medium", children: formatPrice(product.price) }), product.originalPrice && (_jsx("p", { className: "text-sm text-muted-foreground line-through", children: formatPrice(product.originalPrice) }))] }), _jsx("td", { className: "p-4", children: _jsx("p", { className: product.stock < 10 ? 'text-red-500' : '', children: product.stock }) }), _jsx("td", { className: "p-4", children: product.sold }), _jsx("td", { className: "p-4", children: _jsxs(Badge, { variant: product.status === 'active'
                                                                        ? 'default'
                                                                        : product.status === 'inactive'
                                                                            ? 'secondary'
                                                                            : 'destructive', children: [product.status === 'active' && 'Đang bán', product.status === 'inactive' && 'Tạm ngưng', product.status === 'out_of_stock' && 'Hết hàng'] }) }), _jsx("td", { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => openEditDialog(product), children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                                                onDeleteProduct(product.id);
                                                                            }, children: _jsx(Trash2, { className: "w-4 h-4 text-red-500" }) })] }) })] }, product.id))) })] }) }) })] }), _jsx(TabsContent, { value: "orders", className: "space-y-4", children: _jsxs(Tabs, { value: orderTab, onValueChange: (v) => setOrderTab(v), children: [_jsx(motion.div, { variants: sectionVariants, initial: "hidden", animate: "visible", children: _jsxs(TabsList, { children: [_jsxs(TabsTrigger, { value: "pending", className: "gap-2", children: [_jsx(Clock, { className: "w-4 h-4" }), "Ch\u1EDD x\u1EED l\u00FD", getOrderCount('pending') > 0 && (_jsx(Badge, { variant: "secondary", className: "ml-1 h-5 px-1.5 text-xs", children: getOrderCount('pending') }))] }), _jsxs(TabsTrigger, { value: "shipping", className: "gap-2", children: [_jsx(Truck, { className: "w-4 h-4" }), "\u0110ang giao", getOrderCount('shipping') > 0 && (_jsx(Badge, { variant: "secondary", className: "ml-1 h-5 px-1.5 text-xs", children: getOrderCount('shipping') }))] }), _jsxs(TabsTrigger, { value: "completed", className: "gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), "Ho\u00E0n th\u00E0nh", getOrderCount('completed') > 0 && (_jsx(Badge, { variant: "secondary", className: "ml-1 h-5 px-1.5 text-xs", children: getOrderCount('completed') }))] })] }) }), ['pending', 'shipping', 'completed'].map((tab) => (_jsx(TabsContent, { value: tab, className: "space-y-4", children: filteredOrders.length === 0 ? (_jsx(Card, { className: "p-12", children: _jsxs(motion.div, { className: "text-center", initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.3 } }, children: [_jsx(Package, { className: "w-16 h-16 mx-auto mb-4 text-muted-foreground" }), _jsx("h3", { className: "text-lg mb-2", children: "Ch\u01B0a c\u00F3 \u0111\u01A1n h\u00E0ng" }), _jsxs("p", { className: "text-muted-foreground", children: [tab === 'pending' && 'Chưa có đơn hàng chờ xử lý', tab === 'shipping' && 'Chưa có đơn hàng đang giao', tab === 'completed' && 'Chưa có đơn hàng hoàn thành'] })] }) })) : (_jsx(motion.div, { variants: listVariants, initial: "hidden", animate: "visible", className: "space-y-4", children: filteredOrders.map((order) => (_jsx(motion.div, { variants: itemVariants, children: _jsxs(Card, { className: "overflow-hidden", children: [_jsx("div", { className: "p-4 bg-muted/30 border-b", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: order.orderNumber }), _jsx("p", { className: "text-sm text-muted-foreground", children: new Date(order.createdAt).toLocaleString('vi-VN') })] }), _jsxs(Badge, { children: [order.status === 'pending' && 'Chờ xác nhận', order.status === 'confirmed' && 'Đã xác nhận', order.status === 'shipping' && 'Đang giao', order.status === 'completed' && 'Hoàn thành'] })] }) }), _jsxs("div", { className: "p-4", children: [_jsx("div", { className: "space-y-3 mb-4", children: order.items.map((item) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0", children: _jsx(ImageWithFallback, { src: item.image, alt: item.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium line-clamp-1", children: item.name }), item.variant && (_jsx("p", { className: "text-sm text-muted-foreground", children: item.variant }))] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-sm text-muted-foreground", children: ["x", item.quantity] }), _jsx("p", { className: "font-medium", children: formatPrice(item.price) })] })] }, item.id))) }), _jsxs("div", { className: "pt-3 border-t", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Kh\u00E1ch h\u00E0ng:" }), _jsx("p", { className: "font-medium", children: order.shippingAddress.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: order.shippingAddress.phone })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "T\u1ED5ng ti\u1EC1n:" }), _jsx("p", { className: "text-xl font-bold text-primary", children: formatPrice(order.finalPrice) })] })] }), order.status === 'pending' && (_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", onClick: () => onUpdateOrderStatus(order.id, 'confirmed'), className: "flex-1", children: "X\u00E1c nh\u1EADn \u0111\u01A1n" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                                        if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                                                                                            onUpdateOrderStatus(order.id, 'cancelled');
                                                                                        }
                                                                                    }, children: "H\u1EE7y \u0111\u01A1n" })] })), order.status === 'confirmed' && (_jsx(Button, { size: "sm", onClick: () => onUpdateOrderStatus(order.id, 'shipping'), className: "w-full", children: "B\u1EAFt \u0111\u1EA7u giao h\u00E0ng" })), order.status === 'shipping' && (_jsx(Button, { size: "sm", onClick: () => onUpdateOrderStatus(order.id, 'completed'), className: "w-full", children: "Ho\u00E0n th\u00E0nh \u0111\u01A1n h\u00E0ng" }))] })] })] }) }, order.id))) })) }, tab)))] }) })] }), _jsx(Dialog, { open: isAddProductOpen, onOpenChange: setIsAddProductOpen, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh]", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Th\u00EAm s\u1EA3n ph\u1EA9m m\u1EDBi" }) }), _jsx(ScrollArea, { className: "max-h-[75vh] pr-4", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "font-semibold text-lg", children: "Th\u00F4ng tin c\u01A1 b\u1EA3n" }), _jsxs("div", { children: [_jsx(Label, { children: "T\u00EAn s\u1EA3n ph\u1EA9m *" }), _jsx(Input, { value: productForm.name, onChange: (e) => setProductForm({ ...productForm, name: e.target.value }), placeholder: "Nh\u1EADp t\u00EAn s\u1EA3n ph\u1EA9m..." })] }), _jsxs("div", { children: [_jsx(Label, { children: "M\u00F4 t\u1EA3" }), _jsx(Textarea, { value: productForm.description, onChange: (e) => setProductForm({ ...productForm, description: e.target.value }), placeholder: "M\u00F4 t\u1EA3 s\u1EA3n ph\u1EA9m...", rows: 3 })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Th\u01B0\u01A1ng hi\u1EC7u *" }), _jsx(Input, { value: productForm.brand, onChange: (e) => setProductForm({ ...productForm, brand: e.target.value }), placeholder: "V\u00ED d\u1EE5: Adidas, Nike..." })] }), _jsxs("div", { children: [_jsx(Label, { children: "T\u00ECnh tr\u1EA1ng" }), _jsxs(Select, { value: productForm.condition, onValueChange: (value) => setProductForm({ ...productForm, condition: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "new", children: "M\u1EDBi" }), _jsx(SelectItem, { value: "used", children: "\u0110\u00E3 qua s\u1EED d\u1EE5ng" })] })] })] })] })] }), _jsxs("div", { className: "space-y-4 border-t pt-4", children: [_jsx("h3", { className: "font-semibold text-lg", children: "Gi\u00E1 c\u1EA3" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Gi\u00E1 g\u1ED1c *" }), _jsx(Input, { type: "number", value: productForm.price || '', onChange: (e) => setProductForm({ ...productForm, price: Number(e.target.value) || 0 }), placeholder: "3200000" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Gi\u00E1 khuy\u1EBFn m\u00E3i" }), _jsx(Input, { type: "number", value: productForm.salePrice || '', onChange: (e) => setProductForm({ ...productForm, salePrice: Number(e.target.value) || 0 }), placeholder: "2900000" })] })] })] }), _jsxs("div", { className: "space-y-4 border-t pt-4", children: [_jsx("h3", { className: "font-semibold text-lg", children: "Kho h\u00E0ng" }), _jsxs("div", { children: [_jsx(Label, { children: "S\u1ED1 l\u01B0\u1EE3ng trong kho *" }), _jsx(Input, { type: "number", value: productForm.stock || '', onChange: (e) => setProductForm({ ...productForm, stock: Number(e.target.value) || 0 }), placeholder: "120" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "isActive", checked: productForm.isActive, onCheckedChange: (checked) => setProductForm({ ...productForm, isActive: checked === true }) }), _jsx(Label, { htmlFor: "isActive", className: "cursor-pointer", children: "S\u1EA3n ph\u1EA9m \u0111ang ho\u1EA1t \u0111\u1ED9ng" })] })] }), _jsxs("div", { className: "space-y-4 border-t pt-4", children: [_jsx("h3", { className: "font-semibold text-lg", children: "Ph\u00E2n lo\u1EA1i" }), _jsxs("div", { children: [_jsx(Label, { children: "Danh m\u1EE5c *" }), _jsx(Input, { value: rawInputs.categories, onChange: (e) => {
                                                                const value = e.target.value;
                                                                setRawInputs({ ...rawInputs, categories: value });
                                                                // Parse khi user gõ (cho phép dấu cách trong giá trị)
                                                                const categories = value ? value.split(',').map(c => c.trim()).filter(c => c) : [];
                                                                setProductForm({ ...productForm, categoryIds: categories });
                                                            }, onBlur: (e) => {
                                                                // Khi blur, đảm bảo format đúng
                                                                const value = e.target.value;
                                                                const categories = value ? value.split(',').map(c => c.trim()).filter(c => c) : [];
                                                                setRawInputs({ ...rawInputs, categories: categories.join(', ') });
                                                                setProductForm({ ...productForm, categoryIds: categories });
                                                            }, placeholder: "giay, the-thao, phu-kien" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Tags" }), _jsx(Input, { value: rawInputs.tags, onChange: (e) => {
                                                                const value = e.target.value;
                                                                setRawInputs({ ...rawInputs, tags: value });
                                                                const tags = value ? value.split(',').map(t => t.trim()).filter(t => t) : [];
                                                                setProductForm({ ...productForm, tags });
                                                            }, onBlur: (e) => {
                                                                const value = e.target.value;
                                                                const tags = value ? value.split(',').map(t => t.trim()).filter(t => t) : [];
                                                                setRawInputs({ ...rawInputs, tags: tags.join(', ') });
                                                                setProductForm({ ...productForm, tags });
                                                            }, placeholder: "running, sport, adidas" })] })] }), _jsxs("div", { className: "space-y-4 border-t pt-4", children: [_jsx("h3", { className: "font-semibold text-lg", children: "H\u00ECnh \u1EA3nh" }), _jsxs("div", { children: [_jsx(Label, { children: "URL h\u00ECnh \u1EA3nh *" }), _jsx(Textarea, { value: rawInputs.images, onChange: (e) => {
                                                                const value = e.target.value;
                                                                setRawInputs({ ...rawInputs, images: value });
                                                                // Parse nhưng giữ nguyên dấu cách trong URL
                                                                const images = value ? value.split('\n').map(img => img.trim()).filter(img => img) : [];
                                                                setProductForm({ ...productForm, images });
                                                            }, onBlur: (e) => {
                                                                const value = e.target.value;
                                                                const images = value ? value.split('\n').map(img => img.trim()).filter(img => img) : [];
                                                                setRawInputs({ ...rawInputs, images: images.join('\n') });
                                                                setProductForm({ ...productForm, images });
                                                            }, placeholder: "https://example.com/image1.jpg\nhttps://example.com/image2.jpg", rows: 4 })] })] }), _jsxs("div", { className: "space-y-4 border-t pt-4", children: [_jsx("h3", { className: "font-semibold text-lg", children: "Thu\u1ED9c t\u00EDnh" }), _jsxs("div", { children: [_jsx(Label, { children: "Thu\u1ED9c t\u00EDnh s\u1EA3n ph\u1EA9m" }), _jsx(Textarea, { value: rawInputs.attributes, onChange: (e) => {
                                                                const value = e.target.value;
                                                                setRawInputs({ ...rawInputs, attributes: value });
                                                                // Parse nhưng giữ nguyên dấu cách trong giá trị
                                                                const attrs = {};
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
                                                            }, onBlur: (e) => {
                                                                const value = e.target.value;
                                                                const attrs = {};
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
                                                            }, placeholder: "color: white\nmaterial: Primeknit\ncushion: Boost\nweight: 300g", rows: 4 })] })] }), _jsxs("div", { className: "space-y-4 border-t pt-4", children: [_jsx("h3", { className: "font-semibold text-lg", children: "Bi\u1EBFn th\u1EC3" }), _jsxs("div", { children: [_jsx(Label, { children: "Bi\u1EBFn th\u1EC3 s\u1EA3n ph\u1EA9m" }), _jsx(Textarea, { value: rawInputs.variants, onChange: (e) => {
                                                                const value = e.target.value;
                                                                setRawInputs({ ...rawInputs, variants: value });
                                                                // Parse nhưng giữ nguyên dấu cách trong giá trị
                                                                const variants = {};
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
                                                                                }
                                                                                else {
                                                                                    variants[key] = val; // Giữ nguyên dấu cách
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                });
                                                                setProductForm({ ...productForm, variants });
                                                            }, onBlur: (e) => {
                                                                const value = e.target.value;
                                                                const variants = {};
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
                                                                                }
                                                                                else {
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
                                                            }, placeholder: "size: 38,39,40,41,42\ncolor: white,black", rows: 3 })] })] }), _jsxs("div", { className: "space-y-4 border-t pt-4", children: [_jsx("h3", { className: "font-semibold text-lg", children: "\u0110\u1ECBa ch\u1EC9 kho h\u00E0ng" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "\u0110\u1ECBa ch\u1EC9 d\u00F2ng 1 *" }), _jsx(Input, { value: productForm.warehouseAddress.line1, onChange: (e) => setProductForm({
                                                                        ...productForm,
                                                                        warehouseAddress: { ...productForm.warehouseAddress, line1: e.target.value }
                                                                    }), placeholder: "Kho t\u1ED5ng B\u00ECnh T\u00E2n" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Th\u00E0nh ph\u1ED1 *" }), _jsx(Input, { value: productForm.warehouseAddress.city, onChange: (e) => setProductForm({
                                                                        ...productForm,
                                                                        warehouseAddress: { ...productForm.warehouseAddress, city: e.target.value }
                                                                    }), placeholder: "H\u1ED3 Ch\u00ED Minh" })] }), _jsxs("div", { children: [_jsx(Label, { children: "T\u1EC9nh/Th\u00E0nh ph\u1ED1" }), _jsx(Input, { value: productForm.warehouseAddress.province, onChange: (e) => setProductForm({
                                                                        ...productForm,
                                                                        warehouseAddress: { ...productForm.warehouseAddress, province: e.target.value }
                                                                    }), placeholder: "B\u00ECnh T\u00E2n" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Qu\u1ED1c gia" }), _jsx(Input, { value: productForm.warehouseAddress.country, onChange: (e) => setProductForm({
                                                                        ...productForm,
                                                                        warehouseAddress: { ...productForm.warehouseAddress, country: e.target.value }
                                                                    }), placeholder: "Vietnam" })] }), _jsxs("div", { children: [_jsx(Label, { children: "M\u00E3 b\u01B0u \u0111i\u1EC7n" }), _jsx(Input, { value: productForm.warehouseAddress.postalCode, onChange: (e) => setProductForm({
                                                                        ...productForm,
                                                                        warehouseAddress: { ...productForm.warehouseAddress, postalCode: e.target.value }
                                                                    }), placeholder: "72000" })] })] })] })] }) }), _jsxs("div", { className: "flex justify-end gap-2 mt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setIsAddProductOpen(false), children: "H\u1EE7y" }), _jsx(Button, { onClick: handleAddProduct, disabled: !productForm.name || !productForm.brand || !productForm.price || productForm.images.length === 0, children: "Th\u00EAm s\u1EA3n ph\u1EA9m" })] })] }) }), _jsx(Dialog, { open: isEditProductOpen, onOpenChange: setIsEditProductOpen, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Ch\u1EC9nh s\u1EEDa s\u1EA3n ph\u1EA9m" }) }), _jsx(ScrollArea, { className: "max-h-[70vh] pr-4", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "T\u00EAn s\u1EA3n ph\u1EA9m" }), _jsx(Input, { value: productForm.name, onChange: (e) => setProductForm({ ...productForm, name: e.target.value }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Gi\u00E1 b\u00E1n" }), _jsx(Input, { type: "number", value: productForm.price, onChange: (e) => setProductForm({ ...productForm, price: Number(e.target.value) }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Gi\u00E1 khuy\u1EBFn m\u00E3i" }), _jsx(Input, { type: "number", value: productForm.salePrice || '', onChange: (e) => setProductForm({ ...productForm, salePrice: Number(e.target.value) || 0 }) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "S\u1ED1 l\u01B0\u1EE3ng trong kho" }), _jsx(Input, { type: "number", value: productForm.stock || '', onChange: (e) => setProductForm({ ...productForm, stock: Number(e.target.value) || 0 }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Danh m\u1EE5c (ph\u00E2n c\u00E1ch b\u1EB1ng d\u1EA5u ph\u1EA9y)" }), _jsx(Input, { value: productForm.categoryIds.join(', '), onChange: (e) => {
                                                                const categories = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                                                                setProductForm({ ...productForm, categoryIds: categories });
                                                            } })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "M\u00F4 t\u1EA3" }), _jsx(Textarea, { value: productForm.description, onChange: (e) => setProductForm({ ...productForm, description: e.target.value }), rows: 4 })] }), _jsxs("div", { children: [_jsx(Label, { children: "URL h\u00ECnh \u1EA3nh (m\u1ED7i URL m\u1ED9t d\u00F2ng)" }), _jsx(Textarea, { value: productForm.images.join('\n'), onChange: (e) => {
                                                        const images = e.target.value.split('\n').map(img => img.trim()).filter(img => img);
                                                        setProductForm({ ...productForm, images });
                                                    }, rows: 3 })] })] }) }), _jsxs("div", { className: "flex justify-end gap-2 mt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setIsEditProductOpen(false), children: "H\u1EE7y" }), _jsx(Button, { onClick: handleEditProduct, children: "L\u01B0u thay \u0111\u1ED5i" })] })] }) })] }) }));
}
