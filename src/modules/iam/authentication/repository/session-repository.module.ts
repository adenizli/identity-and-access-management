import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionRepositoryService } from './session-repository.service';
import { SessionEntity, SessionSchema } from './entity/session.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: SessionEntity.name, schema: SessionSchema }])],
  providers: [SessionRepositoryService],
  exports: [SessionRepositoryService],
})
export class SessionRepositoryModule {}
