import { Body, Controller, Delete, Get, Headers, Logger, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { AiReviewGuard } from '../guards/ai-review.guard';
import { AiImageGuard } from '../guards/ai-image.guard';
import { AiImageType } from '../decorators/ai-image-type.decorator';
import { AiService } from '../modules/ai-guard/ai.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

/**
 * Cache entry cho review summary
 */
interface ReviewSummaryCache {
    cachedSummary: string | null;
    cachedLastReviewUpdatedAt: number; // timestamp ms
    lastAiCallAt: number; // timestamp ms
}

@Controller('reviews')
export class ReviewGateway {
    private readonly logger = new Logger(ReviewGateway.name);
    
    // In-memory cache cho review summary (productId -> cache)
    private readonly summaryCache = new Map<string, ReviewSummaryCache>();
    
    // Cooldown period (ms) - default 60s
    private readonly cooldownMs: number;

    constructor(
        @Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka,
        private readonly aiService: AiService,
        private readonly configService: ConfigService,
    ) {
        // Đọc cooldown từ ENV, default 60s
        const cooldownSeconds = parseInt(
            this.configService.get<string>('REVIEW_SUMMARY_COOLDOWN_SECONDS') || '60',
            10
        );
        this.cooldownMs = cooldownSeconds * 1000;
        this.logger.log(`[AI Summary] Cooldown set to ${cooldownSeconds}s`);
    }

    async onModuleInit() {
        this.kafka.subscribeToResponseOf('review.create');
        this.kafka.subscribeToResponseOf('review.findAll');
        this.kafka.subscribeToResponseOf('review.findOne');
        this.kafka.subscribeToResponseOf('review.update');
        this.kafka.subscribeToResponseOf('review.delete');
        this.kafka.subscribeToResponseOf('review.SellerReply');
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
     * Lấy N review gần nhất và gọi AI tạo tóm tắt (với cache + cooldown)
     * Fail-safe: không throw error, chỉ log warning
     * 
     * TEST (Postman):
     * 1. POST /reviews với productId X → gọi AI lần 1
     * 2. POST /reviews với productId X ngay sau đó → skip (cooldown)
     * 3. GET /reviews?productId=X nhiều lần → không gọi AI (không trigger summary)
     * 4. Đợi >60s, POST /reviews với productId X → gọi AI lần 2 (nếu có review mới)
     */
    private async generateAndUpdateReviewSummary(productId: string): Promise<void> {
        try {
            const now = Date.now();
            const cache = this.summaryCache.get(productId);

            // 1. Lấy tất cả review của sản phẩm
            const reviewsResult = await firstValueFrom(
                this.kafka.send('review.findAll', { q: { productId } })
            );

            if (!reviewsResult?.success || !reviewsResult?.data?.length) {
                this.logger.debug(`[AI Summary] Không có review cho product: ${productId}`);
                return;
            }

            const allReviews = reviewsResult.data;

            // 2. Tính lastReviewUpdatedAt = max(updatedAt hoặc createdAt)
            const lastReviewUpdatedAt = Math.max(
                ...allReviews.map((r: any) => {
                    const updatedAt = r.updatedAt ? new Date(r.updatedAt).getTime() : 0;
                    const createdAt = r.createdAt ? new Date(r.createdAt).getTime() : 0;
                    return Math.max(updatedAt, createdAt);
                })
            );

            this.logger.log(
                `[AI Summary] product=${productId}, lastReviewUpdatedAt=${new Date(lastReviewUpdatedAt).toISOString()}, ` +
                `cached=${cache?.cachedLastReviewUpdatedAt ? new Date(cache.cachedLastReviewUpdatedAt).toISOString() : 'none'}`
            );

            // 3. Check cache: nếu không có review mới, skip
            if (cache && lastReviewUpdatedAt <= cache.cachedLastReviewUpdatedAt) {
                this.logger.log(
                    `[AI Summary] SKIP: skip_due_to_cache (no new reviews) - product=${productId}`
                );
                return;
            }

            // 4. Check cooldown: nếu gọi AI quá gần, skip
            if (cache && (now - cache.lastAiCallAt) < this.cooldownMs) {
                const remainingSec = Math.ceil((this.cooldownMs - (now - cache.lastAiCallAt)) / 1000);
                this.logger.log(
                    `[AI Summary] SKIP: skip_due_to_cooldown (${remainingSec}s remaining) - product=${productId}`
                );
                return;
            }

            // 5. Lấy tối đa 10 review có comment để tóm tắt
            const reviewTexts = allReviews
                .filter((r: any) => r.comment && r.comment.trim())
                .slice(0, 10)
                .map((r: any) => r.comment);

            if (reviewTexts.length === 0) {
                this.logger.debug(`[AI Summary] Không có review có nội dung cho product: ${productId}`);
                return;
            }

            // 6. GỌI AI TẠO TÓM TẮT
            this.logger.log(`[AI Summary] RUN_AI: Calling Gemini for product=${productId} (${reviewTexts.length} reviews)`);
            const summary = await this.aiService.summarizeReviews(reviewTexts);

            if (!summary) {
                this.logger.warn(`[AI Summary] AI không trả về tóm tắt cho product: ${productId}`);
                // KHÔNG update cache nếu AI fail (để retry sau)
                return;
            }

            // 7. Cập nhật vào Product Service
            const updateResult = await firstValueFrom(
                this.kafka.send('product.updateReviewSummary', { productId, reviewSummary: summary })
            );

            if (updateResult?.success) {
                this.logger.log(`[AI Summary] SUCCESS: Updated summary for product=${productId}`);
                
                // 8. CẬP NHẬT CACHE (chỉ khi thành công)
                this.summaryCache.set(productId, {
                    cachedSummary: summary,
                    cachedLastReviewUpdatedAt: lastReviewUpdatedAt,
                    lastAiCallAt: now,
                });
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

@Patch('Seller/:id')
@UseGuards(AiReviewGuard, AiImageGuard)
@AiImageType('REVIEW_IMAGE')
SellerReply(@Param('id') id: string, @Body() dto: any, @Headers('authorization') auth?: string) {
    return this.kafka.send('review.SellerReply', { id, dto, auth });
}

@Delete(':id')
remove(@Param('id') id: string, @Headers('authorization') auth?: string) {
    return this.kafka.send('review.delete', { id, auth });
}
}