import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { LoaderService, InitOptions } from './loader.service';

@Injectable()
export class LoaderFactoryService {
  protected moduleRef: ModuleRef;

  constructor(moduleRef: ModuleRef) {
    this.moduleRef = moduleRef;
  }

  async create(options: InitOptions): Promise<LoaderService> {
    const loader = await this.moduleRef.resolve(LoaderService);
    loader.init(options);
    return loader;
  }

  async createBunch(
    optionsList: Array<InitOptions>,
  ): Promise<Array<LoaderService>> {
    return Promise.all(
      optionsList.map((options) => {
        return this.create(options);
      }),
    );
  }
}
