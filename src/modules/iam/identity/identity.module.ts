import { Module } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { UserRepositoryModule } from './repository/user-repository.module';
import { CommunicationModule } from '../../communication/communication.module';
import { ConfigModule } from '@nestjs/config';
import { IdentityController } from './identity.controller';
import { forwardRef } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  imports: [
    UserRepositoryModule,
    CommunicationModule,
    ConfigModule,
    forwardRef(() => AuthenticationModule),
    forwardRef(() => AuthorizationModule),
  ],
  controllers: [IdentityController],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
