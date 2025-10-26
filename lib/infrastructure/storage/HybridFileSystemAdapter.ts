/**
 * Hybrid File System Storage Adapter
 * Tries ~/.wama first, falls back to ./wama (repo files)
 * Perfect for development and production without Vercel Blob
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { IStorageAdapter, StorageMetadata } from './IStorageAdapter';

export class HybridFileSystemAdapter implements IStorageAdapter {
  private readonly primaryDir: string;   // ~/.wama
  private readonly fallbackDir: string;  // ./wama (repo)

  constructor() {
    this.primaryDir = path.join(os.homedir(), '.wama');
    this.fallbackDir = path.join(process.cwd(), 'wama');
  }

  private async resolvePath(filePath: string): Promise<string> {
    const primaryPath = path.join(this.primaryDir, filePath);
    const fallbackPath = path.join(this.fallbackDir, filePath);

    // Try primary location first
    try {
      await fs.access(primaryPath);
      return primaryPath;
    } catch {
      // Fall back to repo files
      return fallbackPath;
    }
  }

  async exists(filePath: string): Promise<boolean> {
    const primaryPath = path.join(this.primaryDir, filePath);
    const fallbackPath = path.join(this.fallbackDir, filePath);

    try {
      await fs.access(primaryPath);
      return true;
    } catch {
      try {
        await fs.access(fallbackPath);
        return true;
      } catch {
        return false;
      }
    }
  }

  async read(filePath: string): Promise<string> {
    const resolvedPath = await this.resolvePath(filePath);
    return await fs.readFile(resolvedPath, 'utf-8');
  }

  async write(filePath: string, content: string): Promise<void> {
    // Always write to primary location
    const fullPath = path.join(this.primaryDir, filePath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async list(prefix: string): Promise<string[]> {
    const primaryPath = path.join(this.primaryDir, prefix);
    const fallbackPath = path.join(this.fallbackDir, prefix);

    // Try primary first
    try {
      const entries = await fs.readdir(primaryPath, { withFileTypes: true });
      const files = entries
        .filter(entry => entry.isFile())
        .map(entry => path.join(prefix, entry.name));

      // If primary exists but is empty, try fallback
      if (files.length > 0) {
        console.log(`[HybridFS] Primary ${prefix}: found ${files.length} files`);
        return files;
      }
      console.log(`[HybridFS] Primary ${prefix}: empty, trying fallback`);
    } catch (err) {
      console.log(`[HybridFS] Primary ${prefix}: error, trying fallback`, err);
      // Primary doesn't exist or can't be read, will try fallback
    }

    // Try fallback
    try {
      const entries = await fs.readdir(fallbackPath, { withFileTypes: true });
      const files = entries
        .filter(entry => entry.isFile())
        .map(entry => path.join(prefix, entry.name));
      console.log(`[HybridFS] Fallback ${prefix}: found ${files.length} files`);
      return files;
    } catch (err) {
      console.log(`[HybridFS] Fallback ${prefix}: error`, err);
      return [];
    }
  }

  async delete(filePath: string): Promise<void> {
    // Only delete from primary location
    const fullPath = path.join(this.primaryDir, filePath);
    await fs.unlink(fullPath);
  }

  async getMetadata(filePath: string): Promise<StorageMetadata | null> {
    try {
      const resolvedPath = await this.resolvePath(filePath);
      const stats = await fs.stat(resolvedPath);
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
    // Only create directories if primary path is writable (local dev)
    // In production (Vercel), skip to use repo files from fallback
    try {
      await fs.mkdir(this.primaryDir, { recursive: true });
      await fs.access(this.primaryDir, fs.constants.W_OK);

      // Primary is writable, create subdirectories
      await fs.mkdir(path.join(this.primaryDir, 'contexts'), { recursive: true });
      await fs.mkdir(path.join(this.primaryDir, 'templates'), { recursive: true });
      await fs.mkdir(path.join(this.primaryDir, 'agents'), { recursive: true });
      await fs.mkdir(path.join(this.primaryDir, 'domain-agents'), { recursive: true });
      console.log(`[HybridFS] Initialized writable primary directory: ${this.primaryDir}`);
    } catch (err) {
      // Primary not writable or doesn't exist, will use fallback (repo files)
      console.log(`[HybridFS] Primary not writable, will use fallback:`, this.fallbackDir);
    }
  }
}
