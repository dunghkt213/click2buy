import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { GoogleDrive } from './google-drive';

@Injectable()
export class AppService {
    private drive: GoogleDrive;

    constructor(
        @Inject('MEDIA_SERVICE')
        private readonly kafka: ClientKafka,
    ) {
        this.drive = new GoogleDrive();
    }
    async uploadBuffer(buffer: Buffer, mimetype: string) {
        const url = await this.drive.uploadBuffer(buffer, mimetype);
        return {
            success: true,
            url,
        };
    }

    // ----------UPLOAD-----------------
    async uploadImages(imagesBase64: string[]) {
        const urls: string[] = [];

        for (const img of imagesBase64) {
            const buffer = this.base64ToBuffer(img);
            const { thumbnailUrl } = await this.drive.uploadBuffer(buffer, 'image/jpeg');
            urls.push(thumbnailUrl);
        }

        return {
            success: true,
            urls,
        };
    }

    private base64ToBuffer(b64: string): Buffer {
        const parts = b64.split(',');
        return Buffer.from(parts.length > 1 ? parts[1] : b64, 'base64');
    }
}
