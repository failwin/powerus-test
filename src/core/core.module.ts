import { Module, Global } from '@nestjs/common';
import { RequestsService } from './requests.service';

@Global()
@Module({
  providers: [RequestsService]
})
export class CoreModule {}
