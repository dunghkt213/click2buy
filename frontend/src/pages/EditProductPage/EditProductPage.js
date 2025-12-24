import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * EditProductPage - Trang chỉnh sửa sản phẩm
 * Design hiện đại với form đầy đủ các trường theo JSON structure
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppContext } from '../../providers/AppProvider';
import { productService } from '../../apis/product/product.service';
import { productApi } from '../../apis/product/productApi';
import { mediaApi } from '../../apis/media';
// UI Components
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
// Icons
import { ArrowLeft, DollarSign, Image as ImageIcon, Layers, Package, Plus, Save, Tag, Warehouse, X, Loader2 } from 'lucide-react';
export function EditProductPage() {
    const navigate = useNavigate();
    const app = useAppContext();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stockChangeAmount, setStockChangeAmount] = useState('');
    const [updatingStock, setUpdatingStock] = useState(false);
    const [currentStock, setCurrentStock] = useState(0);
    // State cho form
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        salePrice: '',
        stock: '',
        brand: '',
        condition: 'new',
        categoryIds: '',
        tags: '',
        images: '',
        warehouseAddress: {
            line1: '',
            line2: '',
            city: '',
            province: '',
            country: 'Việt Nam',
            postalCode: ''
        }
    });
    // State cho attributes và variants (mảng các cặp key-value)
    const [attributes, setAttributes] = useState([]);
    const [variants, setVariants] = useState([]);
    // State cho uploaded images
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    // Kiểm tra quyền truy cập và load dữ liệu sản phẩm
    useEffect(() => {
        const loadProduct = async () => {
            if (!app.isLoggedIn) {
                navigate('/login');
                return;
            }
            if (app.user?.role !== 'seller') {
                toast.error('Bạn không có quyền truy cập trang này');
                navigate('/my-store');
                return;
            }
            if (!id) {
                toast.error('Không tìm thấy ID sản phẩm');
                navigate('/my-store');
                return;
            }
            try {
                setLoading(true);
                // Get raw product data từ API để có đầy đủ thông tin (warehouseAddress, categoryIds, tags, variants)
                const { request } = await import('../../apis/client/apiClient');
                const productData = await request(`/products/${id}`, {
                    method: 'GET',
                    requireAuth: true,
                });
                // Kiểm tra xem user có phải owner không
                if (productData.ownerId && app.user?.id && productData.ownerId !== app.user.id) {
                    toast.error('Bạn không có quyền chỉnh sửa sản phẩm này');
                    navigate('/my-store');
                    return;
                }
                // Điền form với dữ liệu sản phẩm từ productData
                const salePrice = productData.salePrice || productData.sale_price;
                const originalPrice = productData.price;
                const stockValue = productData.stock || 0;
                setCurrentStock(stockValue);
                setFormData({
                    name: productData.name || '',
                    description: productData.description || '',
                    price: originalPrice?.toString() || '',
                    salePrice: salePrice && salePrice < originalPrice ? salePrice.toString() : '',
                    stock: stockValue.toString(),
                    brand: productData.brand || '',
                    condition: productData.condition || 'new',
                    categoryIds: Array.isArray(productData.categoryIds)
                        ? productData.categoryIds.join(', ')
                        : '',
                    tags: Array.isArray(productData.tags)
                        ? productData.tags.join(', ')
                        : '',
                    images: '', // Không cần lưu vào formData nữa, sẽ dùng uploadedImages
                    warehouseAddress: productData.warehouseAddress || {
                        line1: '',
                        line2: '',
                        city: '',
                        province: '',
                        country: 'Việt Nam',
                        postalCode: ''
                    }
                });
                // Load attributes
                if (productData.attributes) {
                    const attrs = Object.entries(productData.attributes).map(([key, value]) => ({
                        key,
                        value: typeof value === 'string' ? value : JSON.stringify(value)
                    }));
                    setAttributes(attrs);
                }
                else if (productData.specifications) {
                    const attrs = Object.entries(productData.specifications).map(([key, value]) => ({
                        key,
                        value: typeof value === 'string' ? value : JSON.stringify(value)
                    }));
                    setAttributes(attrs);
                }
                // Load variants (nếu có trong product data)
                if (productData.variants) {
                    const vars = Object.entries(productData.variants).map(([key, value]) => ({
                        key,
                        value: typeof value === 'string' ? value : JSON.stringify(value)
                    }));
                    setVariants(vars);
                }
                // Load existing images vào uploadedImages
                const existingImages = Array.isArray(productData.images) && productData.images.length > 0
                    ? productData.images
                    : (productData.image ? [productData.image] : []);
                if (existingImages.length > 0) {
                    setUploadedImages(existingImages.map(url => ({ url, loading: false })));
                }
            }
            catch (error) {
                console.error('Error loading product:', error);
                toast.error('Không thể tải thông tin sản phẩm');
                navigate('/my-store');
            }
            finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [app.isLoggedIn, app.user?.role, navigate, id]);
    // Helper functions để parse input
    const parseArrayInput = (input) => {
        if (!input.trim())
            return [];
        return input.split(',').map(item => item.trim()).filter(item => item.length > 0);
    };
    // Convert attributes array to object
    const attributesToObject = () => {
        const result = {};
        attributes.forEach(attr => {
            if (attr.key.trim() && attr.value.trim()) {
                result[attr.key.trim()] = attr.value.trim();
            }
        });
        return result;
    };
    // Convert variants array to object
    const variantsToObject = () => {
        const result = {};
        variants.forEach(variant => {
            if (variant.key.trim() && variant.value.trim()) {
                // Try to parse value as JSON, otherwise use as string
                try {
                    result[variant.key.trim()] = JSON.parse(variant.value.trim());
                }
                catch {
                    result[variant.key.trim()] = variant.value.trim();
                }
            }
        });
        return result;
    };
    // Helper functions để thêm/xóa attributes
    const addAttribute = () => {
        setAttributes([...attributes, { key: '', value: '' }]);
    };
    const removeAttribute = (index) => {
        setAttributes(attributes.filter((_, i) => i !== index));
    };
    const updateAttribute = (index, field, value) => {
        const newAttributes = [...attributes];
        newAttributes[index] = { ...newAttributes[index], [field]: value };
        setAttributes(newAttributes);
    };
    // Helper functions để thêm/xóa variants
    const addVariant = () => {
        setVariants([...variants, { key: '', value: '' }]);
    };
    const removeVariant = (index) => {
        setVariants(variants.filter((_, i) => i !== index));
    };
    const updateVariant = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!id) {
            toast.error('Không tìm thấy ID sản phẩm');
            return;
        }
        // Validate required fields (không validate stock vì đã có API riêng để update)
        if (!formData.name || !formData.price || !formData.brand) {
            toast.error('Vui lòng điền đầy đủ các trường bắt buộc (*)');
            return;
        }
        // Validate warehouse address required fields
        if (!formData.warehouseAddress.line1 || !formData.warehouseAddress.city || !formData.warehouseAddress.country) {
            toast.error('Vui lòng điền đầy đủ địa chỉ kho hàng (Địa chỉ dòng 1, Thành phố, Quốc gia)');
            return;
        }
        // Validate images - chỉ sử dụng uploaded images
        const images = uploadedImages
            .filter(img => !img.loading && img.url.length > 0)
            .map(img => img.url);
        if (images.length === 0) {
            toast.error('Vui lòng tải lên ít nhất một hình ảnh cho sản phẩm');
            return;
        }
        try {
            setSaving(true);
            // Parse arrays and objects
            const categoryIds = parseArrayInput(formData.categoryIds);
            const tags = parseArrayInput(formData.tags);
            const attributesObj = attributesToObject();
            const variantsObj = variantsToObject();
            const updateData = {
                name: formData.name,
                description: formData.description || undefined,
                price: Number(formData.price),
                salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
                // Không gửi stock trong update này vì đã có API riêng PATCH /products/:id/stock
                brand: formData.brand,
                condition: formData.condition,
                categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
                tags: tags.length > 0 ? tags : undefined,
                images: images,
                attributes: Object.keys(attributesObj).length > 0 ? attributesObj : undefined,
                variants: Object.keys(variantsObj).length > 0 ? variantsObj : undefined,
                warehouseAddress: formData.warehouseAddress,
            };
            console.log('📦 [EditProductPage] Updating product with data:', updateData);
            await productService.update(id, updateData);
            toast.success('Cập nhật sản phẩm thành công!');
            // Reload store products - trigger reload bằng cách gọi lại API
            // The store will reload automatically when navigating back
            navigate('/my-store');
        }
        catch (error) {
            console.error('❌ [EditProductPage] Error updating product:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật sản phẩm');
        }
        finally {
            setSaving(false);
        }
    };
    const updateWarehouseAddress = (field, value) => {
        setFormData({
            ...formData,
            warehouseAddress: {
                ...formData.warehouseAddress,
                [field]: value
            }
        });
    };
    // Handle image upload
    const handleImageUpload = async (files) => {
        if (!files || files.length === 0)
            return;
        const fileArray = Array.from(files);
        // Validate file types
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));
        if (invalidFiles.length > 0) {
            toast.error('Chỉ chấp nhận file ảnh (JPEG, PNG, WEBP, GIF)');
            return;
        }
        // Validate file size (max 10MB per file)
        const maxSize = 10 * 1024 * 1024; // 10MB
        const oversizedFiles = fileArray.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            toast.error('Kích thước file không được vượt quá 10MB');
            return;
        }
        setUploading(true);
        // Get current length to track new placeholders
        const currentLength = uploadedImages.length;
        // Add loading placeholders
        const loadingPlaceholders = fileArray.map(() => ({ url: '', loading: true }));
        setUploadedImages(prev => [...prev, ...loadingPlaceholders]);
        try {
            // Upload all files sequentially
            const results = [];
            for (let i = 0; i < fileArray.length; i++) {
                try {
                    const response = await mediaApi.upload(fileArray[i]);
                    // Extract thumbnailUrl from response
                    const imageUrl = response?.url?.thumbnailUrl || '';
                    if (imageUrl) {
                        results.push(imageUrl);
                        // Update the specific placeholder with the result
                        setUploadedImages(prev => {
                            const newImages = [...prev];
                            const targetIndex = currentLength + i;
                            if (targetIndex < newImages.length && newImages[targetIndex].loading) {
                                newImages[targetIndex] = { url: imageUrl, loading: false };
                            }
                            return newImages;
                        });
                    }
                    else {
                        throw new Error('Không nhận được URL ảnh từ server');
                    }
                }
                catch (error) {
                    console.error(`Error uploading file ${i + 1}:`, error);
                    toast.error(`Lỗi khi tải ảnh ${i + 1}: ${error?.message || 'Không xác định'}`);
                    // Remove the failed placeholder
                    setUploadedImages(prev => {
                        const newImages = [...prev];
                        const targetIndex = currentLength + i;
                        if (targetIndex < newImages.length && newImages[targetIndex].loading) {
                            newImages.splice(targetIndex, 1);
                        }
                        return newImages;
                    });
                }
            }
            if (results.length > 0) {
                toast.success(`Đã tải lên ${results.length}/${fileArray.length} ảnh thành công`);
            }
            else {
                toast.error('Không thể tải lên ảnh. Vui lòng thử lại');
            }
        }
        catch (error) {
            console.error('Error uploading images:', error);
            toast.error(error?.message || 'Có lỗi xảy ra khi tải ảnh lên');
            // Remove all loading placeholders on error
            setUploadedImages(prev => prev.filter(img => !img.loading || img.url));
        }
        finally {
            setUploading(false);
        }
    };
    // Remove uploaded image
    const removeImage = (index) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };
    // Xử lý cập nhật số lượng tồn kho
    const handleUpdateStock = async () => {
        if (!id) {
            toast.error('Không tìm thấy ID sản phẩm');
            return;
        }
        const amount = Number(stockChangeAmount);
        if (isNaN(amount) || amount === 0) {
            toast.error('Vui lòng nhập số lượng thay đổi hợp lệ (khác 0)');
            return;
        }
        try {
            setUpdatingStock(true);
            const result = await productApi.updateStock(id, amount);
            if (result.success) {
                toast.success(result.message || 'Cập nhật số lượng thành công');
                // Reload lại product data để cập nhật số lượng hiện tại
                const { request } = await import('../../apis/client/apiClient');
                const productData = await request(`/products/${id}`, {
                    method: 'GET',
                    requireAuth: true,
                });
                const newStock = productData.stock || 0;
                setCurrentStock(newStock);
                setFormData({ ...formData, stock: newStock.toString() });
                setStockChangeAmount(''); // Reset input
            }
            else {
                toast.error(result.message || 'Có lỗi xảy ra khi cập nhật số lượng');
            }
        }
        catch (error) {
            console.error('❌ [EditProductPage] Error updating stock:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật số lượng');
        }
        finally {
            setUpdatingStock(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "container mx-auto px-4 py-8 max-w-5xl pt-20 min-h-screen flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "w-8 h-8 animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "\u0110ang t\u1EA3i th\u00F4ng tin s\u1EA3n ph\u1EA9m..." })] }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8 max-w-5xl pt-20 min-h-screen", children: [_jsxs("div", { className: "mb-8 flex items-center gap-4", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => navigate('/my-store'), className: "shrink-0", children: _jsx(ArrowLeft, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: "Ch\u1EC9nh s\u1EEDa s\u1EA3n ph\u1EA9m" }), _jsx("p", { className: "text-muted-foreground", children: "C\u1EADp nh\u1EADt th\u00F4ng tin chi ti\u1EBFt v\u1EC1 s\u1EA3n ph\u1EA9m c\u1EE7a b\u1EA1n" })] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Package, { className: "w-5 h-5" }), "Th\u00F4ng tin c\u01A1 b\u1EA3n"] }), _jsx(CardDescription, { children: "Th\u00F4ng tin chung v\u1EC1 s\u1EA3n ph\u1EA9m" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs(Label, { htmlFor: "name", children: ["T\u00EAn s\u1EA3n ph\u1EA9m ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "Nh\u1EADp t\u00EAn s\u1EA3n ph\u1EA9m", className: "mt-1", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "description", children: "M\u00F4 t\u1EA3 s\u1EA3n ph\u1EA9m" }), _jsx(Textarea, { id: "description", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), placeholder: "M\u00F4 t\u1EA3 chi ti\u1EBFt v\u1EC1 s\u1EA3n ph\u1EA9m...", rows: 5, className: "mt-1" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs(Label, { htmlFor: "brand", children: ["Th\u01B0\u01A1ng hi\u1EC7u ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "brand", value: formData.brand, onChange: (e) => setFormData({ ...formData, brand: e.target.value }), placeholder: "V\u00ED d\u1EE5: Apple, Samsung...", className: "mt-1", required: true })] }), _jsxs("div", { children: [_jsxs(Label, { htmlFor: "condition", children: ["T\u00ECnh tr\u1EA1ng ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs(Select, { value: formData.condition, onValueChange: (value) => setFormData({ ...formData, condition: value }), children: [_jsx(SelectTrigger, { className: "mt-1", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "new", children: "M\u1EDBi" }), _jsx(SelectItem, { value: "used", children: "\u0110\u00E3 qua s\u1EED d\u1EE5ng" })] })] })] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-5 h-5" }), "Gi\u00E1 c\u1EA3 v\u00E0 t\u1ED3n kho"] }), _jsx(CardDescription, { children: "Th\u00F4ng tin v\u1EC1 gi\u00E1 b\u00E1n v\u00E0 s\u1ED1 l\u01B0\u1EE3ng t\u1ED3n kho" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs(Label, { htmlFor: "price", children: ["Gi\u00E1 g\u1ED1c (VND) ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "price", type: "number", value: formData.price, onChange: (e) => setFormData({ ...formData, price: e.target.value }), placeholder: "29990000", className: "mt-1", min: "0", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "salePrice", children: "Gi\u00E1 khuy\u1EBFn m\u00E3i (VND)" }), _jsx(Input, { id: "salePrice", type: "number", value: formData.salePrice, onChange: (e) => setFormData({ ...formData, salePrice: e.target.value }), placeholder: "27990000", className: "mt-1", min: "0" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs(Label, { htmlFor: "currentStock", children: ["S\u1ED1 l\u01B0\u1EE3ng trong kho ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "currentStock", type: "number", value: currentStock, readOnly: true, className: "mt-1 bg-muted cursor-not-allowed" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "stockChange", children: "S\u1ED1 l\u01B0\u1EE3ng thay \u0111\u1ED5i" }), _jsxs("div", { className: "flex gap-2 mt-1", children: [_jsx(Input, { id: "stockChange", type: "number", value: stockChangeAmount, onChange: (e) => setStockChangeAmount(e.target.value), placeholder: "+5 ho\u1EB7c -10", className: "flex-1" }), _jsx(Button, { type: "button", onClick: handleUpdateStock, disabled: updatingStock || !stockChangeAmount || Number(stockChangeAmount) === 0, className: "shrink-0", children: updatingStock ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "\u0110ang c\u1EADp nh\u1EADt..."] })) : ('Cập nhật') })] }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Nh\u1EADp s\u1ED1 d\u01B0\u01A1ng \u0111\u1EC3 th\u00EAm, s\u1ED1 \u00E2m \u0111\u1EC3 gi\u1EA3m" })] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Tag, { className: "w-5 h-5" }), "Danh m\u1EE5c v\u00E0 th\u1EBB"] }), _jsx(CardDescription, { children: "Ph\u00E2n lo\u1EA1i s\u1EA3n ph\u1EA9m \u0111\u1EC3 d\u1EC5 d\u00E0ng t\u00ECm ki\u1EBFm" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "categoryIds", children: "M\u00E3 danh m\u1EE5c (ph\u00E2n c\u00E1ch b\u1EB1ng d\u1EA5u ph\u1EA9y)" }), _jsx(Input, { id: "categoryIds", value: formData.categoryIds, onChange: (e) => setFormData({ ...formData, categoryIds: e.target.value }), placeholder: "cat123, cat456", className: "mt-1" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "V\u00ED d\u1EE5: cat123, cat456, cat789" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "tags", children: "Th\u1EBB (ph\u00E2n c\u00E1ch b\u1EB1ng d\u1EA5u ph\u1EA9y)" }), _jsx(Input, { id: "tags", value: formData.tags, onChange: (e) => setFormData({ ...formData, tags: e.target.value }), placeholder: "smartphone, apple, premium", className: "mt-1" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "V\u00ED d\u1EE5: smartphone, apple, premium, flagship" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(ImageIcon, { className: "w-5 h-5" }), "H\u00ECnh \u1EA3nh s\u1EA3n ph\u1EA9m"] }), _jsx(CardDescription, { children: "T\u1EA3i l\u00EAn h\u00ECnh \u1EA3nh s\u1EA3n ph\u1EA9m c\u1EE7a b\u1EA1n (JPEG, PNG, WEBP, GIF - t\u1ED1i \u0111a 10MB m\u1ED7i \u1EA3nh)" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "image-upload", children: "T\u1EA3i \u1EA3nh l\u00EAn" }), _jsxs("div", { className: "mt-2", children: [_jsx(Input, { id: "image-upload", type: "file", accept: "image/jpeg,image/jpg,image/png,image/webp,image/gif", multiple: true, onChange: (e) => handleImageUpload(e.target.files), disabled: uploading, className: "cursor-pointer" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Ch\u1ECDn m\u1ED9t ho\u1EB7c nhi\u1EC1u \u1EA3nh \u0111\u1EC3 t\u1EA3i l\u00EAn (c\u00F3 th\u1EC3 ch\u1ECDn nhi\u1EC1u \u1EA3nh c\u00F9ng l\u00FAc)" })] })] }), uploadedImages.length > 0 && (_jsxs("div", { children: [_jsxs(Label, { children: ["\u1EA2nh \u0111\u00E3 t\u1EA3i l\u00EAn (", uploadedImages.filter(img => !img.loading).length, ")"] }), _jsx("div", { className: "mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: uploadedImages.map((image, index) => (_jsx("div", { className: "relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted", children: image.loading ? (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "\u0110ang t\u1EA3i..." })] }) })) : (_jsxs(_Fragment, { children: [_jsx("img", { src: image.url, alt: `Product image ${index + 1}`, className: "w-full h-full object-cover", onError: (e) => {
                                                                    console.error('Error loading image:', image.url);
                                                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ELỗi tải ảnh%3C/text%3E%3C/svg%3E';
                                                                } }), _jsx("button", { type: "button", onClick: () => removeImage(index), className: "absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity", title: "X\u00F3a \u1EA3nh", children: _jsx(X, { className: "w-4 h-4" }) })] })) }, index))) })] }))] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Layers, { className: "w-5 h-5" }), "Thu\u1ED9c t\u00EDnh s\u1EA3n ph\u1EA9m"] }), _jsx(CardDescription, { children: "Th\u00F4ng tin k\u1EF9 thu\u1EADt v\u00E0 \u0111\u1EB7c \u0111i\u1EC3m s\u1EA3n ph\u1EA9m (v\u00ED d\u1EE5: M\u00E0u s\u1EAFc, Dung l\u01B0\u1EE3ng, K\u00EDch th\u01B0\u1EDBc m\u00E0n h\u00ECnh...)" })] }), _jsxs(CardContent, { className: "space-y-3", children: [attributes.map((attr, index) => (_jsxs("div", { className: "flex gap-2 items-end", children: [_jsxs("div", { className: "flex-1", children: [_jsx(Label, { children: "T\u00EAn thu\u1ED9c t\u00EDnh" }), _jsx(Input, { value: attr.key, onChange: (e) => updateAttribute(index, 'key', e.target.value), placeholder: "V\u00ED d\u1EE5: M\u00E0u s\u1EAFc, Dung l\u01B0\u1EE3ng...", className: "mt-1" })] }), _jsxs("div", { className: "flex-1", children: [_jsx(Label, { children: "Gi\u00E1 tr\u1ECB" }), _jsx(Input, { value: attr.value, onChange: (e) => updateAttribute(index, 'value', e.target.value), placeholder: "V\u00ED d\u1EE5: \u0110en, 256GB...", className: "mt-1" })] }), _jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => removeAttribute(index), className: "shrink-0 mb-0.5", children: _jsx(X, { className: "w-4 h-4" }) })] }, index))), _jsxs(Button, { type: "button", variant: "outline", onClick: addAttribute, className: "w-full", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Th\u00EAm thu\u1ED9c t\u00EDnh"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Layers, { className: "w-5 h-5" }), "Bi\u1EBFn th\u1EC3 s\u1EA3n ph\u1EA9m"] }), _jsx(CardDescription, { children: "C\u00E1c bi\u1EBFn th\u1EC3 c\u1EE7a s\u1EA3n ph\u1EA9m (v\u00ED d\u1EE5: K\u00EDch th\u01B0\u1EDBc, Phi\u00EAn b\u1EA3n, C\u1EA5u h\u00ECnh...)" })] }), _jsxs(CardContent, { className: "space-y-3", children: [variants.map((variant, index) => (_jsxs("div", { className: "flex gap-2 items-end", children: [_jsxs("div", { className: "flex-1", children: [_jsx(Label, { children: "T\u00EAn bi\u1EBFn th\u1EC3" }), _jsx(Input, { value: variant.key, onChange: (e) => updateVariant(index, 'key', e.target.value), placeholder: "V\u00ED d\u1EE5: K\u00EDch th\u01B0\u1EDBc, Phi\u00EAn b\u1EA3n...", className: "mt-1" })] }), _jsxs("div", { className: "flex-1", children: [_jsx(Label, { children: "Gi\u00E1 tr\u1ECB" }), _jsx(Input, { value: variant.value, onChange: (e) => updateVariant(index, 'value', e.target.value), placeholder: "V\u00ED d\u1EE5: XL, Pro Max...", className: "mt-1" })] }), _jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => removeVariant(index), className: "shrink-0 mb-0.5", children: _jsx(X, { className: "w-4 h-4" }) })] }, index))), _jsxs(Button, { type: "button", variant: "outline", onClick: addVariant, className: "w-full", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Th\u00EAm bi\u1EBFn th\u1EC3"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Warehouse, { className: "w-5 h-5" }), "\u0110\u1ECBa ch\u1EC9 kho h\u00E0ng"] }), _jsx(CardDescription, { children: "Th\u00F4ng tin \u0111\u1ECBa ch\u1EC9 kho n\u01A1i l\u01B0u tr\u1EEF s\u1EA3n ph\u1EA9m" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs(Label, { htmlFor: "warehouseLine1", children: ["\u0110\u1ECBa ch\u1EC9 d\u00F2ng 1 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "warehouseLine1", value: formData.warehouseAddress.line1, onChange: (e) => updateWarehouseAddress('line1', e.target.value), placeholder: "123 Nguy\u1EC5n Tr\u00E3i", className: "mt-1", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "warehouseLine2", children: "\u0110\u1ECBa ch\u1EC9 d\u00F2ng 2" }), _jsx(Input, { id: "warehouseLine2", value: formData.warehouseAddress.line2, onChange: (e) => updateWarehouseAddress('line2', e.target.value), placeholder: "T\u1EA7ng 2, Ph\u00F2ng 201", className: "mt-1" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs(Label, { htmlFor: "warehouseCity", children: ["Th\u00E0nh ph\u1ED1 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "warehouseCity", value: formData.warehouseAddress.city, onChange: (e) => updateWarehouseAddress('city', e.target.value), placeholder: "H\u00E0 N\u1ED9i", className: "mt-1", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "warehouseProvince", children: "T\u1EC9nh/Th\u00E0nh ph\u1ED1" }), _jsx(Input, { id: "warehouseProvince", value: formData.warehouseAddress.province, onChange: (e) => updateWarehouseAddress('province', e.target.value), placeholder: "Thanh Xu\u00E2n", className: "mt-1" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs(Label, { htmlFor: "warehouseCountry", children: ["Qu\u1ED1c gia ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "warehouseCountry", value: formData.warehouseAddress.country, onChange: (e) => updateWarehouseAddress('country', e.target.value), placeholder: "Vi\u1EC7t Nam", className: "mt-1", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "warehousePostalCode", children: "M\u00E3 b\u01B0u \u0111i\u1EC7n" }), _jsx(Input, { id: "warehousePostalCode", value: formData.warehouseAddress.postalCode, onChange: (e) => updateWarehouseAddress('postalCode', e.target.value), placeholder: "100000", className: "mt-1" })] })] })] })] }), _jsxs("div", { className: "flex justify-end gap-4 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => navigate('/my-store'), disabled: saving, children: "H\u1EE7y" }), _jsx(Button, { type: "submit", className: "min-w-[120px]", disabled: saving, children: saving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "\u0110ang l\u01B0u..."] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "C\u1EADp nh\u1EADt s\u1EA3n ph\u1EA9m"] })) })] })] })] }));
}
