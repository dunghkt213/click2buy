import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { kafkaRequest } from 'src/common/kafka-request.helper';
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
    create(@Body() dto: any, @Headers('authorization') auth?: string) {
        // service sẽ tự trích user từ token (JwtAuthGuard trong service)
        return kafkaRequest(this.kafka, 'review.create', { dto, auth });
    }

    @Get()
    findAll(@Query() q: any) {
        return kafkaRequest(this.kafka, 'review.findAll', { q });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return kafkaRequest(this.kafka, 'review.findOne', { id });
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: any, @Headers('authorization') auth?: string) {
        return kafkaRequest(this.kafka, 'review.update', { id, dto, auth });
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Headers('authorization') auth?: string) {
        return kafkaRequest(this.kafka, 'review.delete', { id, auth });
    }
}