import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IdentityService } from '../identity/identity.service';
import * as bcrypt from 'bcrypt';
import { SignInModel } from './model/sign-in.model';
import { AuthenticationCredentialsModel } from './model/authentication-credentials.model';
import { UserModel } from '../identity/model/user.model';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { timeToSeconds } from '@common/utility/time-to-seconds';
import { RedisService } from 'services/redis/redis.service';
import { CreateSessionModel } from './model/crud/create-session.model';
import { CookieOptions } from 'express';
import { CryptoService } from 'services/crypto/crypto.service';
import { AuthSessionService } from './auth-session.service';
import generateUnixTime from '@common/utility/unix-time-generator';
import { RefreshSessionModel } from './model/crud/refresh-session.model';
import { SessionModel } from './model/session.model';

@Injectable()
export class AuthenticationService {
  private readonly sessionCookieOptions: CookieOptions;
  private readonly accessTokenCookieOptions: CookieOptions;
  private readonly refreshTokenCookieOptions: CookieOptions;

  constructor(
    private readonly configService: ConfigService,
    private readonly identityService: IdentityService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly cryptoService: CryptoService,
    private readonly authSessionService: AuthSessionService,
  ) {
    this.sessionCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      // express expects milliseconds
      maxAge: timeToSeconds(this.configService.get('SESSION_EXPIRATION')) * 1000,
    };

