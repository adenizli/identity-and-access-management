import { Module } from '@nestjs/common';
import { CommunicationService } from './communication.service';

@Module({
  imports: [],
  controllers: [],
  providers: [CommunicationService],
  exports: [CommunicationService],
})
export class CommunicationModule {}
