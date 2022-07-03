import { Test, TestingModule } from '@nestjs/testing';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { LoaderFactoryService } from './loaders/loader-factory.service';

describe('FlightsController', () => {
  let flightsService: FlightsService;
  let controller: FlightsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlightsController],
      providers: [FlightsService, LoaderFactoryService],
    }).compile();

    flightsService = module.get<FlightsService>(FlightsService);
    controller = module.get<FlightsController>(FlightsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    let response;

    beforeEach(async () => {
      response = [];
      jest.spyOn(flightsService, 'findAll').mockImplementation(() => {
        return Promise.resolve(response);
      });
    });

    it('should return result from "flightsService.findAll" method', async () => {
      const result = await controller.findAll();
      expect(flightsService.findAll).toBeCalled();
      expect(result).toEqual([]);
    });
  });
});
