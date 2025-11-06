'use client';

import { useEffect, useRef } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function DocsPage() {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'Enhanced Context MCP Server API',
      version: '2.0.0',
      description:
        'Enhanced Context MCP Server - Serverless with Project Registry Integration. Provides intelligent context loading, VISHKAR agent management, and SDLC guidance for AI-powered software development workflows.',
      contact: {
        name: 'Enhanced Context MCP',
        url: 'https://enhanced-context-mcp.vercel.app',
      },
    },
    servers: [
      {
        url: 'https://enhanced-context-mcp.vercel.app',
        description: 'Production Server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Local Development',
      },
    ],
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
    paths: {
      '/api/health': {
        get: {
          summary: 'Health Check',
          description: 'Check if the API is running and healthy',
          operationId: 'healthCheck',
          tags: ['System'],
          security: [],
          responses: {
            '200': {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: {
                        type: 'string',
                        example: 'healthy',
                      },
                      version: {
                        type: 'string',
                        example: '2.0.0',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/mcp': {
        get: {
          summary: 'List Available Tools',
          description: 'Get a list of all available MCP tools with their schemas',
          operationId: 'listTools',
          tags: ['MCP Tools'],
          responses: {
            '200': {
              description: 'List of available tools',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      tools: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Tool',
                        },
                      },
                    },
                  },
                },
              },
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
          },
        },
        post: {
          summary: 'Execute MCP Tool',
          description: 'Execute a specific MCP tool with provided arguments',
          operationId: 'executeTool',
          tags: ['MCP Tools'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ToolExecutionRequest',
                },
                examples: {
                  natural_language: {
                    summary: 'Natural Language Context Loading',
                    value: {
                      tool: 'load_enhanced_context',
                      arguments: {
                        task_statement: 'I want to create an architecture diagram for our MCP server system',
                      },
                    },
                  },
                  structured_context: {
                    summary: 'Structured Context Loading',
                    value: {
                      tool: 'load_enhanced_context',
                      arguments: {
                        query_type: 'architecture',
                        task_intent: 'create',
                        scope: 'epic',
                        complexity: 'complex',
                        domain_focus: ['infrastructure', 'api'],
                        include_sdlc_checks: true,
                      },
                    },
                  },
                  list_agents: {
                    summary: 'List Domain Expert Agents',
                    value: {
                      tool: 'list_vishkar_agents',
                      arguments: {
                        agent_type: 'domain_expert',
                      },
                    },
                  },
                  load_agent: {
                    summary: 'Load Specific Agent',
                    value: {
                      tool: 'load_vishkar_agent',
                      arguments: {
                        agent_id: 'alex-backend',
                        include_examples: true,
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Tool executed successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ToolExecutionResponse',
                  },
                },
              },
            },
            '400': {
              description: 'Bad request - invalid tool or arguments',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/mcp-registry': {
        get: {
          summary: 'Get MCP Registry',
          description: 'Get the complete MCP registry with all tools and configurations',
          operationId: 'getMcpRegistry',
          tags: ['Registry'],
          security: [],
          responses: {
            '200': {
              description: 'MCP Registry data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        example: 'enhanced-context-mcp',
                      },
                      version: {
                        type: 'string',
                        example: '2.0.0',
                      },
                      tools: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Tool',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication. Register your project in the Project Registry to get an API key.',
        },
      },
      schemas: {
        Tool: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Tool identifier',
            },
            description: {
              type: 'string',
              description: 'Tool description',
            },
            inputSchema: {
              type: 'object',
              description: 'JSON Schema for tool input',
            },
          },
        },
        ToolExecutionRequest: {
          type: 'object',
          required: ['tool'],
          properties: {
            tool: {
              type: 'string',
              description: 'Name of the tool to execute',
              enum: [
                'load_enhanced_context',
                'list_vishkar_agents',
                'load_vishkar_agent',
                'validate_vishkar_agent_profile',
                'refresh_agent_cache',
                'update_agent',
              ],
            },
            arguments: {
              type: 'object',
              description: 'Tool-specific arguments',
            },
          },
        },
        ToolExecutionResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the tool executed successfully',
            },
            tool: {
              type: 'string',
              description: 'Name of the executed tool',
            },
            result: {
              type: 'object',
              description: 'Tool execution result',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        LoadEnhancedContextArgs: {
          type: 'object',
          description: 'Arguments for load_enhanced_context tool',
          properties: {
            task_statement: {
              type: 'string',
              description:
                "Natural language description of what you're trying to do. The AI will analyze this and provide relevant contexts, templates, and guidance.",
            },
            query_type: {
              type: 'string',
              enum: [
                'story',
                'testing',
                'security',
                'architecture',
                'pr-review',
                'browser-testing',
                'project-planning',
                'story-breakdown',
                'documentation',
                'flow-diagrams',
                'infrastructure',
              ],
              description: 'Type of query for context loading (optional if task_statement provided)',
            },
            task_intent: {
              type: 'string',
              enum: ['create', 'refine', 'breakdown', 'review', 'plan', 'implement'],
              description: 'What you want to do with this task',
            },
            scope: {
              type: 'string',
              enum: ['epic', 'story', 'subtask', 'portfolio', 'theme', 'spike'],
              description: 'Scope of work',
            },
            complexity: {
              type: 'string',
              enum: ['simple', 'medium', 'complex', 'critical'],
              description: 'Complexity level',
            },
            output_format: {
              type: 'string',
              enum: ['jira', 'confluence', 'github', 'gitlab'],
              description: 'Target output platform',
            },
            include_sdlc_checks: {
              type: 'boolean',
              description: 'Include 13-step SDLC checklist (default: false)',
            },
            domain_focus: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'security',
                  'payments',
                  'compliance',
                  'performance',
                  'accessibility',
                  'data',
                  'infrastructure',
                  'api',
                  'frontend',
                  'backend',
                ],
              },
              description: 'Domain areas needing special attention',
            },
            user_query: {
              type: 'string',
              description: 'Original user query for semantic understanding',
            },
            project_path: {
              type: 'string',
              description: 'Path to current project (optional, auto-detected)',
            },
          },
        },
        ListAgentsArgs: {
          type: 'object',
          properties: {
            agent_type: {
              type: 'string',
              enum: ['domain_expert', 'technical', 'all'],
              description: 'Filter agents by type (default: all)',
            },
          },
        },
        LoadAgentArgs: {
          type: 'object',
          required: ['agent_id'],
          properties: {
            agent_id: {
              type: 'string',
              description: 'Agent ID (e.g., jordan-ops, morgan-finance, alex-backend)',
            },
            include_examples: {
              type: 'boolean',
              description: 'Include example contributions (default: true)',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: 'Authentication required. Provide X-API-Key header.',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'System',
        description: 'System health and status endpoints',
      },
      {
        name: 'MCP Tools',
        description: 'MCP tool execution endpoints',
      },
      {
        name: 'Registry',
        description: 'MCP registry and configuration',
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <SwaggerUI spec={spec} />
    </div>
  );
}
