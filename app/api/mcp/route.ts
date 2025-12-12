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
    name: 'get_started',
    description: '📋 Enhanced Context onboarding - SDLC guidance, VISHKAR agents, POC building. NOTE: For ecosystem overview and registration, use Project Registry MCP (https://project-registry-henna.vercel.app/api/mcp) which requires no auth.',
    inputSchema: {
      type: 'object',
      properties: {
        include_examples: {
          type: 'boolean',
          description: 'Include usage examples (default: true)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_mcp_ecosystem_guide',
    description: 'Detailed MCP information. NOTE: For no-auth ecosystem overview, use Project Registry MCP instead (https://project-registry-henna.vercel.app/api/mcp → get_started).',
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
  },
  {
    name: 'get_poc_building_guide',
    description: 'Get comprehensive guidance on building interactive Proof of Concept (POC) sites using the QIP methodology. Includes the 6-section framework, page layouts, data templates, UI patterns, and client branding extraction guidance.',
    inputSchema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          enum: ['overview', 'framework', 'methodology', 'layouts', 'templates', 'ui_patterns', 'branding', 'checklist', 'full'],
          description: 'Which section: overview (quick summary), framework (6 sections), methodology (step-by-step process), layouts (page wireframes), templates (JSON data structures), ui_patterns (React components), branding (client color/font extraction), checklist (quick start), full (everything)'
        },
        page_type: {
          type: 'string',
          enum: ['questions', 'architecture', 'delivery', 'risks', 'north_star', 'demo'],
          description: 'Get detailed guidance for a specific POC page type'
        }
      },
      required: []
    }
  }
];

