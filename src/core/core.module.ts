import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RequestsService } from './requests.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? './.env.production'
          : './.env.development',
    }),
  ],
  providers: [RequestsService],
})
export class CoreModule {}