    this.accessTokenCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      // express expects milliseconds
      maxAge: timeToSeconds(this.configService.get('ACCESS_TOKEN_EXPIRATION')) * 1000,
    };

    this.refreshTokenCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      // express expects milliseconds
      maxAge: timeToSeconds(this.configService.get('REFRESH_TOKEN_EXPIRATION')) * 1000,
    };
  }

  /**
   * Authenticates a user with credentials and returns access/refresh tokens with cookie options.
   *
   * Steps:
   * 1. Validate identifier exists and password matches
   * 2. Generate access and refresh tokens
   * 3. Return credentials model with cookies configuration
   *
   * @param signInModel - Sign-in credentials
   * @returns Authentication credentials including tokens and cookie options
   * @throws HttpException when credentials are invalid
   */
  public async signIn(signInModel: SignInModel): Promise<AuthenticationCredentialsModel> {
    /* ============= CHECK USER IDENTIFIER ============== */
    const userCredentialsModel = await this.identityService.getUserByCredentials(signInModel.identifier);
    if (!userCredentialsModel) throw new HttpException('INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED);

    /* ================ CHECK PASSWORD ================= */
    const isPasswordValid = await bcrypt.compare(signInModel.password, userCredentialsModel.password);
    if (!isPasswordValid) throw new HttpException('INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED);

    /* =============== GENERATE TOKENS ================= */
    const userModel = await this.identityService.getUserById(userCredentialsModel.id);
    const accessToken = await this.generateAccessToken(userModel);
    const refreshToken = await this.generateRefreshToken(userModel, accessToken);

    /* =============== INVALIDATE OTHER SESSIONS ================= */
    await this.authSessionService.invalidateOtherSessions(userModel.id, signInModel.platform);

    /* =============== CREATE SESSION ================= */
    const createSessionModel = CreateSessionModel.requestToSessionModel(
      userModel.id,
      signInModel.ipAddress,
      signInModel.userAgent,
      signInModel.platform,
      accessToken,
      refreshToken,
      this.sessionCookieOptions,
    );
    const sessionId = await this.authSessionService.createSession(createSessionModel);

    /* ============== RETURN CREDENTIALS =============== */
    return this.generateAuthenticationCredentialsModel(userModel, accessToken, refreshToken, sessionId);
  }

  public async verifySession(sessionId: string): Promise<SessionModel> {
    const session = await this.authSessionService.getSessionById(sessionId);
    if (!session || session.endsAt < generateUnixTime()) throw new HttpException('SESSION_NOT_FOUND', HttpStatus.UNAUTHORIZED);
    return session;
  }

  private generateAuthenticationCredentialsModel(
    userModel: UserModel,
    accessToken: string,
    refreshToken: string,
    sessionId: string,
  ): AuthenticationCredentialsModel {
    const authenticationCredentialsModel = new AuthenticationCredentialsModel();
    authenticationCredentialsModel.user = userModel;
    authenticationCredentialsModel.accessToken = this.cryptoService.encryptString(accessToken);
    authenticationCredentialsModel.accessTokenCookieOptions = this.accessTokenCookieOptions;
    authenticationCredentialsModel.refreshToken = this.cryptoService.encryptString(refreshToken);
    authenticationCredentialsModel.refreshTokenCookieOptions = this.refreshTokenCookieOptions;
    authenticationCredentialsModel.sessionId = this.cryptoService.encryptString(sessionId);
    authenticationCredentialsModel.sessionCookieOptions = this.sessionCookieOptions;
    return authenticationCredentialsModel;
  }

  /**
   * Generates a signed and encrypted JWT access token and caches it in Redis.
   *
   * @param user - Authenticated user
   * @returns Signed access token
   */
  private async generateAccessToken(user: UserModel): Promise<string> {
    const jwtPayload = { user };
    const accessToken = this.jwtService.sign(jwtPayload, {
      expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRATION'),
      secret: this.configService.get('JWT_SECRET'),
      algorithm: this.configService.get('JWT_ALGORITHM'),
    });
    return accessToken;
  }

  /**
   * Generates a signed and encrypted JWT refresh token and caches it in Redis with a key including the access token.
   *
   * @param user - Authenticated user
   * @param accessToken - Previously issued access token
   * @returns Signed refresh token
   */
  private async generateRefreshToken(user: UserModel, accessToken: string): Promise<string> {
    const jwtPayload = { user, accessToken };
    const refreshToken = this.jwtService.sign(jwtPayload, {
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION'),
      secret: this.configService.get('JWT_SECRET'),
      algorithm: this.configService.get('JWT_ALGORITHM'),
    });
    return refreshToken;
  }

  /**
   * Verifies an access token and returns its payload.
   *
   * @param accessToken - JWT access token
   * @returns Payload containing `user`
   */
  public async verifyAccessToken(accessToken: string): Promise<{ user: UserModel }> {
    return this.jwtService.verifyAsync(accessToken, {
      secret: this.configService.get('JWT_SECRET'),
      algorithms: [this.configService.get('JWT_ALGORITHM')],
    });
  }

  private async verifyRefreshToken(refreshToken: string, accessToken: string): Promise<{ user: UserModel; accessToken: string }> {
    try {
      const decodedRefreshToken = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
        algorithms: [this.configService.get('JWT_ALGORITHM')],
      });
      if (decodedRefreshToken.accessToken !== accessToken) throw new HttpException('INVALID_REFRESH_TOKEN', HttpStatus.UNAUTHORIZED);
      return decodedRefreshToken;
    } catch (error) {
      throw new HttpException('EXPIRED_REFRESH_TOKEN', HttpStatus.UNAUTHORIZED);
    }
  }

  async refresh(refreshSessionModel: RefreshSessionModel): Promise<AuthenticationCredentialsModel> {
    const { accessToken: encryptedAccessToken, refreshToken: encryptedRefreshToken, sessionId: encryptedSessionId } = refreshSessionModel;

    if (!encryptedSessionId) throw new HttpException('INVALID_SESSION_ID', HttpStatus.UNAUTHORIZED);
    if (!encryptedAccessToken) throw new HttpException('INVALID_ACCESS_TOKEN', HttpStatus.UNAUTHORIZED);
    if (!encryptedRefreshToken) throw new HttpException('INVALID_REFRESH_TOKEN', HttpStatus.UNAUTHORIZED);

    const sessionId = this.cryptoService.decryptString(encryptedSessionId);

    const session = await this.authSessionService.getSessionById(sessionId);
    if (!session) throw new HttpException('SESSION_NOT_FOUND', HttpStatus.UNAUTHORIZED);

    if (session.endsAt < generateUnixTime()) throw new HttpException('SESSION_EXPIRED', HttpStatus.UNAUTHORIZED);

    const accessToken = this.cryptoService.decryptString(encryptedAccessToken);
    const refreshToken = this.cryptoService.decryptString(encryptedRefreshToken);

    if (session.accessToken !== accessToken) throw new HttpException('INVALID_ACCESS_TOKEN', HttpStatus.UNAUTHORIZED);
    if (session.refreshToken !== refreshToken) throw new HttpException('INVALID_REFRESH_TOKEN', HttpStatus.UNAUTHORIZED);

    const decodedRefreshToken = await this.verifyRefreshToken(refreshToken, accessToken);

    const newAccessToken = await this.generateAccessToken(decodedRefreshToken.user);
    const newRefreshToken = await this.generateRefreshToken(decodedRefreshToken.user, newAccessToken);

    await this.authSessionService.updateSessionTokens(session.id, { accessToken: newAccessToken, refreshToken: newRefreshToken });

    return this.generateAuthenticationCredentialsModel(decodedRefreshToken.user, newAccessToken, newRefreshToken, session.id);
  }

  async signOut(sessionId: string): Promise<void> {
    if (!sessionId) throw new HttpException('INVALID_SESSION_ID', HttpStatus.UNAUTHORIZED);

    const session = await this.authSessionService.getSessionById(sessionId);
    if (!session) throw new HttpException('SESSION_NOT_FOUND', HttpStatus.UNAUTHORIZED);

    await this.authSessionService.deleteSession(sessionId);
    return;
  }
}
