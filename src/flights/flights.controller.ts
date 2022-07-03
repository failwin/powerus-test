import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { FlightsService, Flight } from './flights.service';

@ApiTags('flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @ApiResponse({ type: [Flight] })
  @Get()
  findAll() {
    return this.flightsService.findAll();
  }
}
