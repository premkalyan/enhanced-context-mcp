/**
 * Storage Adapter Interface
 * Abstraction for different storage backends (Vercel Blob, Vercel KV, FileSystem)
 */

export interface StorageMetadata {
  size: number;
  lastModified: Date;
  contentType?: string;
}

export interface IStorageAdapter {
  /**
   * Check if a file or key exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Read file content as string
   */
  read(path: string): Promise<string>;

  /**
   * Write content to file/storage
   */
  write(path: string, content: string): Promise<void>;

  /**
   * List files in a directory or prefix
   */
  list(prefix: string): Promise<string[]>;

  /**
   * Delete a file or key
   */
  delete(path: string): Promise<void>;

  /**
   * Get metadata about a file
   */
  getMetadata(path: string): Promise<StorageMetadata | null>;

  /**
   * Initialize storage (create directories, etc.)
   */
  initialize(): Promise<void>;
}

export interface ICacheAdapter {
  /**
   * Get value from cache
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set value in cache with optional TTL
   */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /**
   * Delete key from cache
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all cache or by prefix
   */
  clear(prefix?: string): Promise<void>;

  /**
   * Check if key exists
   */
  has(key: string): Promise<boolean>;
}
