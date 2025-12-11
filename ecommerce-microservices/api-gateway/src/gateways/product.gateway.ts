import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Headers } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { firstValueFrom } from 'rxjs';

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
  create(@Body() dto: any, @Headers('authorization') auth?: string) {
    return this.kafka.send('product.create', { dto, auth });
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