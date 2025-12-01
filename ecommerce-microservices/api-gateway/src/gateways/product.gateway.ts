import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Headers } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { firstValueFrom } from 'rxjs';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from 'src/dtos/product/create-product.dto';
import { ProductDto } from 'src/dtos/product/product.dto';
import { QueryProductDto } from 'src/dtos/product/query-product.dto';
import { UpdateStockDto } from 'src/dtos/product/update-stock.dto';
import { SimpleSearchDto } from 'src/dtos/product/simple-search.dto';

@ApiTags('Products')
@Controller('products')
export class ProductGateway {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) {}

  async onModuleInit() {
    this.kafka.subscribeToResponseOf('product.create');
    this.kafka.subscribeToResponseOf('product.findAll');
    this.kafka.subscribeToResponseOf('product.findOne');
    this.kafka.subscribeToResponseOf('product.update');
    this.kafka.subscribeToResponseOf('product.remove');
    this.kafka.subscribeToResponseOf('product.search');

    this.kafka.subscribeToResponseOf('inventory.getStock.request');
    this.kafka.subscribeToResponseOf('inventory.addStock');
    this.kafka.subscribeToResponseOf('inventory.adjustStock');
    
    await this.kafka.connect();
  }
  // ============================================================
  // GET ALL PRODUCTS (SELLER)
  // ============================================================
  @Get('seller')
  @ApiOperation({ summary: 'Lấy tất cả sản phẩm thuộc seller hiện tại' })
  @ApiResponse({ status: 200, type: [ProductDto] })
  findAllOfSeller(
    @Query() q: any,
    @Headers('authorization') auth?: string,
  ) {
    return this.kafka.send('product.findAll', { q, auth });
  }

  // ============================================================
  // GET ONE PRODUCT OF SELLER
  // ============================================================
  @Get('seller/:id')
  @ApiOperation({ summary: 'Lấy sản phẩm thuộc seller hiện tại theo ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: ProductDto })
  findOneOfSeller(
    @Param('id') id: string,
    @Headers('authorization') auth?: string,
  ) {
    return this.kafka.send('product.findOne', { id, auth });
  }
  

  // ============================================================
  // CREATE PRODUCT
  // ============================================================
  @Post()
  @ApiOperation({ summary: 'Tạo sản phẩm mới' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created' })
  create(@Body() dto: any, @Headers('authorization') auth?: string) {
    return this.kafka.send('product.create', { dto, auth });
  }

  // ============================================================
  // GET ALL PRODUCTS
  // ============================================================
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm (filter + search)' })
  @ApiResponse({ status: 200, type: [ProductDto] })
  findAll(@Query() q: any) {
    return this.kafka.send('product.findAll', { q });
  }

  // ============================================================
  // GET PRODUCT BY ID
  // ============================================================
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một sản phẩm' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: ProductDto })
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
  @ApiOperation({ summary: 'Cập nhật thông tin sản phẩm' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: CreateProductDto })
  update(@Param('id') id: string, @Body() dto: any, @Headers('authorization') auth?: string) {
    return this.kafka.send('product.update', { id, dto, auth });
  }

  // ============================================================
  // DELETE PRODUCT (SOFT DELETE)
  // ============================================================
  @Delete(':id')
  @ApiOperation({ summary: 'Xoá mềm sản phẩm (chỉ owner mới được xoá)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  remove(@Param('id') id: string, @Headers('authorization') auth?: string) {
    return this.kafka.send('product.remove', { id, auth });
  }

  // ============================================================
  // SEARCH
  // ============================================================
  @Post('search')
  @ApiOperation({ summary: 'Tìm kiếm sản phẩm nâng cao' })
  @ApiBody({ type: SimpleSearchDto })
  @ApiResponse({ status: 200, type: [ProductDto] })
  search(@Body() q: any) {
    return this.kafka.send('product.search', { q });
  }

  // ============================================================
  // UPDATE STOCK
  // ============================================================
  @Patch(':id/stock')
  @ApiOperation({ summary: 'Cập nhật tồn kho (nhập / giảm hàng)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateStockDto })
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
