import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, SaveOptions } from 'mongoose';
import { SessionEntity } from './entity/session.entity';
import { SessionModel } from '../model/session.model';
import { ListQueryModel } from '@common/model/list-query.model';
import generateUnixTime from '@common/utility/unix-time-generator';
import { CreateSessionModel } from '../model/crud/create-session.model';
import { PLATFORMS } from '../enum/platforms.enum';

@Injectable()
export class SessionRepositoryService {
  constructor(
    @InjectModel(SessionEntity.name)
    private readonly sessionEntity: Model<SessionEntity>,
  ) {}

  async createSession(createSessionModel: CreateSessionModel, session?: ClientSession, options?: SaveOptions): Promise<SessionModel> {
    const entity = await new this.sessionEntity(createSessionModel).save({ session, ...options });
    return SessionEntity.toModel(entity);
  }

  async updateSessionTokens(
    sessionId: string,
    { accessToken, refreshToken }: { accessToken: string; refreshToken: string },
    session?: ClientSession,
  ): Promise<void> {
    await this.sessionEntity.findByIdAndUpdate(sessionId, { accessToken, refreshToken }, { session });
  }

  async findSessionById(id: string): Promise<SessionModel> {
    const entity = await this.sessionEntity.findById(id);
    return entity ? SessionEntity.toModel(entity) : null;
  }

  async findSessionsByUserId(userId: string, listQueryModel: ListQueryModel<SessionModel>): Promise<SessionModel[]> {
    const sessions = await this.sessionEntity
      .find({ user: userId })
      .skip(listQueryModel.offset)
      .limit(listQueryModel.limit)
      .sort(listQueryModel.sort)
      .exec();
    return sessions.map((s) => SessionEntity.toModel(s));
  }

  async countSessionsByUserId(userId: string): Promise<number> {
    return this.sessionEntity.countDocuments({ user: userId }).exec();
  }

  async deleteSessionById(id: string, session?: ClientSession): Promise<boolean> {
    const result = await this.sessionEntity.findByIdAndUpdate(id, { deletedAt: generateUnixTime() }, { session });
    return result ? true : false;
  }

  async deleteSessionsByUserIdAndPlatform(userId: string, platform: PLATFORMS): Promise<void> {
    await this.sessionEntity.deleteMany({ user: userId, platform }).exec();
  }
}
