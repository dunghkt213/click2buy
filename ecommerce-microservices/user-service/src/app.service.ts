import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import{  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole, AuthProvider } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UserDto } from './dto/user.dto';
import { error, log } from 'console';
// TEST HOT RELOAD
import { ClientKafka } from '@nestjs/microservices';
@Injectable() 
export class AppService  {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
  @Inject('USER_SERVICE')
  private readonly UserClient: ClientKafka,
) {}
    async onModuleInit() {
    // cần để send().toPromise() hoạt động
    this.UserClient.subscribeToResponseOf('auth.new_token');
  }

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
      shopName: obj.shopName,
      shopDescription: obj.shopDescription,
      shopAddress :obj.shopAddress,
      shopPhone: obj.shopPhone,
      shopEmail: obj.shopEmail,
    };
  }

    private toShopDto(doc: any) {
    const obj = doc.toJSON() as any; // đã loại passwordHash trong toJSON
    return {
      id: obj.id,
      shopName: obj.shopName,
      shopDescription: obj.shopDescription,
      shopAddress :obj.shopAddress,
      shopPhone: obj.shopPhone,
      shopEmail: obj.shopEmail,
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
      role: 'customer' as UserRole,
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

async findByforpasswordHash(
  value: string
) {
  // ❗ Chặn lỗi nguy hiểm: field hoặc value bị undefined → query thành {}
  if (!value) {
    throw new NotFoundException('Không tìm thấy người dùng (tham số không hợp lệ)');
  }
  const query: any = {};

  query['username'] = value.toLowerCase();

  console.log("🔎 Query chạy:", query);

  const doc = await this.userModel
    .findOne(query)
    .select("+passwordHash")
    .lean() // ⚡ lean() đảm bảo trả về object THÔ, không biến dạng
    .exec();

  // Nếu không tìm thấy → return null (không throw)
  if (!doc) {
    console.log("❌ User không tồn tại");
    return null;
  }

  console.log("🔥 Found user:", doc);

  return doc;
}
async getInforShop( value: string) {
  // ❗ Chặn lỗi nguy hiểm: field hoặc value bị undefined → query thành {}
  let field = '_id';
  if (!field || !value) {
    throw new NotFoundException('Không tìm thấy người dùng (tham số không hợp lệ)');
  }

  const query: any = {};

  if (field === 'username' || field === 'email') {
    query[field] = value.toLowerCase();
  } else if (field === '_id') {
    query[field] = value;
  } else {
    // ❗ Nếu field không hợp lệ
    throw new NotFoundException('Không tìm thấy người dùng (field không hợp lệ)');
  }

  console.log("🔍 Running findBy with query:", query);

  const user = await this.userModel
    .findOne(query)
    .select("-passwordHash")   // xoá mật khẩu khi trả về
    .lean()
    .exec();

  // ❗ Nếu không tìm thấy → báo lỗi đúng chuẩn
  if (!user) {
    throw new NotFoundException('Không tìm thấy người dùng');
  }

  return this.toShopDto(user);
}

async findBy(field: 'username' | 'email' | '_id', value: string) {
  // ❗ Chặn lỗi nguy hiểm: field hoặc value bị undefined → query thành {}
  if (!field || !value) {
    throw new NotFoundException('Không tìm thấy người dùng (tham số không hợp lệ)');
  }

  const query: any = {};

  if (field === 'username' || field === 'email') {
    query[field] = value.toLowerCase();
  } else if (field === '_id') {
    query[field] = value;
  } else {
    // ❗ Nếu field không hợp lệ
    throw new NotFoundException('Không tìm thấy người dùng (field không hợp lệ)');
  }

  console.log("🔍 Running findBy with query:", query);

  const user = await this.userModel
    .findOne(query)
    .select("-passwordHash")   // xoá mật khẩu khi trả về
    .lean()
    .exec();

  // ❗ Nếu không tìm thấy → báo lỗi đúng chuẩn
  if (!user) {
    throw new NotFoundException('Không tìm thấy người dùng');
  }

  return user;
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
 async updateRoleSeller(userId: string, payload: any) {
  // Validate tối thiểu
  console.log("payload:", payload.shopName, payload.shopAddress, payload.shopPhone);
  if (!payload.shopName || !payload.shopAddress || !payload.shopPhone) {
    throw new BadRequestException(
      'shopName, shopAddress and shopPhone are required for seller registration'
    );
  }
  // Tự set role = seller
  payload.role = UserRole.SELLER;

  const updated = await this.userModel.findByIdAndUpdate(
    userId,
    { $set: payload },
    { new: true }
  );
  console.log("updated user role seller:", updated);
  if (!updated) {
    throw new error('User not found');
  }
  const tokenResponse = await this.UserClient
  .send('auth.new_token', { userId, userRole: UserRole.SELLER })
  .toPromise();

  const accessToken = tokenResponse?.data?.accessToken;
  const refreshTokenInfo = tokenResponse?.data?.refreshTokenInfo;

  console.log("new token after update role:", accessToken, refreshTokenInfo);
  return {
    user: this.toUserDto(updated),
    accessToken: accessToken,
    refreshTokenInfo: refreshTokenInfo,
  };
}

// ==================== SOCIAL LOGIN ====================

async findOrCreateSocial(data: {
  provider: 'google' | 'facebook';
  socialId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}): Promise<UserDto> {
  const { provider, socialId, email, firstName, lastName, avatar } = data;

  // Tìm user theo socialId
  const socialIdField = provider === 'google' ? 'googleId' : 'facebookId';
  let user = await this.userModel.findOne({ [socialIdField]: socialId }).exec();

  if (user) {
    // Cập nhật lastLogin
    user.lastLogin = new Date();
    await user.save();
    return this.toUserDto(user);
  }

  // Nếu có email, tìm user theo email
  if (email) {
    user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    if (user) {
      // Link social account vào user hiện có
      user[socialIdField] = socialId;
      user.provider = provider as AuthProvider;
      if (avatar && !user.avatar) user.avatar = avatar;
      user.lastLogin = new Date();
      await user.save();
      return this.toUserDto(user);
    }
  }

  // Tạo user mới
  const username = this.generateUsername(email, firstName, lastName, socialId);
  
  const newUser = await this.userModel.create({
    username,
    email: email?.toLowerCase(),
    [socialIdField]: socialId,
    socialId,
    provider: provider as AuthProvider,
    role: UserRole.CUSTOMER,
    avatar,
    isActive: true,
    lastLogin: new Date(),
    address: [],
  });

  console.log(`✅ Created new user via ${provider}:`, newUser.username);
  return this.toUserDto(newUser);
}

// ==================== PHONE LOGIN ====================

async findOrCreateByPhone(data: { phone: string }): Promise<UserDto> {
  const { phone } = data;

  // Tìm user theo số điện thoại
  let user = await this.userModel.findOne({ phone }).exec();

  if (user) {
    user.lastLogin = new Date();
    await user.save();
    return this.toUserDto(user);
  }

  // Tạo user mới với số điện thoại
  const username = `user_${phone.replace(/\D/g, '').slice(-8)}`;
  
  const newUser = await this.userModel.create({
    username,
    phone,
    provider: AuthProvider.PHONE,
    role: UserRole.CUSTOMER,
    isActive: true,
    lastLogin: new Date(),
    address: [],
  });

  console.log(`✅ Created new user via phone:`, newUser.username);
  return this.toUserDto(newUser);
}

// ==================== HELPER ====================

private generateUsername(
  email?: string,
  firstName?: string,
  lastName?: string,
  socialId?: string,
): string {
  if (email) {
    const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${base}_${Date.now().toString(36)}`;
  }
  
  if (firstName || lastName) {
    const name = `${firstName || ''}${lastName || ''}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${name}_${Date.now().toString(36)}`;
  }

  return `user_${socialId?.slice(-8) || Date.now().toString(36)}`;
}

}
