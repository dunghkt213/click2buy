import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Product } from '../schemas/product.schema';

import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<Product>) {}

  async create(dto: CreateProductDto, userId: string) {
    const created = await this.productModel.create({ ...dto, ownerId: userId });
    return { success: true, data: created };
  }

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

  async findOne(id: string) {
    const product = await this.productModel.findById(id).lean();
    if (!product) throw new NotFoundException('Product not found');
    return { success: true, data: product };
  }

  async update(id: string, dto: UpdateProductDto, userId: string) {
    const updated = await this.productModel.findById(id);

    if (!updated) {
      console.log('🧩 Throwing RpcException: { statusCode: 404, message: "Product not found" }');
      throw new RpcException({ statusCode: 404, message: 'Product not found' });
    }

    if (updated.ownerId.toString() !== userId) {
      console.log('🧩 Throwing RpcException: { statusCode: 403, message: "You are not allowed to edit this product" }');
      throw new RpcException({ statusCode: 403, message: 'You are not allowed to edit this product' });
    }

    return {
      success: true,
      message: 'Product updated successfully',
      data: updated
    };
  }

  async remove({ id, userId }: { id: string; userId: string }) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.ownerId.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to delete this review');
    }

    await this.productModel.findByIdAndDelete(id);
    return { success: true, message: 'Product deleted successfully' };
  }

  async search(q: any) {
    const keyword = q?.keyword || '';
    const data = await this.productModel.find({ name: new RegExp(keyword, 'i') }).lean();
    return { success: true, data };
  }
}
