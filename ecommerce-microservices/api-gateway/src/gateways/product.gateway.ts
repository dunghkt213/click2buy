import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Headers, UseGuards, BadRequestException, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { ConfigService } from '@nestjs/config';
import { AiImageGuard } from '../guards/ai-image.guard';
import { AiImageType } from '../decorators/ai-image-type.decorator';
import { AiService } from '../modules/ai-guard/ai.service';
import { firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';

@Controller('products')
export class ProductGateway {
  private readonly logger = new Logger(ProductGateway.name);
  private readonly MAX_PRODUCTS_TO_CHECK = 20;

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka,
    private readonly aiService: AiService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.kafka.subscribeToResponseOf('product.create');
    this.kafka.subscribeToResponseOf('product.findAll');
    this.kafka.subscribeToResponseOf('product.findOne');
    this.kafka.subscribeToResponseOf('product.update');
    this.kafka.subscribeToResponseOf('product.remove');
    this.kafka.subscribeToResponseOf('product.search');
    this.kafka.subscribeToResponseOf('product.findBySeller');

    this.kafka.subscribeToResponseOf('inventory.getStock.request');
    this.kafka.subscribeToResponseOf('inventory.addStock');
    this.kafka.subscribeToResponseOf('inventory.adjustStock');
    this.kafka.subscribeToResponseOf('inventory.getStock.batch');

    this.kafka.subscribeToResponseOf('product.seller.findAll');
    
    await this.kafka.connect();
  }
  // ============================================================
  // GET ALL PRODUCTS (SELLER)
  // ============================================================
  @Get('seller')
async findAllOfSeller(
  @Query() q: any,
  @Headers('authorization') auth?: string,
) {
  const result = await firstValueFrom(
    this.kafka.send<any>('product.seller.findAll', { q, auth })
  );

  const products = result?.data ?? [];

  if (products.length === 0) {
    return {
      success: result.success,
      data: [],
      pagination: result.pagination,
    };
  }

  const productIds = products.map(p => p._id || p.id);

  const stocks = await firstValueFrom(
    this.kafka.send<any[]>(
      'inventory.getStock.batch',
      { productIds }
    )
  );

  const stockMap = new Map(
    stocks.map(s => [s.productId, s])
  );

  const mergedProducts = products.map(p => {
    const stock = stockMap.get(p._id || p.id);
    return {
      ...p,
      stock: stock?.availableStock ?? 0,
      reservedStock: stock?.reservedStock ?? 0,
      soldStock: stock?.soldStock ?? 0,
      status: stock?.status ?? "OUT_OF_STOCK",
    };
  });

  return {
    success: result.success,
    data: mergedProducts,
    pagination: result.pagination,
  };
}


  // ============================================================
  // GET ONE PRODUCT OF SELLER
  // ============================================================
  @Get('seller/:id')
  async findOneOfSeller(
    @Param('id') id: string,
    @Headers('authorization') auth?: string,
  ) {
   // 1. Gọi product-service
   const product = await firstValueFrom(
    this.kafka.send('product.seller.findOne', { id , auth })
  );

  if (!product) return product;
console.log("Product in gateway: ", product);
  // 2. Gọi inventory-service → inventory.getStock.request
  const stock = await firstValueFrom(
    this.kafka.send('inventory.getStock.request', { productId: id })
  );
  console.log("Stock in gateway: ", stock);

  // 3. Merge
  return {
    ...product,
    stock: stock?.availableStock ?? 0,
    reservedStock: stock?.reservedStock ?? 0,
  };
  }
  

  // ============================================================
  // CREATE PRODUCT
  // ============================================================
  @Post()
  @UseGuards(AiImageGuard)
  @AiImageType('PRODUCT_IMAGE')
  async create(@Body() dto: any, @Headers('authorization') auth?: string) {
    // Kiểm tra trùng nội dung trước khi tạo sản phẩm
    // Test: POST /products với body chứa:
    // - name, description (để test text similarity)
    // - images: ["url1", "url2"] (để test image similarity)
    // - Cần JWT token của seller trong Authorization header
    // Threshold: TEXT_DUPLICATE_THRESHOLD_PERCENT=50, IMAGE_DUPLICATE_THRESHOLD_PERCENT=70
    await this.checkDuplicateContent(dto, auth);
    
    return this.kafka.send('product.create', { dto, auth });
  }

  /**
   * Kiểm tra trùng nội dung sản phẩm với các sản phẩm cũ của cùng seller
   * Bao gồm: Text similarity + Image similarity
   * Fail-safe: Nếu lỗi, cho phép tạo sản phẩm
   */
  private async checkDuplicateContent(dto: any, auth?: string): Promise<void> {
    try {
      // 1. Trích sellerId từ JWT
      const sellerId = this.extractSellerIdFromAuth(auth);
      if (!sellerId) {
        this.logger.debug('[Duplicate Check] Không tìm thấy sellerId, bỏ qua kiểm tra');
        return;
      }

      this.logger.log(`[Duplicate Check] Kiểm tra trùng nội dung cho seller: ${sellerId}`);

      // 2. Lấy sản phẩm cũ của seller
      const existingProductsResult = await firstValueFrom(
        this.kafka.send('product.findBySeller', { 
          sellerId, 
          limit: this.MAX_PRODUCTS_TO_CHECK 
        })
      );

      if (!existingProductsResult?.success || !existingProductsResult?.data?.length) {
        this.logger.debug('[Duplicate Check] Seller chưa có sản phẩm nào');
        return;
      }

      const existingProducts = existingProductsResult.data;
      this.logger.debug(`[Duplicate Check] Tìm thấy ${existingProducts.length} sản phẩm cũ`);

      // 3. Kiểm tra Text Similarity
      let textSimilarity = 0;
      let textProductId: string | undefined;

      const newProductText = this.aiService.normalizeTextForComparison(dto);
      if (newProductText.length >= 30) {
        const oldProductsForComparison = existingProducts
          .map(oldProduct => {
            const text = this.aiService.normalizeTextForComparison(oldProduct);
            return {
              productId: oldProduct._id,
              text,
            };
          })
          .filter(p => p.text.length >= 30);

        if (oldProductsForComparison.length > 0) {
          this.logger.log(`[Duplicate Check] Text: So sánh với ${oldProductsForComparison.length} sản phẩm cũ`);
          
          const textBatchResult = await this.aiService.compareSimilarityBatch(newProductText, oldProductsForComparison);
          if (textBatchResult) {
            textSimilarity = textBatchResult.maxSimilarity;
            textProductId = textBatchResult.productId;
            this.logger.log(`[Duplicate Check] Text similarity: ${textSimilarity}%, productId: ${textProductId}`);
          }
        }
      }

      // 4. Kiểm tra Image Similarity
      let imageSimilarity = 0;
      let imageProductId: string | undefined;

      const newProductImages = dto.images;
      if (Array.isArray(newProductImages) && newProductImages.length > 0) {
        // Lấy ảnh đại diện từ sản phẩm cũ (ảnh đầu tiên nếu có)
        const oldProductImages = existingProducts
          .map(oldProduct => {
            const hasValidImages = Array.isArray(oldProduct.images) && oldProduct.images.length > 0;
            const firstImage = hasValidImages ? oldProduct.images[0] : null;
            
            return {
              productId: oldProduct._id,
              image: firstImage
            };
          })
          .filter(p => p.image && typeof p.image === 'string' && p.image.trim().length > 0); // Chỉ lấy sản phẩm có ảnh hợp lệ

        if (oldProductImages.length > 0) {
          this.logger.log(`[Duplicate Check] Image: So sánh với ${oldProductImages.length} sản phẩm cũ có ảnh`);
          
          const imageBatchResult = await this.aiService.compareImageSimilarityBatch(
            newProductImages, 
            oldProductImages
          );
          
          if (imageBatchResult) {
            imageSimilarity = imageBatchResult.maxSimilarity;
            imageProductId = imageBatchResult.productId;
            this.logger.log(`[Duplicate Check] Image similarity: ${imageSimilarity}%, productId: ${imageProductId}, reason: ${imageBatchResult.reason}`);
          } else {
            this.logger.warn('[Duplicate Check] AI Image comparison trả về null');
          }
        } else {
          this.logger.debug('[Duplicate Check] Không có sản phẩm cũ nào có ảnh hợp lệ để so sánh');
        }
      } else {
        this.logger.debug('[Duplicate Check] Sản phẩm mới không có ảnh');
      }

      // 5. Kiểm tra ngưỡng chặn
      const textThreshold = this.configService.get<number>('TEXT_DUPLICATE_THRESHOLD_PERCENT', 50);
      const imageThreshold = this.configService.get<number>('IMAGE_DUPLICATE_THRESHOLD_PERCENT', 70);

      const isTextDuplicate = textSimilarity >= textThreshold;
      const isImageDuplicate = imageSimilarity >= imageThreshold;

      if (isTextDuplicate || isImageDuplicate) {
        const duplicateProductId = isTextDuplicate ? textProductId : imageProductId;
        
        this.logger.warn(
          `[Duplicate Check] CHẶN! Seller: ${sellerId}, Text: ${textSimilarity}%/${textThreshold}%, Image: ${imageSimilarity}%/${imageThreshold}%, ProductId: ${duplicateProductId}`
        );
        this.kafka.emit('product.duplicate_detected', {userId: sellerId});
        throw new BadRequestException(
          `Sản phẩm bị trùng với sản phẩm đã tồn tại (text: ${textSimilarity}%, image: ${imageSimilarity}%). Vui lòng tạo sản phẩm khác biệt hơn.`
        );
      }

      this.logger.log(`[Duplicate Check] Sản phẩm hợp lệ - Text: ${textSimilarity}%/${textThreshold}%, Image: ${imageSimilarity}%/${imageThreshold}%`);
    } catch (error) {
      // Nếu là BadRequestException từ duplicate check, ném lại
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Fail-safe: Lỗi khác, cho phép tạo sản phẩm
      this.logger.warn(`[Duplicate Check] Lỗi: ${error.message}, cho phép tạo sản phẩm`);
    }
  }

  /**
   * Trích sellerId từ Authorization header
   */
  private extractSellerIdFromAuth(auth?: string): string | null {
    if (!auth) return null;

    try {
      const token = auth.replace('Bearer ', '');
      const decoded = jwt.decode(token) as any;
      return decoded?.sub || decoded?.id || null;
    } catch {
      return null;
    }
  }

  // ============================================================
  // SEARCH BY IMAGE (AI-powered)
  // ============================================================
  /**
   * Tìm sản phẩm bằng ảnh (MVP: Image → AI extract text → Text search)
   * QUAN TRỌNG: Phải đặt TRƯỚC route /:id để tránh conflict
   * 
   * TEST (Postman):
   * POST http://localhost:3000/products/search-by-image
   * Body (JSON):
   * {
   *   "image": "<URL hoặc data:image/jpeg;base64,...>",
   *   "limit": 10
   * }
   */
  @Post('search-by-image')
  async searchByImage(@Body() body: { image: string; limit?: number }) {
    try {
      const { image, limit = 20 } = body;

      if (!image) {
        throw new BadRequestException('Thiếu trường "image"');
      }

      this.logger.log('[Search by Image] Bắt đầu xử lý...');

      // 1. (Optional) Validate image - fail-safe: AI lỗi thì vẫn tiếp tục
      const isValidImage = await this.aiService.validateImage(image, 'PRODUCT_IMAGE');
      if (!isValidImage) {
        this.logger.warn('[Search by Image] Ảnh vi phạm chính sách');
        return {
          success: false,
          message: 'Ảnh vi phạm chính sách nội dung. Vui lòng thử ảnh khác.',
          queryUsed: null,
          keywords: [],
          products: [],
        };
      }

      // 2. Trích xuất query text từ ảnh bằng AI
      const extracted = await this.aiService.extractQueryFromImage(image);

      if (!extracted || !extracted.query) {
        this.logger.warn('[Search by Image] AI không thể trích xuất query');
        return {
          success: false,
          message: 'Không thể phân tích ảnh. Vui lòng thử lại hoặc sử dụng tìm kiếm text.',
          queryUsed: null,
          keywords: [],
          products: [],
        };
      }

      const { query, keywords } = extracted;
      this.logger.log(`[Search by Image] Query extracted: "${query}"`);

      // 3. Dùng query để search sản phẩm qua Kafka
      const searchResult = await firstValueFrom(
        this.kafka.send('product.search', { 
          q: { 
            query, 
            limit 
          } 
        })
      );

      const products = searchResult?.data || [];
      this.logger.log(`[Search by Image] Tìm thấy ${products.length} sản phẩm`);

      // 4. Trả về kết quả
      return {
        success: true,
        queryUsed: query,
        keywords,
        products,
        total: products.length,
      };
    } catch (error) {
      this.logger.error(`[Search by Image] Lỗi: ${error.message}`);
      
      // Fail-safe: trả về empty list với message rõ ràng
      return {
        success: false,
        message: error.message || 'Lỗi khi xử lý tìm kiếm bằng ảnh',
        queryUsed: null,
        keywords: [],
        products: [],
      };
    }
  }

  // ============================================================
  // SEARCH
  // ============================================================
  @Post('search')
  search(@Body() q: any) {
    return this.kafka.send('product.search', { q });
  }

  // ============================================================
  // GET ALL PRODUCTS
  // ============================================================
  @Get()
  findAll(@Query() q: any) {
    return this.kafka.send('product.findAll', { q });
  }

  // ============================================================
  // GET PRODUCT BY ID
  // ============================================================
  @Get(':id')
  async findOne(@Param('id') id: string) {
    // 1. Gọi product-service
    const product = await firstValueFrom(
      this.kafka.send('product.findOne', { id })
    );

    if (!product) return product;

    // 2. Gọi inventory-service → inventory.getStock.request
    const stock = await firstValueFrom(
      this.kafka.send('inventory.getStock.request', { productId: id })
    );

    // 3. Merge
    return {
      ...product,
      stock: stock?.availableStock ?? 0,
      reservedStock: stock?.reservedStock ?? 0,
    };
  }

  // ============================================================
  // UPDATE PRODUCT
  // ============================================================
  @Patch(':id')
  @UseGuards(AiImageGuard)
  @AiImageType('PRODUCT_IMAGE')
  update(@Param('id') id: string, @Body() dto: any, @Headers('authorization') auth?: string) {
    return this.kafka.send('product.update', { id, dto, auth });
  }

  // ============================================================
  // DELETE PRODUCT (SOFT DELETE)
  // ============================================================
  @Delete(':id')
  remove(@Param('id') id: string, @Headers('authorization') auth?: string) {
    return this.kafka.send('product.remove', { id, auth });
  }

  // ============================================================
  // UPDATE STOCK
  // ============================================================
  @Patch(':id/stock')
  updateStock(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Headers('authorization') auth?: string,
  ) {
    console.log("amount in gateway: " + amount);
    // Nếu amount >= 0 → nhập thêm hàng
    if (amount >= 0) {
      return this.kafka.send('inventory.addStock', {
        productId: id,
        amount,
        auth,
      });
    }

    // Nếu amount < 0 → điều chỉnh giảm
    return this.kafka.send('inventory.adjustStock', {
      productId: id,
      delta: amount,   // amount là số âm
      auth,
    });
  }
   

}