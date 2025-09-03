import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly authorizationService: AuthorizationService) {}

  /**
   * Ensures the user has the permissions required by the endpoint.
   *
   * - Reads `user` and `requiredPermissions` from the request context
   * - Delegates to AuthorizationService.hasPermission
   *
   * @param context - Execution context
   * @returns True if user is authorized
   * @throws HttpException with FORBIDDEN when user lacks permissions
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requiredPermissions = request.requiredPermissions;

    const hasPermission = await this.authorizationService.hasPermission(user.id, requiredPermissions);
    if (!hasPermission) throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    return true;
  }
}
