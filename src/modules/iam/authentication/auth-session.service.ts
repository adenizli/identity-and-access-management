import { Injectable } from '@nestjs/common';
import { SessionRepositoryService } from './repository';
import { CreateSessionModel } from './model/crud/create-session.model';
import { SessionModel } from './model/session.model';
import { PLATFORMS } from './enum/platforms.enum';

@Injectable()
export class AuthSessionService {
  constructor(private readonly sessionRepositoryService: SessionRepositoryService) {}

  /**
   * Creates a new session.
   *
   * @param createSessionModel - The session model to create.
   * @returns The created session ID.
   */
  public async createSession(createSessionModel: CreateSessionModel): Promise<string> {
    const session = await this.sessionRepositoryService.createSession(createSessionModel);
    return session.id;
  }

  /**
   * Retrieves a session by its ID.
   *
   * @param sessionId - The ID of the session to retrieve.
   * @returns The retrieved session.
   */
  public async getSessionById(sessionId: string): Promise<SessionModel> {
    const session = await this.sessionRepositoryService.findSessionById(sessionId);
    return session;
  }

  /**
   * Updates the tokens of a session.
   *
   * @param sessionId - The ID of the session to update.
   * @param accessToken - The new access token.
   * @param refreshToken - The new refresh token.
   */
  public async updateSessionTokens(
    sessionId: string,
    { accessToken, refreshToken }: { accessToken: string; refreshToken: string },
  ): Promise<void> {
    await this.sessionRepositoryService.updateSessionTokens(sessionId, { accessToken, refreshToken });
  }

  public async deleteSession(sessionId: string): Promise<void> {
    await this.sessionRepositoryService.deleteSessionById(sessionId);
  }

  public async invalidateOtherSessions(userId: string, platform: PLATFORMS): Promise<void> {
    await this.sessionRepositoryService.deleteSessionsByUserIdAndPlatform(userId, platform);
  }
}
