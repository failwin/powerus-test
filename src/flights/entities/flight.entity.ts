import { ApiProperty } from '@nestjs/swagger';

class FlightSlice {
  @ApiProperty({ description: 'Origin name', required: true })
  origin_name: string;

  @ApiProperty({ description: 'Destination name', required: true })
  destination_name: string;

  @ApiProperty({ description: 'Departure time', required: true })
  departure_date_time_utc: string;

  @ApiProperty({ description: 'Arrival time', required: true })
  arrival_date_time_utc: string;

  @ApiProperty({ description: 'flight number', required: true })
  flight_number: string;

  @ApiProperty({ description: 'Duration', required: true })
  duration: number;
}

export class Flight {
  @ApiProperty({ description: 'Price', required: true })
  price: number;

  @ApiProperty({ description: 'Slices', type: [FlightSlice], required: true })
  slices: [FlightSlice, FlightSlice];
}
