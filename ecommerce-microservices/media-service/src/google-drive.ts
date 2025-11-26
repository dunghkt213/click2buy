import { google } from 'googleapis';
import { Readable } from 'stream';

export class GoogleDrive {
    private drive;
    private oauth2;

    constructor() {
        this.oauth2 = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground' // quan trọng
        );

        this.oauth2.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        });

        this.drive = google.drive({
            version: 'v3',
            auth: this.oauth2,
        });
    }

    async uploadBuffer(buffer: Buffer, mimeType: string) {
        const stream = this.bufferToStream(buffer);

        const res = await this.drive.files.create({
            requestBody: {
                name: `media-${Date.now()}`,
                parents: [process.env.DRIVE_FOLDER_ID],
            },
            media: {
                mimeType,
                body: stream,
            },
            fields: 'id',
        });

        const fileId = res.data.id;

        await this.drive.permissions.create({
            fileId,
            requestBody: { role: 'reader', type: 'anyone' },
        });

        return `https://drive.google.com/uc?id=${fileId}`;
    }


    bufferToStream(buffer: Buffer) {
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        return readable;
    }
}
