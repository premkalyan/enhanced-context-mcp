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
        name: "Project Registry",
        url: "https://project-registry-henna.vercel.app",
        api_endpoint: "https://project-registry-henna.vercel.app/api/projects/register",
        docs: "https://project-registry-henna.vercel.app/docs",
        howto: "https://project-registry-henna.vercel.app/api/howto",
        dashboard: "https://project-registry-henna.vercel.app/dashboard",
        description: "Central credential management - register projects, store Jira/Confluence/GitHub credentials securely, get API keys for MCP authentication",
        endpoints: {
          register: "POST /api/projects/register",
          get_project: "GET /api/projects/{apiKey}",
          health: "GET /api/health",
          howto: "GET /api/howto"
        },
        auth_required: false,
        notes: "This is where you register your project to get API keys for other MCPs"
      },
      {
        name: "Enhanced Context MCP",
        url: "https://enhanced-context-mcp.vercel.app",
        api_endpoint: "https://enhanced-context-mcp.vercel.app/api/mcp",
        docs: "https://enhanced-context-mcp.vercel.app/docs",
        howto: "https://enhanced-context-mcp.vercel.app/api/howto",
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
        howto: "https://jira-mcp-pi.vercel.app/api/howto",
        description: "Comprehensive Jira integration - issues, boards, sprints, time tracking, JQL queries. Supports Markdown-to-ADF auto-conversion.",
        tools: ["search_issues", "get_issue", "create_issue", "update_issue", "add_comment", "get_boards", "get_sprints", "log_work", "transition_issue", "link_issues", "get_transitions", "assign_issue", "get_board_configuration", "get_sprint_issues", "create_sprint", "move_issues_to_sprint", "get_issue_worklogs", "get_issue_comments", "delete_comment", "add_watcher", "get_watchers", "remove_watcher", "get_issue_changelog", "get_priorities", "get_statuses", "link_story_to_epic"],
        rich_text_format: "ADF (Atlassian Document Format) - Markdown auto-converted",
        auth_required: true,
        auth_type: "Bearer token (from Project Registry)"
      },
      {
        name: "Confluence MCP",
        url: "https://confluence-mcp-six.vercel.app",
        api_endpoint: "https://confluence-mcp-six.vercel.app/api/mcp",
        docs: "https://confluence-mcp-six.vercel.app/api/mcp",
        howto: "https://confluence-mcp-six.vercel.app/api/howto",
        description: "Confluence documentation management - pages, spaces, templates, attachments, macros",
        tools: ["get_spaces", "get_space", "get_content_by_id", "get_content_by_space_and_title", "search", "create_page", "update_page", "get_page_attachments", "get_page_children", "add_page_labels", "upload_document", "update_document", "delete_document", "list_documents", "create_folder", "get_folder_contents", "move_page_to_folder", "create_page_template", "get_page_templates", "apply_page_template", "update_page_template", "get_pages_by_label", "get_page_history", "insert_macro", "update_macro", "get_page_macros", "link_page_to_jira_issue", "insert_jira_macro", "get_space_permissions", "embed_existing_attachment", "upload_and_embed_document", "upload_and_embed_attachment"],
        rich_text_format: "XHTML storage format (NOT Markdown)",
        auth_required: true,
        auth_type: "Bearer token (from Project Registry)"
      },
      {
        name: "Story Crafter MCP",
        url: "https://storycrafter-mcp.vercel.app",
        api_endpoint: "https://storycrafter-mcp.vercel.app/api/mcp",
        docs: "https://storycrafter-mcp.vercel.app",
        howto: "https://storycrafter-mcp.vercel.app/api/howto",
        description: "AI-powered backlog generator - transforms VISHKAR consensus into structured Epics and User Stories with acceptance criteria and technical tasks",
        tools: ["generate_epics", "generate_stories", "regenerate_epic", "regenerate_story"],
        auth_required: true,
        auth_type: "X-API-Key header (from Project Registry)",
        required_config: "configs.ai_provider (OpenAI or Anthropic API key)"
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
        description: "AI-powered Pull Request analysis - reviews, descriptions, code improvements, security scanning. Uses GPT-4/Claude for intelligent code review.",
        tools: ["pr_review", "pr_describe", "pr_improve", "pr_ask", "pr_analyze", "pr_complete_workflow", "pr_review_branch", "codeql_security_scan", "remediate_security_findings", "configure_codeql_rules"],
        auth_required: true,
        auth_type: "Environment variables (GITHUB_TOKEN, OPENAI_API_KEY, ANTHROPIC_API_KEY)",
        setup: {
          start: "cd /Users/premkalyan/code/mcp/pr-agent-mcp && docker-compose up -d",
          stop: "docker-compose down",
          logs: "docker-compose logs -f"
        },
        notes: "Run locally in Docker. Requires GitHub token and AI API keys configured in environment."
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
      "Project Registry": "https://project-registry-henna.vercel.app/api/projects/register",
      "Enhanced Context": "https://enhanced-context-mcp.vercel.app/api/mcp",
      "JIRA": "https://jira-mcp-pi.vercel.app/api/mcp",
      "Confluence": "https://confluence-mcp-six.vercel.app/api/mcp"
    },
    docker_mcps: {
      "PR-Agent": "http://localhost:8188/mcp"
    },
    documentation: {
      "Project Registry Dashboard": "https://project-registry-henna.vercel.app/dashboard",
      "Project Registry Docs": "https://project-registry-henna.vercel.app/docs",
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
  },
  {
    name: 'get_sdlc_guidance',
    description: 'Get VISHKAR 13-Step Autonomous SDLC guidance. Returns the complete autonomous development lifecycle with agent mappings, quality gates, MCP tool recommendations, and inter-agent handoff protocols. Use this to understand what agents do at each step and which MCP tools to use.',
    inputSchema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          enum: ['overview', 'steps', 'step', 'agents', 'mcp_servers', 'handoff', 'escalation', 'tools_by_step', 'full'],
          description: 'Which section: overview (summary + thresholds), steps (all 13 steps), step (specific step - requires step_number), agents (agent mapping), mcp_servers (Vercel + Docker MCPs), handoff (inter-agent protocol), escalation (failure handling), tools_by_step (MCP tools per step), full (everything)'
        },
        step_number: {
          type: 'number',
          minimum: 1,
          maximum: 13,
          description: 'Get detailed guidance for a specific step (1-13). Required when section is "step".'
        },
        agent_role: {
          type: 'string',
          enum: ['pm_agent', 'dev_agent', 'qa_agent', 'review_agent', 'doc_agent', 'coordinator'],
          description: 'Filter steps by agent role to see what a specific agent is responsible for'
        }
      },
      required: []
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

