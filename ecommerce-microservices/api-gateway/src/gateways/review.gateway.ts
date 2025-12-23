import { Body, Controller, Delete, Get, Headers, Logger, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { AiReviewGuard } from '../guards/ai-review.guard';
import { AiImageGuard } from '../guards/ai-image.guard';
import { AiImageType } from '../decorators/ai-image-type.decorator';
import { AiService } from '../modules/ai-guard/ai.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Controller('reviews')
export class ReviewGateway {
    private readonly logger = new Logger(ReviewGateway.name);

    constructor(
        @Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka,
        private readonly aiService: AiService,
    ) { }

    async onModuleInit() {
        this.kafka.subscribeToResponseOf('review.create');
        this.kafka.subscribeToResponseOf('review.findAll');
        this.kafka.subscribeToResponseOf('review.findOne');
        this.kafka.subscribeToResponseOf('review.update');
        this.kafka.subscribeToResponseOf('review.delete');
        this.kafka.subscribeToResponseOf('user.batch');
        this.kafka.subscribeToResponseOf('product.updateReviewSummary');
        await this.kafka.connect();
    }

    @Post()
    @UseGuards(AiReviewGuard, AiImageGuard)
    @AiImageType('REVIEW_IMAGE')
    async create(@Body() dto: any, @Headers('authorization') auth?: string) { 
        const result = await firstValueFrom(this.kafka.send('review.create', { dto, auth }));
        
        // Sau khi tạo review thành công, trigger AI summary (non-blocking)
        if (result?.success && dto?.productId) {
            this.generateAndUpdateReviewSummary(dto.productId).catch(() => {});
        }
        
        return result;
    }

    /**
     * Lấy N review gần nhất và gọi AI tạo tóm tắt
     * Fail-safe: không throw error, chỉ log warning
     */
    private async generateAndUpdateReviewSummary(productId: string): Promise<void> {
        try {
            this.logger.log(`[AI Summary] Bắt đầu tạo tóm tắt cho product: ${productId}`);

            // 1. Lấy 10 review gần nhất của sản phẩm
            const reviewsResult = await firstValueFrom(
                this.kafka.send('review.findAll', { q: { productId } })
            );

            if (!reviewsResult?.success || !reviewsResult?.data?.length) {
                this.logger.debug(`[AI Summary] Không có review cho product: ${productId}`);
                return;
            }

            // 2. Lấy tối đa 10 review có comment
            const reviews = reviewsResult.data
                .filter((r: any) => r.comment && r.comment.trim())
                .slice(0, 10)
                .map((r: any) => r.comment);

            if (reviews.length === 0) {
                this.logger.debug(`[AI Summary] Không có review có nội dung cho product: ${productId}`);
                return;
            }

            // 3. Gọi AI tạo tóm tắt
            const summary = await this.aiService.summarizeReviews(reviews);

            if (!summary) {
                this.logger.warn(`[AI Summary] AI không trả về tóm tắt cho product: ${productId}`);
                return;
            }

            // 4. Cập nhật vào Product Service
            const updateResult = await firstValueFrom(
                this.kafka.send('product.updateReviewSummary', { productId, reviewSummary: summary })
            );

            if (updateResult?.success) {
                this.logger.log(`[AI Summary] Cập nhật tóm tắt thành công cho product: ${productId}`);
            } else {
                this.logger.warn(`[AI Summary] Không thể cập nhật tóm tắt: ${updateResult?.message}`);
            }
        } catch (error) {
            // Fail-safe: chỉ log warning, không throw
            this.logger.warn(`[AI Summary] Lỗi khi tạo tóm tắt cho product ${productId}: ${error.message}`);
        }
    }

@Get()
    async findAll(@Query() q: any) {
        const result = await lastValueFrom(
            this.kafka.send('review.findAll', { q })
        );
  const reviews = result.data || [];

  const userIds = [...new Set(reviews.map(r => r.userId))];
  const users = await lastValueFrom(
    this.kafka.send('user.batch', { ids: userIds })
  );

    console.log("🔥 Review user từ service:", users);
  const userMap = new Map(users.map(u => [u._id, u.name]));

  return reviews.map(r => ({
    ...r,
    name: userMap.get(r.userId) ?? null,
  }));
}

@Get(':id')
findOne(@Param('id') id: string) {
    return this.kafka.send('review.findOne', { id });
}

@Patch(':id')
@UseGuards(AiReviewGuard, AiImageGuard)
@AiImageType('REVIEW_IMAGE')
update(@Param('id') id: string, @Body() dto: any, @Headers('authorization') auth?: string) {
    return this.kafka.send('review.update', { id, dto, auth });
}

@Delete(':id')
remove(@Param('id') id: string, @Headers('authorization') auth?: string) {
    return this.kafka.send('review.delete', { id, auth });
}
}