import {
    Controller,
} from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
    constructor(private readonly mediaService: AppService) { }

    @MessagePattern('media.upload.request')
    async handleUpload(@Payload() data: any) {
        const rawBuffer = Buffer.from(data.buffer, 'base64');  // <-- decode
        return this.mediaService.uploadBuffer(rawBuffer, data.mimetype);
    }

}
