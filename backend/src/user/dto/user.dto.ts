import { UserRole } from '../schemas/user.schema';

export class AddressDto {
  line1: string;
  line2?: string;
  wardOrDistrict: string;
  city: string;
  province?: string;
  country?: string;
  postalCode?: string;
  isDefault?: boolean;
}

export class UserDto {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  address: AddressDto[];
}
