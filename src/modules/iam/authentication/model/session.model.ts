import { BaseModel } from '@common/model/base.model';
import { PLATFORMS } from '../enum/platforms.enum';

export class SessionModel extends BaseModel {
  user: string;
  ipAddress: string;
  userAgent: string;
  accessToken: string;
  refreshToken: string;
  startedAt: number;
  endsAt: number;
  platform: PLATFORMS;
}
