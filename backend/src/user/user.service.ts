import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable() 
export class UserService  {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Map Document -> DTO (ẩn passwordHash, chuẩn hóa id…)
  private toUserDto(doc: UserDocument): UserDto {
    const obj = doc.toJSON() as any; // đã loại passwordHash trong toJSON
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

  async create(dto: CreateUserDto): Promise<UserDto> {
    // Kiểm tra trùng username/email (đề phòng trước khi đụng unique index)
    const existed = await this.userModel.exists({
      $or: [{ email: dto.email.toLowerCase() }, 
        { username: dto.username.toLowerCase() }],
    });
    if (existed) throw new BadRequestException('Email hoặc username đã tồn tại');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      username: dto.username.toLowerCase(),
      email: dto.email.toLowerCase(),
      passwordHash,
      role: dto.role ?? UserRole.CUSTOMER,
      phone: dto.phone,
      avatar: dto.avatar,
      isActive: true,
      address: [],
    });

    return this.toUserDto(user);
  }

  async findAll(q: QueryUserDto): Promise<{ items: UserDto[]; total: number; 
    page: number; limit: number; totalPages: number; }> {

    const page = Math.max(parseInt(q.page || '1', 10), 1);
    const limit = Math.max(parseInt(q.limit || '10', 10), 1);
    const skip = (page - 1) * limit;

    const filter: FilterQuery<UserDocument> = {};
    if (q.search) {
      const regex = new RegExp(q.search.trim(), 'i');
      filter.$or = [{ username: regex }, { email: regex }, { phone: regex }];
    }
    if (q.role) filter.role = q.role;
    if (typeof q.isActive !== 'undefined') filter.isActive = q.isActive === 'true';

    // sort: '-createdAt,username'
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
    // LƯU Ý: do passwordHash select: false nên kết quả an toàn.
  }

  async findOne(id: string): Promise<UserDto> {
    const doc = await this.userModel.findById(id).exec();
    if (!doc) throw new NotFoundException('User không tồn tại');
    return this.toUserDto(doc);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    const update: any = { ...dto };

  
    if (dto.password) {
      update.passwordHash = await bcrypt.hash(dto.password, 10);
      delete update.password;
    }
    if (dto.email) update.email = dto.email.toLowerCase();
    if (dto.username) update.username = dto.username.toLowerCase();

    try {
      const updated = await this.userModel
        .findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true })
        .exec();
      if (!updated) throw new NotFoundException('User không tồn tại');
      return this.toUserDto(updated);
    } catch (e: any) {

      if (e?.code === 11000) throw new BadRequestException('Email hoặc username đã tồn tại');
      throw e;
    }
  }

  async deactivate(id: string): Promise<{ deactivated: true }> {
    const res = await this.userModel.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true }).exec();
    if (!res) throw new NotFoundException('User không tồn tại');
    return { deactivated: true };
  }

  async hardDelete(id: string): Promise<{ deleted: true }> {
    const res = await this.userModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('User không tồn tại');
    return { deleted: true };
  }

  async findByEmail(email: string): Promise<UserDto | null> {
  const doc = await this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  return doc ? this.toUserDto(doc) : null;
  }

  // user.service.ts
async findWithPassword(email: string) {
  return this.userModel.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash').lean().exec();
}

}
