/**
 * API Request and Response Type Definitions
 */

export interface ApiRequest {
  tool: string;
  arguments: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  tool: string;
  result?: T;
  error?: string;
  metadata?: ResponseMetadata;
}

export interface ResponseMetadata {
  executionTime: number;
  timestamp: string;
  version: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  checks: {
    storage: boolean;
    memory: boolean;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}
