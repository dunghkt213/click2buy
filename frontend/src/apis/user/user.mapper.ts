/**
 * User Mapper - Maps backend user responses to frontend types
 */

import { BackendUserDto } from '../../types/dto/user.dto';
import { User } from '../../types/interface/auth.types';

export function normalizeUser(backendUser: BackendUserDto): User {
  const fallbackName =
    backendUser.name || backendUser.username || backendUser.email || 'Người dùng';

  return {
    id: backendUser.id || backendUser._id || '',
    name: fallbackName,
    email: backendUser.email || '',
    avatar: backendUser.avatar,
    membershipLevel: 'Bronze',
    points: 0,
    role: backendUser.role as 'customer' | 'seller' | 'admin' | undefined,
  };
}

