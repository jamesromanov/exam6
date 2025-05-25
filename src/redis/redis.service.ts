import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
@Injectable()
export class RedisService implements OnModuleInit {
  private redisCli: Redis;
  async onModuleInit() {
    this.redisCli = new Redis({
      port: Number(process.env.REDIS_PORT) || 6379,
      host: process.env.REDIS_HOST,
    });

    this.redisCli.on('connect', () => {
      console.log('Reddis connected✅');
    });
    this.redisCli.on('error', (err) => {
      console.log('Reddis connection error❌:', err);
    });
  }

  async set(key: string, value: any, expire?: number) {
    if (expire)
      return await this.redisCli.set(key, JSON.stringify(value), 'EX', expire);
    else return await this.redisCli.set(key, JSON.stringify(value));
  }

  async get(key: string) {
    return await this.redisCli.get(key);
  }

  async del(key: string) {
    console.log(await this.redisCli.del(key));
    return await this.redisCli.del(key);
  }
}
