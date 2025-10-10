import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { Types } from 'mongoose';


@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  /**
   * Tạo mới review
   */
  
  async create(dto: CreateReviewDto): Promise<ReviewDocument> {
    // Ép kiểu chuỗi ID sang ObjectId thật
    const payload = {
      ...dto,
      userId: new Types.ObjectId(dto.userId),
      productId: new Types.ObjectId(dto.productId),
    };

    // Lưu vào database
    const created = await this.reviewModel.create(payload);

    return created;
  }

  /**
   * Lấy danh sách review (lọc + phân trang + sắp xếp)
   */
  async findAll(query: QueryReviewDto) {
    const {
      productId,
      userId,
      rating,
      isApproved,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const filter: FilterQuery<ReviewDocument> = {};

    if (productId) filter.productId = productId;
    if (userId) filter.userId = userId;
    if (rating) filter.rating = rating;


    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username avatar')
        .populate('productId', 'name'),
      this.reviewModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy chi tiết review theo ID
   */
  async findById(id: string) {
    const review = await this.reviewModel
      .findById(id)
      .populate('userId', 'username avatar')
      .populate('productId', 'name');

    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  /**
   * Cập nhật review
   */
  async update(id: string, dto: UpdateReviewDto) {
    const updated = await this.reviewModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Review not found');
    return updated;
  }

  /**
   * Xóa review
   */
  async delete(id: string) {
    const deleted = await this.reviewModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Review not found');
    return { message: 'Review deleted successfully' };
  }
}
