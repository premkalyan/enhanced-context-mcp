/**
 * Enhanced Context MCP - How To Guide Endpoint
 * Returns JSON documentation about tools, intent-based loading, and usage
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const howto = {
    service: "Enhanced Context MCP",
    version: "1.5.0",
    endpoint: "https://enhanced-context-mcp.vercel.app/api/mcp",

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
      description: "Enhanced Context MCP provides intelligent context loading for AI agents with VISHKAR agent discovery, SDLC guidance, and intent-based context selection.",
      key_features: [
        "Intent-based context loading - automatically select relevant context based on query intent",
        "38 VISHKAR agents - 32 technical specialists + 6 domain experts",
        "SDLC phase-specific guidance and best practices",
        "Multi-agent workflow support with agent recommendations",
        "Full MCP ecosystem documentation"
      ]
    },

    tools: {
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
          description: "Get phase-specific SDLC guidance and best practices",
          parameters: {
            phase: "requirements | design | implementation | testing | deployment | maintenance"
          },
          returns: "Phase-specific processes, artifacts, best practices, and quality gates"
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
      "Use task_intent to get more focused agent recommendations",
      "Specify domain_focus for industry-specific guidance",
      "Use list_vishkar_agents with agent_type filter to discover specialists",
      "Get SDLC guidance for phase-specific best practices",
      "Use get_mcp_ecosystem_guide to understand all available MCPs"
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
