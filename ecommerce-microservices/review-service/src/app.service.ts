import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { Review } from 'schemas/review-schema';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(@InjectModel(Review.name) private readonly reviewModel: Model<Review>) {}

  async create(dto: CreateReviewDto, userId: string) {
    if (!dto.productId || !dto.rating) {
      throw new BadRequestException('ProductId and rating are required');
    }

    // 2️⃣ Gắn userId từ token vào review
    const newReview = new this.reviewModel({
      ...dto,
      userId,
      createdAt: new Date(),
    });

    // 3️⃣ Lưu review vào MongoDB
    const created = await newReview.save();

    // 4️⃣ Trả về kết quả
    return {
      success: true,
      message: 'Review created successfully',
      data: created,
    };
  }

  async findAll(q?: any) {
    const filter: any = {};
    if (q?.productId) filter.productId = q.productId;
    if (q?.userId) filter.userId = q.userId;
    const data = await this.reviewModel.find(filter).sort({ createdAt: -1 }).lean();
    return { success: true, data };
  }

  async findOne(id: string) {
    const review = await this.reviewModel.findById(id).lean();
    if (!review) throw new NotFoundException('Review not found');
    return { success: true, data: review };
  }

  async update(id: string, dto: UpdateReviewDto, userId: string) {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      console.log('🧩 Throwing RpcException: { statusCode: 404, message: "Review not found" }');
      throw new RpcException({ statusCode: 404, message: 'Review not found' });
    }
    
    if (review.userId.toString() !== userId) {
      console.log('🧩 Throwing RpcException: { statusCode: 403, message: "You are not allowed to edit this review" }');
      throw new RpcException({ statusCode: 403, message: 'You are not allowed to edit this review' });
    }

    Object.assign(review, dto);
    const updated = await review.save();

    return {
      success: true,
      message: 'Review updated successfully',
      data: updated,
    };
  }

  async remove({ id, userId }: { id: string; userId: string }) {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // 2️⃣ Kiểm tra quyền: chỉ chủ review mới được xóa
    if (review.userId.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to delete this review');
    }

    // 3️⃣ Thực hiện xóa
    await this.reviewModel.findByIdAndDelete(id);

    return {
      success: true,
      message: 'Review deleted successfully',
      deletedId: id,
    };
  }
}