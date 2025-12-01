import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Product, ProductStatus } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RpcException } from '@nestjs/microservices';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Product.name) 
    private readonly productModel: Model<Product>,

    @Inject('KAFKA_SERVICE')
    private readonly kafka: ClientKafka,

    @Inject('REDIS_CLIENT')  
    private readonly redis: Redis,
  ) {}

  /** Tạo sản phẩm */
  async create(dto: CreateProductDto, userId: string) {
    const created = await this.productModel.create({ ...dto, ownerId: userId, createdAt: new Date(), });

    const productId = created._id.toString();
  
    // --- INITIAL REDIS STATE ---
    await this.redis.hset(`sync:${productId}`, {
      inventory: 'pending',
      search: 'pending',
    });

    await this.redis.expire(`sync:${productId}`, 300); 

    // --- EMIT EVENTS ---
    this.kafka.emit('inventory.sync.requested', {
      productId,
      stock: dto.stock,
      ownerId: userId
    });

    this.kafka.emit('search.sync.requested', {
      productId,
      name: created.name,
      price: created.price,
      categoryIds: created.categoryIds||[],
      imageUrl: created.images?.[0]||null,
    });

    return { success: true, data: created };
  }

  // =========================
  // LISTEN TO SYNC RESULT
  // =========================
  @MessagePattern('inventory.synced')
  async handleInventorySynced(@Payload() data: any) {
    const productId = data.productId;
    await this.redis.hset(`sync:${productId}`, 'inventory', 'done');
    await this.checkAndEmitFinal(productId);
  }

  @MessagePattern('search.synced')
  async handleSearchSynced(@Payload() data: any) {
    const productId = data.productId;
    await this.redis.hset(`sync:${productId}`, 'search', 'done');
    await this.checkAndEmitFinal(productId);
  }

  // =========================
  // CHECK COMPLETE
  // =========================
  async checkAndEmitFinal(productId: string) {
    const sync = await this.redis.hgetall(`sync:${productId}`);

    if (sync.inventory === 'done' && sync.search === 'done') {
      this.kafka.emit('noti.product.created', {
        productId,
        message: 'Product fully synced',
      });

      // cleanup
      await this.redis.del(`sync:${productId}`);
    }
  }

  /** Lấy tất cả sản phẩm (có filter, paginate, sort) */
  async findAll(q?: any) {
    const page = Math.max(parseInt(q?.page || '1', 10), 1);
    const limit = Math.max(parseInt(q?.limit || '10', 10), 1);
    const skip = (page - 1) * limit;

    const filter: FilterQuery<Product> = {};
    if (q?.keyword) {
      filter.name = new RegExp(q.keyword.trim(), 'i');
    }

    const sort = q?.sort ? q.sort.replace(/,/g, ' ') : '-createdAt';

    const [data, total] = await Promise.all([
      this.productModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Lấy 1 sản phẩm */
  async findOne(id: string) {
    console.log("STEP 1");
    console.log('product_id',id)
    try{
      const product = await this.productModel.findById(id).lean();
      if (!product) {
        throw new RpcException('Product not found');
      }
      console.log("STEP 2", product);
      return product;
    }
    catch(err){
      throw new RpcException('Product not found');
    }
  }

  /** Update sản phẩm (chỉ owner mới chỉnh được) */
  async update(id: string, dto: UpdateProductDto, userId: string) {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new RpcException({
        statusCode: 404,
        message: 'Product not found',
      });
    }

    if (product.ownerId.toString() !== userId) {
      throw new RpcException({
        statusCode: 403,
        message: 'You are not allowed to edit this product',
      });
    }

    const updated = await this.productModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true },
    );

    return {
      success: true,
      message: 'Product updated successfully',
      data: updated,
    };
  }

  /** Xóa sản phẩm (chỉ owner mới xóa được) */
  async remove({ id, userId }: { id: string; userId: string }) {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new RpcException({
        statusCode: 404,
        message: 'Product not found',
      });
    }

    console.log("🔥 DELETE DEBUG:", {
      productId: id,
      productOwnerId: product.ownerId,
      receivedUserId: userId,
      equal: product.ownerId.toString() === userId
    });

    if (product.ownerId.toString() !== userId) {
      throw new RpcException({
        statusCode: 403,
        message: 'You are not allowed to delete this product',
      });
    }

    if (product.status === ProductStatus.DELETED) {
      return {
        success: true,
        message: 'Product already deleted',
      };
    }

    product.status = ProductStatus.DELETED;
    product.isActive = false;         // optional: hide from listing
    await product.save();

    this.kafka.emit('cart.productDisabled', { productId: id });

    this.kafka.emit('search.removeDocument', { productId: id });

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }

  /** Search từ khóa */
  async search(q: any) {
    const keyword = q?.keyword || '';
    const data = await this.productModel.find({
      name: new RegExp(keyword, 'i'),
    }).lean();

    return { success: true, data };
  }

  /** Lấy tất cả sản phẩm của seller */
async findAllOfSeller(q: any, sellerId: string) {
  const page = Math.max(parseInt(q?.page || '1', 10), 1);
  const limit = Math.max(parseInt(q?.limit || '10', 10), 1);
  const skip = (page - 1) * limit;

  const filter: FilterQuery<Product> = { ownerId: sellerId };

  if (q?.keyword) {
    filter.name = new RegExp(q.keyword.trim(), 'i');
  }

  const sort = q?.sort ? q.sort.replace(/,/g, ' ') : '-createdAt';

  const [data, total] = await Promise.all([
    this.productModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    this.productModel.countDocuments(filter),
  ]);

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/** Lấy 1 sản phẩm của seller (chỉ owner mới xem được bản full) */
async findOneOfSeller(id: string, sellerId: string) {
  const product = await this.productModel.findById(id).lean();

  if (!product) {
    throw new RpcException({
      statusCode: 404,
      message: 'Product not found',
    });
  }

  if (product.ownerId.toString() !== sellerId) {
    throw new RpcException({
      statusCode: 403,
      message: 'You are not allowed to access this product',
    });
  }

  return product;
}

}
