import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

const HEALTH_CHECK_KEY = '__health_check__';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async pingCheck(key: string, timeoutMs = 1000) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await this.withTimeout(this.ping(), timeoutMs);
      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: error instanceof Error ? error.message : 'Redis no responde',
      });
    }
  }

  private async ping(): Promise<void> {
    const value = Date.now().toString();
    await this.cacheManager.set(HEALTH_CHECK_KEY, value, 5000);
    const result = await this.cacheManager.get(HEALTH_CHECK_KEY);
    if (result !== value) {
      throw new Error('Redis ping falló: el valor leído no coincide');
    }
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Redis no respondió en ${timeoutMs}ms`)),
          timeoutMs,
        ),
      ),
    ]);
  }
}
