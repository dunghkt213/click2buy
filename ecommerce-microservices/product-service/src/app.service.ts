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

    const filter: FilterQuery<Product> = {
      status: ProductStatus.ACTIVE,
      isActive: true,
    };

    if (q.hotDeal === 'true') {
      filter.$expr = {
        $lte: [
          '$salePrice',
          { $multiply: ['$price', 0.5] }
        ]
      };
    }

    if (q?.keyword) {
      filter.name = new RegExp(q.keyword.trim(), 'i');
    }

    if (q?.categoryId && q.categoryId !== 'all') {
      filter.categoryIds = q.categoryId;
    }

    if (q?.minPrice || q?.maxPrice) {
      filter.price = {};
      if (q.minPrice) filter.price.$gte = Number(q.minPrice);
      if (q.maxPrice) filter.price.$lte = Number(q.maxPrice);
    }

    if (q?.minRating) {
      filter.ratingAvg = { $gte: Number(q.minRating) };
    }

    if (q?.brand) {
      filter.brand = q.brand;
    }

    if (q?.tag) {
      filter.tags = q.tag;
    }

    if (q?.condition) {
      filter.condition = q.condition;
    }

    if (q?.hasDiscount === 'true') {
      filter.discount = { $gt: 0 };
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
    console.log('product_id',id)
    try{
      const product = await this.productModel.findById(id).lean();
      return  product ;
    }
    catch(err){
      return new RpcException({
        statusCode: 403,
        message: 'not found product',
      });
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

  async findBatch(ids: string[]) {
    return this.productModel
      .find({ _id: { $in: ids } })
      .lean();
  }

  async findAllOfSeller(q: any, sellerId: string) {
    const page = Math.max(parseInt(q?.page || '1', 10), 1);
    const limit = Math.max(parseInt(q?.limit || '10', 10), 1);
    const skip = (page - 1) * limit;
  
    const filter: FilterQuery<Product> = {
      status: ProductStatus.ACTIVE,
      isActive: true,
      ownerId: sellerId,              // ✅ quan trọng
    };
  
    if (q?.keyword) filter.name = new RegExp(q.keyword.trim(), 'i');
    if (q?.categoryId && q.categoryId !== 'all') filter.categoryIds = q.categoryId;
  
    const sort = q?.sort ? q.sort.replace(/,/g, ' ') : '-createdAt';
  
    const [data, total] = await Promise.all([
      this.productModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.productModel.countDocuments(filter),
    ]);
  
    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
  
  async findOneOfSeller(id: string, sellerId: string) {
    const product = await this.productModel.findById(id).lean();
    if (!product) {
      throw new RpcException({ statusCode: 404, message: 'Product not found' });
    }
  
    if (product.ownerId?.toString() !== sellerId) {
      throw new RpcException({ statusCode: 403, message: 'Forbidden' }); // ✅ chỉ owner
    }
  
    return product;
  }
  
  /** Cập nhật review summary cho sản phẩm (internal call từ API Gateway) */
  async updateReviewSummary(productId: string, reviewSummary: string) {
    try {
      const updated = await this.productModel.findByIdAndUpdate(
        productId,
        { $set: { reviewSummary } },
        { new: true }
      );

      if (!updated) {
        return { success: false, message: 'Product not found' };
      }

      return { success: true, message: 'Review summary updated', data: { productId, reviewSummary } };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /** Lấy sản phẩm của seller (dùng cho kiểm tra trùng nội dung) */
  async findBySeller(sellerId: string, limit: number = 20) {
    try {
      const products = await this.productModel
        .find({ 
          ownerId: sellerId,
          status: { $ne: ProductStatus.DELETED }
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('_id name description brand tags specifications categoryIds')
        .lean();

      return { success: true, data: products };
    } catch (error) {
      return { success: false, message: error.message, data: [] };
    }
  }
}
