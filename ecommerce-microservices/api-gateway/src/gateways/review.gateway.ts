import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import {
    ApiTags,
    ApiOperation,
    ApiQuery,
    ApiParam,
    ApiBody,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateReviewDto } from 'src/dtos/review/create-review.dto';
import { UpdateReviewDto } from 'src/dtos/review/update-review.dto';

@Controller('reviews')
export class ReviewGateway {
    constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) { }

    async onModuleInit() {
        this.kafka.subscribeToResponseOf('review.create');
        this.kafka.subscribeToResponseOf('review.findAll');
        this.kafka.subscribeToResponseOf('review.findOne');
        this.kafka.subscribeToResponseOf('review.update');
        this.kafka.subscribeToResponseOf('review.delete');
        await this.kafka.connect();
    }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tạo review mới cho sản phẩm' })
    @ApiBody({ type: CreateReviewDto })
    create(@Body() dto: any, @Headers('authorization') auth?: string) { 
        return this.kafka.send('review.create', { dto, auth });
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả review (search, filter)' })
    @ApiQuery({
        name: 'productId',
        required: false,
        example: '67467bd24993cd524ff1a120',
    })
    @ApiQuery({
        name: 'rating',
        required: false,
        description: 'Lọc theo rating 1–5',
        example: 5,
    })
    findAll(@Query() q: any) {
        console.log("Lấy tất cả review");
        return this.kafka.send('review.findAll', { q });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết 1 review theo ID' })
    @ApiParam({ name: 'id', example: '67467bd24993cd524ff1a120' })
    findOne(@Param('id') id: string) {
        return this.kafka.send('review.findOne', { id });
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cập nhật 1 review theo ID' })
    @ApiParam({ name: 'id', example: '67467bd24993cd524ff1a120' })
    @ApiBody({ type: UpdateReviewDto })
    update(@Param('id') id: string, @Body() dto: any, @Headers('authorization') auth?: string) {
        return this.kafka.send('review.update', { id, dto, auth });
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xoá review' })
    @ApiParam({ name: 'id', example: '67467bd24993cd524ff1a120' })
    remove(@Param('id') id: string, @Headers('authorization') auth?: string) {
        return this.kafka.send('review.delete', { id, auth });
    }
}