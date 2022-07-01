import { Module } from '@nestjs/common';
import { FlightsModule } from './flights/flights.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [FlightsModule, CoreModule],
})
export class AppModule {}
