import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Request } from 'express';
import { CryptoService } from 'services/crypto/crypto.service';
import { AuthSessionService } from './auth-session.service';
import generateUnixTime from '@common/utility/unix-time-generator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly cryptoService: CryptoService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  /**
   * Validates request authentication via access/refresh tokens with auto-rotation.
   *
   * - Verifies access token and compares with Redis cache
   * - If invalid/expired, verifies refresh token, rotates tokens, and sets cookies
   * - Attaches `user` to the request object upon success
   *
   * @param context - Execution context
   * @returns True if request is authenticated
   * @throws HttpException for unauthorized scenarios
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const accessToken = this.getAccessToken(request.headers);
    const sessionId = this.getSessionId(request.cookies);

    const session = await this.authSessionService.getSessionById(sessionId);
    if (session.endsAt < generateUnixTime()) throw new HttpException('SESSION_EXPIRED', HttpStatus.UNAUTHORIZED);
    if (session.accessToken !== accessToken) throw new HttpException('INVALID_ACCESS_TOKEN', HttpStatus.UNAUTHORIZED);

    try {
      const { user } = await this.authenticationService.verifyAccessToken(accessToken);
      request['user'] = user;

      return true;
    } catch {
      throw new HttpException('EXPIRED_ACCESS_TOKEN', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Extracts and validates Bearer token from Authorization header.
   *
   * @param headers - Request headers
   * @returns Access token string
   */
  private getAccessToken(headers: Record<string, string | string[] | undefined>): string {
    const authorizationHeader = headers['authorization'];
    if (!authorizationHeader) throw new HttpException('NO_ACCESS_TOKEN', HttpStatus.UNAUTHORIZED);

    const raw = Array.isArray(authorizationHeader) ? authorizationHeader[0] : authorizationHeader;
    const [type, token] = raw.split(' ');
    if (type !== 'Bearer') throw new HttpException('INVALID_ACCESS_TOKEN', HttpStatus.UNAUTHORIZED);

    return this.cryptoService.decryptString(token);
  }

  /**
   * Extracts session id from `sessionId` cookie.
   *
   * @param cookies - Request cookies
   * @returns Session id string
   */
  private getSessionId(cookies: Record<string, string>): string {
    const sessionId = cookies['sessionId'];
    if (!sessionId) throw new HttpException('INVALID_SESSION_ID', HttpStatus.UNAUTHORIZED);
    return this.cryptoService.decryptString(sessionId);
  }
}
