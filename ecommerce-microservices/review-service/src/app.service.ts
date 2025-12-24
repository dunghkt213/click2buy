import { BadRequestException, ForbiddenException, Injectable, Inject,NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { SellerReplyDto} from './dto/Seller-reply.dto';
import { Review } from './schemas/review-schema';
import { RpcException } from '@nestjs/microservices';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @Inject('REVIEW_SERVICE') private readonly kafka: ClientKafka,
  ) {}
   async onModuleInit() {
    this.kafka.subscribeToResponseOf('product.findOne');
    await this.kafka.connect();
  }

  async create(dto: CreateReviewDto, userId: string) {
    if (!dto.productId || !dto.rating) {
      throw new BadRequestException('ProductId and rating aređ required');
    }
    const product = await firstValueFrom(
      this.kafka.send('product.findOne', { id: dto.productId }),
    );
    // 2️⃣ Gắn userId từ token vào review
    const newReview = new this.reviewModel({
      ...dto,
      userId,
      createdAt: new Date(),
    });
    this.kafka.emit('review.created', {productId: dto.productId, rating: dto.rating, ownerId: product.ownerId, reviewId: newReview._id});
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
  try {
    const filter: any = {};

    if (q?.productId) filter.productId = q.productId;

    const data = await this.reviewModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data };
  } catch (err) {
    console.error("❌ LỖI TRONG ReviewService.findAll:", err);
    throw err;
  }
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

   async SellerReply(id: string, dto: SellerReplyDto, userId: string) {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      console.log('🧩 Throwing RpcException: { statusCode: 404, message: "Review not found" }');
      throw new RpcException({ statusCode: 404, message: 'Review not found' });
    }
    
    Object.assign(review, dto);
    const updated = await review.save();
    this.kafka.emit('review.sellerReplied', {userId: review.userId, productId: review.productId, reviewId: review._id});
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