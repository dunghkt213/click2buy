import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductDocument> {
    const product = new this.productModel(dto);
    return await product.save();
  }

  async findAll(query: QueryProductDto): Promise<{ items: ProductDocument[]; total: number }> {
    const filters: any = {};
    if (query.text) filters.$text = { $search: query.text };
    if (query.brand) filters.brand = new RegExp(query.brand, 'i');
    if (query.categoryId) filters.categoryIds = query.categoryId;
    if (query.condition) filters.condition = query.condition;
    if (query.tags?.length) filters.tags = { $in: query.tags };
    if (query.minPrice || query.maxPrice) {
      filters.price = {};
      if (query.minPrice) filters.price.$gte = query.minPrice;
      if (query.maxPrice) filters.price.$lte = query.maxPrice;
    }
    if (query.minRating) filters.ratingAvg = { $gte: query.minRating };
    if (query.isActive !== undefined) filters.isActive = query.isActive;

    const sort: any = {};
    if (query.sortBy)
      sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.productModel.find(filters).sort(sort).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(filters),
    ]);

    return { items, total };
  }

  async findOne(id: string): Promise<ProductDocument | null> {
    return this.productModel.findById(id).exec();
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument | null> {
    return this.productModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.productModel.findByIdAndDelete(id).exec();
  }
}
