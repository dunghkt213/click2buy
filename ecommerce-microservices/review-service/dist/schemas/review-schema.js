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
exports.ReviewSchema = exports.Review = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongo_schema_util_1 = require("./mongo-schema.util");
let Review = class Review {
    productId;
    userId;
    rating;
    comment;
    images;
    isApproved;
};
exports.Review = Review;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], Review.prototype, "productId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], Review.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1, max: 5 }),
    __metadata("design:type", Number)
], Review.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], Review.prototype, "comment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Review.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Review.prototype, "isApproved", void 0);
exports.Review = Review = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'reviews' })
], Review);
exports.ReviewSchema = (0, mongo_schema_util_1.createMongoSchema)(Review);
exports.ReviewSchema.index({ productId: 1 });
exports.ReviewSchema.index({ userId: 1 });
exports.ReviewSchema.index({ rating: -1 });
exports.ReviewSchema.index({ isApproved: 1 });
exports.ReviewSchema.index({ createdAt: -1 });
//# sourceMappingURL=review-schema.js.map