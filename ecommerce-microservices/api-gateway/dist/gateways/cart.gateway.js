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
exports.CartGateway = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const inject_decorator_1 = require("@nestjs/common/decorators/core/inject.decorator");
let CartGateway = class CartGateway {
    constructor(kafka) {
        this.kafka = kafka;
    }
    async onModuleInit() {
        this.kafka.subscribeToResponseOf('cart.get');
        this.kafka.subscribeToResponseOf('cart.addItem');
        this.kafka.subscribeToResponseOf('cart.updateItem');
        this.kafka.subscribeToResponseOf('cart.removeItem');
        this.kafka.subscribeToResponseOf('cart.clear');
        await this.kafka.connect();
    }
    getCart(auth) {
        return this.kafka.send('cart.get', { auth });
    }
    addItem(dto, auth) {
        return this.kafka.send('cart.addItem', { dto, auth });
    }
    updateItem(productId, dto, auth) {
        return this.kafka.send('cart.updateItem', { productId, dto, auth });
    }
    removeItem(productId, auth) {
        return this.kafka.send('cart.removeItem', { productId, auth });
    }
    clear(auth) {
        return this.kafka.send('cart.clear', { auth });
    }
};
exports.CartGateway = CartGateway;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CartGateway.prototype, "getCart", null);
__decorate([
    (0, common_1.Post)('items'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CartGateway.prototype, "addItem", null);
__decorate([
    (0, common_1.Patch)('items/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], CartGateway.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('items/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CartGateway.prototype, "removeItem", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CartGateway.prototype, "clear", null);
exports.CartGateway = CartGateway = __decorate([
    (0, common_1.Controller)('cart'),
    __param(0, (0, inject_decorator_1.Inject)('KAFKA_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientKafka])
], CartGateway);
//# sourceMappingURL=cart.gateway.js.map