import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * [POST] /reviews
   * Tạo mới review
   */
  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.reviewService.create(dto);
  }

  /**
   * [GET] /reviews
   * Lấy danh sách review (lọc, phân trang, tìm kiếm)
   */
  @Get()
  findAll(@Query() query: QueryReviewDto) {
    return this.reviewService.findAll(query);
  }

  /**
   * [GET] /reviews/:id
   * Lấy chi tiết 1 review
   */
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.reviewService.findById(id);
  }

  /**
   * [PATCH] /reviews/:id
   * Cập nhật review
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewService.update(id, dto);
  }

  /**
   * [DELETE] /reviews/:id
   * Xóa review
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.reviewService.delete(id);
  }
}
 