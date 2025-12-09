/**
 * useAuth - Custom hook for authentication state management
 */

import { useState, useEffect, useCallback } from 'react';
import { authStorage, authService, mapAuthResponse } from '../apis/auth';
import { userService, normalizeUser } from '../apis/user';
import { User } from '../types/interface';

export interface AuthSuccessPayload {
  user: User;
  accessToken: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | undefined>(() => authStorage.getUser());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => !!(authStorage.getUser() && authStorage.getToken())
  );

  // Fetch user info từ API khi component mount nếu user đã đăng nhập
  useEffect(() => {
    const fetchUserInfoOnMount = async () => {
      if (isLoggedIn && user?.id) {
        try {
          const backendUser = await userService.findOne(user.id);
          const fullUserInfo = normalizeUser(backendUser);
          setUser(fullUserInfo);
          
          // Cập nhật lại user trong authStorage với đầy đủ thông tin
          const token = authStorage.getToken();
          if (token) {
            authStorage.save(fullUserInfo, token);
          }
        } catch (error) {
          console.error('Failed to fetch user info on mount:', error);
        }
      }
    };

    fetchUserInfoOnMount();
  }, [isLoggedIn, user?.id]);

  // Hàm fetch user info từ API và cập nhật state
  const fetchAndUpdateUserInfo = useCallback(async (userId: string) => {
    try {
      const backendUser = await userService.findOne(userId);
      const fullUserInfo = normalizeUser(backendUser);
      setUser(fullUserInfo);
      
      // Cập nhật lại user trong authStorage với đầy đủ thông tin
      const token = authStorage.getToken();
      if (token) {
        authStorage.save(fullUserInfo, token);
      }
      
      return fullUserInfo;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return null;
    }
  }, []);

  const handleLoginSuccess = useCallback(async ({ user: userData, accessToken }: AuthSuccessPayload) => {
    setIsLoggedIn(true);
    setUser(userData);
    authStorage.save(userData, accessToken);
    
    // Fetch đầy đủ thông tin user từ API (bao gồm role)
    if (userData.id) {
      await fetchAndUpdateUserInfo(userData.id);
    }
  }, [fetchAndUpdateUserInfo]);

  const handleRegisterSuccess = useCallback(async ({ user: userData, accessToken }: AuthSuccessPayload) => {
    setIsLoggedIn(true);
    setUser(userData);
    authStorage.save(userData, accessToken);
    
    // Fetch đầy đủ thông tin user từ API (bao gồm role)
    if (userData.id) {
      await fetchAndUpdateUserInfo(userData.id);
    }
  }, [fetchAndUpdateUserInfo]);

  const handleAuthCallbackSuccess = useCallback(async (userData: User, token: string) => {
    setIsLoggedIn(true);
    setUser(userData);
    authStorage.save(userData, token);
    
    // Fetch đầy đủ thông tin user từ API (bao gồm role)
    if (userData.id) {
      await fetchAndUpdateUserInfo(userData.id);
    }
  }, [fetchAndUpdateUserInfo]);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Failed to logout from API', error);
    } finally {
      authStorage.clear();
      setIsLoggedIn(false);
      setUser(undefined);
    }
  }, []);

  return {
    user,
    isLoggedIn,
    setUser,
    setIsLoggedIn,
    fetchAndUpdateUserInfo,
    handleLoginSuccess,
    handleRegisterSuccess,
    handleAuthCallbackSuccess,
    handleLogout,
  };
}

