import { Module } from '@nestjs/common';
import { ServicesModule } from './services';
import { ApplicationModule } from './modules';

@Module({
  imports: [ServicesModule, ApplicationModule],
  controllers: [],
  providers: [],
})
export class CoreModule {}
