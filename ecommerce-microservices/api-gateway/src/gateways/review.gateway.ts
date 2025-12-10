import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { AiReviewGuard } from '../guards/ai-review.guard';

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
    @UseGuards(AiReviewGuard)
    create(@Body() dto: any, @Headers('authorization') auth?: string) { 
        return this.kafka.send('review.create', { dto, auth });
    }

    @Get()
    findAll(@Query() q: any) {
        console.log("Lấy tất cả review");
        return this.kafka.send('review.findAll', { q });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.kafka.send('review.findOne', { id });
    }

    @Patch(':id')
    @UseGuards(AiReviewGuard)
    update(@Param('id') id: string, @Body() dto: any, @Headers('authorization') auth?: string) {
        return this.kafka.send('review.update', { id, dto, auth });
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Headers('authorization') auth?: string) {
        return this.kafka.send('review.delete', { id, auth });
    }
}