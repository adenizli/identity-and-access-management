import { Module } from '@nestjs/common';
import { ConfigurationModule } from './configuration/configuration.module';
import { MongoDbModule } from './mongodb/mongodb.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [ConfigurationModule, MongoDbModule, RedisModule],
  providers: [],
  exports: [ConfigurationModule, MongoDbModule, RedisModule],
})
export class ServicesModule {}
