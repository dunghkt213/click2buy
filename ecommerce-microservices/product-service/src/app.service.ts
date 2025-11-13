import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Product } from '../schemas/product.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class AppService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<Product>) {}

  async create(dto: CreateProductDto) {
    const created = await this.productModel.create(dto);
    return { success: true, data: created };
  }

   async findAll(q?: any) {
    //Lấy tham số phân trang
    const page = Math.max(parseInt(q?.page || '1', 10), 1);
    const limit = Math.max(parseInt(q?.limit || '10', 10), 1);
    const skip = (page - 1) * limit;

    //Lọc theo keyword nếu có
    const filter: FilterQuery<Product> = {};
    if (q?.keyword) {
      filter.name = new RegExp(q.keyword.trim(), 'i');
    }

    //Sắp xếp (mặc định: mới nhất trước)
    const sort = q?.sort ? q.sort.replace(/,/g, ' ') : '-createdAt';

    //Lấy dữ liệu + tổng số record song song
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

  async update(id: string, dto: UpdateProductDto) {
    const updated = await this.productModel.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!updated) throw new NotFoundException('Product not found');
    return { success: true, data: updated };
  }

  async remove(id: string) {
    const deleted = await this.productModel.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Product not found');
    return { success: true, message: 'Product deleted successfully' };
  }

  async search(q: any) {
    const keyword = q?.keyword || '';
    const data = await this.productModel.find({ name: new RegExp(keyword, 'i') }).lean();
    return { success: true, data };
  }
}
