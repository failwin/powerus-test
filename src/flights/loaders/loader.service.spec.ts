import { CacheModule, CACHE_MANAGER } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { Cache } from 'cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { getEmptyLogger } from '../../core/tests';
import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let httpService: HttpService;
  let cache: Cache;
  let service: LoaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, CacheModule.register()],
      providers: [LoaderService],
    }).compile();
    module.useLogger(getEmptyLogger());

    httpService = module.get<HttpService>(HttpService);
    cache = module.get<Cache>(CACHE_MANAGER);
    service = await module.resolve<LoaderService>(LoaderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('load', () => {
    let getData;
    let getError;
    let cacheObj;

    beforeEach(async () => {
      getData = undefined;
      getError = undefined;
      cacheObj = {};

      jest.spyOn(httpService, 'get').mockImplementation(() => {
        if (getError) {
          throw getError;
        }
        return of({
          data: getData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        });
      });

      jest.spyOn(cache, 'get').mockImplementation((key: string) => {
        return Promise.resolve(cacheObj[key]);
      });

      jest.spyOn(cache, 'set').mockImplementation((key: string, value: any) => {
        cacheObj[key] = value;
        return Promise.resolve(cacheObj);
      });
    });

    it('should send HTTP get request with default timeout', async () => {
      service.init({
        url: 'someUrl',
      });
      getData = {
        flights: [],
      };
      await service.load();
      expect(httpService.get).toBeCalled();
      expect(httpService.get).toBeCalledWith('someUrl', { timeout: 1000 });
    });

    it('should send HTTP get request with predefined timeout', async () => {
      service.init({
        url: 'someUrl',
        timeout: 2000,
      });
      getData = {
        flights: [{}],
      };
      await service.load();
      expect(httpService.get).toBeCalled();
      expect(httpService.get).toBeCalledWith('someUrl', { timeout: 2000 });
    });

    it('should return HTTP response', async () => {
      service.init({
        url: 'someUrl',
      });
      getData = {
        flights: [{}],
      };
      const res = await service.load();
      expect(res).toEqual([{}]);
    });

    it('should save HTTP response into cache', async () => {
      service.init({
        url: 'someUrl',
        cacheTTL: 100,
      });
      getData = {
        flights: [{}],
      };
      expect(cacheObj).toEqual({});
      await service.load();
      expect(cacheObj).toEqual({ someUrl: [{}] });
      expect(cache.set).toBeCalledWith('someUrl', [{}], { ttl: 100 });
    });

    it('should take HTTP response from cache', async () => {
      service.init({
        url: 'someUrl',
      });
      cacheObj = { someUrl: [{}] };
      const res = await service.load();
      expect(httpService.get).not.toBeCalled();
      expect(cache.get).toBeCalledWith('someUrl');
      expect(res).toEqual([{}]);
    });

    it('should throw an error if request error', async () => {
      service.init({
        url: 'someUrl',
      });
      getError = new Error('Request Error');
      await expect(service.load()).rejects.toThrow('Request Error');
    });

    it('should throw an error if wrong response format', async () => {
      service.init({
        url: 'someUrl',
      });
      getData = {};
      await expect(service.load()).rejects.toThrow('Wrong data format');
    });

    describe('with "cacheIgnore"', () => {
      it('should not save HTTP response into cache', async () => {
        service.init({
          url: 'someUrl',
          cacheIgnore: true,
        });
        getData = {
          flights: [{}],
        };
        expect(cacheObj).toEqual({});
        await service.load();
        expect(cacheObj).toEqual({});
        expect(cache.set).not.toBeCalled();
      });

      it('should not take HTTP response from cache', async () => {
        service.init({
          url: 'someUrl',
          cacheIgnore: true,
        });
        cacheObj = { someUrl: [{}, {}] };
        getData = {
          flights: [{}],
        };
        const res = await service.load();
        expect(httpService.get).toBeCalled();
        expect(cache.get).not.toBeCalled();
        expect(res).toEqual([{}]);
      });
    });
  });
});
