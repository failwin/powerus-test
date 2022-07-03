import { ModuleRef } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { LoaderFactoryService } from './loader-factory.service';

describe('LoaderFactoryService', () => {
  let moduleRef: ModuleRef;
  let service: LoaderFactoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoaderFactoryService],
    }).compile();

    moduleRef = module.get<ModuleRef>(ModuleRef);
    service = module.get<LoaderFactoryService>(LoaderFactoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(async () => {
      jest.spyOn(moduleRef, 'resolve').mockImplementation(() => {
        return Promise.resolve({
          init: jest.fn(),
        });
      });
    });

    it('should return initiated instance', async () => {
      const options = { url: 'testUrl', timeout: 10 };
      const instance = await service.create(options);
      expect(instance).toBeDefined();
      expect(instance.init).toBeCalledWith(options);
    });
  });

  describe('createBunch', () => {
    beforeEach(async () => {
      jest.spyOn(moduleRef, 'resolve').mockImplementation(() => {
        return Promise.resolve({
          init: jest.fn(),
        });
      });
    });

    it('should return initiated instances', async () => {
      const options1 = { url: 'testUrl1', timeout: 10 };
      const options2 = { url: 'testUrl2', timeout: 20 };
      const instances = await service.createBunch([options1, options2]);
      expect(instances).toHaveLength(2);
      expect(instances[0].init).toBeCalledWith(options1);
      expect(instances[1].init).toBeCalledWith(options2);
    });
  });
});
