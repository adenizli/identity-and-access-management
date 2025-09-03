import { Module } from '@nestjs/common';
import { IamModule } from './iam/iam.module';
import { CommunicationModule } from './communication/communication.module';

@Module({
  imports: [IamModule, CommunicationModule],
  exports: [IamModule, CommunicationModule],
})
export class ApplicationModule {}
