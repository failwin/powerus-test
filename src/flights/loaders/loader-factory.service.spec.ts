import { Test, TestingModule } from '@nestjs/testing';
import { LoaderFactoryService } from './loader-factory.service';

describe('LoaderFactoryService', () => {
  let service: LoaderFactoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoaderFactoryService],
    }).compile();

    service = module.get<LoaderFactoryService>(LoaderFactoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
