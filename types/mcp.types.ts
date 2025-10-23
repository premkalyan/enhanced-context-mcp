/**
 * MCP (Model Context Protocol) Type Definitions
 * Based on JSON-RPC 2.0
 */

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
  id?: string | number;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: unknown;
  error?: JsonRpcError;
  id: string | number | null;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export interface McpToolCall {
  tool: string;
  arguments: Record<string, unknown>;
}

export interface McpToolResponse {
  success: boolean;
  tool: string;
  result?: unknown;
  error?: string;
}

export interface McpCapabilities {
  tools: McpToolDefinition[];
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface McpInitializeRequest {
  protocolVersion: string;
  capabilities: Record<string, unknown>;
  clientInfo: {
    name: string;
    version: string;
  };
}

export interface McpInitializeResponse {
  protocolVersion: string;
  capabilities: McpCapabilities;
  serverInfo: {
    name: string;
    version: string;
  };
}

export enum McpTransportMode {
  STDIO = 'stdio',
  HTTP = 'http'
}
