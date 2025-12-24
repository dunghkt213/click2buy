/**
 * EditProductPage - Trang chỉnh sửa sản phẩm
 * Design hiện đại với form đầy đủ các trường theo JSON structure
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { mediaApi } from '../../apis/media';
import { productService } from '../../apis/product/product.service';
import { productApi } from '../../apis/product/productApi';
import { useAppContext } from '../../providers/AppProvider';

// UI Components
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';

// Icons
import { ArrowLeft, DollarSign, Image as ImageIcon, Layers, Loader2, Package, Plus, Save, Tag, Warehouse, X } from 'lucide-react';

export function EditProductPage() {
  const navigate = useNavigate();
  const app = useAppContext();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stockChangeAmount, setStockChangeAmount] = useState('');
  const [updatingStock, setUpdatingStock] = useState(false);
  const [currentStock, setCurrentStock] = useState<number>(0);

  // State cho form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    stock: '',
    brand: '',
    condition: 'new' as 'new' | 'used',
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
  const [attributes, setAttributes] = useState<Array<{ key: string; value: string }>>([]);
  const [variants, setVariants] = useState<Array<{ key: string; value: string }>>([]);

  // State cho uploaded images
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; loading?: boolean }>>([]);
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
        const productData = await request<any>(`/products/${id}`, {
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
          condition: (productData.condition as 'new' | 'used') || 'new',
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
        } else if (productData.specifications) {
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
          setUploadedImages(existingImages.map((url: string) => ({ url, loading: false })));
        }

      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Không thể tải thông tin sản phẩm');
        navigate('/my-store');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [app.isLoggedIn, app.user?.role, navigate, id]);

  // Helper functions để parse input
  const parseArrayInput = (input: string): string[] => {
    if (!input.trim()) return [];
    return input.split(',').map(item => item.trim()).filter(item => item.length > 0);
  };

  // Convert attributes array to object
  const attributesToObject = (): Record<string, string> => {
    const result: Record<string, string> = {};
    attributes.forEach(attr => {
      if (attr.key.trim() && attr.value.trim()) {
        result[attr.key.trim()] = attr.value.trim();
      }
    });
    return result;
  };

  // Convert variants array to object
  const variantsToObject = (): Record<string, any> => {
    const result: Record<string, any> = {};
    variants.forEach(variant => {
      if (variant.key.trim() && variant.value.trim()) {
        // Try to parse value as JSON, otherwise use as string
        try {
          result[variant.key.trim()] = JSON.parse(variant.value.trim());
        } catch {
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

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: 'key' | 'value', value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    setAttributes(newAttributes);
  };

  // Helper functions để thêm/xóa variants
  const addVariant = () => {
    setVariants([...variants, { key: '', value: '' }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: 'key' | 'value', value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (error: any) {
      console.error('❌ [EditProductPage] Error updating product:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const updateWarehouseAddress = (field: string, value: string) => {
    setFormData({
      ...formData,
      warehouseAddress: {
        ...formData.warehouseAddress,
        [field]: value
      }
    });
  };

  // Handle image upload
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

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
      const results: Array<string> = [];

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
          } else {
            throw new Error('Không nhận được URL ảnh từ server');
          }
        } catch (error: any) {
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
      } else {
        toast.error('Không thể tải lên ảnh. Vui lòng thử lại');
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi tải ảnh lên');

      // Remove all loading placeholders on error
      setUploadedImages(prev => prev.filter(img => !img.loading || img.url));
    } finally {
      setUploading(false);
    }
  };

  // Remove uploaded image
  const removeImage = (index: number) => {
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
        const productData = await request<any>(`/products/${id}`, {
          method: 'GET',
          requireAuth: true,
        });

        const newStock = productData.stock || 0;
        setCurrentStock(newStock);
        setFormData({ ...formData, stock: newStock.toString() });
        setStockChangeAmount(''); // Reset input
      } else {
        toast.error(result.message || 'Có lỗi xảy ra khi cập nhật số lượng');
      }
    } catch (error: any) {
      console.error('❌ [EditProductPage] Error updating stock:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật số lượng');
    } finally {
      setUpdatingStock(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl pt-20 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/my-store')}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">Chỉnh sửa sản phẩm</h1>
          <p className="text-muted-foreground">Cập nhật thông tin chi tiết về sản phẩm của bạn</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cơ bản */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Thông tin cơ bản
            </CardTitle>
            <CardDescription>Thông tin chung về sản phẩm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">
                Tên sản phẩm <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên sản phẩm"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Mô tả sản phẩm</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết về sản phẩm..."
                rows={5}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">
                  Thương hiệu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Ví dụ: Apple, Samsung..."
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="condition">
                  Tình trạng <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value: 'new' | 'used') => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Mới</SelectItem>
                    <SelectItem value="used">Đã qua sử dụng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Giá cả và tồn kho */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Giá cả và tồn kho
            </CardTitle>
            <CardDescription>Thông tin về giá bán và số lượng tồn kho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">
                  Giá gốc (VND) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="29990000"
                  className="mt-1"
                  min="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="salePrice">Giá khuyến mãi (VND)</Label>
                <Input
                  id="salePrice"
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  placeholder="27990000"
                  className="mt-1"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentStock">
                  Số lượng trong kho <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={currentStock}
                  readOnly
                  className="mt-1 bg-muted cursor-not-allowed"
                />
              </div>
              <div>
                <Label htmlFor="stockChange">
                  Số lượng thay đổi
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="stockChange"
                    type="number"
                    value={stockChangeAmount}
                    onChange={(e) => setStockChangeAmount(e.target.value)}
                    placeholder="+5 hoặc -10"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleUpdateStock}
                    disabled={updatingStock || !stockChangeAmount || Number(stockChangeAmount) === 0}
                    className="shrink-0"
                  >
                    {updatingStock ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : (
                      'Cập nhật'
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Nhập số dương để thêm, số âm để giảm
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danh mục và thẻ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Danh mục và thẻ
            </CardTitle>
            <CardDescription>Phân loại sản phẩm để dễ dàng tìm kiếm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="categoryIds">Mã danh mục (phân cách bằng dấu phẩy)</Label>
              <Input
                id="categoryIds"
                value={formData.categoryIds}
                onChange={(e) => setFormData({ ...formData, categoryIds: e.target.value })}
                placeholder="cat123, cat456"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ví dụ: cat123, cat456, cat789
              </p>
            </div>

            <div>
              <Label htmlFor="tags">Thẻ (phân cách bằng dấu phẩy)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="smartphone, apple, premium"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ví dụ: smartphone, apple, premium, flagship
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Hình ảnh */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Hình ảnh sản phẩm
            </CardTitle>
            <CardDescription>Tải lên hình ảnh sản phẩm của bạn (JPEG, PNG, WEBP, GIF - tối đa 10MB mỗi ảnh)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Button */}
            <div>
              <Label htmlFor="image-upload">Tải ảnh lên</Label>
              <div className="mt-2">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  multiple
                  onChange={(e) => handleImageUpload(e.target.files)}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Chọn một hoặc nhiều ảnh để tải lên (có thể chọn nhiều ảnh cùng lúc)
                </p>
              </div>
            </div>

            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
              <div>
                <Label>Ảnh đã tải lên ({uploadedImages.filter(img => !img.loading).length})</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
                    >
                      {image.loading ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-xs text-muted-foreground">Đang tải...</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <img
                            src={image.url}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Error loading image:', image.url);
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ELỗi tải ảnh%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Xóa ảnh"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Thuộc tính */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Thuộc tính sản phẩm
            </CardTitle>
            <CardDescription>Thông tin kỹ thuật và đặc điểm sản phẩm (ví dụ: Màu sắc, Dung lượng, Kích thước màn hình...)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {attributes.map((attr, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Tên thuộc tính</Label>
                  <Input
                    value={attr.key}
                    onChange={(e) => updateAttribute(index, 'key', e.target.value)}
                    placeholder="Ví dụ: Màu sắc, Dung lượng..."
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label>Giá trị</Label>
                  <Input
                    value={attr.value}
                    onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                    placeholder="Ví dụ: Đen, 256GB..."
                    className="mt-1"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAttribute(index)}
                  className="shrink-0 mb-0.5"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addAttribute}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm thuộc tính
            </Button>
          </CardContent>
        </Card>

        {/* Biến thể */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Biến thể sản phẩm
            </CardTitle>
            <CardDescription>Các biến thể của sản phẩm (ví dụ: Kích thước, Phiên bản, Cấu hình...)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {variants.map((variant, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Tên biến thể</Label>
                  <Input
                    value={variant.key}
                    onChange={(e) => updateVariant(index, 'key', e.target.value)}
                    placeholder="Ví dụ: Kích thước, Phiên bản..."
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label>Giá trị</Label>
                  <Input
                    value={variant.value}
                    onChange={(e) => updateVariant(index, 'value', e.target.value)}
                    placeholder="Ví dụ: XL, Pro Max..."
                    className="mt-1"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVariant(index)}
                  className="shrink-0 mb-0.5"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addVariant}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm biến thể
            </Button>
          </CardContent>
        </Card>

        {/* Địa chỉ kho hàng */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="w-5 h-5" />
              Địa chỉ kho hàng
            </CardTitle>
            <CardDescription>Thông tin địa chỉ kho nơi lưu trữ sản phẩm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="warehouseLine1">
                Địa chỉ dòng 1 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="warehouseLine1"
                value={formData.warehouseAddress.line1}
                onChange={(e) => updateWarehouseAddress('line1', e.target.value)}
                placeholder="123 Nguyễn Trãi"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="warehouseLine2">Địa chỉ dòng 2</Label>
              <Input
                id="warehouseLine2"
                value={formData.warehouseAddress.line2}
                onChange={(e) => updateWarehouseAddress('line2', e.target.value)}
                placeholder="Tầng 2, Phòng 201"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warehouseCity">
                  Thành phố <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="warehouseCity"
                  value={formData.warehouseAddress.city}
                  onChange={(e) => updateWarehouseAddress('city', e.target.value)}
                  placeholder="Hà Nội"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="warehouseProvince">Tỉnh/Thành phố</Label>
                <Input
                  id="warehouseProvince"
                  value={formData.warehouseAddress.province}
                  onChange={(e) => updateWarehouseAddress('province', e.target.value)}
                  placeholder="Thanh Xuân"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warehouseCountry">
                  Quốc gia <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="warehouseCountry"
                  value={formData.warehouseAddress.country}
                  onChange={(e) => updateWarehouseAddress('country', e.target.value)}
                  placeholder="Việt Nam"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="warehousePostalCode">Mã bưu điện</Label>
                <Input
                  id="warehousePostalCode"
                  value={formData.warehouseAddress.postalCode}
                  onChange={(e) => updateWarehouseAddress('postalCode', e.target.value)}
                  placeholder="100000"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/my-store')}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button type="submit" className="min-w-[120px]" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Cập nhật sản phẩm
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

