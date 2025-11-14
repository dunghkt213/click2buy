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
exports.UserGateway = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const inject_decorator_1 = require("@nestjs/common/decorators/core/inject.decorator");
let UserGateway = class UserGateway {
    kafka;
    constructor(kafka) {
        this.kafka = kafka;
    }
    async onModuleInit() {
        this.kafka.subscribeToResponseOf('user.create');
        this.kafka.subscribeToResponseOf('user.findAll');
        this.kafka.subscribeToResponseOf('user.findOne');
        this.kafka.subscribeToResponseOf('user.update');
        this.kafka.subscribeToResponseOf('user.deactivate');
        await this.kafka.connect();
    }
    create(dto, auth) {
        return this.kafka.send('user.create', { dto, auth });
    }
    findAll(q, auth) {
        return this.kafka.send('user.findAll', { q, auth });
    }
    findOne(id, auth) {
        return this.kafka.send('user.findOne', { id, auth });
    }
    update(id, dto, auth) {
        return this.kafka.send('user.update', { id, dto, auth });
    }
    deactivate(id, auth) {
        return this.kafka.send('user.deactivate', { id, auth });
    }
};
exports.UserGateway = UserGateway;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UserGateway.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UserGateway.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UserGateway.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], UserGateway.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UserGateway.prototype, "deactivate", null);
exports.UserGateway = UserGateway = __decorate([
    (0, common_1.Controller)('users'),
    __param(0, (0, inject_decorator_1.Inject)('KAFKA_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientKafka])
], UserGateway);
//# sourceMappingURL=user.gateway.js.map