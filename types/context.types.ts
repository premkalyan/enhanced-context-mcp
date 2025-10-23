/**
 * Context and Query Type Definitions
 */

export interface ContextMapping {
  queryType: string;
  contextPath: string;
  description: string;
  priority: number;
}

export interface ContextMetadata {
  title: string;
  category: string;
  tags: string[];
  lastUpdated: string;
  format: string;
  size?: number;
}

export interface ContextFile {
  path: string;
  content: string;
  metadata: ContextMetadata;
}

export interface ContextQuery {
  queryType: string;
  parameters?: Record<string, unknown>;
  maxResults?: number;
  includeMetadata?: boolean;
}

export interface ContextQueryResult {
  contexts: ContextFile[];
  totalCount: number;
  queryType: string;
  executionTime: number;
}

export interface ContextTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: string;
}

export interface ContextGenerationRequest {
  templateId: string;
  variables: Record<string, string>;
  metadata?: Partial<ContextMetadata>;
}

export enum ContextCategory {
  ARCHITECTURE = 'architecture',
  API = 'api',
  WORKFLOW = 'workflow',
  DOMAIN = 'domain',
  TECHNICAL = 'technical',
  DOCUMENTATION = 'documentation'
}

export enum ContextFormat {
  MARKDOWN = 'markdown',
  YAML = 'yaml',
  JSON = 'json',
  TEXT = 'text'
}
