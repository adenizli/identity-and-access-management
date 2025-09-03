import { CookieOptions } from 'express';
import { UserModel } from '../../identity/model/user.model';

export class AuthenticationCredentialsModel {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  user: UserModel;
  accessTokenCookieOptions: CookieOptions;
  refreshTokenCookieOptions: CookieOptions;
  sessionCookieOptions: CookieOptions;
}
