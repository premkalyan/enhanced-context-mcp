/**
 * Agent Type Definitions
 */

export interface AgentPreference {
  agentId: string;
  agentName: string;
  preferredContexts: string[];
  specializations: string[];
  priority: number;
  enabled: boolean;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  contextPreferences: string[];
  loadingStrategy: LoadingStrategy;
  maxTokens?: number;
}

export interface AgentLoadRequest {
  agentId: string;
  contextTypes?: string[];
  includeSpecializations?: boolean;
}

export interface AgentLoadResponse {
  agentId: string;
  contexts: ContextLoadResult[];
  totalTokens: number;
  loadTime: number;
}

export interface ContextLoadResult {
  contextType: string;
  path: string;
  loaded: boolean;
  tokens?: number;
  error?: string;
}

export enum LoadingStrategy {
  EAGER = 'eager',
  LAZY = 'lazy',
  ON_DEMAND = 'on-demand'
}

export enum AgentSpecialization {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  FULLSTACK = 'fullstack',
  DEVOPS = 'devops',
  SECURITY = 'security',
  TESTING = 'testing'
}
