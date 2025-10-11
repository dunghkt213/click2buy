import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * [POST] /reviews
   * Tạo mới review
   */
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @Post()
  async create(@Body() dto: CreateReviewDto, @Req() req) {
    const user = req.user;
    return this.reviewService.create(dto, user._id);
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
    return this.reviewService.findOne(id);
  }

  /**
   * [PATCH] /reviews/:id
   * Cập nhật review
   */
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateReviewDto, @Req() req) {
    const user = req.user;
    return this.reviewService.update(id, user._id, user.role, dto);
  }

  /**
   * [DELETE] /reviews/:id
   * Xóa review
   */
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req) {
    const user = req.user;
    return this.reviewService.delete(id, user._id, user.role);
  }
}
 