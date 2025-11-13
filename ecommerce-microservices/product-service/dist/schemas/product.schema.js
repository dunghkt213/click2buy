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
exports.ProductSchema = exports.Product = exports.WarehouseAddress = exports.ProductCondition = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongo_schema_util_1 = require("./mongo-schema.util");
var ProductCondition;
(function (ProductCondition) {
    ProductCondition["NEW"] = "new";
    ProductCondition["USED"] = "used";
})(ProductCondition || (exports.ProductCondition = ProductCondition = {}));
let WarehouseAddress = class WarehouseAddress {
    line1;
    line2;
    city;
    province;
    country;
    postalCode;
};
exports.WarehouseAddress = WarehouseAddress;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], WarehouseAddress.prototype, "line1", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], WarehouseAddress.prototype, "line2", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], WarehouseAddress.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], WarehouseAddress.prototype, "province", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], WarehouseAddress.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], WarehouseAddress.prototype, "postalCode", void 0);
exports.WarehouseAddress = WarehouseAddress = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], WarehouseAddress);
let Product = class Product {
    name;
    description;
    price;
    salePrice;
    stock;
    isActive;
    brand;
    condition;
    tags;
    images;
    categoryIds;
    attributes;
    variants;
    ratingAvg;
    warehouseAddress;
};
exports.Product = Product;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Product.prototype, "salePrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "stock", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Product.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Product.prototype, "brand", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: Object.values(ProductCondition), default: ProductCondition.NEW }),
    __metadata("design:type", String)
], Product.prototype, "condition", void 0);
__decorate([
    (0, mongoose_1.Prop)([{ type: String }]),
    __metadata("design:type", Array)
], Product.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)([{ type: String }]),
    __metadata("design:type", Array)
], Product.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], ref: 'Category' }),
    __metadata("design:type", Array)
], Product.prototype, "categoryIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Product.prototype, "attributes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Product.prototype, "variants", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "ratingAvg", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: WarehouseAddress }),
    __metadata("design:type", WarehouseAddress)
], Product.prototype, "warehouseAddress", void 0);
exports.Product = Product = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'products' })
], Product);
exports.ProductSchema = (0, mongo_schema_util_1.createMongoSchema)(Product);
exports.ProductSchema.index({ name: 'text', brand: 'text', tags: 'text', description: 'text' });
exports.ProductSchema.index({ brand: 1 });
exports.ProductSchema.index({ ratingAvg: -1 });
exports.ProductSchema.index({ categoryIds: 1 });
exports.ProductSchema.index({ condition: 1 });
exports.ProductSchema.index({ isActive: 1 });
//# sourceMappingURL=product.schema.js.map