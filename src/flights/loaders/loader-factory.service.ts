import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { LoaderService } from './loader.service';

type CreateOptions =
  | string
  | {
      url: string;
    };

@Injectable()
export class LoaderFactoryService {
  protected moduleRef: ModuleRef;

  constructor(moduleRef: ModuleRef) {
    this.moduleRef = moduleRef;
  }

  async create(options: CreateOptions): Promise<LoaderService> {
    const loader = await this.moduleRef.resolve(LoaderService);
    return loader;
  }

  async createBunch(
    optionsList: Array<CreateOptions>,
  ): Promise<Array<LoaderService>> {
    return Promise.all(
      optionsList.map((options) => {
        return this.create(options);
      }),
    );
  }
}
