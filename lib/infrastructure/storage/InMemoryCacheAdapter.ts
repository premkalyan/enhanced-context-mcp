/**
 * In-Memory Cache Adapter
 * For development and testing
 */

import { ICacheAdapter } from './IStorageAdapter';

interface CacheEntry<T> {
  value: T;
  expiresAt?: number;
}

export class InMemoryCacheAdapter implements ICacheAdapter {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined
    };

    this.cache.set(key, entry as CacheEntry<unknown>);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(prefix?: string): Promise<void> {
    if (!prefix) {
      this.cache.clear();
      return;
    }

    const keysToDelete: string[] = [];
    const allKeys = Array.from(this.cache.keys());
    for (const key of allKeys) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  // Helper method for testing
  size(): number {
    return this.cache.size;
  }
}
