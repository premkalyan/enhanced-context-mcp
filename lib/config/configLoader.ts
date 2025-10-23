/**
 * Configuration Loader
 * Loads and validates configuration files
 */

import fs from 'fs';
import path from 'path';

export interface ContextMapping {
  contexts: string[];
  templates: string[];
  description: string;
}

export interface ContextMappingsConfig {
  mappings: Record<string, ContextMapping>;
  allowedQueryTypes: string[];
}

export interface ServerConfig {
  server: {
    name: string;
    version: string;
    protocolVersion: string;
    description: string;
  };
  storage: {
    mode: 'vercel' | 'local';
    wamaDirectoryPath: string;
    contextSubdirectory: string;
    templateSubdirectory: string;
    agentSubdirectory: string;
  };
  security: {
    enableAuthentication: boolean;
    enableRateLimiting: boolean;
    maxRequestsPerMinute: number;
    maxRequestsPerHour: number;
  };
  monitoring: {
    enableLogging: boolean;
    logLevel: string;
    enableMetrics: boolean;
  };
  features: {
    agentLoading: boolean;
    templateLoading: boolean;
    projectRulesLoading: boolean;
    serviceConfigurationCheck: boolean;
    browserTestingSuggestion: boolean;
  };
}

class ConfigLoader {
  private static instance: ConfigLoader;
  private contextMappings: ContextMappingsConfig | null = null;
  private serverConfig: ServerConfig | null = null;

  private constructor() {}

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  loadContextMappings(): ContextMappingsConfig {
    if (this.contextMappings) {
      return this.contextMappings;
    }

    const configPath = path.join(process.cwd(), 'config', 'context-mappings.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    this.contextMappings = JSON.parse(configData);
    return this.contextMappings!;
  }

  loadServerConfig(): ServerConfig {
    if (this.serverConfig) {
      return this.serverConfig;
    }

    const configPath = path.join(process.cwd(), 'config', 'server-config.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    this.serverConfig = JSON.parse(configData);
    return this.serverConfig!;
  }

  getMapping(queryType: string): ContextMapping | null {
    const mappings = this.loadContextMappings();
    return mappings.mappings[queryType] || null;
  }

  isValidQueryType(queryType: string): boolean {
    const mappings = this.loadContextMappings();
    return mappings.allowedQueryTypes.includes(queryType);
  }

  getAllowedQueryTypes(): string[] {
    const mappings = this.loadContextMappings();
    return mappings.allowedQueryTypes;
  }

  reset(): void {
    this.contextMappings = null;
    this.serverConfig = null;
  }
}

export default ConfigLoader;