// Handler for SDLC Guidance - VISHKAR 13-Step Autonomous SDLC
function handleSdlcGuidance(args: { section?: string; step_number?: number; agent_role?: string }) {
  const { section = 'full', step_number, agent_role } = args;

  // Import SDLC config (inline for serverless)
  const SDLC = {
    name: "VISHKAR 13-Step Autonomous SDLC",
    version: "1.0.0",
    description: "Automated development lifecycle from story selection to completion with quality gates and human approval points",

    overview: {
      purpose: "Enable autonomous agents to execute the full software development lifecycle with minimal human intervention",
      philosophy: "Automation first, human oversight at critical gates",
      quality_thresholds: {
        minimum_quality_score: 7,
        test_pass_rate: 90,
        max_retries: 3,
        escalation_trigger: "After 3 failed retries, escalate to human"
      }
    },

    mcp_servers: {
      vercel_hosted: [
        { name: "Project Registry", url: "https://project-registry-henna.vercel.app", howto: "https://project-registry-henna.vercel.app/api/howto", purpose: "API key management", used_in_steps: "All" },
        { name: "JIRA MCP", url: "https://jira-mcp-pi.vercel.app", howto: "https://jira-mcp-pi.vercel.app/api/howto", purpose: "Issue tracking, story lifecycle", used_in_steps: [1, 13] },
        { name: "Confluence MCP", url: "https://confluence-mcp-six.vercel.app", howto: "https://confluence-mcp-six.vercel.app/api/howto", purpose: "Documentation, test reports", used_in_steps: [12] },
        { name: "Enhanced Context MCP", url: "https://enhanced-context-mcp.vercel.app", howto: "https://enhanced-context-mcp.vercel.app/api/howto", purpose: "Context loading, SDLC guidance", used_in_steps: "All" },
        { name: "Story Crafter MCP", url: "https://storycrafter-mcp.vercel.app", howto: "https://storycrafter-mcp.vercel.app/api/howto", purpose: "Backlog generation", used_in_steps: [1] }
      ],
      docker_local: [
        { name: "PR-Agent MCP", url: "http://localhost:8188", port: 8188, purpose: "AI-powered PR review (runs locally for security)", used_in_steps: [8], note: "Code review runs on LOCAL Docker - code never leaves your environment" }
      ]
    },

    agent_mapping: {
      pm_agent: { wama_agents: ["a-project-manager"], owned_steps: [1, 13], responsibilities: ["Story selection", "Story completion", "Sprint management"] },
      dev_agent: { wama_agents: ["a-backend-engineer", "a-frontend-developer"], owned_steps: [2, 3, 7, 9], responsibilities: ["Implementation", "Manual verification", "PR creation", "Feedback implementation"] },
      qa_agent: { wama_agents: ["a-test-automator", "a-qa-engineer"], owned_steps: [4, 5, 6], responsibilities: ["Test case creation", "Test implementation", "Test execution"] },
      review_agent: { wama_agents: ["a-code-reviewer", "a-pr-orchestrator"], owned_steps: [8], responsibilities: ["3-phase PR review", "Security analysis", "Performance analysis"] },
      doc_agent: { wama_agents: ["a-documentation-specialist"], owned_steps: [12], responsibilities: ["Documentation updates", "Architecture diagrams", "Test report linking"] },
      coordinator: { wama_agents: ["a-architect-review"], owned_steps: "All (monitoring)", responsibilities: ["Cross-step monitoring", "Escalation handling", "Quality oversight"] }
    },

    steps: [
      { step: 1, name: "Story Selection", short_name: "Story → In Progress", owner: "PM Agent", automated: true, gate: null, mcp_tools: { jira: ["search_issues", "transition_issue", "add_comment"] }, entry: ["Stories in Ready", "No blockers"], exit: ["Story in In Progress", "AC defined"], handoff_to: "Dev Agent" },
      { step: 2, name: "Implementation", short_name: "Implementation", owner: "Dev Agent", automated: true, gate: null, mcp_tools: { enhanced_context: ["load_enhanced_context"] }, entry: ["Story in progress"], exit: ["Code complete", "Quality >= 7/10"], handoff_to: "Dev Agent (Step 3)" },
      { step: 3, name: "Manual Verification", short_name: "Manual Verification", owner: "Dev Agent", automated: true, gate: "Optional", mcp_tools: { jira: ["add_comment"] }, entry: ["Implementation complete"], exit: ["App starts", "Happy path works"], handoff_to: "QA Agent" },
      { step: 4, name: "Create Test Cases", short_name: "Create GitHub Test Cases", owner: "QA Agent", automated: true, gate: null, mcp_tools: { jira: ["get_issue_details"] }, entry: ["Verification passed"], exit: ["Test cases created"], handoff_to: "QA Agent (Step 5)" },
      { step: 5, name: "Implement Tests", short_name: "Implement Playwright Tests", owner: "QA Agent", automated: true, gate: null, mcp_tools: { enhanced_context: ["load_enhanced_context"] }, entry: ["Test cases ready"], exit: ["Playwright tests implemented"], handoff_to: "QA Agent (Step 6)" },
      { step: 6, name: "Execute Tests", short_name: "Execute Tests", owner: "QA Agent", automated: "Semi", gate: { type: "Quality", threshold: ">=90% pass" }, mcp_tools: { jira: ["add_comment"] }, entry: ["Tests implemented"], exit: ["Pass rate >= 90%"], handoff_to: "Dev Agent" },
      { step: 7, name: "PR Creation", short_name: "PR Creation", owner: "Dev Agent", automated: true, gate: null, mcp_tools: { jira: ["add_comment"] }, entry: ["Tests passing"], exit: ["PR created"], handoff_to: "Review Agent" },
      { step: 8, name: "3-Phase PR Review", short_name: "3-Phase PR Review", owner: "Review Agent", automated: true, gate: null, mcp_tools: { pr_agent_docker: ["pr_describe", "pr_review", "pr_improve"] }, entry: ["PR created"], exit: ["Review complete"], handoff_to: "Dev Agent", note: "PR-Agent runs on LOCAL DOCKER (port 8188)" },
      { step: 9, name: "Feedback Implementation", short_name: "Feedback Implementation", owner: "Dev Agent", automated: true, gate: null, mcp_tools: { jira: ["add_comment"] }, entry: ["Review feedback received"], exit: ["All feedback addressed"], handoff_to: "CI/CD" },
      { step: 10, name: "CI/CD Pipeline", short_name: "Pipeline Execution", owner: "CI/CD", automated: "Semi", gate: { type: "Quality", threshold: "All green" }, mcp_tools: {}, entry: ["Feedback addressed"], exit: ["All checks pass"], handoff_to: "Human" },
      { step: 11, name: "Human Merge Approval", short_name: "Merge Approval", owner: "Human", automated: false, gate: { type: "Human Gate", description: "ONLY mandatory human intervention" }, mcp_tools: {}, entry: ["CI passing"], exit: ["PR merged"], handoff_to: "Doc Agent" },
      { step: 12, name: "Documentation Update", short_name: "Confluence Update", owner: "Doc Agent", automated: true, gate: null, mcp_tools: { confluence: ["create_page", "update_page", "insert_jira_macro"] }, entry: ["PR merged"], exit: ["Docs updated"], handoff_to: "PM Agent" },
      { step: 13, name: "Story Closure", short_name: "Story → Done", owner: "PM Agent", automated: true, gate: null, mcp_tools: { jira: ["transition_issue", "add_comment", "search_issues"] }, entry: ["Docs complete"], exit: ["Story Done", "Next story selected"], handoff_to: "PM Agent (Step 1)" }
    ],

    handoff_format: {
      schema: { from: "Agent role", to: "Target agent", messageType: "handoff", payload: { storyKey: "JIRA key", step: "number", qualityScore: "1-10", nextActions: "array" } },
      example: { from: "Dev Agent", to: "QA Agent", messageType: "handoff", payload: { storyKey: "PROJ-123", step: 3, qualityScore: 8.2, nextActions: ["Create test cases", "Implement tests"] } }
    },

    escalation: {
      triggers: ["Quality < 7/10 after 3 attempts", "Test pass rate < 90% after 3 retries", "CI fails 3 times", "Security vulnerability (auto-escalate)"],
      escalation_to: "Human + Coordinator (a-architect-review)"
    },

    tools_by_step: {
      1: { mcp: "JIRA MCP (Vercel)", tools: ["search_issues", "transition_issue", "add_comment"] },
      2: { mcp: "Enhanced Context MCP (Vercel)", tools: ["load_enhanced_context"] },
      3: { mcp: "JIRA MCP (Vercel)", tools: ["add_comment"] },
      4: { mcp: "JIRA MCP (Vercel)", tools: ["get_issue_details"] },
      5: { mcp: "Enhanced Context MCP (Vercel)", tools: ["load_enhanced_context"] },
      6: { mcp: "JIRA MCP (Vercel)", tools: ["add_comment"] },
      7: { mcp: "JIRA MCP (Vercel)", tools: ["add_comment"] },
      8: { mcp: "PR-Agent MCP (Docker localhost:8188)", tools: ["pr_describe", "pr_review", "pr_improve"] },
      9: { mcp: "JIRA MCP (Vercel)", tools: ["add_comment"] },
      10: { mcp: "External CI/CD", tools: [] },
      11: { mcp: "Human", tools: [] },
      12: { mcp: "Confluence MCP (Vercel)", tools: ["create_page", "update_page"] },
      13: { mcp: "JIRA MCP (Vercel)", tools: ["transition_issue", "add_comment", "search_issues"] }
    }
  };

  // Filter steps by agent role if specified
  const filterStepsByAgent = (steps: any[], role: string) => {
    const agentSteps = SDLC.agent_mapping[role as keyof typeof SDLC.agent_mapping]?.owned_steps;
    if (!agentSteps || agentSteps === "All (monitoring)") return steps;
    return steps.filter(s => (agentSteps as number[]).includes(s.step));
  };

  // Get specific step
  if (section === 'step' && step_number) {
    const step = SDLC.steps.find(s => s.step === step_number);
    if (!step) return { error: `Step ${step_number} not found. Valid steps: 1-13` };
    return {
      step,
      mcp_tools: SDLC.tools_by_step[step_number as keyof typeof SDLC.tools_by_step],
      quality_thresholds: SDLC.overview.quality_thresholds
    };
  }

  switch (section) {
    case 'overview':
      return {
        name: SDLC.name,
        description: SDLC.description,
        ...SDLC.overview,
        total_steps: 13,
        human_gates: 1,
        automated_steps: 12
      };

    case 'steps':
      const steps = agent_role ? filterStepsByAgent(SDLC.steps, agent_role) : SDLC.steps;
      return {
        total: steps.length,
        steps,
        steps_summary: steps.map(s => ({ step: s.step, name: s.name, owner: s.owner, automated: s.automated }))
      };

    case 'agents':
      return {
        agent_mapping: SDLC.agent_mapping,
        usage: "Use agent_role parameter to filter steps by agent"
      };

    case 'mcp_servers':
      return {
        description: "MCP servers used in the SDLC - some on Vercel (cloud), PR-Agent on local Docker",
        ...SDLC.mcp_servers,
        important_note: "PR-Agent MCP runs on LOCAL DOCKER (port 8188) for security - your code never leaves your environment during review"
      };

    case 'handoff':
      return SDLC.handoff_format;

    case 'escalation':
      return SDLC.escalation;

    case 'tools_by_step':
      return {
        description: "MCP tools recommended for each SDLC step",
        tools: SDLC.tools_by_step
      };

    case 'full':
    default:
      return {
        ...SDLC,
        summary: {
          name: SDLC.name,
          total_steps: 13,
          human_gates: 1,
          automated_steps: 12,
          vercel_mcps: SDLC.mcp_servers.vercel_hosted.map(m => m.name),
          docker_mcps: SDLC.mcp_servers.docker_local.map(m => `${m.name} (port ${m.port})`),
          agent_roles: Object.keys(SDLC.agent_mapping)
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

      case 'get_sdlc_guidance':
        result = handleSdlcGuidance(args || {});
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
