"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleKafkaRequest = handleKafkaRequest;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
async function handleKafkaRequest(kafka, topic, payload) {
    try {
        // 📨 Gửi message và chờ Kafka phản hồi
        const result = await (0, rxjs_1.lastValueFrom)(kafka.send(topic, payload));
        return result;
    }
    catch (err) {
        // 🧩 Log lỗi thật để debug
        console.log('📥 RAW KAFKA ERROR:', JSON.stringify(err, null, 2));
        // 🧩 Kafka có thể bọc RpcException nhiều lớp
        const rpcError = err?.response ||
            err?.err?.response ||
            err?.err ||
            err;
        const status = rpcError?.statusCode || rpcError?.status || 500;
        const message = rpcError?.message || 'Internal server error';
        console.log('🧩 Parsed RPC Error:', { status, message });
        // 🧩 Map lỗi RPC → HTTP Exception
        switch (status) {
            case 400:
                throw new common_1.BadRequestException(message);
            case 403:
                throw new common_1.ForbiddenException(message);
            case 404:
                throw new common_1.NotFoundException(message);
            default:
                throw new common_1.InternalServerErrorException(message);
        }
    }
}
//# sourceMappingURL=kafka.helper.js.map