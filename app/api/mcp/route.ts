/**
 * Main MCP Endpoint
 * Handles all MCP tool calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '../../../lib/services/ServiceFactory';
import ConfigLoader from '../../../lib/config/configLoader';

// Tool definitions
const TOOLS = [
  {
    name: 'load_enhanced_context',
    description: 'Load global WAMA contexts, templates, and project-specific rules for enhanced MCP processing. Now supports rich query parameters for intelligent context selection based on task intent, scope, complexity, and domain focus. Includes 13-step SDLC guidance and task-specific quality checks.',
    inputSchema: {
      type: 'object',
      properties: {
        query_type: {
          type: 'string',
          enum: ConfigLoader.getInstance().getAllowedQueryTypes(),
          description: 'Type of user query to load appropriate contexts and templates'
        },
        task_intent: {
          type: 'string',
          enum: ['create', 'refine', 'breakdown', 'review', 'plan', 'implement'],
          description: 'What you want to do: create (new work), refine (improve existing), breakdown (split into smaller parts), review (evaluate), plan (design), implement (code)'
        },
        scope: {
          type: 'string',
          enum: ['epic', 'story', 'subtask', 'portfolio', 'theme', 'spike'],
          description: 'Scope of work: epic (large feature), story (user story), subtask (small task), portfolio (multiple epics), theme (business objective), spike (research)'
        },
        complexity: {
          type: 'string',
          enum: ['simple', 'medium', 'complex', 'critical'],
          description: 'Complexity level: simple (straightforward), medium (moderate effort), complex (requires architecture), critical (high-risk/security)'
        },
        output_format: {
          type: 'string',
          enum: ['jira', 'confluence', 'github', 'gitlab'],
          description: 'Where the output will go: jira (Jira tickets), confluence (documentation), github/gitlab (PRs/issues)'
        },
        include_sdlc_checks: {
          type: 'boolean',
          description: 'Include 13-step SDLC checklist with current step guidance (default: false)'
        },
        domain_focus: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['security', 'payments', 'compliance', 'performance', 'accessibility', 'data', 'infrastructure', 'api', 'frontend', 'backend']
          },
          description: 'Domain areas that need special attention (e.g., ["security", "payments"] for payment feature with security concerns)'
        },
        user_query: {
          type: 'string',
          description: 'Original user query for semantic understanding (optional)'
        },
        project_path: {
          type: 'string',
          description: 'Path to current project (optional, auto-detected if not provided)'
        }
      },
      required: ['query_type']
    }
  },
  {
    name: 'list_vishkar_agents',
    description: 'List all available VISHKAR agent profiles (domain experts + technical agents) from WAMA repository',
    inputSchema: {
      type: 'object',
      properties: {
        agent_type: {
          type: 'string',
          enum: ['domain_expert', 'technical', 'all'],
          description: 'Filter agents by type (default: all)'
        }
      },
      required: []
    }
  },
  {
    name: 'load_vishkar_agent',
    description: 'Load complete VISHKAR agent profile by ID, including system prompt, expertise, responsibilities, and examples',
    inputSchema: {
      type: 'object',
      properties: {
        agent_id: {
          type: 'string',
          description: 'Agent ID (e.g., jordan-ops, morgan-finance, alex-backend)'
        },
        include_examples: {
          type: 'boolean',
          description: 'Include example contributions (default: true)'
        }
      },
      required: ['agent_id']
    }
  },
  {
    name: 'validate_vishkar_agent_profile',
    description: 'Validate VISHKAR agent profile format and completeness',
    inputSchema: {
      type: 'object',
      properties: {
        agent_id: {
          type: 'string',
          description: 'Agent ID to validate'
        },
        strict_mode: {
          type: 'boolean',
          description: 'Enable strict validation mode (default: false)'
        }
      },
      required: ['agent_id']
    }
  },
  {
    name: 'refresh_agent_cache',
    description: 'Clear cached agent profiles and reload from disk (useful during development)',
    inputSchema: {
      type: 'object',
      properties: {
        agent_id: {
          type: 'string',
          description: 'Agent ID to refresh (optional, if omitted clears all cache)'
        }
      },
      required: []
    }
  },
  {
    name: 'update_agent',
    description: 'Update existing agent configurations with learning improvements in the WAMA system. CANNOT create new agents - only updates existing ones.',
    inputSchema: {
      type: 'object',
      properties: {
        agent_name: {
          type: 'string',
          description: 'Name of the EXISTING agent (without .md extension)'
        },
        operation: {
          type: 'string',
          enum: ['update', 'enhance'],
          description: 'Operation type: update existing agent content, or enhance with learning notes'
        },
        agent_data: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Display name for the agent'
            },
            description: {
              type: 'string',
              description: 'Agent description with usage examples'
            },
            model: {
              type: 'string',
              description: 'Model preference (e.g., sonnet, gpt-4)'
            },
            content: {
              type: 'string',
              description: 'Full agent content/instructions'
            }
          },
          required: ['name', 'description', 'content']
        },
        learning_notes: {
          type: 'string',
          description: 'Learning notes for enhancements (required with enhance operation)'
        }
      },
      required: ['agent_name', 'operation', 'agent_data']
    }
  }
];

// Simple authentication check
function isAuthenticated(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return false;
  }

  // TODO: Integrate with Project Registry for validation
  // For now, just check if it's present
  return true;
}

export async function POST(request: NextRequest) {
  // Check authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: 'Authentication required. Provide X-API-Key header.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { tool, arguments: args } = body;

    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool name is required' },
        { status: 400 }
      );
    }

    // Get services
    const enhancedContextService = ServiceFactory.createEnhancedContextService();
    const agentService = ServiceFactory.createAgentService();

    let result;

    switch (tool) {
      case 'load_enhanced_context':
        result = await enhancedContextService.loadEnhancedContext(args || {});
        break;

      case 'list_vishkar_agents':
        result = await agentService.listVishkarAgents(args?.agent_type || 'all');
        break;

      case 'load_vishkar_agent':
        if (!args?.agent_id) {
          return NextResponse.json(
            { success: false, error: 'agent_id is required' },
            { status: 400 }
          );
        }
        result = await agentService.loadVishkarAgent(args.agent_id);
        break;

      case 'validate_vishkar_agent_profile':
        if (!args?.agent_id) {
          return NextResponse.json(
            { success: false, error: 'agent_id is required' },
            { status: 400 }
          );
        }
        result = await agentService.validateAgentProfile(args.agent_id, args.strict_mode || false);
        break;

      case 'refresh_agent_cache':
        await agentService.refreshAgentCache(args?.agent_id);
        result = { success: true, message: 'Cache refreshed successfully' };
        break;

      case 'update_agent':
        result = await enhancedContextService.updateAgent(args || {});
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown tool: ${tool}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      tool,
      result
    });

  } catch (error) {
    const err = error as Error;
    console.error('MCP API Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// Handle tools/list request
export async function GET(request: NextRequest) {
  // Check authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: 'Authentication required. Provide X-API-Key header.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    tools: TOOLS
  });
}
