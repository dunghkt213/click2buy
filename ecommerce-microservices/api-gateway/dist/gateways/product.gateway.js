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
exports.ProductGateway = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const inject_decorator_1 = require("@nestjs/common/decorators/core/inject.decorator");
let ProductGateway = class ProductGateway {
    kafka;
    constructor(kafka) {
        this.kafka = kafka;
    }
    async onModuleInit() {
        this.kafka.subscribeToResponseOf('product.create');
        this.kafka.subscribeToResponseOf('product.findAll');
        this.kafka.subscribeToResponseOf('product.findOne');
        this.kafka.subscribeToResponseOf('product.update');
        this.kafka.subscribeToResponseOf('product.remove');
        this.kafka.subscribeToResponseOf('product.search');
        await this.kafka.connect();
    }
    create(dto, auth) {
        return this.kafka.send('product.create', { dto, auth });
    }
    findAll(q) {
        return this.kafka.send('product.findAll', { q });
    }
    findOne(id) {
        return this.kafka.send('product.findOne', { id });
    }
    update(id, dto, auth) {
        return this.kafka.send('product.update', { id, dto, auth });
    }
    remove(id, auth) {
        return this.kafka.send('product.remove', { id, auth });
    }
    search(q) {
        return this.kafka.send('product.search', { q });
    }
};
exports.ProductGateway = ProductGateway;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProductGateway.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductGateway.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductGateway.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], ProductGateway.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProductGateway.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('search'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductGateway.prototype, "search", null);
exports.ProductGateway = ProductGateway = __decorate([
    (0, common_1.Controller)('products'),
    __param(0, (0, inject_decorator_1.Inject)('KAFKA_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientKafka])
], ProductGateway);
//# sourceMappingURL=product.gateway.js.map