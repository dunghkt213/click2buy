export enum SocialProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

export class SocialLoginDto {
  provider: SocialProvider;
  socialId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}
