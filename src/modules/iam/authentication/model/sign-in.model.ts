import { PLATFORMS } from '../enum/platforms.enum';

export class SignInModel {
  identifier: string;
  password: string;
  ipAddress: string;
  userAgent: string;
  platform: PLATFORMS;
}
