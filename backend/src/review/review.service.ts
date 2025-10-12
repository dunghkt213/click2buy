import { Injectable, NotFoundException,ForbiddenException, BadRequestException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { Types } from 'mongoose';
import { UserService } from '../user/user.service';
import { ProductService } from '../product/product.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  /**
   * Tạo mới review
   */
  async create(dto: CreateReviewDto, userId: string) {
    // Kiểm tra sản phẩm tồn tại
    const product = await this.productService.findOne(dto.productId).catch(() => null);
    if (!product) throw new NotFoundException('Product not found');

    // Kiểm tra user tồn tại
    const user = await this.userService.findOne(userId).catch(() => null);
    if (!user) throw new NotFoundException('User not found');

    // Kiểm tra trùng review
    const existed = await this.reviewModel.findOne({
      productId: new Types.ObjectId(dto.productId),
      userId: new Types.ObjectId(userId),
    });
    if (existed) {
      throw new BadRequestException('You have already reviewed this product');
    }

    // Lưu review vào DB
    const created = await this.reviewModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(dto.productId),
      isApproved: true,
    });

    return {
      message: 'Review created successfully',
      review: created,
    };
  }

  /**
   * Lấy danh sách review (lọc + phân trang + sắp xếp)
   * 
   * @param {QueryReviewDto} query - DTO chứa toàn bộ tham số lọc, phân trang, và sắp xếp.
   * @property {string} [productId] - ID sản phẩm cần lọc.
   * @property {string} [userId] - ID người dùng cần lọc.
   * @property {number} [rating] - Điểm đánh giá cần lọc.
   * @property {boolean} [isApproved] - Trạng thái duyệt của review.
   * @property {string} [search] - Từ khóa tìm kiếm trong comment.
   * @property {string} [sortBy='createdAt'] - Trường sắp xếp.
   * @property {'asc'|'desc'} [sortOrder='desc'] - Thứ tự sắp xếp.
   * @property {number} [page=1] - Trang hiện tại.
   * @property {number} [limit=10] - Số phần tử mỗi trang.
   * 
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
    if (typeof isApproved === 'boolean') filter.isApproved = isApproved;
    if (search) filter.comment = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.reviewModel.countDocuments(filter),
    ]);

    return {
      items: items,
      total,
      page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy chi tiết review theo ID
   * 
   * @param {string} id - ID của review cần truy vấn.
   * 
   */
  async findOne(id: string) {
    const review = await this.reviewModel.findById(id).lean();
    if (!review) throw new NotFoundException('Review not found');

    return { ...review};
  }

  /**
   * Cập nhật review
   * 
   * @param {string} id - ID của review cần cập nhật.
   * @param {string} userId - ID của người dùng hiện tại 
   * @param {string} role - Vai trò của người dùng 
   * @param {UpdateReviewDto} dto - Dữ liệu cập nhật review 
   * 
   * @returns {Promise<{ message: string; review: any }>}
   * Trả về object chứa thông báo thành công và review sau khi cập nhật.
   * 
   * @throws {NotFoundException} - Nếu review không tồn tại trong cơ sở dữ liệu.
   * @throws {ForbiddenException} - Nếu người dùng không có quyền chỉnh sửa review.
   */
  async update(id: string, userId: string, role: string, dto: UpdateReviewDto) {
    // Tìm review theo ID
    const review = await this.reviewModel.findById(id);
    if (!review) throw new NotFoundException('Review not found');

    //  Kiểm tra quyền
    if (review.userId.toString() !== userId && role !== 'admin') {
      throw new ForbiddenException('You are not allowed to edit this review');
    }

     //Không cho update productId hoặc userId
    const { rating, comment } = dto;
    const updateFields: any = {};
    if (rating !== undefined) updateFields.rating = rating;
    if (comment !== undefined) updateFields.comment = comment;

    //Cập nhật review
    const updated = await this.reviewModel
      .findByIdAndUpdate(id, updateFields, { new: true })
      .lean();
    
     return {
      message: 'Review updated successfully',
      review: updated,
    };

  }

  /**
   * Xóa review
   * 
   * @param {string} id - ID của review cần xóa.
   * @param {string} userId - ID của người dùng hiện tại (lấy từ JWT token).
   * @param {string} role - Vai trò của người dùng hiện tại 
   *
   * @returns {Promise<{ message: string; reviewId: string; deletedBy: string }>}
   * Trả về object thông báo thành công, chứa `message`, `reviewId`, và `deletedBy`.
   *
   * @throws {NotFoundException} - Khi review không tồn tại trong cơ sở dữ liệu.
   * @throws {ForbiddenException} - Khi người dùng không có quyền xóa review này.
   */
  async delete(id: string, userId: string, role: string) {
    // Tìm review
    const review = await this.reviewModel.findById(id);
    if (!review) throw new NotFoundException('Review not found');
    

    // Kiểm tra quyền: chỉ chủ review hoặc admin mới được xóa
    if (review.userId.toString() !== userId && role !== 'admin') {
      throw new ForbiddenException('You are not allowed to delete this review');
    }

    //Xóa khỏi DB
    await this.reviewModel.findByIdAndDelete(id); 

    //Trả về kết quả chuẩn REST
    return {
      message: 'Review deleted successfully',
      reviewId: id,
      deletedBy: userId,
    };
  }

}
