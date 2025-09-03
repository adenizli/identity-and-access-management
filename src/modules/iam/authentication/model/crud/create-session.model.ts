import { BaseModel } from '@common/model/base.model';
import generateUnixTime from '@common/utility/unix-time-generator';
import { CookieOptions } from 'express';
import { PLATFORMS } from '../../enum/platforms.enum';

export class CreateSessionModel extends BaseModel {
  user: string;
  ipAddress: string;
  userAgent: string;
  accessToken: string;
  refreshToken: string;
  startedAt: number;
  endsAt: number;
  platform: PLATFORMS;

  static requestToSessionModel(
    user: string,
    ipAddress: string,
    userAgent: string,
    platform: PLATFORMS,
    accessToken: string,
    refreshToken: string,
    sessionCookieOptions: CookieOptions,
  ): CreateSessionModel {
    const createSessionModel = new CreateSessionModel();
    createSessionModel.user = user;
    createSessionModel.ipAddress = ipAddress;
    createSessionModel.userAgent = userAgent;
    createSessionModel.platform = platform;
    createSessionModel.accessToken = accessToken;
    createSessionModel.refreshToken = refreshToken;
    createSessionModel.startedAt = generateUnixTime();
    // sessionCookieOptions.maxAge is in milliseconds; generateUnixTime returns seconds
    createSessionModel.endsAt = generateUnixTime() + Math.floor(sessionCookieOptions.maxAge / 1000);
    return createSessionModel;
  }
}
