import { forwardRef, Module } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { RoleRepositoryModule } from './repository/role-repository.module';
import { AuthorizationController } from './authorization.controller';
import { IdentityModule } from '../identity/identity.module';
import { Global } from '@nestjs/common';

@Global()
@Module({
  imports: [RoleRepositoryModule, forwardRef(() => IdentityModule)],
  controllers: [AuthorizationController],
  providers: [AuthorizationService],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
