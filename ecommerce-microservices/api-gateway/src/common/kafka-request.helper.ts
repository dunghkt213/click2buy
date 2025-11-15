import { HttpException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

export async function kafkaRequest(kafka, topic: string, payload: any) {
    try {
        return await firstValueFrom(kafka.send(topic, payload));
    } catch (err) {
        // Trường hợp Kafka gửi lỗi dạng RpcException
        if (err?.status && err?.message) {
            throw new HttpException(err.message, err.status);
        }

        // Trường hợp Kafka trả lỗi dạng khác
        if (err?.response?.status && err?.response?.message) {
            throw new HttpException(err.response.message, err.response.status);
        }

        // Fallback → Unknown error
        throw new HttpException('Internal Kafka error', 500);
    }
}
 