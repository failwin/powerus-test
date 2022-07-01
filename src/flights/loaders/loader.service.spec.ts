import { Test, TestingModule } from '@nestjs/testing';
import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoaderService],
    }).compile();

    service = module.get<LoaderService>(LoaderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
