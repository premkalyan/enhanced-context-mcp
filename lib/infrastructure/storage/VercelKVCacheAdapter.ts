/**
 * Vercel KV Cache Adapter
 * Using Vercel KV (Redis) for caching
 */

import { kv } from '@vercel/kv';
import { ICacheAdapter } from './IStorageAdapter';

export class VercelKVCacheAdapter implements ICacheAdapter {
  async get<T>(key: string): Promise<T | null> {
    try {
      return await kv.get<T>(key);
    } catch (error) {
      console.error(`Failed to get key ${key} from cache:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await kv.set(key, value, { ex: ttlSeconds });
      } else {
        await kv.set(key, value);
      }
    } catch (error) {
      console.error(`Failed to set key ${key} in cache:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await kv.del(key);
    } catch (error) {
      console.error(`Failed to delete key ${key} from cache:`, error);
    }
  }

  async clear(prefix?: string): Promise<void> {
    if (!prefix) {
      // WARNING: This would clear the entire KV store
      console.warn('Clearing entire cache is not recommended in production');
      return;
    }

    try {
      // Scan for keys with prefix and delete them
      const keys = await kv.keys(`${prefix}*`);
      if (keys.length > 0) {
        await kv.del(...keys);
      }
    } catch (error) {
      console.error(`Failed to clear cache with prefix ${prefix}:`, error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const exists = await kv.exists(key);
      return exists === 1;
    } catch (error) {
      console.error(`Failed to check existence of key ${key}:`, error);
      return false;
    }
  }
}
