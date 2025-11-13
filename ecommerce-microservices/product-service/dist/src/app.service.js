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
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("../schemas/product.schema");
let AppService = class AppService {
    productModel;
    constructor(productModel) {
        this.productModel = productModel;
    }
    async create(dto) {
        const created = await this.productModel.create(dto);
        return { success: true, data: created };
    }
    async findAll(q) {
        const page = Math.max(parseInt(q?.page || '1', 10), 1);
        const limit = Math.max(parseInt(q?.limit || '10', 10), 1);
        const skip = (page - 1) * limit;
        const filter = {};
        if (q?.keyword) {
            filter.name = new RegExp(q.keyword.trim(), 'i');
        }
        const sort = q?.sort ? q.sort.replace(/,/g, ' ') : '-createdAt';
        const [data, total] = await Promise.all([
            this.productModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            this.productModel.countDocuments(filter),
        ]);
        return {
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const product = await this.productModel.findById(id).lean();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return { success: true, data: product };
    }
    async update(id, dto) {
        const updated = await this.productModel.findByIdAndUpdate(id, dto, { new: true }).lean();
        if (!updated)
            throw new common_1.NotFoundException('Product not found');
        return { success: true, data: updated };
    }
    async remove(id) {
        const deleted = await this.productModel.findByIdAndDelete(id).lean();
        if (!deleted)
            throw new common_1.NotFoundException('Product not found');
        return { success: true, message: 'Product deleted successfully' };
    }
    async search(q) {
        const keyword = q?.keyword || '';
        const data = await this.productModel.find({ name: new RegExp(keyword, 'i') }).lean();
        return { success: true, data };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AppService);
//# sourceMappingURL=app.service.js.map