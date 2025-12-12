/**
 * Enhanced Context MCP - How To Guide Endpoint
 * Returns JSON documentation about tools, intent-based loading, and usage
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const howto = {
    service: "Enhanced Context MCP",
    version: "1.6.0",
    endpoint: "https://enhanced-context-mcp.vercel.app/api/mcp",

    entry_point: {
      note: "For ecosystem overview WITHOUT auth, use Project Registry MCP first",
      project_registry: "POST https://project-registry-henna.vercel.app/api/mcp",
      call: { tool: "get_started", arguments: {} },
      why: "Project Registry requires no auth - it's the true entry point"
    },

    this_mcp: {
      purpose: "Specialized tools: SDLC guidance, VISHKAR agents, POC building",
      requires_auth: true,
      tools: ["get_sdlc_guidance", "get_poc_building_guide", "list_vishkar_agents", "load_enhanced_context"]
    },

    authentication: {
      method: "Bearer Token",
      header: "Authorization: Bearer {api_key}",
      how_to_get_key: [
        "1. Go to Project Registry: https://project-registry-henna.vercel.app/dashboard",
        "2. Register your project",
        "3. Copy your API key (pk_xxx...)",
        "4. Use as Bearer token in Authorization header"
      ],
      registration_endpoint: "POST https://project-registry-henna.vercel.app/api/projects/register",
      registration_body: {
        projectId: "your-project-id",
        projectName: "Your Project Name"
      }
    },

    overview: {
      description: "Enhanced Context MCP is the central hub for the VISHKAR MCP ecosystem. Call 'get_started' for complete onboarding.",
      key_features: [
        "🚀 get_started tool - One call to understand the entire ecosystem",
        "6 MCPs documented - Project Registry, Enhanced Context, JIRA, Confluence, Story Crafter, PR-Agent",
        "13-step autonomous SDLC - Agent-driven development with quality gates",
        "38 VISHKAR agents - 32 technical specialists + 6 domain experts",
        "POC building guide - QIP methodology with templates",
        "Intent-based context loading - Smart context selection"
      ]
    },

    tools: {
      onboarding: [
        {
          name: "get_started",
          description: "🚀 START HERE - Complete onboarding guide for the VISHKAR MCP ecosystem",
          call_this_first: true,
          parameters: {
            include_examples: "boolean (default: true) - Include usage examples"
          },
          returns: {
            welcome: "Welcome message and overview",
            quick_start: "3-step guide to get started",
            mcp_ecosystem: "All 6 MCPs with endpoints, tools, and auth requirements",
            sdlc_overview: "13-step autonomous SDLC summary with agent mappings",
            vishkar_agents: "38 agents overview (32 technical + 6 domain experts)",
            poc_building: "POC methodology summary",
            available_tools: "All tools in this MCP and others",
            howto_endpoints: "Documentation endpoints for all MCPs",
            next_steps: "Recommended actions",
            examples: "Usage examples (if include_examples=true)"
          },
          example_request: {
            tool: "get_started",
            arguments: {}
          },
          why_call_first: "This single call gives you everything needed to understand and use the entire VISHKAR MCP ecosystem"
        }
      ],
      context_loading: [
        {
          name: "load_enhanced_context",
          description: "Load context with intent-based selection for smarter, more relevant results",
          parameters: {
            query: "Natural language query describing what you need (required)",
            task_intent: "analyze | implement | review | debug | design | document | test | refactor | optimize",
            scope: "file | component | module | service | system | architecture",
            complexity: "simple | moderate | complex | enterprise",
            output_format: "code | documentation | analysis | recommendation",
            domain_focus: "e-commerce | healthcare | fintech | cx-design | privacy | supply-chain"
          },
          examples: [
            {
              description: "Implementation query",
              query: "Help me implement user authentication",
              task_intent: "implement",
              scope: "module",
              complexity: "moderate"
            },
            {
              description: "Architecture review",
              query: "Review my microservices architecture",
              task_intent: "review",
              scope: "system",
              output_format: "analysis"
            },
            {
              description: "Domain-specific context",
              query: "E-commerce checkout optimization",
              domain_focus: "e-commerce",
              task_intent: "optimize"
            }
          ]
        }
      ],
      agent_discovery: [
        {
          name: "list_vishkar_agents",
          description: "List available VISHKAR agents filtered by type",
          parameters: {
            agent_type: "all | technical | domain_expert (default: all)"
          },
          response: {
            technical_agents: "32 specialized technical agents (backend, frontend, security, etc.)",
            domain_experts: "6 domain planning agents (e-commerce, healthcare, fintech, CX, privacy, supply chain)"
          }
        }
      ],
      sdlc_guidance: [
        {
          name: "get_sdlc_guidance",
          description: "Get VISHKAR 13-Step Autonomous SDLC guidance with agent mappings, MCP tools, and quality gates",
          parameters: {
            section: "overview | steps | step | agents | mcp_servers | handoff | escalation | tools_by_step | full",
            step_number: "1-13 (required when section is 'step')",
            agent_role: "pm_agent | dev_agent | qa_agent | review_agent | doc_agent | coordinator"
          },
          returns: {
            overview: "SDLC summary, quality thresholds (7/10 quality, 90% tests), philosophy",
            steps: "All 13 steps with entry/exit criteria, MCP tools, handoffs",
            step: "Detailed guidance for specific step (requires step_number)",
            agents: "Agent mapping - which WAMA agents own which steps",
            mcp_servers: "Vercel MCPs vs Docker MCPs (PR-Agent runs locally)",
            handoff: "Inter-agent handoff format with example payload",
            escalation: "When and how to escalate to humans",
            tools_by_step: "MCP tools recommended for each step",
            full: "Complete SDLC documentation"
          },
          examples: [
            { section: "overview", description: "Get SDLC summary and quality thresholds" },
            { section: "step", step_number: 8, description: "Get Step 8 (3-Phase PR Review) details" },
            { section: "steps", agent_role: "qa_agent", description: "Get steps owned by QA Agent" },
            { section: "mcp_servers", description: "See which MCPs are on Vercel vs Docker" }
          ]
        }
      ],
      ecosystem_info: [
        {
          name: "get_mcp_ecosystem_guide",
          description: "Get comprehensive guide to all MCPs in the ecosystem",
          returns: {
            vercel_mcps: "Project Registry, Enhanced Context, JIRA, Confluence",
            local_mcps: "PR-Agent (Docker port 8188)",
            authentication: "How to get and use API keys",
            request_format: "JSON-RPC 2.0 examples"
          }
        }
      ],
      poc_building: [
        {
          name: "get_poc_building_guide",
          description: "Get comprehensive guidance on building interactive POC sites using the QIP methodology",
          parameters: {
            section: "overview | framework | methodology | layouts | templates | ui_patterns | branding | checklist | full",
            page_type: "questions | architecture | delivery | risks | north_star | demo"
          },
          returns: {
            overview: "Quick summary of QIP methodology and key principles",
            framework: "6-section framework (Questions, Architecture, Delivery, Risks, North Star, Demo)",
            methodology: "Step-by-step process: Template → Structure → Fill",
            layouts: "Page layout wireframes and structures",
            templates: "JSON data templates for questions, stages, WBS",
            ui_patterns: "React component patterns and color coding system",
            branding: "Client branding extraction using AntiGravity tool",
            checklist: "Quick start checklist for POC creation",
            full: "Complete guide with all sections"
          },
          examples: [
            { section: "overview", description: "Get quick summary of POC building approach" },
            { section: "framework", description: "Get the 6-section framework details" },
            { page_type: "architecture", description: "Get detailed guidance for architecture page" },
            { section: "branding", description: "Get AntiGravity color/font extraction guidance" }
          ]
        }
      ]
    },

    vishkar_agents: {
      description: "38 specialized agents for different roles and domains",
      technical_agents: [
        "backend-engineer - Node.js, Express, databases, APIs",
        "frontend-developer - React, TypeScript, UI/UX",
        "security-auditor - Security reviews, vulnerability assessment",
        "cloud-architect - AWS, Azure, GCP, infrastructure design",
        "devops-engineer - CI/CD, containers, orchestration",
        "database-specialist - SQL, NoSQL, optimization",
        "api-designer - REST, GraphQL, API best practices",
        "test-automator - Testing strategies, frameworks",
        "performance-engineer - Profiling, optimization",
        "mobile-developer - iOS, Android, React Native",
        "ml-engineer - Machine learning, data pipelines",
        "... and 21 more specialized roles"
      ],
      domain_experts: [
        {
          name: "e-commerce-specialist",
          expertise: "Cart systems, payment processing, inventory, checkout optimization"
        },
        {
          name: "healthcare-specialist",
          expertise: "HIPAA compliance, EHR integration, clinical workflows"
        },
        {
          name: "fintech-specialist",
          expertise: "Payment systems, regulatory compliance (PCI-DSS, KYC/AML)"
        },
        {
          name: "cx-design-specialist",
          expertise: "Customer journey mapping, UX research, service design"
        },
        {
          name: "privacy-specialist",
          expertise: "GDPR, CCPA, data protection, consent management"
        },
        {
          name: "supply-chain-specialist",
          expertise: "Logistics, inventory optimization, supplier management"
        }
      ]
    },

    intent_analysis: {
      description: "The MCP analyzes your query to understand intent and select relevant context",
      analysis_dimensions: {
        task_intent: "What type of work? (analyze, implement, review, debug, etc.)",
        scope: "How broad? (file, component, module, service, system)",
        complexity: "How complex? (simple, moderate, complex, enterprise)",
        output_format: "What output? (code, documentation, analysis, recommendation)"
      },
      benefits: [
        "Automatically filters to most relevant agents",
        "Selects appropriate context depth",
        "Matches domain expertise when needed",
        "Reduces noise in responses"
      ]
    },

    request_format: {
      protocol: "JSON-RPC 2.0",
      example: {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "load_enhanced_context",
          arguments: {
            query: "Help me design a secure authentication system",
            task_intent: "design",
            scope: "module",
            complexity: "moderate"
          }
        }
      }
    },

    tips: [
      "🚀 FIRST: Call 'get_started' to get complete ecosystem onboarding in one call",
      "Use task_intent to get more focused agent recommendations",
      "Specify domain_focus for industry-specific guidance",
      "Use list_vishkar_agents with agent_type filter to discover specialists",
      "Get SDLC guidance for phase-specific best practices",
      "Use get_mcp_ecosystem_guide for deep-dive into specific MCPs",
      "Use get_poc_building_guide for POC site structure and methodology",
      "Extract client branding (colors, fonts) using AntiGravity before starting POC"
    ],

    related_endpoints: {
      api_docs: "https://enhanced-context-mcp.vercel.app/docs",
      mcp_registry: "https://enhanced-context-mcp.vercel.app/api/mcp-registry",
      health_check: "https://enhanced-context-mcp.vercel.app/api/health"
    },

    links: {
      documentation: "https://enhanced-context-mcp.vercel.app/api/mcp",
      swagger_ui: "https://enhanced-context-mcp.vercel.app/docs",
      project_registry: "https://project-registry-henna.vercel.app"
    }
  };

  return NextResponse.json(howto);
}
