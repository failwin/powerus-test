import { Injectable } from '@nestjs/common';
import { LoaderService } from './loaders/loader.service';
import { LoaderFactoryService } from './loaders/loader-factory.service';

@Injectable()
export class FlightsService {
  protected loaderFactoryService: LoaderFactoryService;

  constructor(loaderFactoryService: LoaderFactoryService) {
    this.loaderFactoryService = loaderFactoryService;
  }

  async findAll() {
    const loaders = await this.prepareLoaders();
    const results = await Promise.allSettled(loaders.map((l) => l.load()));
  }

  private async prepareLoaders(): Promise<Array<LoaderService>> {
    const urls = [];
    return this.loaderFactoryService.createBunch(urls);
  }
}
