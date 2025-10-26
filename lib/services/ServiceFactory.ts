/**
 * Service Factory
 * Creates and configures service instances with appropriate storage adapters
 */

import { ContextService } from './ContextService';
import { TemplateService } from './TemplateService';
import { AgentService } from './AgentService';
import { EnhancedContextService } from './EnhancedContextService';
import { FileSystemAdapter } from '../infrastructure/storage/FileSystemAdapter';
import { HybridFileSystemAdapter } from '../infrastructure/storage/HybridFileSystemAdapter';
import { VercelBlobAdapter } from '../infrastructure/storage/VercelBlobAdapter';
import { VercelKVCacheAdapter } from '../infrastructure/storage/VercelKVCacheAdapter';
import { InMemoryCacheAdapter } from '../infrastructure/storage/InMemoryCacheAdapter';
import { IStorageAdapter, ICacheAdapter } from '../infrastructure/storage/IStorageAdapter';
import os from 'os';
import path from 'path';
import ConfigLoader from '../config/configLoader';

export class ServiceFactory {
  private static storageAdapter: IStorageAdapter | null = null;
  private static cacheAdapter: ICacheAdapter | null = null;

  /**
   * Get or create storage adapter based on environment
   */
  static getStorageAdapter(): IStorageAdapter {
    if (this.storageAdapter) {
      return this.storageAdapter;
    }

    const config = ConfigLoader.getInstance().loadServerConfig();
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercelEnv = process.env.VERCEL === '1';
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

    // Only use Vercel Blob if explicitly enabled AND token is configured
    if (isProduction && isVercelEnv && process.env.USE_VERCEL_BLOB === 'true' && hasBlobToken) {
      console.log('[ServiceFactory] Using VercelBlobAdapter');
      this.storageAdapter = new VercelBlobAdapter('wama');
    } else {
      // Use hybrid file system (tries ~/.wama, falls back to ./wama repo files)
      console.log('[ServiceFactory] Using HybridFileSystemAdapter');
      this.storageAdapter = new HybridFileSystemAdapter();
    }

    return this.storageAdapter;
  }

  /**
   * Get or create cache adapter based on environment
   */
  static getCacheAdapter(): ICacheAdapter {
    if (this.cacheAdapter) {
      return this.cacheAdapter;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const isVercelEnv = process.env.VERCEL === '1';

    if (isProduction && isVercelEnv) {
      // Use Vercel KV in production
      this.cacheAdapter = new VercelKVCacheAdapter();
    } else {
      // Use in-memory cache for local development
      this.cacheAdapter = new InMemoryCacheAdapter();
    }

    return this.cacheAdapter;
  }

  /**
   * Create ContextService
   */
  static createContextService(): ContextService {
    const storageAdapter = this.getStorageAdapter();
    return new ContextService(storageAdapter);
  }

  /**
   * Create TemplateService
   */
  static createTemplateService(): TemplateService {
    const storageAdapter = this.getStorageAdapter();
    return new TemplateService(storageAdapter);
  }

  /**
   * Create AgentService
   */
  static createAgentService(): AgentService {
    const storageAdapter = this.getStorageAdapter();
    const cacheAdapter = this.getCacheAdapter();
    return new AgentService(storageAdapter, cacheAdapter);
  }

  /**
   * Create EnhancedContextService with all dependencies
   */
  static createEnhancedContextService(): EnhancedContextService {
    const contextService = this.createContextService();
    const templateService = this.createTemplateService();
    const agentService = this.createAgentService();

    return new EnhancedContextService(
      contextService,
      templateService,
      agentService
    );
  }

  /**
   * Reset singleton instances (useful for testing)
   */
  static reset(): void {
    this.storageAdapter = null;
    this.cacheAdapter = null;
  }
}
