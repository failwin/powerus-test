import { Injectable, Scope, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Flight } from '../entities/flight.entity';

export type InitOptions = {
  url?: string;
  timeout?: number;
};

const DEFAULT_TIMEOUT = 1000;

@Injectable({ scope: Scope.REQUEST })
export class LoaderService {
  protected logger = new Logger(LoaderService.name);

  protected httpService: HttpService;

  protected baseUrl = '';

  protected timeout = DEFAULT_TIMEOUT;

  constructor(httpService: HttpService) {
    this.httpService = httpService;
  }

  init(options: InitOptions) {
    const { url, timeout } = options;
    this.baseUrl = url;
    this.timeout = timeout || DEFAULT_TIMEOUT;
  }

  async load(): Promise<Array<Flight>> {
    try {
      const source = await this.httpService.get(this.baseUrl, {
        timeout: this.timeout,
      });
      const res = await lastValueFrom(source);
      if (res.data && res.data.flights) {
        return res.data.flights.map(this.normalizeItem);
      }
      throw new Error('Wrong data format');
    } catch (err) {
      this.logger.warn(`Load for "${this.baseUrl}" error: ${err.message}`);
      this.logger.error(err);
      throw err;
    }
  }

  protected normalizeItem(doc: any): Flight {
    return doc;
  }
}
