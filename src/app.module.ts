import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheManagerModule } from './cache-manager/cache-manager.module';
import { CacheManagerService } from './cache-manager/cache-manager.service';

@Module({
  imports: [CacheManagerModule],
  controllers: [AppController],
  providers: [AppService, CacheManagerService],
})
export class AppModule {}
