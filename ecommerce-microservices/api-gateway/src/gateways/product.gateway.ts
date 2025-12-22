import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Headers, UseGuards, BadRequestException, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { AiImageGuard } from '../guards/ai-image.guard';
import { AiImageType } from '../decorators/ai-image-type.decorator';
import { AiService } from '../modules/ai-guard/ai.service';
import { firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';

@Controller('products')
export class ProductGateway {
  private readonly logger = new Logger(ProductGateway.name);
  private readonly SIMILARITY_THRESHOLD = 80;
  private readonly MAX_PRODUCTS_TO_CHECK = 20;

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka,
    private readonly aiService: AiService,
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
    await this.checkDuplicateContent(dto, auth);
    
    return this.kafka.send('product.create', { dto, auth });
  }

  /**
   * Kiểm tra trùng nội dung sản phẩm với các sản phẩm cũ của cùng seller
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

      // 2. Chuẩn hóa text của sản phẩm mới
      const newProductText = this.aiService.normalizeTextForComparison(dto);
      if (newProductText.length < 30) {
        this.logger.debug('[Duplicate Check] Mô tả sản phẩm mới quá ngắn, bỏ qua kiểm tra');
        return;
      }

      this.logger.log(`[Duplicate Check] Kiểm tra trùng nội dung cho seller: ${sellerId}`);

      // 3. Lấy sản phẩm cũ của seller
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

      // 4. Chuẩn bị danh sách sản phẩm cũ để so sánh batch
      const oldProductsForComparison = existingProducts
        .map(oldProduct => {
          const text = this.aiService.normalizeTextForComparison(oldProduct);
          return {
            productId: oldProduct._id,
            text,
          };
        })
        .filter(p => p.text.length >= 30); // Chỉ lấy sản phẩm có mô tả đủ dài

      if (oldProductsForComparison.length === 0) {
        this.logger.debug('[Duplicate Check] Không có sản phẩm cũ nào có mô tả đủ dài để so sánh');
        return;
      }

      this.logger.log(`[Duplicate Check] Sử dụng 1 AI request để so sánh với ${oldProductsForComparison.length} sản phẩm cũ`);

      // 5. Gọi AI batch comparison (CHỈ 1 REQUEST DUY NHẤT)
      const batchResult = await this.aiService.compareSimilarityBatch(newProductText, oldProductsForComparison);

      if (batchResult === null) {
        // Fail-safe: AI lỗi, cho qua
        this.logger.warn('[Duplicate Check] AI batch comparison không trả về kết quả, cho phép tạo sản phẩm');
        return;
      }

      const { maxSimilarity, productId } = batchResult;

      this.logger.log(`[Duplicate Check] Kết quả batch: maxSimilarity=${maxSimilarity}%, productId=${productId}`);

      // 6. Kiểm tra ngưỡng chặn
      if (maxSimilarity >= this.SIMILARITY_THRESHOLD) {
        this.logger.warn(
          `[Duplicate Check] CHẶN! Seller: ${sellerId}, Product cũ: ${productId}, Similarity: ${maxSimilarity}%`
        );
        throw new BadRequestException(
          `Sản phẩm có nội dung rất giống với sản phẩm đã tồn tại (độ tương đồng: ${maxSimilarity}%). Vui lòng tạo mô tả khác biệt hơn.`
        );
      }

      this.logger.log('[Duplicate Check] Sản phẩm hợp lệ, không trùng nội dung');
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
  // SEARCH
  // ============================================================
  @Post('search')
  search(@Body() q: any) {
    return this.kafka.send('product.search', { q });
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