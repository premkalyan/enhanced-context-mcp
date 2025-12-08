/**
 * Main MCP Endpoint
 * Handles all MCP tool calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '../../../lib/services/ServiceFactory';
import ConfigLoader from '../../../lib/config/configLoader';

// MCP Ecosystem Data - Comprehensive guide to all MCPs
const MCP_ECOSYSTEM = {
  overview: {
    description: "VISHKAR MCP Ecosystem - A collection of Model Context Protocol servers that provide AI assistants with secure access to enterprise tools and data.",
    architecture: {
      project_registry: {
        url: "https://project-registry-henna.vercel.app",
        purpose: "Central credential management and API key distribution",
        docs: "https://project-registry-henna.vercel.app/dashboard"
      },
      authentication_flow: [
        "1. Register your project at Project Registry with your tool credentials (Jira, Confluence, GitHub, etc.)",
        "2. Receive a unique API key (pk_xxx...)",
        "3. Use this API key as Bearer token when calling any MCP service",
        "4. MCP services fetch your credentials from registry automatically"
      ]
    }
  },
  mcps: {
    vercel_deployed: [
      {
        name: "Enhanced Context MCP",
        url: "https://enhanced-context-mcp.vercel.app",
        api_endpoint: "https://enhanced-context-mcp.vercel.app/api/mcp",
        docs: "https://enhanced-context-mcp.vercel.app/docs",
        description: "Context loading, VISHKAR agent management, SDLC guidance, and MCP ecosystem information",
        tools: ["load_enhanced_context", "list_vishkar_agents", "load_vishkar_agent", "validate_vishkar_agent_profile", "refresh_agent_cache", "update_agent", "get_mcp_ecosystem_guide"],
        auth_required: true,
        auth_type: "X-API-Key header"
      },
      {
        name: "JIRA MCP",
        url: "https://jira-mcp-pi.vercel.app",
        api_endpoint: "https://jira-mcp-pi.vercel.app/api/mcp",
        docs: "https://jira-mcp-pi.vercel.app",
        description: "Comprehensive Jira integration - issues, boards, sprints, time tracking, JQL queries",
        tools: ["search_issues", "get_issue", "create_issue", "update_issue", "add_comment", "get_boards", "get_sprints", "log_work", "transition_issue", "link_issues", "get_transitions", "assign_issue", "get_board_configuration", "get_sprint_issues", "create_sprint", "move_issues_to_sprint", "get_issue_worklogs", "get_issue_comments", "delete_comment", "add_watcher", "get_watchers", "remove_watcher", "get_issue_changelog", "get_priorities", "get_statuses", "link_story_to_epic"],
        auth_required: true,
        auth_type: "Bearer token (from Project Registry)"
      },
      {
        name: "Confluence MCP",
        url: "https://confluence-mcp-six.vercel.app",
        api_endpoint: "https://confluence-mcp-six.vercel.app/api/mcp",
        docs: "https://confluence-mcp-six.vercel.app/api/mcp",
        description: "Confluence documentation management - pages, spaces, templates, attachments, macros",
        tools: ["get_spaces", "get_space", "get_content_by_id", "get_content_by_space_and_title", "search", "create_page", "update_page", "get_page_attachments", "get_page_children", "add_page_labels", "upload_document", "update_document", "delete_document", "list_documents", "create_folder", "get_folder_contents", "move_page_to_folder", "create_page_template", "get_page_templates", "apply_page_template", "update_page_template", "get_pages_by_label", "get_page_history", "insert_macro", "update_macro", "get_page_macros", "link_page_to_jira_issue", "insert_jira_macro", "get_space_permissions", "embed_existing_attachment", "upload_and_embed_document", "upload_and_embed_attachment"],
        auth_required: true,
        auth_type: "Bearer token (from Project Registry)"
      },
      {
        name: "Storycrafter MCP",
        url: "https://storycrafter-mcp.vercel.app",
        api_endpoint: "https://storycrafter-mcp.vercel.app/api/mcp",
        docs: "https://storycrafter-mcp.vercel.app",
        description: "AI-powered user story and epic generation with INVEST criteria validation",
        tools: ["generate_story", "generate_epic", "validate_story", "breakdown_epic"],
        auth_required: true,
        auth_type: "X-API-Key header"
      }
    ],
    docker_local: [
      {
        name: "PR-Agent MCP",
        port: 8188,
        url: "http://localhost:8188",
        api_endpoint: "http://localhost:8188/mcp",
        info_endpoint: "http://localhost:8188/info",
        health_endpoint: "http://localhost:8188/health",
        description: "AI-powered Pull Request analysis - reviews, descriptions, code improvements, security scanning",
        tools: ["pr_review", "pr_describe", "pr_improve", "pr_ask", "pr_analyze", "pr_complete_workflow", "pr_review_branch", "codeql_security_scan", "remediate_security_findings", "configure_codeql_rules"],
        auth_required: true,
        auth_type: "Environment variables (GITHUB_TOKEN, OPENAI_API_KEY, ANTHROPIC_API_KEY)",
        docker_compose: "docker-compose up -d pr-agent-mcp",
        notes: "Connects to local PR-Agent Docker service on port 3000"
      },
      {
        name: "GitHub MCP",
        port: 8185,
        url: "http://localhost:8185",
        api_endpoint: "http://localhost:8185/mcp",
        description: "GitHub operations - repos, PRs, issues, branches, workflows",
        tools: ["list_repos", "get_repo", "create_repo", "list_prs", "create_pr", "merge_pr", "list_issues", "create_issue", "list_branches", "create_branch", "get_workflows", "trigger_workflow"],
        auth_required: true,
        auth_type: "GITHUB_TOKEN environment variable"
      },
      {
        name: "Slack MCP",
        port: 8186,
        url: "http://localhost:8186",
        api_endpoint: "http://localhost:8186/mcp",
        description: "Slack integration - messages, channels, users, reactions",
        tools: ["send_message", "list_channels", "get_channel_history", "search_messages", "add_reaction", "upload_file"],
        auth_required: true,
        auth_type: "SLACK_BOT_TOKEN environment variable"
      },
      {
        name: "Filesystem MCP",
        port: 8187,
        url: "http://localhost:8187",
        api_endpoint: "http://localhost:8187/mcp",
        description: "Safe filesystem operations for reading/writing project files",
        tools: ["read_file", "write_file", "list_directory", "create_directory", "delete_file", "move_file", "search_files"],
        auth_required: false,
        notes: "Restricted to allowed directories only"
      }
    ]
  },
  usage_examples: {
    project_registration: {
      description: "Register your project to get an API key",
      endpoint: "POST https://project-registry-henna.vercel.app/api/projects/register",
      request: {
        projectId: "my-project",
        projectName: "My Project",
        configs: {
          jira: {
            url: "https://yourcompany.atlassian.net",
            email: "your-email@company.com",
            api_token: "your-jira-api-token"
          },
          confluence: {
            url: "https://yourcompany.atlassian.net/wiki",
            email: "your-email@company.com",
            api_token: "your-confluence-api-token",
            spaceKey: "MYSPACE"
          }
        }
      },
      response: {
        success: true,
        apiKey: "pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        message: "Project registered successfully"
      }
    },
    calling_jira_mcp: {
      description: "Search for issues using JIRA MCP",
      endpoint: "POST https://jira-mcp-pi.vercel.app/api/mcp",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer pk_your_api_key_here"
      },
      request: {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "search_issues",
          arguments: {
            jql: "project = MYPROJECT AND status = 'In Progress'",
            maxResults: 10
          }
        }
      }
    },
    calling_confluence_mcp: {
      description: "Get page content from Confluence",
      endpoint: "POST https://confluence-mcp-six.vercel.app/api/mcp",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer pk_your_api_key_here"
      },
      request: {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "get_content_by_id",
          arguments: {
            id: "123456789"
          }
        }
      }
    },
    calling_enhanced_context: {
      description: "Load context for a task using natural language",
      endpoint: "POST https://enhanced-context-mcp.vercel.app/api/mcp",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "pk_your_api_key_here"
      },
      request: {
        tool: "load_enhanced_context",
        arguments: {
          task_statement: "I want to create architecture diagrams for our payment processing system"
        }
      }
    }
  },
  quick_reference: {
    vercel_mcps: {
      "Enhanced Context": "https://enhanced-context-mcp.vercel.app/api/mcp",
      "JIRA": "https://jira-mcp-pi.vercel.app/api/mcp",
      "Confluence": "https://confluence-mcp-six.vercel.app/api/mcp",
      "Storycrafter": "https://storycrafter-mcp.vercel.app/api/mcp"
    },
    docker_mcps: {
      "PR-Agent": "http://localhost:8188/mcp",
      "GitHub": "http://localhost:8185/mcp",
      "Slack": "http://localhost:8186/mcp",
      "Filesystem": "http://localhost:8187/mcp"
    },
    documentation: {
      "Project Registry Dashboard": "https://project-registry-henna.vercel.app/dashboard",
      "Enhanced Context Docs": "https://enhanced-context-mcp.vercel.app/docs",
      "JIRA MCP Docs": "https://jira-mcp-pi.vercel.app",
      "Confluence MCP Docs": "https://confluence-mcp-six.vercel.app/api/mcp"
    }
  },
  troubleshooting: {
    common_issues: [
      {
        issue: "401 Unauthorized",
        solution: "Ensure you have a valid API key from Project Registry and include it as Bearer token or X-API-Key header"
      },
      {
        issue: "Confluence/JIRA not configured",
        solution: "Register your project at Project Registry with the tool credentials before calling the MCP"
      },
      {
        issue: "Docker MCP not responding",
        solution: "Ensure Docker containers are running: docker-compose ps, then docker-compose up -d <service-name>"
      },
      {
        issue: "Body content not returned from Confluence",
        solution: "Use get_content_by_id - it now returns body.storage by default"
      }
    ]
  }
};

// Tool definitions
const TOOLS = [
  {
    name: 'get_mcp_ecosystem_guide',
    description: 'Get comprehensive guide about all MCPs in the ecosystem - what they are, where they are deployed (Vercel/Docker), how to use them, authentication flow, documentation links, and usage examples. Perfect for understanding the MCP landscape.',
    inputSchema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          enum: ['overview', 'vercel_mcps', 'docker_mcps', 'all_mcps', 'authentication', 'usage_examples', 'quick_reference', 'troubleshooting', 'full'],
          description: 'Which section to return: overview (architecture), vercel_mcps (cloud-deployed), docker_mcps (local), all_mcps (both), authentication (how to get API keys), usage_examples (code samples), quick_reference (URLs), troubleshooting (common issues), full (everything)'
        },
        mcp_name: {
          type: 'string',
          description: 'Get details about a specific MCP by name (e.g., "JIRA MCP", "Confluence MCP", "PR-Agent MCP")'
        }
      },
      required: []
    }
  },
  {
    name: 'load_enhanced_context',
    description: 'Load global WAMA contexts, templates, and project-specific rules for enhanced MCP processing. Supports TWO modes: (1) Natural Language: Just provide task_statement describing what you want to do, and the AI will intelligently infer contexts, templates, and guidance. (2) Structured: Provide explicit query_type, task_intent, scope, etc. Includes 13-step SDLC guidance and task-specific quality checks.',
    inputSchema: {
      type: 'object',
      properties: {
        task_statement: {
          type: 'string',
          description: 'Natural language description of what you\'re trying to do (e.g., "I want to create an architecture diagram for our MCP server system", "Help me write user stories for a payment feature", "Review security for our authentication system"). The AI will analyze this and provide relevant contexts, templates, and guidance. Use this for the most intelligent and accurate context loading.'
        },
        query_type: {
          type: 'string',
          enum: ConfigLoader.getInstance().getAllowedQueryTypes(),
          description: 'Type of user query to load appropriate contexts and templates. Optional if task_statement is provided.'
        },
        task_intent: {
          type: 'string',
          enum: ['create', 'refine', 'breakdown', 'review', 'plan', 'implement', 'select', 'escalate', 'deploy'],
          description: 'What you want to do: create (new work), refine (improve existing), breakdown (split into smaller parts), review (evaluate), plan (design), implement (code), select (pick next story), escalate (handle blocker), deploy (release to environment)'
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
      required: [] // Either task_statement or query_type must be provided, validated at runtime
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

// Handler for MCP Ecosystem Guide
function handleMcpEcosystemGuide(args: { section?: string; mcp_name?: string }) {
  const { section = 'full', mcp_name } = args;

  // If specific MCP requested, find and return it
  if (mcp_name) {
    const allMcps = [...MCP_ECOSYSTEM.mcps.vercel_deployed, ...MCP_ECOSYSTEM.mcps.docker_local];
    const found = allMcps.find(mcp =>
      mcp.name.toLowerCase().includes(mcp_name.toLowerCase())
    );
    if (found) {
      return {
        mcp: found,
        usage_tip: found.auth_required
          ? `This MCP requires authentication. ${found.auth_type}`
          : "This MCP does not require authentication."
      };
    }
    return { error: `MCP "${mcp_name}" not found. Available MCPs: ${allMcps.map(m => m.name).join(', ')}` };
  }

  // Return based on section
  switch (section) {
    case 'overview':
      return {
        ...MCP_ECOSYSTEM.overview,
        total_mcps: MCP_ECOSYSTEM.mcps.vercel_deployed.length + MCP_ECOSYSTEM.mcps.docker_local.length,
        vercel_count: MCP_ECOSYSTEM.mcps.vercel_deployed.length,
        docker_count: MCP_ECOSYSTEM.mcps.docker_local.length
      };

    case 'vercel_mcps':
      return {
        deployment: 'Vercel (Cloud)',
        description: 'These MCPs are deployed on Vercel and accessible from anywhere via HTTPS',
        mcps: MCP_ECOSYSTEM.mcps.vercel_deployed
      };

    case 'docker_mcps':
      return {
        deployment: 'Docker (Local)',
        description: 'These MCPs run locally in Docker containers. Start them with docker-compose.',
        mcps: MCP_ECOSYSTEM.mcps.docker_local
      };

    case 'all_mcps':
      return {
        vercel_deployed: MCP_ECOSYSTEM.mcps.vercel_deployed,
        docker_local: MCP_ECOSYSTEM.mcps.docker_local,
        total: MCP_ECOSYSTEM.mcps.vercel_deployed.length + MCP_ECOSYSTEM.mcps.docker_local.length
      };

    case 'authentication':
      return {
        flow: MCP_ECOSYSTEM.overview.architecture.authentication_flow,
        project_registry: MCP_ECOSYSTEM.overview.architecture.project_registry,
        registration_example: MCP_ECOSYSTEM.usage_examples.project_registration
      };

    case 'usage_examples':
      return MCP_ECOSYSTEM.usage_examples;

    case 'quick_reference':
      return MCP_ECOSYSTEM.quick_reference;

    case 'troubleshooting':
      return MCP_ECOSYSTEM.troubleshooting;

    case 'full':
    default:
      return {
        ...MCP_ECOSYSTEM,
        summary: {
          total_mcps: MCP_ECOSYSTEM.mcps.vercel_deployed.length + MCP_ECOSYSTEM.mcps.docker_local.length,
          vercel_deployed: MCP_ECOSYSTEM.mcps.vercel_deployed.map(m => m.name),
          docker_local: MCP_ECOSYSTEM.mcps.docker_local.map(m => m.name),
          getting_started: [
            "1. Go to Project Registry: https://project-registry-henna.vercel.app/dashboard",
            "2. Register your project with tool credentials (Jira, Confluence, etc.)",
            "3. Copy your API key (pk_xxx...)",
            "4. Use the API key as Bearer token when calling MCPs"
          ]
        }
      };
  }
}

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
      case 'get_mcp_ecosystem_guide':
        result = handleMcpEcosystemGuide(args || {});
        break;

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

// Handle tools/list request (public endpoint for documentation)
export async function GET(request: NextRequest) {
  // GET endpoint is public to support Swagger UI and API documentation
  // No authentication required for listing available tools
  return NextResponse.json({
    tools: TOOLS
  });
}
