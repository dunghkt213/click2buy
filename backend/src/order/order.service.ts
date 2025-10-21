import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';

@Injectable()
export class OrderService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  async create(dto: CreateOrderDto): Promise<Order> {
     if (dto.userId && typeof dto.userId === 'string') {
      dto.userId = new Types.ObjectId(dto.userId) as any;
    }
    const created = new this.orderModel(dto);
    return created.save();
  }

  async findAll(query: QueryOrderDto): Promise<{
  data: Order[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;
    const filters: any = {};
    if (query.userId) filters.userId = query.userId;
    if (query.status) filters.status = query.status;
    if (query.paymentStatus) filters.paymentStatus = query.paymentStatus;
    if (query.trackingNumber) filters.trackingNumber = query.trackingNumber;

    const [orders, total] = await Promise.all([
    this.orderModel
      .find(filters)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean(), 
    this.orderModel.countDocuments(filters),
  ]);

  return {
    data: orders,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).lean();
    if (!order) {throw new NotFoundException(`Order with ID ${id} not found`);}
    return order;
  }

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    const updated = await this.orderModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException(`Order ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<Order> {
    const deleted = await this.orderModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException(`Order ${id} not found`);
    return deleted;
  }
}
