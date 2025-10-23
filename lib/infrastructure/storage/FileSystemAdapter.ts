/**
 * File System Storage Adapter
 * For local development and testing
 */

import fs from 'fs/promises';
import path from 'path';
import { IStorageAdapter, StorageMetadata } from './IStorageAdapter';

export class FileSystemAdapter implements IStorageAdapter {
  constructor(private readonly baseDir: string) {}

  private resolvePath(filePath: string): string {
    return path.join(this.baseDir, filePath);
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(this.resolvePath(filePath));
      return true;
    } catch {
      return false;
    }
  }

  async read(filePath: string): Promise<string> {
    const fullPath = this.resolvePath(filePath);
    return await fs.readFile(fullPath, 'utf-8');
  }

  async write(filePath: string, content: string): Promise<void> {
    const fullPath = this.resolvePath(filePath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async list(prefix: string): Promise<string[]> {
    const fullPath = this.resolvePath(prefix);
    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isFile())
        .map(entry => path.join(prefix, entry.name));
    } catch {
      return [];
    }
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = this.resolvePath(filePath);
    await fs.unlink(fullPath);
  }

  async getMetadata(filePath: string): Promise<StorageMetadata | null> {
    try {
      const fullPath = this.resolvePath(filePath);
      const stats = await fs.stat(fullPath);
      return {
        size: stats.size,
        lastModified: stats.mtime,
        contentType: 'text/plain'
      };
    } catch {
      return null;
    }
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
  }
}
