import { Module, CacheModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import * as mongoStore from 'cache-manager-mongodb';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { LoaderService } from './loaders/loader.service';
import { LoaderFactoryService } from './loaders/loader-factory.service';

@Module({
  imports: [
    HttpModule,
    CacheModule.registerAsync({
      useFactory: () => ({
        store: mongoStore,
        uri: process.env.CACHE_STORE_CONNECTION,
        options: {
          retryWrites: false,
        },
      }),
    }),
  ],
  controllers: [FlightsController],
  providers: [FlightsService, LoaderService, LoaderFactoryService],
})
export class FlightsModule {}
