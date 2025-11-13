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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const review_schema_1 = require("../schemas/review-schema");
const microservices_1 = require("@nestjs/microservices");
let AppService = class AppService {
    reviewModel;
    constructor(reviewModel) {
        this.reviewModel = reviewModel;
    }
    async create(dto, userId) {
        if (!dto.productId || !dto.rating) {
            throw new common_1.BadRequestException('ProductId and rating are required');
        }
        const newReview = new this.reviewModel({
            ...dto,
            userId,
            createdAt: new Date(),
        });
        const created = await newReview.save();
        return {
            success: true,
            message: 'Review created successfully',
            data: created,
        };
    }
    async findAll(q) {
        const filter = {};
        if (q?.productId)
            filter.productId = q.productId;
        if (q?.userId)
            filter.userId = q.userId;
        const data = await this.reviewModel.find(filter).sort({ createdAt: -1 }).lean();
        return { success: true, data };
    }
    async findOne(id) {
        const review = await this.reviewModel.findById(id).lean();
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        return { success: true, data: review };
    }
    async update(id, dto, userId) {
        const review = await this.reviewModel.findById(id);
        if (!review) {
            console.log('🧩 Throwing RpcException: { statusCode: 404, message: "Review not found" }');
            throw new microservices_1.RpcException({ statusCode: 404, message: 'Review not found' });
        }
        if (review.userId.toString() !== userId) {
            console.log('🧩 Throwing RpcException: { statusCode: 403, message: "You are not allowed to edit this review" }');
            throw new microservices_1.RpcException({ statusCode: 403, message: 'You are not allowed to edit this review' });
        }
        Object.assign(review, dto);
        const updated = await review.save();
        return {
            success: true,
            message: 'Review updated successfully',
            data: updated,
        };
    }
    async remove({ id, userId }) {
        const review = await this.reviewModel.findById(id);
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (review.userId.toString() !== userId) {
            throw new common_1.ForbiddenException('You are not allowed to delete this review');
        }
        await this.reviewModel.findByIdAndDelete(id);
        return {
            success: true,
            message: 'Review deleted successfully',
            deletedId: id,
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(review_schema_1.Review.name)),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], AppService);
//# sourceMappingURL=app.service.js.map