"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const bcrypt = __importStar(require("bcryptjs"));
const user_schema_1 = require("./schemas/user.schema");
let AppService = class AppService {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    toUserDto(doc) {
        const obj = doc.toJSON();
        return {
            id: obj.id,
            username: obj.username,
            email: obj.email,
            role: obj.role,
            phone: obj.phone,
            avatar: obj.avatar,
            isActive: obj.isActive,
            lastLogin: obj.lastLogin,
            createdAt: obj.createdAt,
            updatedAt: obj.updatedAt,
            address: obj.address || [],
        };
    }
    async create(dto) {
        const existed = await this.userModel.exists({
            $or: [{ email: dto.email.toLowerCase() },
                { username: dto.username.toLowerCase() }],
        });
        if (existed)
            throw new common_1.BadRequestException('Email hoặc username đã tồn tại');
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.userModel.create({
            username: dto.username.toLowerCase(),
            email: dto.email.toLowerCase(),
            passwordHash,
            role: dto.role ?? user_schema_1.UserRole.CUSTOMER,
            phone: dto.phone,
            avatar: dto.avatar,
            isActive: true,
            address: [],
        });
        return this.toUserDto(user);
    }
    async findAll(q) {
        const page = Math.max(parseInt(q.page || '1', 10), 1);
        const limit = Math.max(parseInt(q.limit || '10', 10), 1);
        const skip = (page - 1) * limit;
        const filter = {};
        if (q.search) {
            const regex = new RegExp(q.search.trim(), 'i');
            filter.$or = [{ username: regex }, { email: regex }, { phone: regex }];
        }
        if (q.role)
            filter.role = q.role;
        if (typeof q.isActive !== 'undefined')
            filter.isActive = q.isActive === 'true';
        const sort = q.sort ? q.sort.replace(/,/g, ' ') : '-createdAt';
        const [docs, total] = await Promise.all([
            this.userModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
            this.userModel.countDocuments(filter),
        ]);
        return {
            items: docs.map((d) => this.toUserDto(d)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const doc = await this.userModel.findById(id).exec();
        if (!doc)
            throw new common_1.NotFoundException('User không tồn tại');
        return this.toUserDto(doc);
    }
    async update(id, dto) {
        const update = { ...dto };
        if (dto.password) {
            update.passwordHash = await bcrypt.hash(dto.password, 10);
            delete update.password;
        }
        if (dto.email)
            update.email = dto.email.toLowerCase();
        if (dto.username)
            update.username = dto.username.toLowerCase();
        try {
            const updated = await this.userModel
                .findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true })
                .exec();
            if (!updated)
                throw new common_1.NotFoundException('User không tồn tại');
            return this.toUserDto(updated);
        }
        catch (e) {
            if (e?.code === 11000)
                throw new common_1.BadRequestException('Email hoặc username đã tồn tại');
            throw e;
        }
    }
    async deactivate(id) {
        const res = await this.userModel.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true }).exec();
        if (!res)
            throw new common_1.NotFoundException('User không tồn tại');
        return { deactivated: true };
    }
    async hardDelete(id) {
        const res = await this.userModel.findByIdAndDelete(id).exec();
        if (!res)
            throw new common_1.NotFoundException('User không tồn tại');
        return { deleted: true };
    }
    async findByEmail(email) {
        const doc = await this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
        return doc ? this.toUserDto(doc) : null;
    }
    async findWithPassword(email) {
        return this.userModel.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash').lean().exec();
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AppService);
//# sourceMappingURL=app.service.js.map