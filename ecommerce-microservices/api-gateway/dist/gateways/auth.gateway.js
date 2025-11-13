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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGateway = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const login_dto_1 = require("../dtos/auth/login.dto");
const register_dto_1 = require("../dtos/auth/register.dto");
const inject_decorator_1 = require("@nestjs/common/decorators/core/inject.decorator");
let AuthGateway = class AuthGateway {
    kafka;
    constructor(kafka) {
        this.kafka = kafka;
    }
    async onModuleInit() {
        this.kafka.subscribeToResponseOf('auth.login');
        this.kafka.subscribeToResponseOf('auth.register');
        await this.kafka.connect();
    }
    login(dto) {
        return this.kafka.send('auth.login', dto);
    }
    register(dto) {
        return this.kafka.send('auth.register', dto);
    }
};
exports.AuthGateway = AuthGateway;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthGateway.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthGateway.prototype, "register", null);
exports.AuthGateway = AuthGateway = __decorate([
    (0, common_1.Controller)('auth'),
    __param(0, (0, inject_decorator_1.Inject)('KAFKA_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientKafka])
], AuthGateway);
//# sourceMappingURL=auth.gateway.js.map