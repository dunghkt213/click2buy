import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from '../user/user.service';
import { ProductService } from '../product/product.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

//Mock mongoose model
const mockReviewModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

//Mock user/product service
const mockUserService = { findOne: jest.fn() };
const mockProductService = { findOne: jest.fn() };

describe('ReviewService', () => {
  let service: ReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: getModelToken('Review'), useValue: mockReviewModel },
        { provide: UserService, useValue: mockUserService },
        { provide: ProductService, useValue: mockProductService },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    jest.clearAllMocks();
  });

  // ================================
  // TEST NHÓM: delete()
  // ================================
  describe('delete()', () => {
    it('✅ nên xóa review thành công khi user là chủ sở hữu', async () => {
      const fakeReview = { _id: 'r1', userId: 'u123' };
      mockReviewModel.findById.mockResolvedValue(fakeReview);
      mockReviewModel.findByIdAndDelete.mockResolvedValue(fakeReview);

      const result = await service.delete('r1', 'u123', 'customer');

      expect(mockReviewModel.findById).toHaveBeenCalledWith('r1');
      expect(mockReviewModel.findByIdAndDelete).toHaveBeenCalledWith('r1');
      expect(result).toEqual({
        message: 'Review deleted successfully',
        reviewId: 'r1',
        deletedBy: 'u123',
      });
    });

    it('✅ nên xóa review thành công khi user là admin', async () => {
      const fakeReview = { _id: 'r2', userId: 'u999' };
      mockReviewModel.findById.mockResolvedValue(fakeReview);
      mockReviewModel.findByIdAndDelete.mockResolvedValue(fakeReview);

      const result = await service.delete('r2', 'adminUser', 'admin');

      expect(mockReviewModel.findByIdAndDelete).toHaveBeenCalledWith('r2');
      expect(result.message).toBe('Review deleted successfully');
      expect(result.deletedBy).toBe('adminUser');
    });

    it('❌ nên ném lỗi NotFoundException nếu review không tồn tại', async () => {
      mockReviewModel.findById.mockResolvedValue(null);

      await expect(service.delete('r404', 'u1', 'customer')).rejects.toThrow(NotFoundException);
      expect(mockReviewModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('❌ nên ném lỗi ForbiddenException nếu user không phải chủ hoặc admin', async () => {
      const fakeReview = { _id: 'r3', userId: 'anotherUser' };
      mockReviewModel.findById.mockResolvedValue(fakeReview);

      await expect(service.delete('r3', 'u123', 'customer')).rejects.toThrow(ForbiddenException);
      expect(mockReviewModel.findByIdAndDelete).not.toHaveBeenCalled();
    });
  });

  // ================================
  // TEST NHÓM: create()
  // ================================
  describe('create()', () => {
    it('✅ nên tạo review thành công khi product & user tồn tại và chưa có review', async () => {
      const dto = { productId: '507f1f77bcf86cd799439011', rating: 5, comment: 'Tốt lắm!' };
      const userId = '507f1f77bcf86cd799439012';

      mockProductService.findOne.mockResolvedValue({ _id: dto.productId, name: 'iPhone' });
      mockUserService.findOne.mockResolvedValue({ _id: userId, username: 'Alice' });
      mockReviewModel.findOne.mockResolvedValue(null);
      mockReviewModel.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439099',
        productId: dto.productId,
        userId: userId,
        rating: 5,
        comment: 'Tốt lắm!',
      });

      const result = await service.create(dto as any, userId);

      // Kiểm tra findOne được gọi
      expect(mockReviewModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: expect.any(Types.ObjectId),
          userId: expect.any(Types.ObjectId),
        }),
      );

      expect(mockProductService.findOne).toHaveBeenCalledWith(dto.productId);
      expect(mockUserService.findOne).toHaveBeenCalledWith(userId);
      expect(mockReviewModel.create).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Review created successfully',
        review: expect.objectContaining({
          _id: '507f1f77bcf86cd799439099',
          userId,
          rating: 5,
        }),
      });
    });

    it('❌ nên ném NotFoundException nếu product không tồn tại', async () => {
      const dto = { productId: '507f1f77bcf86cd799439022', rating: 4, comment: 'Ổn' };
      const userId = '507f1f77bcf86cd799439012';

      mockProductService.findOne.mockResolvedValue(null);
      mockUserService.findOne.mockResolvedValue({ _id: userId });

      await expect(service.create(dto as any, userId)).rejects.toThrow(NotFoundException);
      expect(mockReviewModel.create).not.toHaveBeenCalled();
    });

    it('❌ nên ném NotFoundException nếu user không tồn tại', async () => {
      const dto = { productId: '507f1f77bcf86cd799439011', rating: 3, comment: 'Tạm được' };
      const userId = '507f1f77bcf86cd799439099';

      mockProductService.findOne.mockResolvedValue({ _id: dto.productId });
      mockUserService.findOne.mockResolvedValue(null);

      await expect(service.create(dto as any, userId)).rejects.toThrow(NotFoundException);
      expect(mockReviewModel.create).not.toHaveBeenCalled();
    });

    it('❌ nên ném BadRequestException nếu user đã review sản phẩm', async () => {
      const dto = { productId: '507f1f77bcf86cd799439011', rating: 5 };
      const userId = '507f1f77bcf86cd799439012';

      mockProductService.findOne.mockResolvedValue({ _id: dto.productId });
      mockUserService.findOne.mockResolvedValue({ _id: userId });
      mockReviewModel.findOne.mockResolvedValue({ _id: '507f1f77bcf86cd799439099' });

      await expect(service.create(dto as any, userId)).rejects.toThrow(BadRequestException);
      expect(mockReviewModel.create).not.toHaveBeenCalled();
    });
  });
  // ================================
  // TEST NHÓM: findAll()
  // ================================
  describe('findAll()', () => {
  // TEST CASE 1: Lọc và phân trang cơ bản
  it('✅ nên trả về danh sách review được lọc, sắp xếp, phân trang đúng', async () => {
    const query = {
      productId: '507f1f77bcf86cd799439011',
      userId: '507f1f77bcf86cd799439012',
      rating: 5,
      page: 1,
      limit: 2,
      sortBy: 'rating',
      sortOrder: 'asc',
    };

    const mockItems = [
  { _id: 'r1', rating: 5, comment: 'Good', user: { _id: '507f1f77bcf86cd799439012' } },
  { _id: 'r2', rating: 5, comment: 'Excellent', user: { _id: '507f1f77bcf86cd799439012' } },
];

    // Mock chainable Mongoose query
    const mockFindQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockItems),
    };

    mockReviewModel.find.mockReturnValue(mockFindQuery);
    mockReviewModel.countDocuments.mockResolvedValue(2);

    const result = await service.findAll(query as any);

    expect(mockReviewModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: query.productId,
        userId: query.userId,
        rating: query.rating,
      }),
    );

    expect(result).toEqual({
      items: mockItems,
      total: 2,
      page: 1,
      limit: 2,
      totalPages: 1,
    });
  });

  // TEST CASE 2: Có search theo comment
  it('✅ nên tạo regex khi có search trong comment', async () => {
    const query = { search: 'good' };

    const mockFindQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    };

    mockReviewModel.find.mockReturnValue(mockFindQuery);
    mockReviewModel.countDocuments.mockResolvedValue(0);

    await service.findAll(query as any);

    expect(mockReviewModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        comment: { $regex: 'good', $options: 'i' },
      }),
    );
  });

  // TEST CASE 3: Không có kết quả
  it('✅ nên trả về items rỗng và total = 0 nếu không có review nào', async () => {
    const query = { page: 2, limit: 5 };

    const mockFindQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    };

    mockReviewModel.find.mockReturnValue(mockFindQuery);
    mockReviewModel.countDocuments.mockResolvedValue(0);

    const result = await service.findAll(query as any);

    expect(result).toEqual({
      items: [],
      total: 0,
      page: 2,
      limit: 5,
      totalPages: 0,
    });
    });

  });

  // ================================
  // TEST NHÓM: findOne()
  // ================================
  describe('findOne()', () => {
    // TEST CASE 1: tìm thấy review
  it('✅ nên trả về review khi tồn tại', async () => {
    const review = {
      _id: '507f1f77bcf86cd799439099',
      rating: 5,
      comment: 'Tốt lắm',
      userId: { username: 'Alice', avatar: 'a.png' },
      productId: { name: 'iPhone' },
    };

    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(review),
    };

    mockReviewModel.findById.mockReturnValue(mockQuery);

    const result = await service.findOne('507f1f77bcf86cd799439099');

    expect(mockReviewModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439099');
    expect(result).toMatchObject({
    _id: '507f1f77bcf86cd799439099',
    rating: 5,
    comment: 'Tốt lắm',
    userId: expect.objectContaining({ username: 'Alice' }),
    productId: expect.objectContaining({ name: 'iPhone' }),
  });
  });

  // ❌ TEST CASE 2: không tìm thấy review
  it('❌ nên ném NotFoundException nếu không tìm thấy review', async () => {
    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null),
    };
    mockReviewModel.findById.mockReturnValue(mockQuery);

    await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
  });
  });
  // ================================
  // TEST NHÓM: update()
  // ================================
  describe('update()', () => {
    //CASE 1: update thành công
  it('✅ nên update thành công khi user là chủ sở hữu', async () => {
    const id = '507f1f77bcf86cd799439099';
    const userId = '507f1f77bcf86cd799439012';
    const dto = { rating: 4, comment: 'Khá ổn' };

    const fakeReview = { _id: id, userId };
    const updatedReview = { ...fakeReview, rating: 4, comment: 'Khá ổn' };

    mockReviewModel.findById.mockResolvedValue(fakeReview);
    mockReviewModel.findByIdAndUpdate.mockReturnValue({
    lean: jest.fn().mockResolvedValue(updatedReview),
    });

    const result = await service.update(id, userId, 'customer', dto);

    expect(mockReviewModel.findById).toHaveBeenCalledWith(id);
    expect(mockReviewModel.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      { rating: 4, comment: 'Khá ổn' },
      { new: true },
    );
    expect(result).toEqual({
      message: 'Review updated successfully',
      review: updatedReview,
    });
  });

  //  CASE 2: admin được phép update
  it('✅ nên update thành công khi user là admin', async () => {
    const id = '507f1f77bcf86cd799439099';
    const userId = '507f1f77bcf86cd799439099';
    const dto = { rating: 3 };

    const fakeReview = { _id: id, userId: 'someoneElse' };
    const updatedReview = { ...fakeReview, rating: 3 };

    mockReviewModel.findById.mockResolvedValue(fakeReview);
    mockReviewModel.findByIdAndUpdate.mockReturnValue({
    lean: jest.fn().mockResolvedValue(updatedReview),
    });

    const result = await service.update(id, userId, 'admin', dto);

    expect(result.message).toBe('Review updated successfully');
    expect(result.review).toEqual(updatedReview);
  });

  // CASE 3: review không tồn tại
  it('❌ nên ném NotFoundException nếu review không tồn tại', async () => {
    mockReviewModel.findById.mockResolvedValue(null);

    await expect(
      service.update('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', 'customer', {
        rating: 4,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(mockReviewModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  // CASE 4: user không có quyền sửa
  it('❌ nên ném ForbiddenException nếu user không phải chủ hoặc admin', async () => {
    const fakeReview = { _id: '507f1f77bcf86cd799439011', userId: 'someoneElse' };
    mockReviewModel.findById.mockResolvedValue(fakeReview);

    await expect(
      service.update('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', 'customer', {
        rating: 2,
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(mockReviewModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });
  });
});