// Handler for Get Started - Enhanced Context specific onboarding
function handleGetStarted(args: { include_examples?: boolean }) {
  const includeExamples = args.include_examples !== false;

  const onboarding = {
    note: {
      important: "For ecosystem overview WITHOUT authentication, use Project Registry MCP",
      entry_point: "POST https://project-registry-henna.vercel.app/api/mcp",
      call: { tool: "get_started", arguments: {} },
      why: "Project Registry requires no auth and is the true entry point"
    },

    this_mcp: {
      name: "Enhanced Context MCP",
      purpose: "Specialized tools for SDLC guidance, VISHKAR agents, and POC building",
      requires_auth: true,
      auth_header: "X-API-Key: {your_api_key}"
    },

    available_tools: {
      sdlc: {
        tool: "get_sdlc_guidance",
        description: "13-step autonomous SDLC with agent mappings and MCP integration",
        sections: ["overview", "steps", "step", "agents", "mcp_servers", "handoff", "escalation", "tools_by_step", "full"]
      },
      agents: {
        tool: "list_vishkar_agents",
        description: "38 VISHKAR agents - 32 technical specialists + 6 domain experts",
        filter_by: "agent_type: all | technical | domain_expert"
      },
      poc_building: {
        tool: "get_poc_building_guide",
        description: "QIP methodology for building interactive POC sites",
        sections: ["overview", "framework", "methodology", "layouts", "templates", "ui_patterns", "branding", "checklist", "full"]
      },
      context_loading: {
        tool: "load_enhanced_context",
        description: "Intent-based context loading with smart selection",
        parameters: ["query", "task_intent", "scope", "complexity", "domain_focus"]
      }
    },

    sdlc_overview: {
      name: "VISHKAR 13-Step Autonomous SDLC",
      description: "Agent-driven software development lifecycle with quality gates",
      quality_thresholds: { minimum_score: "7/10", test_coverage: "90%" },
      steps_summary: [
        { step: 1, name: "Project Initialization", owner: "pm_agent" },
        { step: 2, name: "Requirements Gathering", owner: "pm_agent" },
        { step: 3, name: "Epic & Story Creation", owner: "pm_agent" },
        { step: 4, name: "Technical Design", owner: "dev_agent" },
        { step: 5, name: "Sprint Planning", owner: "pm_agent" },
        { step: 6, name: "Implementation", owner: "dev_agent" },
        { step: 7, name: "Unit Testing", owner: "qa_agent" },
        { step: 8, name: "PR Review (3-Phase)", owner: "review_agent" },
        { step: 9, name: "Integration Testing", owner: "qa_agent" },
        { step: 10, name: "Documentation", owner: "doc_agent" },
        { step: 11, name: "Deployment", owner: "dev_agent" },
        { step: 12, name: "Verification", owner: "qa_agent" },
        { step: 13, name: "Handoff & Closure", owner: "pm_agent" }
      ],
      get_full_details: "Call get_sdlc_guidance with section='full'"
    },

    vishkar_agents: {
      total: 38,
      technical_agents: 32,
      domain_experts: 6,
      categories: {
        technical: ["backend-engineer", "frontend-developer", "security-auditor", "cloud-architect", "devops-engineer", "database-specialist", "api-designer", "test-automator", "performance-engineer", "mobile-developer", "ml-engineer", "data-engineer"],
        domain_experts: [
          { name: "e-commerce-specialist", focus: "Cart, payments, checkout" },
          { name: "healthcare-specialist", focus: "HIPAA, EHR, clinical" },
          { name: "fintech-specialist", focus: "PCI-DSS, KYC/AML" },
          { name: "cx-design-specialist", focus: "Customer journey, UX" },
          { name: "privacy-specialist", focus: "GDPR, CCPA" },
          { name: "supply-chain-specialist", focus: "Logistics, inventory" }
        ]
      },
      get_full_list: "Call list_vishkar_agents"
    },

    poc_building: {
      methodology: "QIP - Questions, Implementation, Presentation",
      framework: "6-section POC structure",
      sections: ["Questions", "Architecture", "Delivery (WBS)", "Risks", "North Star", "Demo"],
      branding: "Use AntiGravity tool to extract client colors/fonts",
      get_full_guide: "Call get_poc_building_guide"
    },

    mcp_ecosystem_summary: {
      total_mcps: 6,
      entry_point: "Project Registry (no auth required)",
      this_mcp: "Enhanced Context (auth required)",
      other_mcps: ["JIRA MCP", "Confluence MCP", "Story Crafter MCP", "PR-Agent MCP (Docker)"],
      for_full_ecosystem_guide: "Use Project Registry MCP → get_started (no auth needed)"
    },

    next_steps: [
      "1. Call get_sdlc_guidance for development workflow",
      "2. Call list_vishkar_agents to find the right agent",
      "3. Call get_poc_building_guide for POC structure",
      "4. Use the specific MCP for your task (JIRA, Confluence, etc.)"
    ]
  };

  // Add examples if requested
  if (includeExamples) {
    return {
      ...onboarding,
      examples: {
        register_project: {
          endpoint: "POST https://project-registry-henna.vercel.app/api/projects/register",
          body: {
            projectId: "my-project",
            projectName: "My Project",
            configs: {
              jira: { url: "https://company.atlassian.net", email: "user@company.com", api_token: "xxx" },
              confluence: { url: "https://company.atlassian.net/wiki", email: "user@company.com", api_token: "xxx" }
            }
          }
        },
        call_jira: {
          endpoint: "POST https://jira-mcp-pi.vercel.app/api/mcp",
          headers: { "Authorization": "Bearer pk_your_key", "Content-Type": "application/json" },
          body: { tool: "search_issues", arguments: { jql: "project = MYPROJ AND status = 'In Progress'" } }
        },
        call_enhanced_context: {
          endpoint: "POST https://enhanced-context-mcp.vercel.app/api/mcp",
          headers: { "X-API-Key": "pk_your_key", "Content-Type": "application/json" },
          body: { tool: "list_vishkar_agents", arguments: { agent_type: "domain_expert" } }
        }
      }
    };
  }

  return onboarding;
}

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

