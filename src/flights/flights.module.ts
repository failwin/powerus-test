import { Module } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { LoaderService } from './loaders/loader.service';
import { LoaderFactoryService } from './loaders/loader-factory.service';

@Module({
  controllers: [FlightsController],
  providers: [FlightsService, LoaderService, LoaderFactoryService],
})
export class FlightsModule {}
