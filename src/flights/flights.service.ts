import { Injectable } from '@nestjs/common';
import { ServiceUnavailableException } from '@nestjs/common';
import { LoaderService } from './loaders/loader.service';
import { LoaderFactoryService } from './loaders/loader-factory.service';
import { Flight } from './entities/flight.entity';

export { Flight } from './entities/flight.entity';

@Injectable()
export class FlightsService {
  protected loaderFactoryService: LoaderFactoryService;

  constructor(loaderFactoryService: LoaderFactoryService) {
    this.loaderFactoryService = loaderFactoryService;
  }

  async findAll(): Promise<Array<Flight>> {
    const loaders = await this.prepareLoaders();
    const results = await Promise.all(
      loaders.map((loader) =>
        loader
          .load()
          .then((value) => ({ status: 'fulfilled', value }))
          .catch((reason) => ({ status: 'rejected', reason })),
      ),
    );
    // const results = await Promise.allSettled(
    //   loaders.map((loader) => loader.load()),
    // );
    const fulfilled = results.filter((res) => res.status === 'fulfilled');
    if (!fulfilled.length) {
      throw new ServiceUnavailableException();
    }
    const list = FlightsService.prepareList(
      fulfilled.map((res: PromiseFulfilledResult<Array<Flight>>) => res.value),
    );
    return list;
  }

  private async prepareLoaders(): Promise<Array<LoaderService>> {
    const urlsStr = process.env.FLIGHTS_URLS || '';
    const urls = urlsStr.split(',');
    const timeout = parseInt(process.env.FLIGHTS_REQUEST_TIMEOUT, 10);
    const cacheTTL = parseInt(process.env.FLIGHTS_CACHE_TTL, 10);
    return this.loaderFactoryService.createBunch(
      urls.map((url) => ({ url, timeout, cacheTTL })),
    );
  }

  private static prepareList(fulfilled: Array<Array<Flight>>): Array<Flight> {
    const result = [];
    const inResult = new Set();
    fulfilled.forEach((list) => {
      list.forEach((item) => {
        const from = item.slices[0];
        const to = item.slices[1];
        const key = `
          ${from.flight_number}_${from.departure_date_time_utc}_${from.arrival_date_time_utc}
          ${to.flight_number}_${to.departure_date_time_utc}_${to.arrival_date_time_utc}
        `.trim();
        if (!inResult.has(key)) {
          inResult.add(key);
          result.push(item);
        }
      });
    });
    return result;
  }
}
