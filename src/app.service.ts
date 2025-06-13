import { Injectable } from '@nestjs/common';
import { CacheManagerService } from './cache-manager/cache-manager.service';
import { RespUserDto } from './dto/response';

@Injectable()
export class AppService {
  constructor(
    private readonly cacheManager: CacheManagerService, // Replace 'any' with the actual type if available
  ) {}
  async getHello(): Promise<string> {
    const cacheKey = 'helloWorld';
    const cachedValue = await this.cacheManager.get<string>(cacheKey);

    let response: any;
    if (cachedValue) {
      response = cachedValue;
    } else {
      response = 'Hello World555!';
      // Set the value in cache with a TTL of 60 seconds
      await this.cacheManager.set(cacheKey, response, 60000);
    }
    return response;
  }
}
