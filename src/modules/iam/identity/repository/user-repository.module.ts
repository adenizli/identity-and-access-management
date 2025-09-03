import { Module } from '@nestjs/common';
import { UserRepositoryService } from './user-repository.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema } from './entity/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
  ],
  providers: [UserRepositoryService],
  exports: [UserRepositoryService],
})
export class UserRepositoryModule {}
