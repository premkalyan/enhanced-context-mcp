/**
 * Main MCP Endpoint
 * Handles all MCP tool calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '../../../lib/services/ServiceFactory';
import ConfigLoader from '../../../lib/config/configLoader';
import {
  loadStandardFromFile,
  loadAllStandards,
  loadHelperScripts,
  getStandardsInfo,
  AVAILABLE_SECTIONS
} from '../../../lib/services/StandardsService';

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
          enum: ['overview', 'steps', 'step', 'agents', 'mcp_servers', 'handoff', 'escalation', 'pr_agent_feedback_loop', 'tools_by_step', 'severity_levels', 'storage_schemas', 'contextual_selection', 'review_templates', 'full'],
          description: 'Which section: overview (summary + thresholds), steps (all 17 steps), step (specific step - requires step_number), agents (agent mapping), mcp_servers (Vercel + Docker MCPs), handoff (inter-agent protocol), escalation (failure handling), pr_agent_feedback_loop (MANDATORY PR-Agent suggestion triage/implementation for Step 14), tools_by_step (MCP tools per step), severity_levels (issue severity definitions), storage_schemas (findings/lessons storage), contextual_selection (file pattern rules), review_templates (4-Angle Review checklists for Steps 3-6), full (everything)'
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
  },
  {
    name: 'get_engineering_standards',
    description: 'Retrieve engineering standards and best practices templates for Python, FastAPI, Database, Testing, Frontend, Security, and Code Quality. Use this to initialize project standards or reference during development. LLMs should read these before implementation to follow established patterns.',
    inputSchema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          enum: ['overview', 'python', 'fastapi', 'database', 'testing', 'frontend', 'security', 'code_quality', 'all'],
          description: 'Specific section to retrieve: overview (principles), python (backend conventions), fastapi (API patterns), database (SQLAlchemy/Alembic), testing (pytest patterns), frontend (Next.js/React), security (OWASP), code_quality (SOLID/DRY), all (everything)'
        },
        format: {
          type: 'string',
          enum: ['markdown', 'files', 'json', 'confluence', 'distribution'],
          description: 'Output format: markdown (readable), files (for .standards/), json (structured), confluence (XHTML for Confluence pages), distribution (complete package with repo files + Confluence content + page hierarchy)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_helper_scripts',
    description: 'Get information about VISHKAR helper scripts for MCP operations, database queries, and project setup. These scripts are available in the enhanced-context-mcp repository and can be cloned locally for easy MCP interactions.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['mcp', 'db', 'setup', 'all'],
          description: 'Category of scripts to retrieve: mcp (MCP interaction scripts), db (database query scripts), setup (project setup scripts), all (everything)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_tool_configuration',
    description: 'Get configuration/instructions for AI coding tools to enforce engineering standards. Returns tool-specific config files (CLAUDE.md for Claude Code, .cursorrules for Cursor, .aider.conf.yml for Aider, etc.) that instruct LLMs to read .standards/ before implementing code.',
    inputSchema: {
      type: 'object',
      properties: {
        tool: {
          type: 'string',
          enum: ['claude', 'cursor', 'aider', 'goose', 'copilot', 'all'],
          description: 'The AI coding tool to get configuration for'
        },
        project_type: {
          type: 'string',
          enum: ['python_backend', 'fastapi', 'nextjs', 'fullstack', 'generic'],
          description: 'Type of project for context-specific instructions'
        },
        include_standards: {
          type: 'boolean',
          description: 'Include full engineering standards reference in the config (default: true)'
        }
      },
      required: ['tool']
    }
  },
  {
    name: 'validate_sdlc_preconditions',
    description: 'Validates SDLC prerequisites before implementation. Call this BEFORE writing any code. Returns blockers if prerequisites are not met, preventing agents from proceeding until resolved.',
    inputSchema: {
      type: 'object',
      properties: {
        task_type: {
          type: 'string',
          enum: ['implementation', 'bugfix', 'refactor', 'test', 'documentation'],
          description: 'Type of task being performed'
        },
        files_to_change: {
          type: 'array',
          items: { type: 'string' },
          description: 'Files that will be modified (for tech-stack detection and review requirements)'
        },
        jira_ticket: {
          type: 'string',
          description: 'JIRA ticket key (e.g., PROJ-123) - optional but recommended for full validation'
        }
      },
      required: ['task_type']
    }
  },
  {
    name: 'get_review_template',
    description: 'Get structured review checklist for 4-Angle Internal Review. Returns specific checks based on review type and file patterns being changed.',
    inputSchema: {
      type: 'object',
      properties: {
        review_type: {
          type: 'string',
          enum: ['architecture', 'security', 'code_quality', 'tech_stack', 'all'],
          description: 'Type of review: architecture (design patterns), security (OWASP), code_quality (SOLID/DRY), tech_stack (framework-specific), all (complete 4-angle)'
        },
        file_patterns: {
          type: 'array',
          items: { type: 'string' },
          description: 'File patterns being reviewed (e.g., ["backend/**/*.py", "api/routes/*.py"])'
        },
        include_standards_reference: {
          type: 'boolean',
          description: 'Include relevant .standards/ file references (default: true)'
        }
      },
      required: ['review_type']
    }
  },
  {
    name: 'get_completion_checklist',
    description: 'Returns mandatory steps before marking a task complete (Step 17 Story Closure). Includes worklog requirement, cross-linking checks (JIRA-PR-Confluence), and review status. MANDATORY: worklog must be logged before marking Done.',
    inputSchema: {
      type: 'object',
      properties: {
        task_type: {
          type: 'string',
          enum: ['implementation', 'bugfix', 'refactor', 'test', 'documentation'],
          description: 'Type of task being completed'
        },
        files_changed: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of file paths that were modified'
        },
        jira_ticket: {
          type: 'string',
          description: 'JIRA ticket key (e.g., PROJ-123)'
        },
        reviews_completed: {
          type: 'array',
          items: { type: 'string' },
          description: 'Reviews already completed (e.g., ["architecture", "security", "code_quality", "tech_stack"])'
        },
        // Step 17 Closure Parameters
        worklog_logged: {
          type: 'boolean',
          description: 'Has time been logged via add_worklog? (MANDATORY before marking Done)'
        },
        time_spent: {
          type: 'string',
          description: 'Time spent on task in JIRA format (e.g., "1h 30m", "2d", "45m")'
        },
        pr_url: {
          type: 'string',
          description: 'GitHub/GitLab PR URL (e.g., https://github.com/owner/repo/pull/123)'
        },
        confluence_url: {
          type: 'string',
          description: 'Confluence documentation page URL if applicable'
        },
        pr_linked_to_jira: {
          type: 'boolean',
          description: 'Has the PR URL been added to the JIRA ticket?'
        },
        confluence_linked_to_jira: {
          type: 'boolean',
          description: 'Has the Confluence URL been added to the JIRA ticket?'
        },
        pr_linked_in_confluence: {
          type: 'boolean',
          description: 'Has the PR URL been added to the Confluence documentation page?'
        }
      },
      required: ['task_type', 'files_changed']
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
        sections: ["overview", "steps", "step", "agents", "mcp_servers", "handoff", "escalation", "tools_by_step", "severity_levels", "storage_schemas", "contextual_selection", "review_templates", "full"]
      },
      contextual_agent: {
        tool: "get_contextual_agent",
        description: "Get the right specialist agent(s) for reviewing specific files - 'Give me the right architect'",
        parameters: ["file_paths", "file_path", "include_agent_details"],
        usage: "Pass file paths to get matched agents for Step 6 (Tech-Stack Review)"
      },
      engineering_standards: {
        tool: "get_engineering_standards",
        description: "Comprehensive coding standards for Python, FastAPI, Database, Testing, Frontend, Security, Code Quality",
        sections: ["overview", "python", "fastapi", "database", "testing", "frontend", "security", "code_quality", "all"],
        formats: ["markdown", "files", "json", "confluence", "distribution"],
        usage: "Use format='distribution' for complete package (repo files + Confluence content + workflow)",
        distribution_workflow: [
          "1. get_engineering_standards({ format: 'distribution' })",
          "2. Save repo_files to .standards/",
          "3. Create Confluence pages using confluence_pages data",
          "4. Team reviews in Confluence, customizes .standards/",
          "5. LLMs read .standards/ before implementation"
        ]
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
      },
      helper_scripts: {
        tool: "get_helper_scripts",
        description: "Shell scripts for calling VISHKAR MCPs, database queries, and project setup",
        categories: ["mcp", "db", "setup", "all"],
        usage: "Clone repo and use scripts for easy MCP interactions from terminal"
      },
      tool_configuration: {
        tool: "get_tool_configuration",
        description: "Configuration files for AI coding tools to enforce engineering standards",
        supported_tools: ["claude", "cursor", "aider", "goose", "copilot", "all"],
        files_generated: {
          claude: "CLAUDE.md",
          cursor: ".cursorrules",
          aider: ".aider.conf.yml",
          goose: ".goose/config.yaml",
          copilot: ".github/copilot-instructions.md"
        },
        usage: "Get config for your AI tool, save to project, tool reads .standards/ automatically"
      },
      // SDLC Enforcement Tools
      sdlc_preconditions: {
        tool: "validate_sdlc_preconditions",
        description: "Gate check BEFORE implementation - validates standards exist, reviews planned, tests designed",
        parameters: ["task_type", "files_to_change", "jira_ticket"],
        when_to_use: "ALWAYS call before writing any code",
        returns: "Blockers, applicable standards, required reviews, pre-implementation checklist"
      },
      review_templates: {
        tool: "get_review_template",
        description: "Structured checklists for 4-Angle Internal Review (Steps 3-6)",
        review_types: ["architecture", "security", "code_quality", "tech_stack", "all"],
        features: ["Checklist IDs (SEC-001, ARCH-001)", "Severity levels", "Standards references"],
        when_to_use: "During Steps 3-6 of SDLC for structured reviews"
      },
      completion_checklist: {
        tool: "get_completion_checklist",
        description: "Mandatory steps before marking task complete - prevents premature closure",
        parameters: ["task_type", "files_changed", "jira_ticket", "reviews_completed"],
        checks: ["Required reviews passed", "Tests written/passing", "Documentation updated", "JIRA transitioned"],
        when_to_use: "Before marking any task as Done"
      }
    },

    utilities: {
      repository: "https://github.com/premkalyan/enhanced-context-mcp",
      description: "This repository contains helper scripts and standards files for VISHKAR development",
      contents: {
        standards: ".standards/*.md - Engineering standards markdown files (source of truth)",
        mcp_scripts: "scripts/mcp/*.sh - Shell scripts for calling VISHKAR MCPs",
        db_scripts: "scripts/db/*.sh - Database query utilities",
        setup_scripts: "scripts/setup/*.sh - Project setup scripts"
      },
      usage: {
        clone: "git clone -b utils-only https://github.com/premkalyan/enhanced-context-mcp.git .vishkar-utils",
        set_api_key: "export VISHKAR_API_KEY=pk_xxx",
        make_executable: "chmod +x .vishkar-utils/scripts/mcp/*.sh",
        example: "./.vishkar-utils/scripts/mcp/jira.sh '{\"tool\":\"search_issues\",\"arguments\":{\"jql\":\"project=PROJ\"}}'"
      },
      note: "Standards are also served via get_engineering_standards tool for programmatic access"
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
      enforcement_tools: {
        before_implementation: "validate_sdlc_preconditions - Gate check for prerequisites",
        during_review: "get_review_template - Structured checklists for Steps 3-6",
        before_completion: "get_completion_checklist - Mandatory steps before Done"
      },
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

  // VISHKAR 17-Step Enhanced SDLC v2.1.0 (inline for serverless)
  const SDLC = {
    name: "VISHKAR 17-Step Enhanced SDLC",
    version: "2.1.0",
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

    prerequisites: {
      description: "Setup steps before starting SDLC workflow",
      standards_distribution: {
        purpose: "Establish engineering standards for consistent code quality",
        when: "Before first sprint or when onboarding new project",
        workflow: [
          "1. Fetch standards: get_engineering_standards({ format: 'distribution' })",
          "2. Create .standards/ directory in repository",
          "3. Save repo_files to .standards/",
          "4. Create Engineering Standards page hierarchy in Confluence",
          "5. Team reviews standards in Confluence (add comments/feedback)",
          "6. Customize .standards/ based on team feedback",
          "7. Commit .standards/ to repository",
          "8. LLMs read .standards/ before each implementation task"
        ],
        tools: {
          fetch: "get_engineering_standards({ format: 'distribution' })",
          confluence_pages: "confluence_mcp.create_page",
          team_review: "Confluence comments and inline feedback"
        },
        result: "Consistent coding standards accessible to both humans (Confluence) and LLMs (.standards/)"
      },
      lessons_learned_setup: {
        purpose: "Enable continuous learning from past mistakes",
        files: [".reviews/lessons_learned.json", ".reviews/findings/"],
        workflow: "After each review cycle, add new lessons to lessons_learned.json"
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
      { step: 14, name: "PR Feedback Implementation", phase: "PR & Review", owner: "Dev Agent", automated: true, gate: { type: "Quality Gate", threshold: "All PR-Agent suggestions triaged" }, description: "MANDATORY: Triage, implement, and resolve all PR-Agent suggestions", important: "PR-Agent suggestions are ACTIONABLE items, not informational", pr_agent_feedback_loop: { mandatory: true, phases: ["1. Fetch suggestions via gh api", "2. Triage each (accept/reject with reason)", "3. Implement accepted changes", "4. Commit: fix: {desc} (PR-Agent suggestion)", "5. Resolve threads via GraphQL", "6. Verify all CI checks pass"] } },
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

    // PR-Agent Feedback Loop - MANDATORY for Step 14
    pr_agent_feedback_loop: {
      description: "After PR-Agent runs pr_review/pr_improve in Step 13, agents MUST complete this feedback loop in Step 14",
      principle: "PR-Agent suggestions are ACTIONABLE ITEMS that must be triaged, implemented, and resolved - NOT just informational",
      mandatory: true,
      phases: [
        {
          phase: 1,
          name: "Fetch Suggestions",
          description: "Retrieve all PR-Agent comments and suggestions from the PR",
          commands: [
            "gh api repos/{owner}/{repo}/pulls/{pr_number}/comments --jq '.[].body'",
            "gh pr view {pr_number} --comments"
          ]
        },
        {
          phase: 2,
          name: "Triage & Implement",
          description: "Review each suggestion and implement accepted ones",
          workflow: [
            "1. Read and understand each suggestion",
            "2. Decide: ACCEPT (will implement) or REJECT (with documented reason)",
            "3. For ACCEPT: Apply the code change",
            "4. Commit with message: 'fix: {description} (PR-Agent suggestion)'",
            "5. Push to branch"
          ],
          commit_format: "fix: {brief_description} (PR-Agent suggestion)"
        },
        {
          phase: 3,
          name: "Resolve Threads",
          description: "Mark each addressed review thread as resolved via GitHub GraphQL API",
          fetch_threads: "gh api graphql -f query='query { repository(owner: \"{owner}\", name: \"{repo}\") { pullRequest(number: {pr_number}) { reviewThreads(first: 50) { nodes { id isResolved comments(first: 1) { nodes { body } } } } } } }'",
          resolve_thread: "gh api graphql -f query='mutation { resolveReviewThread(input: {threadId: \"{thread_id}\"}) { thread { isResolved } } }'"
        },
        {
          phase: 4,
          name: "Verify Clean State",
          description: "Ensure PR is ready for merge",
          checks: [
            "All CI checks passing",
            "All review threads resolved",
            "No pending suggestions unaddressed",
            "PR ready for human review/merge"
          ],
          command: "gh pr checks {pr_number} && gh pr view {pr_number} --json reviewDecision,reviews"
        }
      ],
      exit_criteria: [
        "All PR-Agent suggestions evaluated (accept/reject with reason)",
        "All accepted suggestions implemented and committed",
        "All review threads resolved",
        "Tests re-run and passing",
        "CI checks green",
        "PR ready for human review/merge"
      ]
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
      14: { mcp: "JIRA MCP + GitHub CLI", tools: ["add_comment", "gh api", "gh pr view", "gh pr checks"], note: "PR-Agent Feedback Loop - MANDATORY triage and implementation" },
      15: { mcp: "External CI/CD", tools: [] },
      16: { mcp: "Human", tools: [] },
      17: { mcp: "JIRA MCP + Confluence MCP", tools: ["transition_issue", "add_comment", "add_worklog", "update_page"] }
    },

    // 4-Angle Review Templates (Steps 3-6) - Inline for quick reference
    review_templates: {
      description: "Structured review checklists for 4-Angle Internal Review",
      usage: "Use during Steps 3-6 for consistent, thorough reviews",
      tool_reference: "For detailed templates with severity levels, use: get_review_template({ review_type: 'all' })",
      quick_checklists: {
        architecture: {
          step: 3,
          agent: "a-architect-review",
          key_checks: [
            "ARCH-001: Component boundaries well-defined (HIGH)",
            "ARCH-002: No circular dependencies (CRITICAL)",
            "ARCH-003: Appropriate abstraction layers (MEDIUM)",
            "ARCH-004: Scalability addressed (HIGH)",
            "ARCH-005: Error handling consistent (MEDIUM)"
          ]
        },
        security: {
          step: 4,
          agent: "a-security-auditor",
          key_checks: [
            "SEC-001: User inputs validated with Pydantic (CRITICAL)",
            "SEC-002: No hardcoded secrets (CRITICAL)",
            "SEC-003: Parameterized queries only (CRITICAL)",
            "SEC-004: Auth on sensitive endpoints (CRITICAL)",
            "SEC-005: Authorization checks present (CRITICAL)"
          ]
        },
        code_quality: {
          step: 5,
          agent: "a-code-reviewer",
          key_checks: [
            "QUAL-001: Complete type hints (HIGH)",
            "QUAL-002: Functions single-purpose (MEDIUM)",
            "QUAL-003: No code duplication (MEDIUM)",
            "QUAL-005: Specific exceptions used (HIGH)",
            "QUAL-010: No blocking in async code (CRITICAL)"
          ]
        },
        tech_stack: {
          step: 6,
          agent: "contextual",
          key_checks: [
            "TECH-001: Framework best practices (HIGH)",
            "TECH-004: N+1 queries avoided (HIGH)",
            "TECH-005: Connection pooling used (HIGH)",
            "TECH-006: Async patterns correct (CRITICAL)",
            "TECH-007: Dependency injection used (MEDIUM)"
          ]
        }
      },
      blocking_rule: "0 Critical, 0 High issues must remain after review"
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

    case 'pr_agent_feedback_loop':
      return {
        ...SDLC.pr_agent_feedback_loop,
        when_to_use: "Step 14 - immediately after PR-Agent runs pr_review/pr_improve",
        summary: "MANDATORY: After PR-Agent review, fetch suggestions, triage each, implement accepted, resolve threads, verify CI green"
      };

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

    case 'review_templates':
      return {
        section_description: "4-Angle Review Templates for Steps 3-6",
        ...SDLC.review_templates,
        detailed_tool: {
          tool: "get_review_template",
          description: "For full checklists with all IDs, severities, and standards references",
          example: "get_review_template({ review_type: 'security' })"
        },
        enforcement_tools: {
          before_implementation: "validate_sdlc_preconditions - Gate check prerequisites",
          after_implementation: "get_completion_checklist - Verify all steps complete"
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

// Handler for Engineering Standards - Comprehensive coding standards and best practices
async function handleEngineeringStandards(args: { section?: string; format?: string }) {
  const { section = 'all', format = 'markdown' } = args;

  // For 'markdown' format, read directly from .standards/ files
  if (format === 'markdown') {
    try {
      if (section === 'all') {
        const allStandards = await loadAllStandards();
        return {
          format: 'markdown',
          section: 'all',
          source: 'file-based (.standards/)',
          standards_info: getStandardsInfo(),
          content: allStandards,
          usage: {
            specific_section: "get_engineering_standards({ section: 'python' }) for Python standards",
            files_format: "get_engineering_standards({ format: 'files' }) to get file paths",
            distribution: "get_engineering_standards({ format: 'distribution' }) for complete package",
            for_llm: "Read .standards/ directory before implementing features"
          }
        };
      } else {
        const content = await loadStandardFromFile(section);
        return {
          format: 'markdown',
          section,
          source: 'file-based (.standards/)',
          content,
          available_sections: AVAILABLE_SECTIONS
        };
      }
    } catch (error) {
      // Fall through to hardcoded content if file reading fails
      console.warn('File-based loading failed, using hardcoded content:', error);
    }
  }

  // For 'files' format, list available files
  if (format === 'files') {
    try {
      if (section !== 'all') {
        const content = await loadStandardFromFile(section);
        const fileName = section === 'overview' ? 'README.md' : `${section}.md`;
        return {
          format: 'files',
          section,
          source: 'file-based (.standards/)',
          file: {
            name: fileName,
            path: `.standards/${fileName}`,
            content
          }
        };
      }
      // For all sections, load all files
      const allStandards = await loadAllStandards();
      return {
        format: 'files',
        source: 'file-based (.standards/)',
        description: "Files from .standards/ directory",
        files: Object.entries(allStandards).map(([section, content]) => ({
          name: section === 'overview' ? 'README.md' : `${section}.md`,
          path: `.standards/${section === 'overview' ? 'README.md' : `${section}.md`}`,
          content
        })),
        standards_info: getStandardsInfo()
      };
    } catch (error) {
      console.warn('File-based loading failed, using hardcoded content:', error);
    }
  }

  // Hardcoded fallback (for JSON format and when files unavailable)

  // Engineering Standards v1.0.0 - Comprehensive standards based on spec
  const STANDARDS = {
    version: "1.0.0",
    last_updated: "2024-12-14",

    overview: {
      purpose: "Engineering standards ensure consistency, quality, and efficiency across all VISHKAR projects",
      principles: [
        { name: "Explicit over Implicit", description: "Be clear about intentions in code" },
        { name: "Simple over Complex", description: "Prefer straightforward solutions" },
        { name: "Consistent over Creative", description: "Follow established patterns" },
        { name: "Secure by Default", description: "Security is not optional" },
        { name: "Test Everything", description: "Untested code is broken code" }
      ],
      scope: {
        backend: "Python 3.12+, FastAPI 0.115+, SQLAlchemy 2.0+",
        frontend: "Next.js 14/15, React 18+, TypeScript 5+",
        database: "PostgreSQL 16+, pgvector, Alembic",
        testing: "pytest, pytest-asyncio, Jest, Playwright",
        infrastructure: "Docker, Redis, Kubernetes"
      },
      distribution_model: {
        description: "Fetch standards from Enhanced Context MCP → Store in .standards/ → Team customizes → LLM reads before implementation",
        fetch_command: "get_engineering_standards with format='files'",
        local_storage: ".standards/",
        llm_usage: "Read .standards/ at start of each implementation task"
      }
    },

    python: {
      title: "Python Backend Standards",
      version: "3.12+",
      sections: {
        environment: {
          minimum_version: "3.12",
          virtual_environment: "venv or poetry",
          package_manager: "pip or poetry"
        },
        import_ordering: {
          description: "Use isort with these groups",
          order: [
            "1. Standard library (import asyncio, from datetime import datetime)",
            "2. Third-party packages (from fastapi import FastAPI, from pydantic import BaseModel)",
            "3. Local application (from src.core.config import settings)"
          ]
        },
        type_hints: {
          rule: "Required everywhere - functions, methods, class attributes",
          examples: {
            good: "def calculate_total(items: list[Item], tax_rate: float) -> Decimal: ...",
            bad: "def calculate_total(items, tax_rate):  # No type hints"
          }
        },
        async_patterns: {
          critical_rule: "Never block the event loop in async functions",
          examples: {
            good: "async with httpx.AsyncClient() as client: response = await client.get(url)",
            bad: "response = requests.get(url)  # BLOCKS EVENT LOOP!",
            workaround: "Use loop.run_in_executor() for CPU-bound sync code"
          }
        },
        error_handling: {
          pattern: "Use specific exceptions, log server-side, return sanitized messages to clients",
          example: "raise HTTPException(status_code=404, detail='Customer not found')  # Generic to client"
        },
        naming: {
          modules: "snake_case (customer_service.py)",
          classes: "PascalCase (CustomerService)",
          functions: "snake_case (get_customer_by_id)",
          variables: "snake_case (customer_name)",
          constants: "UPPER_SNAKE (MAX_RETRY_COUNT)",
          private: "_prefix (_internal_method)"
        }
      }
    },

    fastapi: {
      title: "FastAPI Standards",
      sections: {
        router_organization: {
          pattern: "src/api/v1/routes/{resource}.py",
          example: {
            prefix: "/customers",
            tags: ["Customers"],
            decorators: "@router.get('/{customer_id}', response_model=CustomerResponse, summary='Get Customer')"
          }
        },
        dependency_injection: {
          database: "async def get_db() -> AsyncGenerator[AsyncSession, None]: yield session",
          service: "def get_customer_service(db: AsyncSession = Depends(get_db)) -> CustomerService",
          auth: "async def get_current_user(token: str = Depends(oauth2_scheme)) -> User"
        },
        response_models: {
          rule: "Always use response_model for type safety and documentation",
          pattern: {
            base: "class CustomerBase(BaseModel): name: str; email: str",
            create: "class CustomerCreate(CustomerBase): pass",
            response: "class CustomerResponse(CustomerBase): model_config = ConfigDict(from_attributes=True); id: UUID; created_at: datetime"
          }
        },
        error_handling: {
          validation: "Let Pydantic handle (422 automatic)",
          business_logic: "HTTPException(status_code=400, detail='Cannot delete customer with active orders')",
          not_found: "HTTPException(status_code=404, detail='Resource not found')",
          auth: "HTTPException(status_code=401, detail='Invalid credentials', headers={'WWW-Authenticate': 'Bearer'})"
        },
        cors: {
          critical: "NEVER use wildcards in production",
          config: {
            allow_origins: "settings.cors_origins_list (explicit list)",
            allow_credentials: true,
            allow_methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allow_headers: ["Accept", "Content-Type", "Authorization", "X-API-Key", "X-Request-ID"]
          }
        }
      }
    },

    database: {
      title: "Database Standards (SQLAlchemy/Alembic)",
      sections: {
        model_base: {
          critical: "Define naming convention for constraints - enables proper Alembic migrations",
          naming_convention: {
            ix: "ix_%(table_name)s_%(column_0_name)s",
            uq: "uq_%(table_name)s_%(column_0_name)s",
            ck: "ck_%(table_name)s_%(constraint_name)s",
            fk: "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
            pk: "pk_%(table_name)s"
          },
          mixins: ["TimestampMixin (created_at, updated_at)", "UUIDMixin (id as UUID primary key)"]
        },
        model_pattern: {
          tablename: "__tablename__ = 'customers'",
          required_fields: "name: Mapped[str] = mapped_column(String(255))",
          optional_fields: "api_key_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)",
          relationships: "templates: Mapped[list['Template']] = relationship(back_populates='customer', cascade='all, delete-orphan')"
        },
        alembic_migrations: {
          naming: "YYYYMMDD_HHMM_description.py (e.g., 20241214_1030_add_customer_api_key.py)",
          structure: "upgrade() and downgrade() functions",
          rule: "Always include downgrade for rollback capability"
        },
        connection_pooling: {
          critical: "Always use connection pooling in async applications",
          config: {
            poolclass: "AsyncAdaptedQueuePool",
            pool_size: 5,
            max_overflow: 10,
            pool_timeout: 30,
            pool_recycle: 1800,
            pool_pre_ping: true
          }
        },
        raw_sql: {
          rule: "ALWAYS use text() wrapper for raw SQL",
          good: "await conn.execute(text('SELECT 1'))",
          bad: "await conn.execute('SELECT 1')  # SQLAlchemy 2.0 will warn/error"
        }
      }
    },

    testing: {
      title: "Testing Standards",
      sections: {
        directory_structure: {
          root: "tests/",
          conftest: "tests/conftest.py (shared fixtures)",
          unit: "tests/unit/ (no external deps, mocked)",
          integration: "tests/integration/ (with DB/Redis)",
          e2e: "tests/e2e/ (full stack)"
        },
        categorization: {
          unit: { marker: "@pytest.mark.unit", dependencies: "None (mocked)", speed: "Fast" },
          integration: { marker: "@pytest.mark.integration", dependencies: "DB, Redis", speed: "Medium" },
          e2e: { marker: "@pytest.mark.e2e", dependencies: "Full stack", speed: "Slow" }
        },
        pytest_config: {
          asyncio_mode: "auto",
          asyncio_default_fixture_loop_scope: "function",
          addopts: "-v --tb=short --strict-markers"
        },
        naming_convention: {
          pattern: "test_<what>_<condition>_<expected_result>",
          examples: [
            "test_get_customer_with_valid_id_returns_customer",
            "test_get_customer_with_invalid_id_returns_none",
            "test_create_customer_with_duplicate_email_raises_error"
          ]
        },
        mocking: {
          async_mock: "session = AsyncMock(); session.execute = AsyncMock(return_value=MagicMock())",
          patch: "@patch('src.services.external_api.fetch_data')"
        },
        coverage_threshold: 80
      }
    },

    frontend: {
      title: "Frontend Standards (Next.js/React/TypeScript)",
      sections: {
        app_router: {
          layout: "src/app/layout.tsx - Root layout with html/body",
          page: "src/app/page.tsx - Home page",
          route_groups: "src/app/(auth)/ - Route groups with parentheses"
        },
        component_organization: {
          ui: "src/components/ui/ - Base UI components (Button, Input)",
          features: "src/components/features/ - Feature-specific components",
          layouts: "src/components/layouts/ - Layout components (Header, Sidebar)"
        },
        server_vs_client: {
          server: "Default - no directive, can fetch data directly",
          client: "'use client' directive - for useState, useEffect, event handlers"
        },
        api_client: {
          pattern: "Class-based ApiClient with request<T> method",
          error_handling: "Throw ApiError on non-ok response",
          methods: ["get<T>(endpoint)", "post<T>(endpoint, data)"]
        },
        typescript_config: {
          target: "ES2022",
          strict: true,
          moduleResolution: "bundler",
          paths: { "@/*": ["./src/*"] }
        }
      }
    },

    security: {
      title: "Security Standards (OWASP API Top 10)",
      sections: {
        owasp_checklist: [
          { risk: "API1: BOLA", mitigation: "Object-level authorization", implementation: "Check user owns resource before access" },
          { risk: "API2: Broken Auth", mitigation: "Strong authentication", implementation: "OAuth 2.0 + JWT, MFA for sensitive ops" },
          { risk: "API3: Object Property Level", mitigation: "Input/output filtering", implementation: "Pydantic schemas, explicit field selection" },
          { risk: "API4: Unrestricted Resource", mitigation: "Rate limiting", implementation: "Redis-based rate limiter per user/IP" },
          { risk: "API5: BFLA", mitigation: "Function-level authorization", implementation: "Role-based access control (RBAC)" },
          { risk: "API6: Mass Assignment", mitigation: "Explicit schemas", implementation: "Separate Create/Update schemas" },
          { risk: "API7: Security Misconfiguration", mitigation: "Secure defaults", implementation: "HTTPS, proper headers, no debug in prod" },
          { risk: "API8: Injection", mitigation: "Input validation", implementation: "Parameterized queries, Pydantic validation" },
          { risk: "API9: Improper Asset Management", mitigation: "API inventory", implementation: "Version all endpoints, deprecation policy" },
          { risk: "API10: Unsafe Consumption", mitigation: "Third-party validation", implementation: "Validate all external API responses" }
        ],
        authentication: {
          pattern: "OAuth2 + JWT",
          dependency: "oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')",
          validation: "jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])"
        },
        input_validation: {
          tool: "Pydantic with field_validator",
          example: "@field_validator('name') def validate_name(cls, v): if len(v) < 2: raise ValueError('...')"
        },
        secrets_management: {
          rule: "NEVER hardcode secrets",
          use: "Environment variables or secrets manager",
          config: "pydantic_settings BaseSettings with env_file='.env'"
        },
        information_disclosure: {
          rule: "Log details server-side, return generic messages to clients",
          debug_info: "Only expose in development (settings.debug)"
        }
      }
    },

    code_quality: {
      title: "Code Quality Standards",
      sections: {
        solid_principles: [
          { principle: "Single Responsibility", description: "One class = one job", example: "CustomerService only handles customer logic" },
          { principle: "Open/Closed", description: "Open for extension, closed for modification", example: "Use abstract base classes" },
          { principle: "Liskov Substitution", description: "Subtypes must be substitutable", example: "Child classes don't break contracts" },
          { principle: "Interface Segregation", description: "Many specific interfaces > one general", example: "Separate Reader and Writer protocols" },
          { principle: "Dependency Inversion", description: "Depend on abstractions", example: "Inject dependencies via constructor" }
        ],
        dry: {
          description: "Don't Repeat Yourself",
          bad: "Duplicated version string in multiple schemas",
          good: "Single settings.app_version used everywhere"
        },
        documentation: {
          format: "Google-style docstrings",
          required: ["Args", "Returns", "Raises", "Example (for complex functions)"]
        },
        linting: {
          tool: "ruff",
          config: {
            line_length: 88,
            target_version: "py312",
            select: ["E", "W", "F", "I", "B", "C4", "UP", "ARG", "SIM"]
          },
          type_checking: "mypy with strict=true"
        }
      }
    },

    lessons_learned: {
      title: "Lessons Learned Integration",
      storage: {
        findings: ".reviews/findings/{task_id}_findings.json",
        lessons: ".reviews/lessons_learned.json"
      },
      schema: {
        id: "LL-001",
        category: "database | security | performance | ...",
        severity: "critical | high | medium | low",
        pattern: "What was done wrong",
        problem: "Why it's a problem",
        solution: "How to fix it",
        source_task: "V1-49",
        date_added: "2024-12-14"
      },
      llm_workflow: [
        "1. Read .reviews/lessons_learned.json at start of task",
        "2. Check if any lessons apply to current work",
        "3. Avoid repeating documented mistakes",
        "4. After review, add new lessons if discovered"
      ]
    },

    directory_structure: {
      backend: {
        src: ["main.py", "api/v1/routes/", "core/config.py", "core/database.py", "models/", "schemas/", "services/", "utils/"],
        tests: ["conftest.py", "unit/", "integration/", "e2e/"],
        alembic: ["versions/", "env.py", "alembic.ini"],
        config: ["requirements.txt", "requirements-dev.txt", "pytest.ini", "pyproject.toml"]
      },
      frontend: {
        src: ["app/", "components/ui/", "components/features/", "lib/", "hooks/", "types/"],
        config: ["package.json", "tsconfig.json", "next.config.js", "tailwind.config.js"],
        tests: ["unit/", "integration/", "e2e/"]
      },
      standards: {
        path: ".standards/",
        files: ["README.md", "python.md", "fastapi.md", "database.md", "testing.md", "frontend.md", "security.md", "code_quality.md", "lessons_learned.json"]
      }
    }
  };

  // Generate file contents for .standards/ directory
  const generateFileContents = () => {
    return {
      "README.md": `# Engineering Standards

Version: ${STANDARDS.version}
Last Updated: ${STANDARDS.last_updated}

## Purpose
${STANDARDS.overview.purpose}

## Principles
${STANDARDS.overview.principles.map(p => `- **${p.name}**: ${p.description}`).join('\n')}

## Files
- python.md - Python backend conventions
- fastapi.md - FastAPI patterns
- database.md - SQLAlchemy/Alembic standards
- testing.md - pytest patterns
- frontend.md - Next.js/React standards
- security.md - OWASP checklist
- code_quality.md - SOLID/DRY guidelines
- lessons_learned.json - Project-specific learnings

## Usage
LLMs should read these files before implementation to follow established patterns.
`,
      "python.md": `# Python Backend Standards

## Version: ${STANDARDS.python.version}+

## Import Ordering
${STANDARDS.python.sections.import_ordering.order.join('\n')}

## Type Hints
${STANDARDS.python.sections.type_hints.rule}

Good: \`${STANDARDS.python.sections.type_hints.examples.good}\`

## Async Patterns
**CRITICAL**: ${STANDARDS.python.sections.async_patterns.critical_rule}

## Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Modules | snake_case | customer_service.py |
| Classes | PascalCase | CustomerService |
| Functions | snake_case | get_customer_by_id |
| Constants | UPPER_SNAKE | MAX_RETRY_COUNT |
`,
      "fastapi.md": `# FastAPI Standards

## Router Organization
Pattern: \`${STANDARDS.fastapi.sections.router_organization.pattern}\`

## Response Models
Always use response_model for type safety and documentation.

## CORS Configuration
**CRITICAL**: ${STANDARDS.fastapi.sections.cors.critical}

## Error Handling
- Validation: Let Pydantic handle (422 automatic)
- Business Logic: ${STANDARDS.fastapi.sections.error_handling.business_logic}
- Not Found: ${STANDARDS.fastapi.sections.error_handling.not_found}
`,
      "database.md": `# Database Standards (SQLAlchemy/Alembic)

## Naming Convention
**CRITICAL**: Define naming convention for proper Alembic migrations

## Connection Pooling
**CRITICAL**: Always use connection pooling in async applications
- pool_size: ${STANDARDS.database.sections.connection_pooling.config.pool_size}
- max_overflow: ${STANDARDS.database.sections.connection_pooling.config.max_overflow}
- pool_pre_ping: ${STANDARDS.database.sections.connection_pooling.config.pool_pre_ping}

## Raw SQL
${STANDARDS.database.sections.raw_sql.rule}
`,
      "testing.md": `# Testing Standards

## Directory Structure
- tests/unit/ - No external dependencies, mocked
- tests/integration/ - With DB/Redis
- tests/e2e/ - Full stack

## Naming Convention
Pattern: \`test_<what>_<condition>_<expected_result>\`

## Coverage Threshold: ${STANDARDS.testing.sections.coverage_threshold}%
`,
      "frontend.md": `# Frontend Standards (Next.js/React/TypeScript)

## App Router Conventions
- layout.tsx - Root layout
- page.tsx - Page component
- Route groups - (auth)/ syntax

## Server vs Client Components
- Server: Default, can fetch data directly
- Client: 'use client' directive for useState, useEffect

## TypeScript Config
- strict: true
- target: ES2022
`,
      "security.md": `# Security Standards (OWASP API Top 10)

${STANDARDS.security.sections.owasp_checklist.map(item => `## ${item.risk}
- **Mitigation**: ${item.mitigation}
- **Implementation**: ${item.implementation}
`).join('\n')}

## Secrets Management
${STANDARDS.security.sections.secrets_management.rule}
`,
      "code_quality.md": `# Code Quality Standards

## SOLID Principles
${STANDARDS.code_quality.sections.solid_principles.map(p => `- **${p.principle}**: ${p.description}`).join('\n')}

## DRY (Don't Repeat Yourself)
${STANDARDS.code_quality.sections.dry.description}

## Linting
- Tool: ${STANDARDS.code_quality.sections.linting.tool}
- Line length: ${STANDARDS.code_quality.sections.linting.config.line_length}
`,
      "lessons_learned.json": JSON.stringify({
        schema_version: "1.0.0",
        last_updated: new Date().toISOString(),
        lessons: []
      }, null, 2)
    };
  };

  // Generate Confluence XHTML content for each standard
  const generateConfluenceContent = () => {
    return {
      parent: {
        title: "Engineering Standards",
        content: `<ac:structured-macro ac:name="info"><ac:rich-text-body>
<p><strong>Version:</strong> ${STANDARDS.version} | <strong>Last Updated:</strong> ${STANDARDS.last_updated}</p>
</ac:rich-text-body></ac:structured-macro>

<h2>Purpose</h2>
<p>${STANDARDS.overview.purpose}</p>

<h2>Principles</h2>
<ac:structured-macro ac:name="panel"><ac:rich-text-body>
<ul>
${STANDARDS.overview.principles.map(p => `<li><strong>${p.name}</strong>: ${p.description}</li>`).join('\n')}
</ul>
</ac:rich-text-body></ac:structured-macro>

<h2>Technology Scope</h2>
<table>
<tr><th>Layer</th><th>Technologies</th></tr>
<tr><td>Backend</td><td>${STANDARDS.overview.scope.backend}</td></tr>
<tr><td>Frontend</td><td>${STANDARDS.overview.scope.frontend}</td></tr>
<tr><td>Database</td><td>${STANDARDS.overview.scope.database}</td></tr>
<tr><td>Testing</td><td>${STANDARDS.overview.scope.testing}</td></tr>
<tr><td>Infrastructure</td><td>${STANDARDS.overview.scope.infrastructure}</td></tr>
</table>

<h2>Child Pages</h2>
<ac:structured-macro ac:name="children"><ac:parameter ac:name="all">true</ac:parameter></ac:structured-macro>`
      },
      children: [
        {
          title: "Python Backend Standards",
          order: 1,
          content: `<ac:structured-macro ac:name="toc"/><h2>Version</h2><p>Python ${STANDARDS.python.version}</p>

<h2>Import Ordering</h2>
<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">python</ac:parameter><ac:plain-text-body><![CDATA[# 1. Standard library
import asyncio
from datetime import datetime

# 2. Third-party packages
from fastapi import FastAPI
from pydantic import BaseModel

# 3. Local application
from src.core.config import settings]]></ac:plain-text-body></ac:structured-macro>

<h2>Type Hints</h2>
<ac:structured-macro ac:name="warning"><ac:rich-text-body>
<p><strong>Required everywhere</strong> - functions, methods, class attributes</p>
</ac:rich-text-body></ac:structured-macro>

<h2>Async Patterns</h2>
<ac:structured-macro ac:name="warning"><ac:rich-text-body>
<p><strong>CRITICAL:</strong> ${STANDARDS.python.sections.async_patterns.critical_rule}</p>
</ac:rich-text-body></ac:structured-macro>

<h2>Naming Conventions</h2>
<table>
<tr><th>Element</th><th>Convention</th><th>Example</th></tr>
<tr><td>Modules</td><td>snake_case</td><td>customer_service.py</td></tr>
<tr><td>Classes</td><td>PascalCase</td><td>CustomerService</td></tr>
<tr><td>Functions</td><td>snake_case</td><td>get_customer_by_id</td></tr>
<tr><td>Constants</td><td>UPPER_SNAKE</td><td>MAX_RETRY_COUNT</td></tr>
</table>`
        },
        {
          title: "FastAPI Standards",
          order: 2,
          content: `<ac:structured-macro ac:name="toc"/><h2>Router Organization</h2>
<p>Pattern: <code>src/api/v1/routes/{resource}.py</code></p>

<h2>CORS Configuration</h2>
<ac:structured-macro ac:name="warning"><ac:rich-text-body>
<p><strong>CRITICAL:</strong> ${STANDARDS.fastapi.sections.cors.critical}</p>
</ac:rich-text-body></ac:structured-macro>

<h2>Response Models</h2>
<p>Always use response_model for type safety and documentation.</p>

<h2>Error Handling</h2>
<table>
<tr><th>Type</th><th>Pattern</th></tr>
<tr><td>Validation</td><td>Let Pydantic handle (422 automatic)</td></tr>
<tr><td>Business Logic</td><td>HTTPException(status_code=400)</td></tr>
<tr><td>Not Found</td><td>HTTPException(status_code=404)</td></tr>
</table>`
        },
        {
          title: "Database Standards",
          order: 3,
          content: `<ac:structured-macro ac:name="toc"/><h2>SQLAlchemy Naming Convention</h2>
<ac:structured-macro ac:name="warning"><ac:rich-text-body>
<p><strong>CRITICAL:</strong> Define naming convention for proper Alembic migrations</p>
</ac:rich-text-body></ac:structured-macro>

<h2>Connection Pooling</h2>
<ac:structured-macro ac:name="warning"><ac:rich-text-body>
<p><strong>CRITICAL:</strong> Always use connection pooling in async applications</p>
</ac:rich-text-body></ac:structured-macro>
<table>
<tr><th>Setting</th><th>Value</th></tr>
<tr><td>pool_size</td><td>${STANDARDS.database.sections.connection_pooling.config.pool_size}</td></tr>
<tr><td>max_overflow</td><td>${STANDARDS.database.sections.connection_pooling.config.max_overflow}</td></tr>
<tr><td>pool_pre_ping</td><td>${STANDARDS.database.sections.connection_pooling.config.pool_pre_ping}</td></tr>
</table>

<h2>Raw SQL</h2>
<p>${STANDARDS.database.sections.raw_sql.rule}</p>`
        },
        {
          title: "Testing Standards",
          order: 4,
          content: `<ac:structured-macro ac:name="toc"/><h2>Directory Structure</h2>
<ul>
<li><code>tests/unit/</code> - No external dependencies, mocked</li>
<li><code>tests/integration/</code> - With DB/Redis</li>
<li><code>tests/e2e/</code> - Full stack</li>
</ul>

<h2>Test Categorization</h2>
<table>
<tr><th>Category</th><th>Marker</th><th>Dependencies</th></tr>
<tr><td>Unit</td><td>@pytest.mark.unit</td><td>None (mocked)</td></tr>
<tr><td>Integration</td><td>@pytest.mark.integration</td><td>DB, Redis</td></tr>
<tr><td>E2E</td><td>@pytest.mark.e2e</td><td>Full stack</td></tr>
</table>

<h2>Naming Convention</h2>
<p>Pattern: <code>test_&lt;what&gt;_&lt;condition&gt;_&lt;expected_result&gt;</code></p>

<h2>Coverage Threshold</h2>
<ac:structured-macro ac:name="info"><ac:rich-text-body>
<p><strong>Minimum: ${STANDARDS.testing.sections.coverage_threshold}%</strong></p>
</ac:rich-text-body></ac:structured-macro>`
        },
        {
          title: "Frontend Standards",
          order: 5,
          content: `<ac:structured-macro ac:name="toc"/><h2>Next.js App Router</h2>
<ul>
<li><code>layout.tsx</code> - Root layout</li>
<li><code>page.tsx</code> - Page component</li>
<li>Route groups - <code>(auth)/</code> syntax</li>
</ul>

<h2>Server vs Client Components</h2>
<table>
<tr><th>Type</th><th>Usage</th></tr>
<tr><td>Server (default)</td><td>Can fetch data directly, no directive needed</td></tr>
<tr><td>Client</td><td>'use client' directive for useState, useEffect</td></tr>
</table>

<h2>TypeScript Config</h2>
<ul>
<li><code>strict: true</code></li>
<li><code>target: ES2022</code></li>
</ul>`
        },
        {
          title: "Security Standards",
          order: 6,
          content: `<ac:structured-macro ac:name="toc"/><h2>OWASP API Security Top 10</h2>
<table>
<tr><th>Risk</th><th>Mitigation</th><th>Implementation</th></tr>
${STANDARDS.security.sections.owasp_checklist.map(item => `<tr><td>${item.risk}</td><td>${item.mitigation}</td><td>${item.implementation}</td></tr>`).join('\n')}
</table>

<h2>Secrets Management</h2>
<ac:structured-macro ac:name="warning"><ac:rich-text-body>
<p><strong>${STANDARDS.security.sections.secrets_management.rule}</strong></p>
<p>Use: ${STANDARDS.security.sections.secrets_management.use}</p>
</ac:rich-text-body></ac:structured-macro>`
        },
        {
          title: "Code Quality Standards",
          order: 7,
          content: `<ac:structured-macro ac:name="toc"/><h2>SOLID Principles</h2>
<table>
<tr><th>Principle</th><th>Description</th><th>Example</th></tr>
${STANDARDS.code_quality.sections.solid_principles.map(p => `<tr><td>${p.principle}</td><td>${p.description}</td><td>${p.example}</td></tr>`).join('\n')}
</table>

<h2>DRY (Don't Repeat Yourself)</h2>
<p>${STANDARDS.code_quality.sections.dry.description}</p>

<h2>Linting</h2>
<ul>
<li>Tool: ${STANDARDS.code_quality.sections.linting.tool}</li>
<li>Line length: ${STANDARDS.code_quality.sections.linting.config.line_length}</li>
</ul>`
        }
      ]
    };
  };

  // Page structure for Confluence hierarchy
  const pageStructure = {
    parent_page: {
      title: "Engineering Standards",
      description: "Root page containing all engineering standards"
    },
    child_pages: [
      { order: 1, title: "Python Backend Standards", section: "python" },
      { order: 2, title: "FastAPI Standards", section: "fastapi" },
      { order: 3, title: "Database Standards", section: "database" },
      { order: 4, title: "Testing Standards", section: "testing" },
      { order: 5, title: "Frontend Standards", section: "frontend" },
      { order: 6, title: "Security Standards", section: "security" },
      { order: 7, title: "Code Quality Standards", section: "code_quality" }
    ]
  };

  // Distribution workflow
  const distributionWorkflow = {
    overview: "Complete workflow for distributing engineering standards to both repository and Confluence",
    steps: [
      {
        step: 1,
        action: "Fetch standards",
        tool: "get_engineering_standards",
        args: { format: "distribution" },
        description: "Get complete distribution package with repo files and Confluence content"
      },
      {
        step: 2,
        action: "Create .standards/ directory in repo",
        files: [".standards/README.md", ".standards/python.md", ".standards/fastapi.md", ".standards/database.md", ".standards/testing.md", ".standards/frontend.md", ".standards/security.md", ".standards/code_quality.md", ".standards/lessons_learned.json"],
        description: "Save markdown files to .standards/ directory for LLM reference"
      },
      {
        step: 3,
        action: "Create parent page in Confluence",
        tool: "confluence_mcp.create_page",
        args: { title: "Engineering Standards", content: "<parent_content>" },
        description: "Create the root Engineering Standards page"
      },
      {
        step: 4,
        action: "Create child pages in Confluence",
        tool: "confluence_mcp.create_page",
        loop: "For each child page in order",
        args: { title: "<child_title>", content: "<child_content>", parentId: "<parent_page_id>" },
        description: "Create each standard as a child page under Engineering Standards"
      },
      {
        step: 5,
        action: "Team review in Confluence",
        description: "Teams review and comment on standards in Confluence. Use Confluence comments for feedback."
      },
      {
        step: 6,
        action: "Customize locally",
        description: "After team approval, customize .standards/ files based on team feedback and commit to repo"
      }
    ],
    automation_script: `# Automated distribution script (run after fetching standards)
# 1. Create .standards/ directory
mkdir -p .standards

# 2. Use Claude Code or LLM to:
#    - Save each file from distribution.repo_files to .standards/
#    - Create Confluence parent page using confluence_mcp.create_page
#    - Create child pages with parentId from parent page response

# 3. Verify setup
ls -la .standards/
# Should show: README.md, python.md, fastapi.md, database.md, testing.md, frontend.md, security.md, code_quality.md, lessons_learned.json`
  };

  // Return based on section and format
  const getSection = (sectionName: string) => {
    switch (sectionName) {
      case 'overview': return STANDARDS.overview;
      case 'python': return STANDARDS.python;
      case 'fastapi': return STANDARDS.fastapi;
      case 'database': return STANDARDS.database;
      case 'testing': return STANDARDS.testing;
      case 'frontend': return STANDARDS.frontend;
      case 'security': return STANDARDS.security;
      case 'code_quality': return STANDARDS.code_quality;
      case 'all': return STANDARDS;
      default: return { error: `Unknown section: ${sectionName}. Valid sections: overview, python, fastapi, database, testing, frontend, security, code_quality, all` };
    }
  };

  // Format the response
  if (format === 'files') {
    const files = generateFileContents();
    if (section !== 'all') {
      // Return specific file for the section
      const fileMap: Record<string, string> = {
        overview: 'README.md',
        python: 'python.md',
        fastapi: 'fastapi.md',
        database: 'database.md',
        testing: 'testing.md',
        frontend: 'frontend.md',
        security: 'security.md',
        code_quality: 'code_quality.md'
      };
      const fileName = fileMap[section];
      if (fileName && files[fileName as keyof typeof files]) {
        return {
          format: 'files',
          section,
          file: {
            name: fileName,
            path: `.standards/${fileName}`,
            content: files[fileName as keyof typeof files]
          }
        };
      }
    }
    return {
      format: 'files',
      description: "Files for .standards/ directory - create this directory and save these files",
      files: Object.entries(files).map(([name, content]) => ({
        name,
        path: `.standards/${name}`,
        content
      }))
    };
  }

  if (format === 'json') {
    return {
      format: 'json',
      section,
      data: getSection(section)
    };
  }

  // Confluence format - returns XHTML content ready for Confluence pages
  if (format === 'confluence') {
    const confluenceContent = generateConfluenceContent();
    return {
      format: 'confluence',
      description: "XHTML content formatted for Confluence storage format",
      page_structure: pageStructure,
      content: confluenceContent,
      usage: {
        create_parent: "Use confluence_mcp.create_page with content.parent",
        create_children: "Loop through content.children and create each with parentId",
        note: "Content uses Confluence macros: info, warning, panel, code, toc, children"
      }
    };
  }

  // Distribution format - complete package for repo + Confluence distribution
  if (format === 'distribution') {
    const files = generateFileContents();
    const confluenceContent = generateConfluenceContent();

    return {
      format: 'distribution',
      version: STANDARDS.version,
      description: "Complete distribution package with repo files + Confluence content + workflow",

      // Repository files
      repo_files: Object.entries(files).map(([name, content]) => ({
        name,
        path: `.standards/${name}`,
        content
      })),

      // Confluence pages
      confluence_pages: {
        parent: confluenceContent.parent,
        children: confluenceContent.children
      },

      // Page hierarchy metadata
      page_structure: pageStructure,

      // Distribution workflow
      workflow: distributionWorkflow,

      // Quick reference for automation
      automation: {
        repo_directory: ".standards/",
        confluence_parent_title: "Engineering Standards",
        total_pages: 1 + confluenceContent.children.length,
        mcp_tools: {
          create_page: "confluence_mcp.create_page",
          get_page: "confluence_mcp.get_content_by_space_and_title"
        }
      },

      // Next steps
      next_steps: [
        "1. Create .standards/ directory: mkdir -p .standards",
        "2. Save each repo_file to .standards/",
        "3. Create Confluence parent page using confluence_pages.parent",
        "4. Create each child page with parentId from parent response",
        "5. Share Confluence pages with team for review",
        "6. Update .standards/ based on team feedback",
        "7. Commit .standards/ to repository"
      ]
    };
  }

  // Default: markdown format
  const sectionData = getSection(section);
  return {
    format: 'markdown',
    section,
    version: STANDARDS.version,
    data: sectionData,
    usage: {
      fetch_all: "get_engineering_standards({ format: 'files' }) to get all files for .standards/",
      specific_section: "get_engineering_standards({ section: 'python' }) for Python standards",
      confluence: "get_engineering_standards({ format: 'confluence' }) for Confluence XHTML",
      distribution: "get_engineering_standards({ format: 'distribution' }) for complete package",
      for_llm: "Read .standards/ directory before implementing features"
    }
  };
}

// Handler for Helper Scripts
async function handleHelperScripts(args: { category?: string }) {
  const { category = 'all' } = args;

  return await loadHelperScripts(category as 'mcp' | 'db' | 'setup' | 'all');
}

// Handler for Tool Configuration - returns AI tool configs (CLAUDE.md, .cursorrules, etc.)
function handleToolConfiguration(args: { tool?: string; project_type?: string; include_standards?: boolean }) {
  const { tool = 'claude', project_type = 'generic', include_standards = true } = args;

  // Standards reference block (included if include_standards is true)
  const standardsBlock = include_standards ? `
## Standards Reference

| Task Type | Required Reading |
|-----------|------------------|
| Python backend | \`.standards/python.md\` |
| FastAPI/API routes | \`.standards/fastapi.md\` |
| Database/SQLAlchemy | \`.standards/database.md\` |
| Testing | \`.standards/testing.md\` |
| Security | \`.standards/security.md\` |
| Frontend/React | \`.standards/frontend.md\` |
| Refactoring | \`.standards/code_quality.md\` |

### Enforcement Rules (NON-NEGOTIABLE)

1. **Type Hints**: ALL functions MUST have complete type hints
2. **Async**: NEVER block the event loop - always use async/await for I/O
3. **Database**: Always use \`text()\` for raw SQL, use connection pooling
4. **Testing**: Use pytest markers (@pytest.mark.unit, etc.), maintain 80%+ coverage
5. **Security**: Follow OWASP API Top 10, validate all inputs with Pydantic
6. **Error Handling**: Use specific exceptions, sanitize error messages
` : '';

  // CLAUDE.md content
  const CLAUDE_MD_CONTENT = `# Engineering Standards Enforcement

## MANDATORY: Read Before Implementing

Before writing ANY code, you MUST read the relevant engineering standards from \`.standards/\` directory.

${standardsBlock}

### Code Review Checklist

When reviewing code, verify:
- [ ] Type hints on all functions
- [ ] No blocking calls in async functions
- [ ] Parameterized queries (no SQL injection)
- [ ] Input validation with Pydantic
- [ ] Proper error handling
- [ ] Test coverage adequate

## MCP Timeout Configuration

VISHKAR MCPs are hosted on Vercel which has cold-start latency. Configure proper timeout settings.

### Required in \`~/.claude/settings.json\`:
\`\`\`json
{
  "env": {
    "MCP_TIMEOUT": "120000"
  }
}
\`\`\`

Or set environment variable before running:
\`\`\`bash
export MCP_TIMEOUT=120000
claude
\`\`\`

### Troubleshooting MCP Timeouts

If MCP tools return "operation was aborted due to timeout":
1. Verify \`MCP_TIMEOUT\` is set to at least 120000 (120 seconds)
2. First call may be slow (Vercel cold start) - retry once
3. Check \`claude mcp list\` shows servers as "Connected"

## Getting Standards

If \`.standards/\` directory doesn't exist, fetch from Enhanced Context MCP:
\`\`\`bash
curl -X POST https://enhanced-context-mcp.vercel.app/api/mcp \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_KEY" \\
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_engineering_standards","arguments":{"format":"files"}},"id":1}'
\`\`\`

Or clone the utils-only branch:
\`\`\`bash
git clone -b utils-only https://github.com/premkalyan/enhanced-context-mcp.git .vishkar-utils
cp -r .vishkar-utils/.standards/ .standards/
\`\`\`
`;

  // .cursorrules content
  const CURSOR_RULES_CONTENT = `# Cursor Rules - Engineering Standards

## Always Read Standards First

Before implementing any code, read the relevant standard from \`.standards/\`:
- Python: .standards/python.md
- FastAPI: .standards/fastapi.md
- Database: .standards/database.md
- Testing: .standards/testing.md
- Security: .standards/security.md
- Frontend: .standards/frontend.md

## Code Quality Rules

- All functions must have type hints
- Never block async event loop
- Use parameterized queries
- Validate inputs with Pydantic
- Minimum 80% test coverage

## When Reviewing Code

Check against .standards/code_quality.md and .standards/security.md
`;

  // .aider.conf.yml content
  const AIDER_CONFIG_CONTENT = `# Aider configuration for engineering standards enforcement

# Always read these files for context
read:
  - .standards/README.md
  - .standards/python.md
  - .standards/testing.md
  - .standards/security.md

# Auto-commits disabled for review
auto-commits: false
attribute-author: false

# Custom instructions
extra-context: |
  IMPORTANT: Follow engineering standards in .standards/ directory.
  - All functions need type hints
  - Use async/await for I/O operations
  - Follow OWASP security guidelines
  - Write tests for all new functionality
`;

  // .goose/config.yaml content
  const GOOSE_CONFIG_CONTENT = `# Goose AI configuration for engineering standards

context:
  read_files:
    - .standards/README.md
    - .standards/python.md
    - .standards/testing.md

rules:
  - Always read .standards/ before implementing code
  - Follow type hint conventions in python.md
  - Follow security guidelines in security.md
  - Write tests following testing.md patterns
`;

  // GitHub Copilot instructions
  const COPILOT_INSTRUCTIONS_CONTENT = `# GitHub Copilot Instructions

## Engineering Standards

This project follows engineering standards defined in \`.standards/\` directory.

Before suggesting code:
1. Reference patterns from .standards/*.md files
2. Ensure type hints on all functions
3. Use async/await for I/O operations
4. Follow OWASP security guidelines
5. Include appropriate test suggestions

## Project Type: ${project_type}

Follow conventions specific to this project type when suggesting code.
`;

  const configs: Record<string, any> = {
    claude: {
      filename: 'CLAUDE.md',
      location: 'Project root',
      content: CLAUDE_MD_CONTENT,
      instructions: 'Save to CLAUDE.md in project root. Claude Code reads this automatically.',
      auto_loaded: true
    },
    cursor: {
      filename: '.cursorrules',
      location: 'Project root',
      content: CURSOR_RULES_CONTENT,
      instructions: 'Save to .cursorrules in project root. Cursor reads this automatically.',
      auto_loaded: true
    },
    aider: {
      filename: '.aider.conf.yml',
      location: 'Project root',
      content: AIDER_CONFIG_CONTENT,
      instructions: 'Save to .aider.conf.yml in project root. Aider reads this on startup.',
      auto_loaded: true
    },
    goose: {
      filename: '.goose/config.yaml',
      location: '.goose directory',
      content: GOOSE_CONFIG_CONTENT,
      instructions: 'Create .goose directory and save config.yaml inside.',
      auto_loaded: true
    },
    copilot: {
      filename: '.github/copilot-instructions.md',
      location: '.github directory',
      content: COPILOT_INSTRUCTIONS_CONTENT,
      instructions: 'Create .github directory if needed and save copilot-instructions.md inside.',
      auto_loaded: false,
      note: 'Copilot has limited support for project-level instructions'
    },
    'claude-settings': {
      filename: 'settings.json',
      location: '~/.claude/ (user home)',
      content: JSON.stringify({
        env: {
          MCP_TIMEOUT: "120000"
        }
      }, null, 2),
      instructions: 'Merge into ~/.claude/settings.json. Required for VISHKAR MCP timeout handling.',
      auto_loaded: true,
      note: 'MCP_TIMEOUT prevents Vercel cold-start timeouts. Value is in milliseconds (120000 = 120 seconds).',
      merge_strategy: 'Add env.MCP_TIMEOUT to existing settings.json, do not overwrite other settings'
    },
    'reviews': {
      directory: '.reviews/',
      location: 'Project root',
      description: 'SDLC review findings and lessons learned storage for LLM context loading',
      structure: {
        'README.md': `# .reviews/ Directory

This directory stores review findings and lessons learned from the VISHKAR 17-Step SDLC process.

## Purpose

1. **Findings Storage**: Store review findings per task for traceability
2. **Lessons Learned**: Accumulate learnings for LLM context loading
3. **Continuous Improvement**: Prevent repeating past mistakes

## Directory Structure

\`\`\`
.reviews/
├── README.md              # This file
├── lessons_learned.json   # Accumulated lessons (LLM loads at start of each task)
└── findings/              # Per-task review findings
    ├── PROJ-123_findings.json
    ├── PROJ-456_findings.json
    └── ...
\`\`\`

## Usage

### At Start of Implementation (Step 2)
\`\`\`bash
# LLM reads lessons_learned.json to avoid past mistakes
cat .reviews/lessons_learned.json
\`\`\`

### After 4-Angle Review (Step 7)
\`\`\`bash
# Save findings for the task
# File: .reviews/findings/{JIRA_TICKET}_findings.json
\`\`\`

### After Learning New Lesson
\`\`\`bash
# Add to lessons_learned.json
# Format: { "lessons": [{ "id": "LL-XXX", "category": "...", "lesson": "...", "date_added": "..." }] }
\`\`\`

## Schemas

See Enhanced Context MCP: \`get_sdlc_guidance({ section: 'storage_schemas' })\`
`,
        'lessons_learned.json': JSON.stringify({
          _schema_version: "1.0",
          _description: "Lessons learned from past implementations. LLM loads this at start of each task to avoid repeating mistakes.",
          _usage: "Add new lessons after discovering issues during review. Include category, context, and date.",
          lessons: [
            {
              id: "LL-001",
              category: "example",
              lesson: "This is an example lesson. Replace with actual lessons from your projects.",
              context: "Discovered during initial SDLC setup",
              date_added: new Date().toISOString().split('T')[0]
            }
          ]
        }, null, 2),
        'findings/.gitkeep': '# This directory stores per-task findings from 4-angle reviews\n# Files are named: {JIRA_TICKET}_findings.json\n'
      },
      instructions: 'Create .reviews/ directory in project root with these files. LLM loads lessons_learned.json at start of each task.',
      auto_loaded: false,
      sdlc_integration: {
        step_2: 'Load lessons_learned.json before implementation',
        step_7: 'Store findings in findings/{task_id}_findings.json',
        step_17: 'Add new lessons to lessons_learned.json if discovered'
      },
      setup_commands: [
        'mkdir -p .reviews/findings',
        'touch .reviews/findings/.gitkeep',
        '# Copy README.md and lessons_learned.json from this config'
      ]
    }
  };

  // Return all configs if 'all' requested
  if (tool === 'all') {
    return {
      project_type,
      include_standards,
      configs,
      setup_workflow: [
        "1. Choose your AI coding tool",
        "2. Save the corresponding config file to your project",
        "3. Fetch engineering standards: get_engineering_standards({ format: 'files' })",
        "4. Save standards to .standards/ directory",
        "5. Create .reviews/ directory: get_tool_configuration({ tool: 'reviews' })",
        "6. Set MCP_TIMEOUT: get_tool_configuration({ tool: 'claude-settings' })",
        "7. AI tool will now reference standards before implementing code"
      ],
      standards_injection_library: {
        location: "lib/standards-injection/",
        files: ["inject-standards.ts", "README.md"],
        description: "Utility library for programmatically injecting standards into LLM prompts",
        usage: "Import and use in your backend to ensure any LLM follows standards"
      }
    };
  }

  // Return specific tool config
  const config = configs[tool];
  if (!config) {
    return {
      error: `Unknown tool: ${tool}. Available tools: claude, cursor, aider, goose, copilot, claude-settings, reviews, all`,
      available_tools: Object.keys(configs)
    };
  }

  return {
    tool,
    project_type,
    ...config,
    other_tools: Object.entries(configs)
      .filter(([k]) => k !== tool)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: { filename: v.filename, available: true } }), {}),
    next_steps: [
      `1. Save content to ${config.filename}`,
      "2. Run: get_engineering_standards({ format: 'files' })",
      "3. Save standards to .standards/ directory",
      `4. ${config.instructions.split('.')[0]}`
    ]
  };
}

// Handler for Validate SDLC Preconditions - Gate check before implementation
function handleValidateSdlcPreconditions(args: { task_type?: string; files_to_change?: string[]; jira_ticket?: string }) {
  const { task_type = 'implementation', files_to_change = [], jira_ticket } = args;

  // Define file pattern to standards/reviews mapping
  const FILE_PATTERN_MAPPING: Record<string, { standards: string[]; reviews: string[] }> = {
    'py': { standards: ['python.md', 'testing.md'], reviews: ['code_quality', 'security'] },
    'fastapi': { standards: ['python.md', 'fastapi.md', 'security.md'], reviews: ['architecture', 'security', 'code_quality'] },
    'api': { standards: ['fastapi.md', 'security.md'], reviews: ['architecture', 'security'] },
    'tsx': { standards: ['frontend.md'], reviews: ['code_quality', 'tech_stack'] },
    'ts': { standards: ['frontend.md'], reviews: ['code_quality'] },
    'sql': { standards: ['database.md', 'security.md'], reviews: ['security', 'code_quality'] },
    'alembic': { standards: ['database.md'], reviews: ['architecture'] },
    'test': { standards: ['testing.md'], reviews: ['code_quality'] },
    'terraform': { standards: ['security.md'], reviews: ['architecture', 'security'] },
  };

  // Determine applicable standards and reviews based on files
  const detectApplicableContext = (files: string[]) => {
    const standards = new Set<string>();
    const reviews = new Set<string>();
    const agents: string[] = [];

    for (const file of files) {
      const fileLower = file.toLowerCase();

      // Python/FastAPI
      if (fileLower.includes('api/') || fileLower.includes('routes/')) {
        FILE_PATTERN_MAPPING.fastapi.standards.forEach(s => standards.add(s));
        FILE_PATTERN_MAPPING.fastapi.reviews.forEach(r => reviews.add(r));
        agents.push('a-fastapi-pro', 'a-backend-engineer');
      } else if (fileLower.endsWith('.py')) {
        FILE_PATTERN_MAPPING.py.standards.forEach(s => standards.add(s));
        FILE_PATTERN_MAPPING.py.reviews.forEach(r => reviews.add(r));
        agents.push('a-backend-engineer');
      }

      // Frontend
      if (fileLower.endsWith('.tsx') || fileLower.endsWith('.jsx')) {
        FILE_PATTERN_MAPPING.tsx.standards.forEach(s => standards.add(s));
        FILE_PATTERN_MAPPING.tsx.reviews.forEach(r => reviews.add(r));
        agents.push('a-frontend-developer', 'a-typescript-pro');
      }

      // Database
      if (fileLower.includes('alembic') || fileLower.includes('migration')) {
        FILE_PATTERN_MAPPING.alembic.standards.forEach(s => standards.add(s));
        FILE_PATTERN_MAPPING.alembic.reviews.forEach(r => reviews.add(r));
        agents.push('a-backend-engineer');
      }

      // Tests
      if (fileLower.includes('test') || fileLower.includes('spec')) {
        FILE_PATTERN_MAPPING.test.standards.forEach(s => standards.add(s));
        FILE_PATTERN_MAPPING.test.reviews.forEach(r => reviews.add(r));
        agents.push('a-test-automator');
      }

      // Infrastructure
      if (fileLower.includes('terraform') || fileLower.endsWith('.tf')) {
        FILE_PATTERN_MAPPING.terraform.standards.forEach(s => standards.add(s));
        FILE_PATTERN_MAPPING.terraform.reviews.forEach(r => reviews.add(r));
        agents.push('a-terraform-specialist');
      }
    }

    // Add security review for all implementation tasks
    if (task_type === 'implementation') {
      reviews.add('security');
      standards.add('security.md');
    }

    return {
      standards: Array.from(standards),
      reviews: Array.from(reviews),
      agents: Array.from(new Set(agents))
    };
  };

  const context = detectApplicableContext(files_to_change);

  // Define blockers
  const blockers: Array<{ type: string; severity: string; message: string; fix: string }> = [];

  // Check for .standards/ directory (we can't actually check filesystem in serverless, so provide guidance)
  blockers.push({
    type: 'check_standards',
    severity: 'warning',
    message: 'Ensure .standards/ directory exists with relevant standard files',
    fix: `If missing, run: get_engineering_standards({ format: 'files' }) and save to .standards/`
  });

  // Check lessons_learned.json
  if (task_type === 'implementation' || task_type === 'bugfix') {
    blockers.push({
      type: 'check_lessons_learned',
      severity: 'info',
      message: 'Load .reviews/lessons_learned.json before implementation to avoid repeating past mistakes',
      fix: 'Read the file if it exists, or create with empty {"lessons": []} structure'
    });
  }

  // Environment checks for MCP connectivity
  blockers.push({
    type: 'check_mcp_timeout',
    severity: 'warning',
    message: 'Ensure MCP_TIMEOUT is configured to prevent Vercel cold start timeouts',
    fix: 'Add to ~/.claude/settings.json: { "env": { "MCP_TIMEOUT": "120000" } }'
  });

  blockers.push({
    type: 'check_mcp_connectivity',
    severity: 'warning',
    message: 'Verify all VISHKAR MCPs are connected before starting work',
    fix: 'Run: claude mcp list - all MCPs should show "Connected" status'
  });

  blockers.push({
    type: 'check_api_key',
    severity: 'info',
    message: 'Ensure VISHKAR_API_KEY is set in project .env for MCP authentication',
    fix: 'Add VISHKAR_API_KEY=pk_xxx to project .env file (get key from Project Registry)'
  });

  // Build checklist
  const checklist = {
    environment_ready: {
      required: true,
      checks: [
        { name: 'MCP_TIMEOUT', location: '~/.claude/settings.json', value: '120000', action: 'Prevents Vercel cold start timeouts' },
        { name: 'MCP_CONNECTIVITY', command: 'claude mcp list', expected: 'All MCPs show "Connected"' },
        { name: 'VISHKAR_API_KEY', location: 'project .env', action: 'Required for authenticated MCP calls' }
      ],
      verification_command: 'claude mcp list'
    },
    standards_loaded: {
      required: true,
      files: context.standards.map(s => `.standards/${s}`),
      action: 'Read these files before writing code'
    },
    lessons_learned_loaded: {
      required: task_type === 'implementation' || task_type === 'bugfix',
      file: '.reviews/lessons_learned.json',
      action: 'Check for relevant past issues'
    },
    jira_ticket_valid: {
      status: jira_ticket ? 'provided' : 'not_provided',
      recommendation: jira_ticket ? `Verify ${jira_ticket} is in "In Progress" status` : 'Provide jira_ticket for full tracking',
      // JIRA status check - MUST verify before proceeding
      jira_check: jira_ticket ? {
        required: true,
        mcp_call: {
          endpoint: 'https://jira-mcp-pi.vercel.app/api/mcp',
          method: 'tools/call',
          tool: 'get_issue_details',
          arguments: { issueKey: jira_ticket },
          headers: { 'Authorization': 'Bearer {jira_token}', 'Content-Type': 'application/json' }
        },
        expected_status: ['In Progress', 'In Development', 'Coding'],
        blocked_status: ['Done', 'Closed', 'Resolved', 'Ready for Testing', 'In Review'],
        action_if_blocked: `Transition ${jira_ticket} to "In Progress" before starting implementation`,
        action_if_not_started: `Transition ${jira_ticket} from "To Do" to "In Progress"`
      } : null
    },
    required_reviews_identified: {
      reviews: context.reviews,
      agents: context.agents
    }
  };

  // Add JIRA status as potential blocker
  if (jira_ticket) {
    blockers.push({
      type: 'jira_status_check',
      severity: 'critical',
      message: `MUST verify ${jira_ticket} status is "In Progress" before coding`,
      fix: `Call JIRA MCP: get_issue_details({ issueKey: "${jira_ticket}" }) and verify status`
    });
  }

  return {
    // GATE CHECK - Do not proceed if any critical blockers
    gate_check: {
      can_proceed: blockers.filter(b => b.severity === 'critical').length === 0 || !jira_ticket,
      critical_blockers: blockers.filter(b => b.severity === 'critical'),
      message: jira_ticket
        ? `⚠️ BLOCKING: Verify JIRA ${jira_ticket} is "In Progress" before writing any code`
        : '⚠️ WARNING: No JIRA ticket provided - progress tracking will be limited'
    },

    ready: blockers.filter(b => b.severity === 'critical').length === 0,
    task_type,
    files_to_change,
    jira_ticket: jira_ticket || null,

    blockers,
    checklist,

    applicable_context: {
      standards: context.standards.map(s => ({ file: `.standards/${s}`, action: 'Must read before implementation' })),
      reviews_required: context.reviews.map(r => ({
        type: r,
        step: r === 'architecture' ? 3 : r === 'security' ? 4 : r === 'code_quality' ? 5 : 6,
        blocking_severities: ['critical', 'high']
      })),
      recommended_agents: context.agents
    },

    pre_implementation_steps: [
      '1. Verify environment: MCP_TIMEOUT=120000 in settings.json, run "claude mcp list" to confirm connectivity',
      '2. Read applicable standards from .standards/',
      '3. Load .reviews/lessons_learned.json if exists',
      '4. Verify Jira ticket is In Progress',
      '5. Identify reviewer agents for post-implementation',
      '6. Begin implementation following standards'
    ],

    sdlc_reference: {
      current_step: 2,
      step_name: 'Implementation',
      next_steps: [3, 4, 5, 6],
      next_step_names: ['Architecture Review', 'Security Review', 'Code Quality Review', 'Tech-Stack Review']
    }
  };
}

// Handler for Review Templates - Structured checklists for 4-Angle Review
function handleGetReviewTemplate(args: { review_type?: string; file_patterns?: string[]; include_standards_reference?: boolean }) {
  const { review_type = 'all', file_patterns = [], include_standards_reference = true } = args;

  // Define review checklists
  const REVIEW_CHECKLISTS: Record<string, {
    agent: string;
    step: number;
    focus_areas: string[];
    checklist: Array<{ id: string; check: string; severity: 'critical' | 'high' | 'medium' | 'low' }>;
    standards_reference: string[];
  }> = {
    architecture: {
      agent: 'a-architect-review',
      step: 3,
      focus_areas: ['System design patterns', 'Component boundaries', 'Scalability', 'Technical debt'],
      checklist: [
        { id: 'ARCH-001', check: 'Component boundaries are well-defined and follow single responsibility', severity: 'high' },
        { id: 'ARCH-002', check: 'No circular dependencies between modules', severity: 'critical' },
        { id: 'ARCH-003', check: 'Appropriate abstraction layers (service, repository, etc.)', severity: 'medium' },
        { id: 'ARCH-004', check: 'Scalability considerations addressed (stateless, cacheable)', severity: 'high' },
        { id: 'ARCH-005', check: 'Error handling strategy consistent across components', severity: 'medium' },
        { id: 'ARCH-006', check: 'Configuration externalized (no hardcoded values)', severity: 'high' },
        { id: 'ARCH-007', check: 'Logging and observability hooks in place', severity: 'medium' }
      ],
      standards_reference: ['code_quality.md']
    },
    security: {
      agent: 'a-security-auditor',
      step: 4,
      focus_areas: ['OWASP Top 10', 'Auth/AuthZ', 'Input validation', 'Secrets management'],
      checklist: [
        { id: 'SEC-001', check: 'All user inputs validated with Pydantic or equivalent', severity: 'critical' },
        { id: 'SEC-002', check: 'No hardcoded secrets, API keys, or credentials', severity: 'critical' },
        { id: 'SEC-003', check: 'SQL queries use parameterized queries or ORM (no raw SQL concatenation)', severity: 'critical' },
        { id: 'SEC-004', check: 'Authentication required on sensitive endpoints', severity: 'critical' },
        { id: 'SEC-005', check: 'Authorization checks verify user has permission for resource', severity: 'critical' },
        { id: 'SEC-006', check: 'Sensitive data encrypted at rest and in transit', severity: 'high' },
        { id: 'SEC-007', check: 'Rate limiting configured on public endpoints', severity: 'high' },
        { id: 'SEC-008', check: 'Error messages do not leak internal details', severity: 'high' },
        { id: 'SEC-009', check: 'CORS configured restrictively (not wildcard)', severity: 'high' },
        { id: 'SEC-010', check: 'Dependencies checked for known vulnerabilities', severity: 'medium' }
      ],
      standards_reference: ['security.md']
    },
    code_quality: {
      agent: 'a-code-reviewer',
      step: 5,
      focus_areas: ['SOLID principles', 'Clean code', 'DRY', 'Error handling'],
      checklist: [
        { id: 'QUAL-001', check: 'All functions have complete type hints', severity: 'high' },
        { id: 'QUAL-002', check: 'Functions are single-purpose (< 30 lines recommended)', severity: 'medium' },
        { id: 'QUAL-003', check: 'No code duplication (DRY principle)', severity: 'medium' },
        { id: 'QUAL-004', check: 'Clear naming conventions followed', severity: 'medium' },
        { id: 'QUAL-005', check: 'Error handling uses specific exceptions, not bare except', severity: 'high' },
        { id: 'QUAL-006', check: 'Complex logic has explanatory comments', severity: 'low' },
        { id: 'QUAL-007', check: 'No TODO/FIXME comments without linked tickets', severity: 'low' },
        { id: 'QUAL-008', check: 'Imports organized (stdlib, third-party, local)', severity: 'low' },
        { id: 'QUAL-009', check: 'No magic numbers (use named constants)', severity: 'medium' },
        { id: 'QUAL-010', check: 'Async code does not block event loop', severity: 'critical' }
      ],
      standards_reference: ['code_quality.md', 'python.md']
    },
    tech_stack: {
      agent: 'contextual',
      step: 6,
      focus_areas: ['Framework patterns', 'Performance', 'Async patterns', 'Caching'],
      checklist: [
        { id: 'TECH-001', check: 'Framework-specific best practices followed', severity: 'high' },
        { id: 'TECH-002', check: 'Performance-critical paths optimized', severity: 'high' },
        { id: 'TECH-003', check: 'Appropriate use of caching where beneficial', severity: 'medium' },
        { id: 'TECH-004', check: 'Database queries optimized (N+1 queries avoided)', severity: 'high' },
        { id: 'TECH-005', check: 'Connection pooling used for external services', severity: 'high' },
        { id: 'TECH-006', check: 'Async patterns used correctly (await all I/O)', severity: 'critical' },
        { id: 'TECH-007', check: 'Proper use of dependency injection', severity: 'medium' },
        { id: 'TECH-008', check: 'Response models defined for all endpoints', severity: 'medium' }
      ],
      standards_reference: ['fastapi.md', 'database.md', 'frontend.md']
    }
  };

  // Determine which review(s) to return
  if (review_type === 'all') {
    const allReviews = Object.entries(REVIEW_CHECKLISTS).map(([type, data]) => ({
      review_type: type,
      ...data,
      standards_reference: include_standards_reference
        ? data.standards_reference.map(s => `.standards/${s}`)
        : undefined
    }));

    return {
      description: 'Complete 4-Angle Internal Review checklists',
      sdlc_steps: '3-6',
      total_checks: allReviews.reduce((sum, r) => sum + r.checklist.length, 0),
      blocking_rule: '0 Critical, 0 High issues allowed',
      reviews: allReviews,
      workflow: [
        'Step 3: Run architecture review first',
        'Step 4: Run security review (can parallel with 3)',
        'Step 5: Run code quality review',
        'Step 6: Run tech-stack review (agent selected by file patterns)',
        'Step 7: Address all Critical/High findings before proceeding'
      ],
      findings_storage: '.reviews/findings/{task_id}_findings.json'
    };
  }

  // Return specific review type
  const reviewData = REVIEW_CHECKLISTS[review_type];
  if (!reviewData) {
    return {
      error: `Unknown review type: ${review_type}`,
      available_types: Object.keys(REVIEW_CHECKLISTS)
    };
  }

  // For tech_stack, suggest contextual agent based on file patterns
  let contextualAgent = reviewData.agent;
  if (review_type === 'tech_stack' && file_patterns.length > 0) {
    const hasBackend = file_patterns.some(p => p.includes('.py') || p.includes('api/'));
    const hasFrontend = file_patterns.some(p => p.includes('.tsx') || p.includes('.jsx'));
    const hasTerraform = file_patterns.some(p => p.includes('.tf') || p.includes('terraform'));

    if (hasTerraform) contextualAgent = 'a-terraform-specialist';
    else if (hasFrontend) contextualAgent = 'a-frontend-developer';
    else if (hasBackend) contextualAgent = 'a-fastapi-pro';
  }

  return {
    review_type,
    agent: contextualAgent,
    step: reviewData.step,
    focus_areas: reviewData.focus_areas,
    checklist: reviewData.checklist,
    total_checks: reviewData.checklist.length,
    critical_count: reviewData.checklist.filter(c => c.severity === 'critical').length,
    high_count: reviewData.checklist.filter(c => c.severity === 'high').length,
    blocking_rule: '0 Critical, 0 High issues required to proceed',
    standards_reference: include_standards_reference
      ? reviewData.standards_reference.map(s => `.standards/${s}`)
      : undefined,
    findings_format: {
      file: '.reviews/findings/{task_id}_findings.json',
      schema: {
        task_id: 'string',
        review_type: review_type,
        findings: [{
          id: 'SEC-001',
          status: 'pass | fail | na',
          severity: 'critical | high | medium | low',
          details: 'Description of issue if failed',
          line_numbers: [10, 15],
          fix_suggestion: 'How to fix'
        }],
        summary: { critical: 0, high: 0, medium: 0, low: 0 },
        blocking: false
      }
    }
  };
}

// Handler for Completion Checklist - What's required before marking task complete
function handleGetCompletionChecklist(args: {
  task_type?: string;
  files_changed?: string[];
  jira_ticket?: string;
  reviews_completed?: string[];
  // NEW: Step 17 requirements
  worklog_logged?: boolean;
  time_spent?: string;
  pr_url?: string;
  confluence_url?: string;
  pr_linked_to_jira?: boolean;
  confluence_linked_to_jira?: boolean;
  pr_linked_in_confluence?: boolean;
}) {
  const {
    task_type = 'implementation',
    files_changed = [],
    jira_ticket,
    reviews_completed = [],
    // Step 17 closure requirements
    worklog_logged = false,
    time_spent,
    pr_url,
    confluence_url,
    pr_linked_to_jira = false,
    confluence_linked_to_jira = false,
    pr_linked_in_confluence = false
  } = args;

  // Analyze files to determine requirements
  const hasApiChanges = files_changed.some(f => f.includes('api/') || f.includes('routes/') || f.includes('endpoint'));
  const hasDbChanges = files_changed.some(f => f.includes('model') || f.includes('alembic') || f.includes('migration'));
  const hasFrontendChanges = files_changed.some(f => f.endsWith('.tsx') || f.endsWith('.jsx') || f.includes('component'));
  const hasTestChanges = files_changed.some(f => f.includes('test') || f.includes('spec'));
  const hasSecurityRelevant = files_changed.some(f => f.includes('auth') || f.includes('security') || f.includes('password') || f.includes('token'));

  // Determine required reviews based on file changes
  const requiredReviews: Record<string, { required: boolean; reason: string; completed: boolean }> = {
    architecture: {
      required: hasApiChanges || hasDbChanges,
      reason: hasApiChanges ? 'API endpoint changes detected' : hasDbChanges ? 'Database model changes detected' : 'Not required for this change',
      completed: reviews_completed.includes('architecture')
    },
    security: {
      required: hasApiChanges || hasSecurityRelevant || task_type === 'implementation',
      reason: hasSecurityRelevant ? 'Security-relevant files modified' : hasApiChanges ? 'API changes require security review' : 'Standard implementation review',
      completed: reviews_completed.includes('security')
    },
    code_quality: {
      required: true,
      reason: 'Always required for all code changes',
      completed: reviews_completed.includes('code_quality')
    },
    tech_stack: {
      required: task_type === 'implementation' || task_type === 'refactor',
      reason: 'Framework-specific patterns should be verified',
      completed: reviews_completed.includes('tech_stack')
    }
  };

  // Determine required tests
  const requiredTests: Record<string, { required: boolean; reason: string; coverage_threshold?: number }> = {
    unit: {
      required: task_type !== 'documentation',
      reason: task_type === 'documentation' ? 'Documentation changes don\'t require unit tests' : 'All code changes require unit tests',
      coverage_threshold: 80
    },
    integration: {
      required: hasApiChanges || hasDbChanges,
      reason: hasApiChanges ? 'API changes require integration tests' : hasDbChanges ? 'Database changes require integration tests' : 'Not required',
    },
    e2e: {
      required: hasFrontendChanges && hasApiChanges,
      reason: hasFrontendChanges && hasApiChanges ? 'Full-stack changes benefit from E2E tests' : 'Not required for this change',
    }
  };

  // Determine required documentation
  const requiredDocs: Array<{ type: string; required: boolean; reason: string }> = [];

  if (hasApiChanges) {
    requiredDocs.push({
      type: 'API documentation',
      required: true,
      reason: 'New/modified endpoints should be documented'
    });
  }

  if (hasDbChanges) {
    requiredDocs.push({
      type: 'Database schema docs',
      required: true,
      reason: 'Model changes should be documented'
    });
  }

  // Calculate completion status
  const pendingReviews = Object.entries(requiredReviews)
    .filter(([_, v]) => v.required && !v.completed)
    .map(([k, _]) => k);

  const allReviewsComplete = pendingReviews.length === 0;

  // Build blockers list
  const blockers: Array<{ type: string; severity: string; message: string; action: string }> = [];

  // Add review blockers
  pendingReviews.forEach(review => {
    blockers.push({
      type: 'review_incomplete',
      severity: 'BLOCKING',
      message: `${review.toUpperCase()} review not completed`,
      action: `Run get_review_template({ review_type: '${review}' }) and complete review`
    });
  });

  // Add test blockers if no tests in changes
  if (!hasTestChanges && task_type !== 'documentation') {
    blockers.push({
      type: 'tests_missing',
      severity: 'BLOCKING',
      message: 'No test files in changes - tests are required',
      action: 'Add tests for changed code with ≥80% coverage'
    });
  }

  // Check for JIRA
  if (!jira_ticket) {
    blockers.push({
      type: 'jira_not_provided',
      severity: 'WARNING',
      message: 'No JIRA ticket provided - cannot track transitions',
      action: 'Provide jira_ticket parameter for full workflow tracking'
    });
  }

  // ============================================================
  // STEP 17: STORY CLOSURE REQUIREMENTS (MANDATORY)
  // ============================================================

  // WORKLOG - MANDATORY before marking Done
  if (!worklog_logged) {
    blockers.push({
      type: 'worklog_missing',
      severity: 'BLOCKING',
      message: '⏱️ WORKLOG NOT LOGGED - Time tracking is MANDATORY before marking Done',
      action: `Call JIRA MCP: add_worklog({ issueKey: '${jira_ticket || 'TICKET-XXX'}', timeSpent: '${time_spent || '1h 30m'}', comment: 'Task completed - [brief description]' })`
    });
  }

  // PR LINK TO JIRA - MANDATORY for traceability
  if (pr_url && !pr_linked_to_jira) {
    blockers.push({
      type: 'pr_not_linked_to_jira',
      severity: 'BLOCKING',
      message: '🔗 PR NOT LINKED TO JIRA - Add PR URL to JIRA ticket',
      action: `Call JIRA MCP: add_comment({ issueKey: '${jira_ticket || 'TICKET-XXX'}', comment: 'PR: ${pr_url}' })`
    });
  } else if (!pr_url) {
    blockers.push({
      type: 'pr_url_missing',
      severity: 'WARNING',
      message: 'PR URL not provided - cannot verify cross-linking',
      action: 'Provide pr_url parameter (e.g., https://github.com/owner/repo/pull/123)'
    });
  }

  // CONFLUENCE LINK TO JIRA - MANDATORY for documentation navigation
  if (confluence_url && !confluence_linked_to_jira) {
    blockers.push({
      type: 'confluence_not_linked_to_jira',
      severity: 'BLOCKING',
      message: '📄 CONFLUENCE NOT LINKED TO JIRA - Add documentation URL to JIRA ticket',
      action: `Call JIRA MCP: add_comment({ issueKey: '${jira_ticket || 'TICKET-XXX'}', comment: 'Documentation: ${confluence_url}' })`
    });
  } else if (!confluence_url) {
    blockers.push({
      type: 'confluence_url_missing',
      severity: 'WARNING',
      message: 'Confluence URL not provided - cannot verify documentation linking',
      action: 'Provide confluence_url parameter if documentation page exists'
    });
  }

  // PR LINK IN CONFLUENCE - MANDATORY for implementation reference
  if (confluence_url && pr_url && !pr_linked_in_confluence) {
    blockers.push({
      type: 'pr_not_in_confluence',
      severity: 'BLOCKING',
      message: '🔗 PR NOT LINKED IN CONFLUENCE - Add PR URL to documentation page',
      action: `Call Confluence MCP: update_page - Add PR link (${pr_url}) to Implementation section`
    });
  }

  const canComplete = blockers.filter(b => b.severity === 'BLOCKING').length === 0;

  return {
    // GATE CHECK - Prominent blocking message
    gate_check: {
      can_mark_done: canComplete,
      blocking_issues: blockers.filter(b => b.severity === 'BLOCKING').length,
      message: canComplete
        ? '✅ All required steps complete - task can be marked Done'
        : `🚫 CANNOT MARK DONE: ${blockers.filter(b => b.severity === 'BLOCKING').length} blocking issue(s) remain`
    },

    task_type,
    files_changed_count: files_changed.length,
    jira_ticket: jira_ticket || 'not_provided',

    // Clear blockers section
    blockers,

    completion_status: {
      ready_to_complete: canComplete,
      total_blockers: blockers.filter(b => b.severity === 'BLOCKING').length,
      total_warnings: blockers.filter(b => b.severity === 'WARNING').length
    },

    required_reviews: requiredReviews,
    pending_reviews: pendingReviews,

    required_tests: requiredTests,

    required_documentation: requiredDocs,

    storage_requirements: {
      findings_file: jira_ticket ? `.reviews/findings/${jira_ticket}_findings.json` : '.reviews/findings/{task_id}_findings.json',
      lessons_learned: '.reviews/lessons_learned.json',
      action: 'Save all Critical/High findings to lessons_learned.json for future reference'
    },

    jira_transitions: jira_ticket ? {
      current: 'In Progress (assumed)',
      on_reviews_complete: 'Ready for Testing',
      on_tests_pass: 'Ready for PR Review',
      on_pr_approved: 'Ready for Merge',
      on_merge: 'Done'
    } : {
      note: 'Provide jira_ticket for transition guidance'
    },

    final_checklist: [
      { step: 1, item: '4-Angle Review complete (0 Critical, 0 High)', status: allReviewsComplete ? 'done' : 'pending' },
      { step: 2, item: 'All findings addressed or logged', status: 'verify' },
      { step: 3, item: 'Tests written and passing (≥90% pass rate)', status: 'verify' },
      { step: 4, item: 'Test coverage adequate (≥80%)', status: 'verify' },
      { step: 5, item: 'Documentation updated if required', status: requiredDocs.length > 0 ? 'verify' : 'na' },
      { step: 6, item: 'Lessons learned updated', status: 'verify' },
      { step: 7, item: 'PR created with description', status: pr_url ? 'done' : 'pending' },
      // Step 17 Closure Requirements
      { step: 8, item: '⏱️ WORKLOG LOGGED (MANDATORY)', status: worklog_logged ? 'done' : 'BLOCKING' },
      { step: 9, item: '🔗 PR URL added to JIRA ticket', status: pr_linked_to_jira ? 'done' : (pr_url ? 'BLOCKING' : 'pending') },
      { step: 10, item: '📄 Confluence URL added to JIRA ticket', status: confluence_linked_to_jira ? 'done' : (confluence_url ? 'BLOCKING' : 'na') },
      { step: 11, item: '🔗 PR URL added to Confluence page', status: pr_linked_in_confluence ? 'done' : (confluence_url && pr_url ? 'BLOCKING' : 'na') },
      { step: 12, item: 'JIRA transitioned to Done', status: 'pending' }
    ],

    // Step 17 Cross-Linking Summary
    cross_linking: {
      status: (pr_linked_to_jira && confluence_linked_to_jira && pr_linked_in_confluence) ? 'complete' : 'incomplete',
      jira_to_pr: pr_linked_to_jira ? '✅' : '❌',
      jira_to_confluence: confluence_linked_to_jira ? '✅' : '❌',
      confluence_to_pr: pr_linked_in_confluence ? '✅' : '❌',
      pr_url: pr_url || 'not_provided',
      confluence_url: confluence_url || 'not_provided',
      actions_needed: [
        ...(pr_url && !pr_linked_to_jira ? [`Add PR link to JIRA: add_comment({ issueKey: '${jira_ticket}', comment: 'PR: ${pr_url}' })`] : []),
        ...(confluence_url && !confluence_linked_to_jira ? [`Add Confluence link to JIRA: add_comment({ issueKey: '${jira_ticket}', comment: 'Docs: ${confluence_url}' })`] : []),
        ...(confluence_url && pr_url && !pr_linked_in_confluence ? [`Add PR link to Confluence: update Implementation section with ${pr_url}`] : [])
      ]
    },

    // Worklog Summary
    worklog: {
      logged: worklog_logged,
      time_spent: time_spent || 'not_provided',
      action: worklog_logged
        ? '✅ Worklog recorded'
        : `❌ CALL: add_worklog({ issueKey: '${jira_ticket || 'TICKET-XXX'}', timeSpent: '[Xh Ym]', comment: '[description]' })`
    },

    sdlc_reference: {
      current_phase: 'Feedback/Testing',
      remaining_steps: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      next_milestone: 'PR Creation (Step 12)'
    }
  };
}

// MCP Server Info
const SERVER_INFO = {
  name: 'enhanced-context-mcp',
  version: '2.5.0'
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

      case 'get_engineering_standards':
        result = await handleEngineeringStandards(args || {});
        break;

      case 'get_helper_scripts':
        result = await handleHelperScripts(args || {});
        break;

      case 'get_tool_configuration':
        result = handleToolConfiguration(args || {});
        break;

      case 'validate_sdlc_preconditions':
        result = handleValidateSdlcPreconditions(args || {});
        break;

      case 'get_review_template':
        result = handleGetReviewTemplate(args || {});
        break;

      case 'get_completion_checklist':
        result = handleGetCompletionChecklist(args || {});
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
