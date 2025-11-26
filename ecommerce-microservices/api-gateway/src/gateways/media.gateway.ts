import { Body, Controller, Delete, Get, Param, Post, Put, Query, Headers, UploadedFile, UseInterceptors, } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('media')
export class MediaGateway {
    constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) { }

    async onModuleInit() {
        this.kafka.subscribeToResponseOf('media.upload.request');
        await this.kafka.connect();
    }
  
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadMedia(@UploadedFile() file: any, @Headers('authorization') auth?: string) {
        return this.kafka.send('media.upload.request', {
            buffer: file.buffer.toString('base64'),  // <-- encode
            mimetype: file.mimetype,
            originalname: file.originalname,
            auth,
        });
    }

}
