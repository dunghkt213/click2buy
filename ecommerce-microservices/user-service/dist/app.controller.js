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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const jwt_kafka_guard_1 = require("./auth/jwt-kafka.guard");
const current_user_decorator_1 = require("./auth/current-user.decorator");
const app_service_1 = require("./app.service");
let AppController = class AppController {
    AppService;
    constructor(AppService) {
        this.AppService = AppService;
    }
    async create(data, user) {
        if (user.role !== 'admin') {
            throw new Error('Access denied: Only admins can access all users.');
        }
        else
            return this.AppService.create(data.dto);
    }
    async findAll(data, user) {
        if (user.role !== 'admin') {
            throw new Error('Access denied: Only admins can access all users.');
        }
        else
            return this.AppService.findAll(data.q);
    }
    async findOne(data, user) {
        if (user.role !== 'admin') {
            throw new Error('Access denied: Only admins can access all users.');
        }
        else
            return this.AppService.findOne(data.id);
    }
    async update(data, user) {
        if (user.sub !== data.id) {
            throw new Error('Access denied: You can only update your own profile.');
        }
        else
            return this.AppService.update(data.id, data.dto);
    }
    async deactivate(data, user) {
        if (user.sub !== data.id) {
            throw new Error('Access denied: You can only update your own profile.');
        }
        return this.AppService.deactivate(data.id);
    }
};
exports.AppController = AppController;
__decorate([
    (0, microservices_1.MessagePattern)('user.create'),
    (0, common_1.UseGuards)(jwt_kafka_guard_1.JwtKafkaAuthGuard),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "create", null);
__decorate([
    (0, microservices_1.MessagePattern)('user.findAll'),
    (0, common_1.UseGuards)(jwt_kafka_guard_1.JwtKafkaAuthGuard),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "findAll", null);
__decorate([
    (0, microservices_1.MessagePattern)('user.findOne'),
    (0, common_1.UseGuards)(jwt_kafka_guard_1.JwtKafkaAuthGuard),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "findOne", null);
__decorate([
    (0, microservices_1.MessagePattern)('user.update'),
    (0, common_1.UseGuards)(jwt_kafka_guard_1.JwtKafkaAuthGuard),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "update", null);
__decorate([
    (0, microservices_1.MessagePattern)('user.deactivate'),
    (0, common_1.UseGuards)(jwt_kafka_guard_1.JwtKafkaAuthGuard),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "deactivate", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map