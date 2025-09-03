import { Module } from '@nestjs/common';
import { IdentityModule } from './identity/identity.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthorizationModule } from './authorization/authorization.module';

@Module({
  imports: [IdentityModule, AuthenticationModule, AuthorizationModule],
  controllers: [],
  providers: [],
  exports: [IdentityModule, AuthenticationModule, AuthorizationModule],
})
export class IamModule {}
