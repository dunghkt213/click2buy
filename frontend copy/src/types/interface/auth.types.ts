/**
 * Auth Types - Type definitions for Authentication
 */

import { BackendUserDto } from '../dto/auth.dto';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  membershipLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  points: number;
  role?: 'customer' | 'seller' | 'admin';
}

export interface AuthSuccessPayload {
  user: User;
  accessToken: string;
}

export type BackendUser = BackendUserDto;

