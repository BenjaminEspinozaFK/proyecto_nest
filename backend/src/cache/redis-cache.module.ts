import { Module, Logger } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';

const logger = new Logger('RedisCacheModule');

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        const redisStore = new KeyvRedis(redisUrl);

        redisStore.on('error', (error: Error) => {
          logger.error('Error de conexión a Redis:', error);
        });

        return {
          stores: [new Keyv({ store: redisStore })],
          ttl: 60_000, // 60 segundos por defecto
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
