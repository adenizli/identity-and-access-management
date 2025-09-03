import { forwardRef, Global, Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { IdentityModule } from '../identity/identity.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationGuard } from './authentication.guard';
import { RedisModule } from 'services/redis/redis.module';
import { SessionRepositoryModule } from './repository/session-repository.module';
import { CryptoModule } from 'services/crypto/crypto.module';
import { AuthSessionService } from './auth-session.service';

@Global()
@Module({
  imports: [
    forwardRef(() => IdentityModule),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({ secret: configService.get('JWT_SECRET') }),
      inject: [ConfigService],
    }),
    RedisModule,
    SessionRepositoryModule,
    CryptoModule,
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, AuthenticationGuard, AuthSessionService],
  exports: [AuthenticationService, AuthenticationGuard, AuthSessionService, JwtModule],
})
export class AuthenticationModule {}
