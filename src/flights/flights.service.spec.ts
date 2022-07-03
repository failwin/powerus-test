import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { LoaderFactoryService } from './loaders/loader-factory.service';
import { FlightsService, Flight } from './flights.service';
import { before } from '@nestjs/swagger/dist/plugin';

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

const createTestFlight = (options: DeepPartial<Flight>) => {
  const instance = new Flight();
  Object.keys(options).forEach((key) => {
    instance[key] = options[key];
  });
  return instance;
};

const createTestLoader = (value?: any, error?: any) => {
  const loader = {
    async load() {
      if (error) {
        throw error;
      }
      return value;
    },
  };
  return loader;
};

describe('FlightsService', () => {
  let service: FlightsService;
  let loaderFactoryService: LoaderFactoryService;
  let OLD_ENV;

  before(() => {
    OLD_ENV = process.env;
  });

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FlightsService, LoaderFactoryService],
    }).compile();

    loaderFactoryService =
      module.get<LoaderFactoryService>(LoaderFactoryService);
    service = module.get<FlightsService>(FlightsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = OLD_ENV;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    let loaders;

    beforeEach(async () => {
      loaders = [];
      jest.spyOn(loaderFactoryService, 'createBunch').mockImplementation(() => {
        return Promise.resolve(loaders);
      });
    });

    it('should ask for loaders creation', async () => {
      const loader1 = {
        async load() {
          return [];
        },
      };
      loaders = [loader1];

      process.env.FLIGHTS_URLS = 'testUrl1,testUrl2';
      process.env.FLIGHTS_REQUEST_TIMEOUT = '100';
      process.env.FLIGHTS_CACHE_TTL = '60';

      await service.findAll();

      expect(loaderFactoryService.createBunch).toBeCalledWith([
        { url: 'testUrl1', timeout: 100, cacheTTL: 60 },
        { url: 'testUrl2', timeout: 100, cacheTTL: 60 },
      ]);
    });

    it('should return single loader response', async () => {
      const flight1 = createTestFlight({
        price: 10,
        slices: [{ flight_number: '1' }, { flight_number: '2' }],
      });
      const loader1 = createTestLoader([flight1]);
      loaders = [loader1];

      const result = await service.findAll();
      expect(result).toEqual([flight1]);
    });

    it('should return single loader error', async () => {
      const flight1 = createTestFlight({
        price: 10,
        slices: [{ flight_number: '1' }, { flight_number: '2' }],
      });
      const loader1 = createTestLoader([flight1]);
      loaders = [loader1];

      const result = await service.findAll();
      expect(result).toEqual([flight1]);
    });

    it('should return merged loaders responses', async () => {
      const flight1 = createTestFlight({
        price: 10,
        slices: [{ flight_number: '1' }, { flight_number: '2' }],
      });
      const flight2 = createTestFlight({
        price: 20,
        slices: [{ flight_number: '3' }, { flight_number: '4' }],
      });
      const flight3 = createTestFlight({
        price: 30,
        slices: [{ flight_number: '5' }, { flight_number: '6' }],
      });

      const loader1 = createTestLoader([flight1]);
      const loader2 = createTestLoader([flight2]);
      const loader3 = createTestLoader([flight3]);
      loaders = [loader1, loader2, loader3];

      const result = await service.findAll();
      expect(result).toEqual([flight1, flight2, flight3]);
    });

    it('should return merged unique loaders responses', async () => {
      const flight1 = createTestFlight({
        price: 10,
        slices: [
          {
            flight_number: '1',
            departure_date_time_utc: '10:30',
            arrival_date_time_utc: '12:00',
          },
          {
            flight_number: '2',
            departure_date_time_utc: '16:30',
            arrival_date_time_utc: '20:00',
          },
        ],
      });
      const flight2 = createTestFlight({
        price: 20,
        slices: [
          {
            flight_number: '3',
            departure_date_time_utc: '10:00',
            arrival_date_time_utc: '13:00',
          },
          {
            flight_number: '4',
            departure_date_time_utc: '20:30',
            arrival_date_time_utc: '22:00',
          },
        ],
      });
      const flight3 = createTestFlight({
        price: 30,
        slices: [
          {
            flight_number: '5',
            departure_date_time_utc: '2:30',
            arrival_date_time_utc: '12:00',
          },
          {
            flight_number: '6',
            departure_date_time_utc: '15:00',
            arrival_date_time_utc: '17:30',
          },
        ],
      });

      const loader1 = createTestLoader([flight1]);
      const loader2 = createTestLoader([flight2, flight1]);
      const loader3 = createTestLoader([flight3, flight2]);
      loaders = [loader1, loader2, loader3];

      const result = await service.findAll();
      expect(result).toEqual([flight1, flight2, flight3]);
    });

    it('should return success loaders responses only', async () => {
      const flight1 = createTestFlight({
        price: 10,
        slices: [{ flight_number: '1' }, { flight_number: '2' }],
      });
      const flight2 = createTestFlight({
        price: 20,
        slices: [{ flight_number: '3' }, { flight_number: '4' }],
      });

      const loader1 = createTestLoader([flight1]);
      const loader2 = createTestLoader(undefined, new Error('Load Error'));
      const loader3 = createTestLoader([flight2]);
      loaders = [loader1, loader2, loader3];

      const result = await service.findAll();
      expect(result).toEqual([flight1, flight2]);
    });

    it('should return error if all loaders responses failed', async () => {
      const loader1 = createTestLoader(undefined, new Error('Load Error 2'));
      const loader2 = createTestLoader(undefined, new Error('Load Error 2'));
      const loader3 = createTestLoader(undefined, new Error('Load Error 2'));
      loaders = [loader1, loader2, loader3];

      await expect(service.findAll()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