// Handler for POC Building Guide - QIP Methodology
function handlePocBuildingGuide(args: { section?: string; page_type?: string }) {
  const { section = 'full', page_type } = args;

  const POC_GUIDE = {
    name: "QIP POC Building Methodology",
    version: "1.0.0",
    description: "A structured approach to building comprehensive, interactive Proof of Concept sites that win stakeholder buy-in",

    overview: {
      purpose: "Build POCs that stakeholders can navigate in 30-60 minutes with confidence that scope, risks, and feasibility are documented",
      principles: [
        "Questions First - Define scope before designing",
        "Tell a Story - Architecture is a journey, not a data dump",
        "Show Feasibility - WBS proves you can deliver",
        "Address Risks - Shows mature thinking",
        "Paint the Vision - North Star inspires buy-in",
        "Demonstrate Live - Working demo beats slides"
      ],
      result: "Comprehensive, interactive POC that wins stakeholder buy-in"
    },

    framework: {
      description: "Every POC should have these 6 core sections",
      sections: [
        { number: 1, name: "Questions", purpose: "Clarify scope & requirements", key_content: "Interactive Q&A table with 'Our Understanding'", page: "/questions" },
        { number: 2, name: "Architecture", purpose: "Show the journey from problem to solution", key_content: "Multi-stage narrative with Mermaid diagrams", page: "/architecture" },
        { number: 3, name: "Delivery", purpose: "Prove feasibility with WBS", key_content: "Phases, effort, team, timeline with what-if analysis", page: "/delivery" },
        { number: 4, name: "Risks", purpose: "Show you've thought it through", key_content: "Risk register with mitigations and contingencies", page: "/risks" },
        { number: 5, name: "North Star", purpose: "Paint the vision beyond MVP", key_content: "Future capabilities, competitive differentiation", page: "/what-else" },
        { number: 6, name: "Demo", purpose: "Show, don't tell", key_content: "Interactive live demonstration with scenarios", page: "/pipeline" }
      ]
    },

    methodology: {
      description: "Template → Structure → Fill approach",
      steps: [
        {
          step: 1,
          name: "Start with Questions",
          why: "Questions define scope. Everything else flows from answered questions.",
          structure: ["Clarifying questions table", "Categories (Scope, Technical, Integration, Timeline)", "'Our Understanding' column", "Deadline badge (creates urgency)"]
        },
        {
          step: 2,
          name: "Create Architecture Journey",
          why: "Tell a story, not dump information",
          parts: [
            { part: "A", name: "Business Problem", content: "Current State → Pain Points → Requirements" },
            { part: "B", name: "Solution Design", content: "Approach → Components → Data Flow" },
            { part: "C", name: "Technology", content: "Infrastructure → AI/ML → Security" },
            { part: "D", name: "Operations", content: "Monitoring → Support → Evolution" }
          ],
          stage_content: ["Story/narrative (what & why)", "Mermaid diagram", "Outcomes (deliverables)", "Example (concrete instance)", "Risks (linked to risk register)", "CMMI/Framework alignment"]
        },
        {
          step: 3,
          name: "Build Delivery Plan (WBS)",
          structure: ["Phases (6 phases, 9 months typical)", "Tasks with effort (person-days)", "Team Roles (7 roles with rates)", "Production Drops (5 incremental releases)", "Volume Assumptions", "Monthly Staffing"],
          features: ["Editable effort fields (what-if analysis)", "Auto-calculated totals & utilization", "CSV export for external tools"]
        },
        {
          step: 4,
          name: "Document Risks",
          structure: ["Summary cards (total, critical, open, contingencies)", "Risk table with filters", "Impact/Probability matrix", "Owner, Mitigation, Contingency fields"]
        },
        {
          step: 5,
          name: "Define North Star Vision",
          structure: ["Vision Statement (3-phase evolution)", "Architecture Evolution diagram", "Competitive Differentiation", "Strategic Capabilities", "Business Value metrics", "Evolution Roadmap"]
        },
        {
          step: 6,
          name: "Create Live Demo",
          structure: ["Scenario Selector (4 demo scenarios)", "Interactive Flow (ReactFlow canvas)", "Event Log (real-time activity)", "Phase Progress indicator", "Output Integration (Jira tickets, Confluence reports)"]
        }
      ]
    },

    page_layouts: {
      questions: {
        name: "Questions Page",
        sections: ["Header with Deadline Badge", "Questions Table (ID, Question, Category, Our Understanding)", "Editable fields for interpretations"]
      },
      architecture: {
        name: "Architecture Page",
        sections: ["Stage Navigation (Parts A-D)", "Main Content (Title, Story, Diagram, Outcomes)", "Progress Bar", "Side Panel (Examples + Risks)"]
      },
      delivery: {
        name: "Delivery Page (WBS)",
        sections: ["Summary Cards (Total Effort, Team Size, Duration)", "Expandable Phase Sections", "Task Tables with Editable Effort", "Monthly Staffing Chart", "Team Roles", "Production Drops"]
      },
      risks: {
        name: "Risks Page",
        sections: ["Summary Cards", "Filterable Risk Table", "Impact/Probability indicators"]
      },
      north_star: {
        name: "North Star Page",
        sections: ["Vision Statement", "Architecture Evolution Diagram", "Feature Comparison", "Capability Areas", "Business Value Cards", "Timeline"]
      },
      demo: {
        name: "Demo Page",
        sections: ["Scenario Selector", "ReactFlow Canvas", "Event Log", "Phase Progress"]
      }
    },

    templates: {
      questions_json: {
        description: "Questions data structure",
        schema: {
          questions: [{
            id: "Q1",
            question: "What systems need to integrate?",
            category: "Technical | Scope | Integration | Timeline",
            priority: "High | Medium | Low",
            ourUnderstanding: "Your interpretation"
          }]
        }
      },
      stages_json: {
        description: "Architecture stages data structure",
        schema: {
          stages: [{
            id: "1.0",
            part: "A | B | C | D",
            title: "Stage Title",
            subtitle: "Stage Subtitle",
            story: "Narrative description",
            diagram: "Mermaid flowchart syntax",
            outcomes: ["Outcome 1", "Outcome 2"],
            questionIds: ["Q1", "Q2"],
            risks: [{ risk: "Description", impact: "High", probability: "Medium", mitigation: "How to address" }]
          }]
        }
      },
      wbs_json: {
        description: "Work Breakdown Structure",
        schema: {
          phases: [{
            id: "1",
            phase: "Phase Name",
            duration: "Weeks 1-6",
            items: [{ id: "1.1", task: "Task Name", description: "Details", effort: 9, role: "BA" }]
          }],
          teamRoles: [{ id: "TL", name: "Tech Lead", count: 1 }],
          productionDrops: [{ drop: "Drop 1", week: "Week 9", scope: ["Feature 1"] }]
        }
      }
    },

    ui_patterns: {
      card_component: {
        description: "Standard card with icon and content",
        classes: "bg-white dark:bg-zinc-800 rounded-lg border p-6"
      },
      editable_table: {
        description: "Table with inline-editable fields for what-if analysis"
      },
      progress_steps: {
        description: "Horizontal step indicator",
        active_classes: "bg-purple-500 text-white",
        inactive_classes: "bg-zinc-200"
      },
      color_coding: {
        part_a_business: { color: "Red/Orange", classes: "bg-red-100 text-red-700" },
        part_b_solution: { color: "Blue", classes: "bg-blue-100 text-blue-700" },
        part_c_technology: { color: "Purple", classes: "bg-purple-100 text-purple-700" },
        part_d_operations: { color: "Green", classes: "bg-green-100 text-green-700" },
        critical_risk: { color: "Red", classes: "bg-red-500" },
        medium_risk: { color: "Amber", classes: "bg-amber-500" },
        low_risk: { color: "Green", classes: "bg-green-500" }
      }
    },

    client_branding: {
      description: "Extract and apply client-specific branding for POC customization",
      importance: "POCs should reflect client's visual identity to increase stakeholder buy-in",
      extraction_tool: {
        name: "AntiGravity",
        purpose: "AI-powered tool for extracting color schemes and typography from client websites or brand assets",
        capabilities: [
          "Extract primary, secondary, and accent colors from client website",
          "Identify font families (headings, body text)",
          "Generate Tailwind CSS color palette",
          "Create CSS custom properties for theming",
          "Suggest dark mode color variants"
        ],
        usage: [
          "1. Provide client website URL or brand assets to AntiGravity",
          "2. AntiGravity analyzes visual elements and extracts branding",
          "3. Receive color palette (hex/RGB) and font stack",
          "4. Apply to POC via Tailwind config or CSS variables",
          "5. Validate with client before finalizing"
        ]
      },
      implementation: {
        tailwind_config: "Extend theme.colors with client palette",
        css_variables: "Define --color-primary, --color-secondary, etc.",
        font_import: "Add client fonts via Google Fonts or local files"
      },
      best_practices: [
        "Always extract branding BEFORE building UI components",
        "Use client's primary color for CTAs and key interactive elements",
        "Maintain sufficient contrast for accessibility (WCAG 2.1)",
        "Test both light and dark modes with client colors",
        "Document color decisions for consistency"
      ]
    },

    checklist: {
      description: "Quick Start Checklist",
      items: [
        { task: "Extract client branding using AntiGravity", section: "Branding" },
        { task: "Create /questions page with clarifying questions table", section: "Questions" },
        { task: "Create /architecture page with 4-part journey (16 stages)", section: "Architecture" },
        { task: "Add Mermaid diagrams for each stage", section: "Architecture" },
        { task: "Create /delivery page with WBS and team roles", section: "Delivery" },
        { task: "Extract risks to /risks page with mitigations", section: "Risks" },
        { task: "Create /what-else page with North Star vision", section: "North Star" },
        { task: "Build /pipeline demo with scenarios", section: "Demo" },
        { task: "Add access control (PasswordGate)", section: "Security" },
        { task: "Test dark mode support", section: "UI" },
        { task: "Review with stakeholders", section: "Final" }
      ]
    },

    file_structure: {
      app: ["questions/page.tsx", "architecture/page.tsx", "delivery/page.tsx", "risks/page.tsx", "what-else/page.tsx", "pipeline/page.tsx"],
      content: ["questions.json", "stages.json", "examples/"],
      components: ["QuestionsTable.tsx", "StageNavigation.tsx", "StageContent.tsx", "ProgressBar.tsx", "SidePanel.tsx"]
    }
  };

  // Get specific page type guidance
  if (page_type) {
    const pageGuide = {
      questions: { ...POC_GUIDE.framework.sections[0], layout: POC_GUIDE.page_layouts.questions, template: POC_GUIDE.templates.questions_json, methodology: POC_GUIDE.methodology.steps[0] },
      architecture: { ...POC_GUIDE.framework.sections[1], layout: POC_GUIDE.page_layouts.architecture, template: POC_GUIDE.templates.stages_json, methodology: POC_GUIDE.methodology.steps[1] },
      delivery: { ...POC_GUIDE.framework.sections[2], layout: POC_GUIDE.page_layouts.delivery, template: POC_GUIDE.templates.wbs_json, methodology: POC_GUIDE.methodology.steps[2] },
      risks: { ...POC_GUIDE.framework.sections[3], layout: POC_GUIDE.page_layouts.risks, methodology: POC_GUIDE.methodology.steps[3] },
      north_star: { ...POC_GUIDE.framework.sections[4], layout: POC_GUIDE.page_layouts.north_star, methodology: POC_GUIDE.methodology.steps[4] },
      demo: { ...POC_GUIDE.framework.sections[5], layout: POC_GUIDE.page_layouts.demo, methodology: POC_GUIDE.methodology.steps[5] }
    };
    return pageGuide[page_type as keyof typeof pageGuide] || { error: `Unknown page type: ${page_type}` };
  }

  switch (section) {
    case 'overview':
      return POC_GUIDE.overview;

    case 'framework':
      return POC_GUIDE.framework;

    case 'methodology':
      return POC_GUIDE.methodology;

    case 'layouts':
      return POC_GUIDE.page_layouts;

    case 'templates':
      return POC_GUIDE.templates;

    case 'ui_patterns':
      return POC_GUIDE.ui_patterns;

    case 'branding':
      return POC_GUIDE.client_branding;

    case 'checklist':
      return POC_GUIDE.checklist;

    case 'full':
    default:
      return {
        ...POC_GUIDE,
        summary: {
          name: POC_GUIDE.name,
          sections: POC_GUIDE.framework.sections.map(s => s.name),
          key_principles: POC_GUIDE.overview.principles,
          branding_tool: "AntiGravity",
          checklist_items: POC_GUIDE.checklist.items.length
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
      case 'get_started':
        result = handleGetStarted(args || {});
        break;

      case 'get_mcp_ecosystem_guide':
        result = handleMcpEcosystemGuide(args || {});
        break;

      case 'get_sdlc_guidance':
        result = handleSdlcGuidance(args || {});
        break;

      case 'get_poc_building_guide':
        result = handlePocBuildingGuide(args || {});
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
