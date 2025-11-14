"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtKafkaAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_service_1 = require("./jwt.service");
let JwtKafkaAuthGuard = class JwtKafkaAuthGuard {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    canActivate(context) {
        console.log('📩 Incoming Kafka data:', context.switchToRpc().getData());
        const data = context.switchToRpc().getData();
        const authHeader = data?.authorization || data?.auth;
        if (!authHeader) {
            throw new common_1.UnauthorizedException('Missing authorization field in message');
        }
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : authHeader;
        const payload = this.jwtService.validateToken(token);
        if (!payload) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        data.user = payload;
        return true;
    }
};
exports.JwtKafkaAuthGuard = JwtKafkaAuthGuard;
exports.JwtKafkaAuthGuard = JwtKafkaAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_service_1.JwtService])
], JwtKafkaAuthGuard);
//# sourceMappingURL=jwt-kafka.guard.js.map