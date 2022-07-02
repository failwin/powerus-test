import {
  Inject,
  Injectable,
  Scope,
  Logger,
  CACHE_MANAGER,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Flight } from '../entities/flight.entity';

export type InitOptions = {
  url?: string;
  timeout?: number;
  cacheTTL?: number;
  cacheIgnore?: boolean;
};

const DEFAULT_TIMEOUT = 1000;
const DEFAULT_CACHE_TTL = 10;

@Injectable({ scope: Scope.REQUEST })
export class LoaderService {
  protected logger = new Logger(LoaderService.name);

  protected httpService: HttpService;

  protected cacheManager: Cache;

  protected baseUrl = '';

  protected timeout = DEFAULT_TIMEOUT;

  protected cacheTTL = DEFAULT_CACHE_TTL;

  protected cacheIgnore = false;

  constructor(
    httpService: HttpService,
    @Inject(CACHE_MANAGER) cacheManager: Cache,
  ) {
    this.httpService = httpService;
    this.cacheManager = cacheManager;
  }

  init(options: InitOptions) {
    const { url, timeout, cacheTTL, cacheIgnore } = options;
    this.baseUrl = url;
    this.timeout = timeout || DEFAULT_TIMEOUT;
    this.cacheTTL = cacheTTL || DEFAULT_CACHE_TTL;
    this.cacheIgnore = cacheIgnore;
  }

  async load(): Promise<Array<Flight>> {
    try {
      const cacheResult = await this.getFromCache();
      if (cacheResult) {
        return cacheResult;
      }
      const source = await this.httpService.get(this.baseUrl, {
        timeout: this.timeout,
      });
      const result = await lastValueFrom(source);
      if (result.data && result.data.flights) {
        const list = result.data.flights.map(this.normalizeItem);
        await this.setToCache(list);
        return list;
      }
      throw new Error('Wrong data format');
    } catch (err) {
      this.logger.warn(`Load for "${this.baseUrl}" error: ${err.message}`);
      this.logger.error(err);
      throw err;
    }
  }

  protected async getFromCache(): Promise<Array<Flight>> {
    if (this.cacheIgnore) {
      return undefined;
    }
    return this.cacheManager.get<Array<Flight>>(this.baseUrl);
  }

  protected async setToCache(value: Array<Flight>): Promise<void> {
    if (this.cacheIgnore) {
      return undefined;
    }
    await this.cacheManager.set(this.baseUrl, value, { ttl: this.cacheTTL });
  }

  protected normalizeItem(doc: any): Flight {
    return doc;
  }
}
