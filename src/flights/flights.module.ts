import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { LoaderService } from './loaders/loader.service';
import { LoaderFactoryService } from './loaders/loader-factory.service';

@Module({
  imports: [HttpModule],
  controllers: [FlightsController],
  providers: [FlightsService, LoaderService, LoaderFactoryService],
})
export class FlightsModule {}
