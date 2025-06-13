import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'; // เพิ่ม OnModuleInit
import Keyv from 'keyv';
import { Redis } from 'ioredis'; // ต้องติดตั้ง ioredis (เป็น dependency ของ @keyv/redis อยู่แล้ว)

@Injectable()
export class CacheManagerService implements OnModuleInit {
  // เพื่อเก็บ instance ของ Redis client โดยตรง
  private redisClient: Redis;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Lifecycle hook ที่จะถูกเรียกเมื่อ Module เริ่มต้น
  async onModuleInit() {
    // โครงสร้างของ cacheManager.store อาจแตกต่างกันไปตามเวอร์ชันของ @nestjs/cache-manager
    // และการตั้งค่า Keyv/Store
    const cacheStore = (this.cacheManager as any).store; // ใช้ 'as any' เพื่อเข้าถึง private/internal property

    // ตรวจสอบว่า cacheStore เป็น Keyv instance และมี client ที่เป็น Redis หรือไม่
    // สำหรับกรณีที่คุณมีหลาย stores และ Redis เป็นหนึ่งในนั้น
    if (cacheStore && Array.isArray(cacheStore.stores)) {
      for (const store of cacheStore.stores) {
        // ตรวจสอบว่าเป็น Keyv instance และมี client (ioredis) ที่มีคำสั่ง hset
        if (
          store instanceof Keyv &&
          (store as any).client &&
          'hset' in (store as any).client
        ) {
          this.redisClient = (store as any).client as Redis; // เก็บ Redis client
          console.log('Redis Keyv store and client found and initialized.');
          break; // พบแล้วก็ออกจากการวนลูป
        }
      }
    }
    // สำหรับกรณีที่คุณมี Keyv Redis เป็น store เดียว
    else if (
      cacheStore instanceof Keyv &&
      (cacheStore as any).client &&
      'hset' in (cacheStore as any).client
    ) {
      this.redisClient = (cacheStore as any).client as Redis;
      console.log('Single Redis Keyv store and client found and initialized.');
    }

    if (!this.redisClient) {
      console.error(
        'Failed to obtain Redis client from CacheManager. Hash functions will not work.',
      );
      // อาจจะ throw error หรือจัดการตามความเหมาะสม
    }
  }

  /**
   * ดึงข้อมูลจาก Cache (String type)
   * @param key คีย์สำหรับระบุข้อมูลใน Cache
   * @returns ข้อมูลที่ได้จาก Cache หรือ undefined ถ้าไม่มีข้อมูล
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const data = await this.cacheManager.get<T>(key);
      if (data !== undefined && data !== null) {
        console.log(`Cache HIT for key: ${key}`);
      } else {
        console.log(`Cache MISS for key: ${key}`);
      }
      return data;
    } catch (error) {
      console.error(`Error getting cache for key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * เก็บข้อมูลลงใน Cache (String type)
   * @param key คีย์สำหรับระบุข้อมูล
   * @param value ข้อมูลที่จะเก็บ
   * @param ttl (Optional) ระยะเวลาที่ cache จะหมดอายุในหน่วยมิลลิวินาที (จะ Override TTL ที่ตั้งค่าใน Module)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      console.log(
        `Cache SET for key: ${key}${ttl ? ` with TTL: ${ttl}ms` : ''}`,
      );
    } catch (error) {
      console.error(`Error setting cache for key ${key}:`, error);
    }
  }

  /**
   * ลบข้อมูลจาก Cache (String type)
   * @param key คีย์ของข้อมูลที่ต้องการลบ
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      console.log(`Cache DEL for key: ${key}`);
    } catch (error) {
      console.error(`Error deleting cache for key ${key}:`, error);
    }
  }
}
