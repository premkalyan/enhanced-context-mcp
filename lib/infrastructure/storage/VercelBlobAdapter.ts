/**
 * Vercel Blob Storage Adapter
 * For production deployment on Vercel
 */

import { put, del, head, list } from '@vercel/blob';
import { IStorageAdapter, StorageMetadata } from './IStorageAdapter';

export class VercelBlobAdapter implements IStorageAdapter {
  constructor(private readonly basePrefix: string = 'wama') {}

  private getFullPath(path: string): string {
    return `${this.basePrefix}/${path}`;
  }

  async exists(path: string): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(path);
      const { url } = await head(fullPath);
      return !!url;
    } catch {
      return false;
    }
  }

  async read(path: string): Promise<string> {
    const fullPath = this.getFullPath(path);

    try {
      const { url } = await head(fullPath);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to read from Vercel Blob: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to read ${path}: ${err.message}`);
    }
  }

  async write(path: string, content: string): Promise<void> {
    const fullPath = this.getFullPath(path);

    try {
      await put(fullPath, content, {
        access: 'public',
        contentType: 'text/plain'
      });
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to write ${path}: ${err.message}`);
    }
  }

  async list(prefix: string): Promise<string[]> {
    const fullPrefix = this.getFullPath(prefix);

    try {
      const { blobs } = await list({ prefix: fullPrefix });
      return blobs.map(blob =>
        blob.pathname.replace(`${this.basePrefix}/`, '')
      );
    } catch (error) {
      const err = error as Error;
      console.error(`Failed to list blobs with prefix ${prefix}:`, err.message);
      return [];
    }
  }

  async delete(path: string): Promise<void> {
    const fullPath = this.getFullPath(path);

    try {
      await del(fullPath);
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to delete ${path}: ${err.message}`);
    }
  }

  async getMetadata(path: string): Promise<StorageMetadata | null> {
    try {
      const fullPath = this.getFullPath(path);
      const headResult = await head(fullPath);

      return {
        size: headResult.size,
        lastModified: new Date(headResult.uploadedAt),
        contentType: headResult.contentType || 'text/plain'
      };
    } catch {
      return null;
    }
  }

  async initialize(): Promise<void> {
    // Vercel Blob doesn't require initialization
    // Directories are created automatically on first write
  }
}
