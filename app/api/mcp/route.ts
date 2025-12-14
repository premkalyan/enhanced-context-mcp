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
    description: 'Get VISHKAR 17-Step Enhanced SDLC guidance with 4-Angle Internal Review. Returns the complete autonomous development lifecycle with agent mappings, quality gates, MCP tool recommendations, severity levels, storage schemas, and contextual agent selection. Use this to understand what agents do at each step and which MCP tools to use.',
    inputSchema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          enum: ['overview', 'steps', 'step', 'agents', 'mcp_servers', 'handoff', 'escalation', 'tools_by_step', 'severity_levels', 'storage_schemas', 'contextual_selection', 'full'],
          description: 'Which section: overview (summary + thresholds), steps (all 17 steps), step (specific step - requires step_number), agents (agent mapping), mcp_servers (Vercel + Docker MCPs), handoff (inter-agent protocol), escalation (failure handling), tools_by_step (MCP tools per step), severity_levels (issue severity definitions), storage_schemas (findings/lessons storage), contextual_selection (file pattern rules), full (everything)'
        },
        step_number: {
          type: 'number',
          minimum: 1,
          maximum: 17,
          description: 'Get detailed guidance for a specific step (1-17). Required when section is "step".'
        },
        agent_role: {
          type: 'string',
          enum: ['pm_agent', 'dev_agent', 'qa_agent', 'review_agent_architecture', 'review_agent_security', 'review_agent_quality', 'review_agent_techstack', 'pr_review_agent', 'coordinator'],
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
  },
  {
    name: 'get_contextual_agent',
    description: 'Get the right VISHKAR agent(s) for reviewing or working on specific files. This tool matches file paths against tech-stack patterns and returns the most appropriate specialized agents. Use this for Step 6 (Tech-Stack Review) of the 17-Step SDLC or when you need to find "the right architect" for a specific type of file.',
    inputSchema: {
      type: 'object',
      properties: {
        file_paths: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of file paths to match against tech-stack patterns (e.g., ["backend/src/main.py", "frontend/components/Button.tsx"])'
        },
        file_path: {
          type: 'string',
          description: 'Single file path to match (alternative to file_paths array)'
        },
        include_agent_details: {
          type: 'boolean',
          description: 'Include full agent profile details in response (default: false)'
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
        description: "17-step enhanced SDLC with 4-Angle Internal Review, agent mappings, and MCP integration",
        sections: ["overview", "steps", "step", "agents", "mcp_servers", "handoff", "escalation", "tools_by_step", "severity_levels", "storage_schemas", "contextual_selection", "full"]
      },
      contextual_agent: {
        tool: "get_contextual_agent",
        description: "Get the right specialist agent(s) for reviewing specific files - 'Give me the right architect'",
        parameters: ["file_paths", "file_path", "include_agent_details"],
        usage: "Pass file paths to get matched agents for Step 6 (Tech-Stack Review)"
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
      name: "VISHKAR 17-Step Enhanced SDLC",
      version: "2.0.0",
      description: "Agent-driven SDLC with 4-Angle Internal Review - Quality at source",
      key_feature: "4-Angle Internal Review (Steps 3-6) catches issues before testing",
      quality_thresholds: { minimum_score: "7/10", test_coverage: "90%", blocking_severities: ["critical", "high"] },
      phases: [
        { name: "Task Selection", steps: [1] },
        { name: "Implementation", steps: [2] },
        { name: "4-Angle Internal Review", steps: [3, 4, 5, 6], description: "Architecture, Security, Quality, Tech-Stack" },
        { name: "Feedback", steps: [7] },
        { name: "Testing", steps: [8, 9, 10, 11] },
        { name: "PR & Review", steps: [12, 13, 14] },
        { name: "Merge & Deploy", steps: [15, 16, 17] }
      ],
      contextual_agent_selection: "Use get_contextual_agent to find the right specialist for Step 6",
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

// Handler for SDLC Guidance - VISHKAR 17-Step Enhanced SDLC with 4-Angle Internal Review
function handleSdlcGuidance(args: { section?: string; step_number?: number; agent_role?: string }) {
  const { section = 'full', step_number, agent_role } = args;

  // VISHKAR 17-Step Enhanced SDLC v2.0.0 (inline for serverless)
  const SDLC = {
    name: "VISHKAR 17-Step Enhanced SDLC",
    version: "2.0.0",
    description: "Enhanced development lifecycle with 4-Angle Internal Review after task implementation - Quality at source",

    overview: {
      purpose: "Enable autonomous agents to execute the full software development lifecycle with minimal human intervention",
      philosophy: "Quality at source - review early, fix early",
      total_steps: 17,
      human_gates: 1,
      automated_steps: 16,
      key_enhancement: "4-Angle Internal Review (Steps 3-6) after implementation catches issues before testing",
      quality_thresholds: {
        minimum_quality_score: 7,
        test_pass_rate: 90,
        max_retries: 3,
        escalation_trigger: "After 3 failed retries, escalate to human",
        critical_issues_allowed: 0,
        high_issues_allowed: 0
      }
    },

    severity_levels: [
      { level: "critical", symbol: "🔴", description: "Security vulnerabilities, production-breaking issues", action: "MUST fix before proceeding", blocking: true },
      { level: "high", symbol: "🟠", description: "Performance issues, significant maintainability concerns", action: "MUST fix before proceeding", blocking: true },
      { level: "medium", symbol: "🟡", description: "Code quality improvements, best practice suggestions", action: "SHOULD fix, recommended", blocking: false },
      { level: "low", symbol: "🟢", description: "Style preferences, minor optimizations", action: "MAY fix, or log for future", blocking: false }
    ],

    contextual_agent_selection: {
      description: "Rules for selecting the right agent based on file patterns being reviewed",
      usage: "When Step 6 (Tech-Stack Review) runs, select agent based on files being changed",
      tool: "get_contextual_agent",
      example_patterns: [
        { pattern: "backend/**/*.py", agents: ["a-fastapi-pro", "a-backend-engineer"] },
        { pattern: "frontend/**/*.tsx", agents: ["a-frontend-developer", "a-typescript-pro"] },
        { pattern: "terraform/**/*", agents: ["a-terraform-specialist"] },
        { pattern: "**/api/**/*", agents: ["a-backend-architect", "a-backend-engineer"] }
      ],
      default_agent: "a-backend-engineer"
    },

    mcp_servers: {
      vercel_hosted: [
        { name: "Project Registry", url: "https://project-registry-henna.vercel.app", howto: "https://project-registry-henna.vercel.app/api/howto", purpose: "API key management and credential storage" },
        { name: "JIRA MCP", url: "https://jira-mcp-pi.vercel.app", howto: "https://jira-mcp-pi.vercel.app/api/howto", purpose: "Issue tracking, sprint management, story lifecycle", used_in_steps: [1, 17] },
        { name: "Confluence MCP", url: "https://confluence-mcp-six.vercel.app", howto: "https://confluence-mcp-six.vercel.app/api/howto", purpose: "Documentation, architecture diagrams, test reports", used_in_steps: [17] },
        { name: "Enhanced Context MCP", url: "https://enhanced-context-mcp.vercel.app", howto: "https://enhanced-context-mcp.vercel.app/api/howto", purpose: "Context loading, agent discovery, SDLC guidance, contextual agent selection", used_in_steps: "All steps" },
        { name: "Story Crafter MCP", url: "https://storycrafter-mcp.vercel.app", howto: "https://storycrafter-mcp.vercel.app/api/howto", purpose: "Backlog generation from VISHKAR consensus", used_in_steps: [1] }
      ],
      docker_local: [
        { name: "PR-Agent MCP", url: "http://localhost:8188", port: 8188, purpose: "AI-powered PR review, code analysis, security scanning", used_in_steps: [13], note: "Code review MCP runs on local Docker for security - keeps code analysis local" }
      ]
    },

    agent_mapping: {
      pm_agent: { wama_agents: ["a-project-manager"], owned_steps: [1, 17], responsibilities: ["Story selection", "Story completion", "Sprint management"] },
      dev_agent: { wama_agents: ["a-backend-engineer", "a-frontend-developer", "a-fullstack-developer"], owned_steps: [2, 7, 8, 12, 14], responsibilities: ["Implementation", "Feedback fixes", "Manual verification", "PR creation", "PR feedback implementation"] },
      review_agent_architecture: { wama_agents: ["a-architect-review"], owned_steps: [3], responsibilities: ["System design review", "Component boundaries", "Scalability assessment"] },
      review_agent_security: { wama_agents: ["a-security-auditor"], owned_steps: [4], responsibilities: ["Security vulnerability detection", "OWASP compliance", "Auth review"] },
      review_agent_quality: { wama_agents: ["a-code-reviewer"], owned_steps: [5], responsibilities: ["Code quality assessment", "SOLID principles", "Clean code"] },
      review_agent_techstack: { wama_agents: ["contextual"], owned_steps: [6], responsibilities: ["Framework-specific review", "Performance patterns", "Best practices"], agent_selection: "Use get_contextual_agent based on file patterns" },
      qa_agent: { wama_agents: ["a-test-automator", "a-qa-engineer"], owned_steps: [9, 10, 11], responsibilities: ["Test case creation", "Test implementation", "Test execution"] },
      pr_review_agent: { wama_agents: ["a-pr-orchestrator"], owned_steps: [13], responsibilities: ["Formal PR review orchestration", "Cross-agent coordination"] },
      coordinator: { wama_agents: ["a-architect-review"], owned_steps: "All (monitoring)", responsibilities: ["Cross-step monitoring", "Escalation handling", "Quality oversight"] }
    },

    phases: [
      { name: "Task Selection", steps: [1], description: "Select and prepare task from backlog" },
      { name: "Implementation", steps: [2], description: "Develop the feature/fix" },
      { name: "4-Angle Internal Review", steps: [3, 4, 5, 6], description: "Architecture, Security, Quality, Tech-Stack reviews" },
      { name: "Feedback", steps: [7], description: "Address review findings" },
      { name: "Testing", steps: [8, 9, 10, 11], description: "Manual verification and automated testing" },
      { name: "PR & Review", steps: [12, 13, 14], description: "Create PR and formal review" },
      { name: "Merge & Deploy", steps: [15, 16, 17], description: "CI/CD, approval, and closure" }
    ],

    steps: [
      { step: 1, name: "Task Selection", phase: "Task Selection", owner: "PM Agent", automated: true, gate: null, description: "Select task from JIRA backlog and move to In Progress", jira_transition: "To Do -> In Progress" },
      { step: 2, name: "Implementation", phase: "Implementation", owner: "Dev Agent", automated: true, gate: null, description: "Implement the task following coding standards, load lessons learned", context_loading: ".reviews/lessons_learned.json" },
      { step: 3, name: "Architecture Review", phase: "4-Angle Internal Review", owner: "Review Agent (Architecture)", automated: true, gate: { type: "Quality Gate", threshold: "0 Critical, 0 High issues" }, description: "Review system design and architectural implications", focus: ["System design patterns", "Component boundaries", "Scalability", "Technical debt"], blocking_on: ["critical", "high"] },
      { step: 4, name: "Security Review", phase: "4-Angle Internal Review", owner: "Review Agent (Security)", automated: true, gate: { type: "Quality Gate", threshold: "0 Critical, 0 High issues" }, description: "Review for security vulnerabilities and compliance", focus: ["OWASP Top 10", "Auth/AuthZ", "Input validation", "Secrets management"], blocking_on: ["critical", "high"] },
      { step: 5, name: "Code Quality Review", phase: "4-Angle Internal Review", owner: "Review Agent (Quality)", automated: true, gate: { type: "Quality Gate", threshold: "0 Critical, 0 High issues" }, description: "Review for code quality and maintainability", focus: ["SOLID principles", "Clean code", "DRY", "Error handling"], blocking_on: ["critical", "high"] },
      { step: 6, name: "Tech-Stack Review", phase: "4-Angle Internal Review", owner: "Review Agent (Tech-Stack)", automated: true, gate: { type: "Quality Gate", threshold: "0 Critical, 0 High issues" }, description: "Review for technology-specific best practices", focus: ["Framework patterns", "Performance", "Async patterns", "Caching"], agent_selection: "contextual - use get_contextual_agent", blocking_on: ["critical", "high"] },
      { step: 7, name: "Feedback Implementation & Storage", phase: "Feedback", owner: "Dev Agent", automated: true, gate: { type: "Quality Gate", threshold: "0 Critical, 0 High remaining" }, description: "Address findings from 4-angle review and store for LLM learning", storage: { findings: ".reviews/findings/{task_id}_findings.json", lessons: ".reviews/lessons_learned.json" } },
      { step: 8, name: "Manual Verification", phase: "Testing", owner: "Dev Agent", automated: true, gate: "Optional", description: "Developer verifies implementation works locally" },
      { step: 9, name: "Create Test Cases", phase: "Testing", owner: "QA Agent", automated: true, gate: null, description: "Define test scenarios in TCM-compatible JSON format", storage: "tests/cases/{task_id}.json" },
      { step: 10, name: "Implement Tests", phase: "Testing", owner: "QA Agent", automated: true, gate: null, description: "Write automated tests based on test cases", coverage_threshold: 80 },
      { step: 11, name: "Execute Tests", phase: "Testing", owner: "QA Agent", automated: true, gate: { type: "Quality Gate", threshold: ">=90% pass rate, >=80% coverage" }, description: "Run full test suite and verify quality threshold" },
      { step: 12, name: "PR Creation", phase: "PR & Review", owner: "Dev Agent", automated: true, gate: null, description: "Create pull request with review checklist", commit_format: "{PROJECT}-{number}: {summary}" },
      { step: 13, name: "PR Review (Formal)", phase: "PR & Review", owner: "PR Review Agent", automated: true, gate: null, description: "Formal PR review using PR-Agent (Docker)", review_phases: ["pr_describe", "pr_review", "pr_improve"], note: "PR-Agent runs on LOCAL DOCKER (port 8188)" },
      { step: 14, name: "PR Feedback Implementation", phase: "PR & Review", owner: "Dev Agent", automated: true, gate: null, description: "Address PR review comments" },
      { step: 15, name: "CI/CD Pipeline", phase: "Merge & Deploy", owner: "CI/CD (Automated)", automated: "Semi", gate: { type: "Quality Gate", threshold: "All checks green" }, description: "Execute automated CI/CD pipeline" },
      { step: 16, name: "Human Merge Approval", phase: "Merge & Deploy", owner: "Human", automated: false, gate: { type: "Human Gate", description: "ONLY mandatory human intervention point" }, description: "Final human sign-off before merge" },
      { step: 17, name: "Story Closure", phase: "Merge & Deploy", owner: "PM Agent", automated: true, gate: null, description: "Close task and update documentation", jira_transition: "In Progress -> Done" }
    ],

    storage_schemas: {
      findings_per_task: { location: ".reviews/findings/{task_id}_findings.json", purpose: "Store review findings for each task" },
      lessons_learned: { location: ".reviews/lessons_learned.json", purpose: "LLM learning context - load at start of each implementation" },
      test_cases: { location: "tests/cases/{task_id}.json", format: "TCM-compatible JSON" }
    },

    handoff_format: {
      schema: { from: "Agent role", to: "Target agent", messageType: "handoff", timestamp: "ISO 8601", step: "number", payload: {} },
      example: { from: "Dev Agent", to: "Review Agent (Architecture)", messageType: "handoff", timestamp: "2024-01-15T10:30:00Z", step: 2, payload: { taskKey: "PROJ-123", changedFiles: ["src/api/auth.py"], qualityScore: 8.2 } }
    },

    escalation: {
      triggers: ["Quality < 7/10 after 3 attempts", "Test pass rate < 90% after 3 retries", "CI fails 3 times", "Critical/High issues remain after 3 fix attempts", "Security vulnerability (auto-escalate)"],
      escalation_to: "Human + Coordinator Agent (a-architect-review)",
      required_info: ["Failed step", "Retry count", "Failure reason", "Suggested remediation"]
    },

    tools_by_step: {
      1: { mcp: "JIRA MCP", tools: ["search_issues", "transition_issue", "add_comment"] },
      2: { mcp: "Enhanced Context MCP", tools: ["load_enhanced_context"] },
      3: { mcp: "Enhanced Context MCP", tools: ["load_vishkar_agent"], agent: "a-architect-review" },
      4: { mcp: "Enhanced Context MCP", tools: ["load_vishkar_agent"], agent: "a-security-auditor" },
      5: { mcp: "Enhanced Context MCP", tools: ["load_vishkar_agent"], agent: "a-code-reviewer" },
      6: { mcp: "Enhanced Context MCP", tools: ["get_contextual_agent", "load_vishkar_agent"], agent: "contextual" },
      7: { mcp: "Enhanced Context MCP + JIRA", tools: ["load_enhanced_context", "add_comment"] },
      8: { mcp: "JIRA MCP", tools: ["add_comment"] },
      9: { mcp: "JIRA MCP + Enhanced Context", tools: ["get_issue_details", "load_enhanced_context"] },
      10: { mcp: "Enhanced Context MCP", tools: ["load_enhanced_context"] },
      11: { mcp: "JIRA MCP", tools: ["add_comment"] },
      12: { mcp: "JIRA MCP", tools: ["add_comment"] },
      13: { mcp: "PR-Agent MCP (Docker localhost:8188)", tools: ["pr_describe", "pr_review", "pr_improve"] },
      14: { mcp: "JIRA MCP", tools: ["add_comment"] },
      15: { mcp: "External CI/CD", tools: [] },
      16: { mcp: "Human", tools: [] },
      17: { mcp: "JIRA MCP + Confluence MCP", tools: ["transition_issue", "add_comment", "add_worklog", "update_page"] }
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
    if (!step) return { error: `Step ${step_number} not found. Valid steps: 1-17` };
    return {
      step,
      mcp_tools: SDLC.tools_by_step[step_number as keyof typeof SDLC.tools_by_step],
      quality_thresholds: SDLC.overview.quality_thresholds,
      severity_levels: SDLC.severity_levels
    };
  }

  switch (section) {
    case 'overview':
      return {
        name: SDLC.name,
        version: SDLC.version,
        description: SDLC.description,
        ...SDLC.overview,
        phases: SDLC.phases
      };

    case 'steps':
      const steps = agent_role ? filterStepsByAgent(SDLC.steps, agent_role) : SDLC.steps;
      return {
        total: steps.length,
        steps,
        steps_summary: steps.map(s => ({ step: s.step, name: s.name, phase: s.phase, owner: s.owner, automated: s.automated }))
      };

    case 'agents':
      return {
        agent_mapping: SDLC.agent_mapping,
        usage: "Use agent_role parameter to filter steps by agent",
        note: "review_agent_techstack uses contextual agent selection - call get_contextual_agent with file paths"
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

    case 'severity_levels':
      return {
        description: "Issue severity levels and their blocking behavior",
        severity_levels: SDLC.severity_levels,
        blocking_rules: {
          critical: "MUST fix before proceeding - blocks all progress",
          high: "MUST fix before proceeding - blocks all progress",
          medium: "SHOULD fix, recommended but not blocking",
          low: "MAY fix or log for future - not blocking"
        }
      };

    case 'storage_schemas':
      return {
        description: "Storage schemas for review findings, lessons learned, and test cases",
        schemas: SDLC.storage_schemas,
        purpose: "Enable LLM learning from previous reviews to prevent repeated mistakes"
      };

    case 'contextual_selection':
      return {
        section_description: "Contextual agent selection for Step 6 (Tech-Stack Review)",
        ...SDLC.contextual_agent_selection,
        how_to_use: "Call get_contextual_agent with file_paths to get the right specialist agent(s)",
        example: {
          tool: "get_contextual_agent",
          arguments: { file_paths: ["backend/src/main.py", "frontend/components/Button.tsx"] },
          response: "Returns a-fastapi-pro, a-backend-engineer, a-frontend-developer, a-typescript-pro"
        }
      };

    case 'full':
    default:
      return {
        ...SDLC,
        summary: {
          name: SDLC.name,
          version: SDLC.version,
          total_steps: 17,
          human_gates: 1,
          automated_steps: 16,
          key_feature: "4-Angle Internal Review (Steps 3-6)",
          phases: SDLC.phases.map(p => p.name),
          vercel_mcps: SDLC.mcp_servers.vercel_hosted.map(m => m.name),
          docker_mcps: SDLC.mcp_servers.docker_local.map(m => `${m.name} (port ${m.port})`),
          agent_roles: Object.keys(SDLC.agent_mapping),
          new_in_v2: ["4-Angle Internal Review", "Severity Levels", "Contextual Agent Selection", "Findings Storage", "Lessons Learned"]
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

// Handler for Contextual Agent Selection - "Give me the right architect"
async function handleContextualAgent(args: { file_paths?: string[]; file_path?: string; include_agent_details?: boolean }) {
  const { file_paths, file_path, include_agent_details = false } = args;

  // Combine file_paths array and single file_path into one list
  const filesToMatch: string[] = [];
  if (file_paths && Array.isArray(file_paths)) {
    filesToMatch.push(...file_paths);
  }
  if (file_path) {
    filesToMatch.push(file_path);
  }

  if (filesToMatch.length === 0) {
    return {
      error: "No file paths provided. Provide either file_paths (array) or file_path (string)",
      usage: {
        file_paths: ["backend/src/main.py", "frontend/components/Button.tsx"],
        file_path: "backend/src/main.py"
      }
    };
  }

  // Contextual agent selection rules from SDLC v2.0.0
  const CONTEXTUAL_RULES = [
    { pattern: "backend/**/*.py", agents: ["a-fastapi-pro", "a-backend-engineer"], description: "Python backend files" },
    { pattern: "frontend/**/*.tsx", agents: ["a-frontend-developer", "a-typescript-pro"], description: "React TypeScript components" },
    { pattern: "frontend/**/*.ts", agents: ["a-typescript-pro"], description: "TypeScript files" },
    { pattern: "frontend/**/*.js", agents: ["a-javascript-pro"], description: "JavaScript files" },
    { pattern: "**/*.jsx", agents: ["a-frontend-developer", "a-javascript-pro"], description: "React JSX components" },
    { pattern: "docker/**/*", agents: ["a-deployment-engineer"], description: "Docker configuration" },
    { pattern: "**/Dockerfile*", agents: ["a-deployment-engineer"], description: "Dockerfile" },
    { pattern: "**/*.yml", agents: ["a-deployment-engineer"], description: "YAML configuration files" },
    { pattern: "**/*.yaml", agents: ["a-deployment-engineer"], description: "YAML configuration files" },
    { pattern: "terraform/**/*", agents: ["a-terraform-specialist"], description: "Terraform IaC files" },
    { pattern: "**/*.tf", agents: ["a-terraform-specialist"], description: "Terraform files" },
    { pattern: "tests/**/*", agents: ["a-test-automator"], description: "Test files" },
    { pattern: "**/*test*.py", agents: ["a-test-automator"], description: "Python test files" },
    { pattern: "**/*spec*.ts", agents: ["a-test-automator"], description: "TypeScript spec files" },
    { pattern: "**/*test*.ts", agents: ["a-test-automator"], description: "TypeScript test files" },
    { pattern: "**/*test*.tsx", agents: ["a-test-automator"], description: "React test files" },
    { pattern: "**/api/**/*", agents: ["a-backend-architect", "a-backend-engineer"], description: "API endpoints" },
    { pattern: "**/components/**/*", agents: ["a-frontend-developer"], description: "UI components" },
    { pattern: "**/hooks/**/*", agents: ["a-frontend-developer"], description: "React hooks" },
    { pattern: "**/*.sql", agents: ["a-backend-engineer"], description: "SQL files" },
    { pattern: "**/migrations/**/*", agents: ["a-backend-engineer"], description: "Database migrations" },
    { pattern: "**/*.prisma", agents: ["a-backend-engineer"], description: "Prisma schema" },
    { pattern: "**/*.go", agents: ["a-backend-engineer"], description: "Go files" },
    { pattern: "**/*.rs", agents: ["a-backend-engineer"], description: "Rust files" },
    { pattern: "**/*.java", agents: ["a-backend-engineer"], description: "Java files" },
    { pattern: "**/security/**/*", agents: ["a-security-auditor"], description: "Security-related files" },
    { pattern: "**/auth/**/*", agents: ["a-security-auditor", "a-backend-engineer"], description: "Authentication files" },
    { pattern: "**/*.md", agents: ["a-code-reviewer"], description: "Markdown documentation" },
    { pattern: "**/infra/**/*", agents: ["a-cloud-architect", "a-terraform-specialist"], description: "Infrastructure files" },
    { pattern: "**/k8s/**/*", agents: ["a-deployment-engineer"], description: "Kubernetes configurations" },
    { pattern: "**/*.css", agents: ["a-frontend-developer"], description: "CSS stylesheets" },
    { pattern: "**/*.scss", agents: ["a-frontend-developer"], description: "SCSS stylesheets" }
  ];

  const DEFAULT_AGENT = "a-backend-engineer";

  // Simple glob pattern matching function
  function matchPattern(filePath: string, pattern: string): boolean {
    // Convert glob pattern to regex
    // IMPORTANT: Escape dots FIRST before converting glob patterns
    const regexPattern = pattern
      .replace(/\./g, '\\.')              // Escape dots first (before glob conversion)
      .replace(/\*\*/g, '{{GLOBSTAR}}')   // Preserve ** for later
      .replace(/\*/g, '[^/]*')            // * matches anything except /
      .replace(/{{GLOBSTAR}}/g, '.*')     // ** matches anything including /
      .replace(/\?/g, '.');               // ? matches single char

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
  }

  // Match each file to its rules
  const matches: { file: string; matchedRules: { pattern: string; agents: string[]; description: string }[] }[] = [];
  const allMatchedAgents = new Set<string>();

  for (const file of filesToMatch) {
    const fileMatches: { pattern: string; agents: string[]; description: string }[] = [];

    for (const rule of CONTEXTUAL_RULES) {
      if (matchPattern(file, rule.pattern)) {
        fileMatches.push({
          pattern: rule.pattern,
          agents: rule.agents,
          description: rule.description
        });
        rule.agents.forEach(agent => allMatchedAgents.add(agent));
      }
    }

    matches.push({
      file,
      matchedRules: fileMatches.length > 0 ? fileMatches : [{
        pattern: "default",
        agents: [DEFAULT_AGENT],
        description: "Default agent - no specific pattern matched"
      }]
    });

    // Add default agent if no matches
    if (fileMatches.length === 0) {
      allMatchedAgents.add(DEFAULT_AGENT);
    }
  }

  // Get unique agents sorted by frequency of match
  const agentFrequency: Record<string, number> = {};
  for (const match of matches) {
    for (const rule of match.matchedRules) {
      for (const agent of rule.agents) {
        agentFrequency[agent] = (agentFrequency[agent] || 0) + 1;
      }
    }
  }

  const recommendedAgents = Object.entries(agentFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([agent, count]) => ({ agent, matchCount: count }));

  // Build response
  const response: any = {
    summary: {
      total_files: filesToMatch.length,
      unique_agents_matched: allMatchedAgents.size,
      primary_agent: recommendedAgents[0]?.agent || DEFAULT_AGENT
    },
    recommended_agents: recommendedAgents,
    file_matches: matches,
    usage_context: {
      step: 6,
      step_name: "Tech-Stack Review",
      description: "Use these agents for technology-specific code review",
      sdlc_phase: "4-Angle Internal Review"
    }
  };

  // Optionally include agent details
  if (include_agent_details) {
    const agentService = ServiceFactory.createAgentService();
    const agentDetails: Record<string, any> = {};

    for (const agent of Array.from(allMatchedAgents)) {
      try {
        const profile = await agentService.loadVishkarAgent(agent);
        if (profile) {
          agentDetails[agent] = {
            name: profile.name || agent,
            specializations: profile.specializations || [],
            description: profile.description || "Specialized review agent",
            type: profile.type
          };
        } else {
          agentDetails[agent] = {
            name: agent,
            description: "Agent profile not found - use load_vishkar_agent to get details"
          };
        }
      } catch {
        agentDetails[agent] = {
          name: agent,
          description: "Agent profile not found - use load_vishkar_agent to get details"
        };
      }
    }
    response.agent_details = agentDetails;
  }

  return response;
}

// MCP Server Info
const SERVER_INFO = {
  name: 'enhanced-context-mcp',
  version: '2.0.0'
};

// MCP Protocol Version
const PROTOCOL_VERSION = '2024-11-05';

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

// Execute tool and return result
async function executeTool(toolName: string, args: any): Promise<{ success: boolean; result?: any; error?: string }> {
  const enhancedContextService = ServiceFactory.createEnhancedContextService();
  const agentService = ServiceFactory.createAgentService();

  try {
    let result;

    switch (toolName) {
      case 'get_started':
        result = handleGetStarted(args || {});
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
          return { success: false, error: 'agent_id is required' };
        }
        result = await agentService.loadVishkarAgent(args.agent_id);
        break;

      case 'validate_vishkar_agent_profile':
        if (!args?.agent_id) {
          return { success: false, error: 'agent_id is required' };
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

      case 'get_contextual_agent':
        result = await handleContextualAgent(args || {});
        break;

      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }

    return { success: true, result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ============================================================
    // MCP PROTOCOL HANDLERS (Streamable HTTP Transport)
    // ============================================================

    // 1. INITIALIZE - MCP handshake (no auth required for handshake)
    if (body.method === 'initialize') {
      console.log('MCP: Initialize request received');
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            tools: {}
          },
          serverInfo: SERVER_INFO
        }
      });
    }

    // 2. INITIALIZED - Client acknowledgment
    if (body.method === 'notifications/initialized') {
      console.log('MCP: Client initialized');
      return new NextResponse(null, { status: 204 });
    }

    // 3. TOOLS/LIST - Return available tools (no auth for discovery)
    if (body.method === 'tools/list') {
      console.log('MCP: Tools list request');
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: { tools: TOOLS }
      });
    }

    // 4. PING - Health check (no auth required)
    if (body.method === 'ping') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {}
      });
    }

    // ============================================================
    // AUTHENTICATED ENDPOINTS (tools/call and legacy format)
    // ============================================================

    // Check authentication for tool execution
    if (!isAuthenticated(request)) {
      // Return MCP-format error if using MCP protocol
      if (body.method === 'tools/call') {
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          error: {
            code: -32001,
            message: 'Authentication required. Provide X-API-Key header.'
          }
        }, { status: 401 });
      }
      return NextResponse.json(
        { success: false, error: 'Authentication required. Provide X-API-Key header.' },
        { status: 401 }
      );
    }

    // 5. TOOLS/CALL - Execute a tool (MCP protocol format)
    if (body.method === 'tools/call') {
      const toolName = body.params?.name;
      const toolArgs = body.params?.arguments || {};

      console.log(`MCP: Tool call - ${toolName}`);

      if (!toolName) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          error: {
            code: -32602,
            message: 'Invalid params: missing tool name'
          }
        });
      }

      const { success, result, error } = await executeTool(toolName, toolArgs);

      if (!success) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          error: {
            code: -32601,
            message: error || `Failed to execute tool: ${toolName}`,
            data: { available_tools: TOOLS.map(t => t.name) }
          }
        });
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      });
    }

    // ============================================================
    // BACKWARD COMPATIBLE HANDLER (existing HTTP API format)
    // ============================================================

    // Support old format: { tool: "...", arguments: {} }
    const tool = body.tool;
    const args = body.arguments || {};

    if (tool) {
      console.log(`HTTP API: Tool call - ${tool}`);

      const { success, result, error } = await executeTool(tool, args);

      if (!success) {
        return NextResponse.json(
          { success: false, error: error || `Unknown tool: ${tool}` },
          { status: 400 }
        );
      }

      // Return in JSON-RPC format if client sent jsonrpc field
      if (body.jsonrpc) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
        });
      }

      return NextResponse.json({ success: true, tool, result });
    }

    // No recognized format
    return NextResponse.json({
      error: 'Invalid request format',
      hint: 'Use MCP protocol { method: "tools/call", params: { name: "...", arguments: {...} } } or HTTP API { tool: "...", arguments: {...} }',
      available_tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
      mcp_methods: ['initialize', 'tools/list', 'tools/call', 'ping']
    }, { status: 400 });

  } catch (error) {
    const err = error as Error;
    console.error('MCP endpoint error:', err);
    return NextResponse.json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: 'Internal server error',
        data: { details: err.message }
      }
    }, { status: 500 });
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
