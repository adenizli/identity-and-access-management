import { Module } from '@nestjs/common';
import { InitApplicationCommand } from './init-application.cli';
import { IamModule } from '@modules/iam/iam.module';
import { ConfigurationModule } from '@services/configuration/configuration.module';
import { MongoDbModule } from '@services/mongodb/mongodb.module';

@Module({
  imports: [IamModule, ConfigurationModule, MongoDbModule],
  providers: [InitApplicationCommand],
})
export class CliModule {}
