import { Module } from '@nestjs/common';
import { RoleRepositoryService } from './role-repository.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleEntity, RoleSchema } from './entity/role.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: RoleEntity.name, schema: RoleSchema }])],
  providers: [RoleRepositoryService],
  exports: [RoleRepositoryService],
})
export class RoleRepositoryModule {}
