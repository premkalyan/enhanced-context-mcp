#!/usr/bin/env node

/**
 * Auto-generate MCP Registry from live services
 *
 * This script fetches tool information from all deployed MCP services
 * and generates an updated mcp-registry.json file.
 *
 * Usage:
 *   node scripts/generate-registry.js
 *
 * Environment Variables:
 *   PROJECT_REGISTRY_ADMIN_TOKEN - Admin token for registry mutations
 */

const fs = require('fs');
const path = require('path');

// Service configurations
const SERVICES = {
  'project-registry': {
    name: 'Project Registry',
    url: 'https://project-registry-henna.vercel.app',
    description: 'Central registry for project metadata, API keys, JIRA project keys, Confluence space keys, and GitHub repositories. Use this first to get project configuration.',
    transport: 'http',
    authentication: {
      type: 'bearer',
      header: 'Authorization',
      note: 'Use admin token for mutations, no auth for queries'
    },
    toolsEndpoint: null, // Manual definition
    tools: [
      {
        name: 'list_projects',
        description: 'List all registered projects',
        endpoint: '/api/projects',
        method: 'GET'
      },
      {
        name: 'get_project',
        description: 'Get project by ID including JIRA project key, Confluence space key, GitHub repo, and API key',
        endpoint: '/api/projects/:id',
        method: 'GET'
      },
      {
        name: 'create_project',
        description: 'Create a new project with metadata (requires admin token)',
        endpoint: '/api/projects',
        method: 'POST'
      },
      {
        name: 'update_project',
        description: 'Update existing project metadata (requires admin token)',
        endpoint: '/api/projects/:id',
        method: 'PUT'
      },
      {
        name: 'delete_project',
        description: 'Delete project (requires admin token)',
        endpoint: '/api/projects/:id',
        method: 'DELETE'
      },
      {
        name: 'validate_token',
        description: 'Validate API token',
        endpoint: '/api/validate-token',
        method: 'POST'
      }
    ]
  },
  'enhanced-context': {
    name: 'Enhanced Context MCP',
    url: 'https://enhanced-context-mcp.vercel.app',
    description: 'Intelligent context, template, and agent selection based on task intent, scope, and complexity. Provides SDLC guidance, quality checks, common mistakes to avoid, and best practices. USE THIS FIRST before creating any JIRA issues or documentation to get proper format, structure, and guidance.',
    transport: 'http',
    authentication: {
      type: 'api-key',
      header: 'X-API-Key',
      note: 'Use project API key from Project Registry'
    },
    toolsEndpoint: null,
    tools: [
      {
        name: 'load_enhanced_context',
        description: 'Load intelligent contexts, templates, and agents based on task parameters. Returns: epic prefix format, story structure, acceptance criteria format, quality checks, common mistakes, best practices, SDLC step guidance, agent persona, and relevant templates.',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'list_vishkar_agents',
        description: 'List all available VISHKAR agent profiles (32 specialized agents including frontend, backend, cloud, security, testing, etc)',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'load_vishkar_agent',
        description: 'Load specific agent profile by ID with complete persona, expertise, and examples',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'update_agent',
        description: 'Update existing agent with learning improvements (cannot create new agents)',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'validate_vishkar_agent_profile',
        description: 'Validate agent profile format and completeness',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'refresh_agent_cache',
        description: 'Clear cached agent profiles and reload from disk',
        endpoint: '/api/mcp',
        method: 'POST'
      }
    ]
  },
  'jira': {
    name: 'JIRA MCP',
    url: 'https://jira-mcp-pi.vercel.app',
    description: 'Create, update, and manage JIRA issues (epics, stories, tasks, subtasks, bugs). Search issues with JQL, add comments, link issues, transition workflows, and manage dependencies. Supports 11 tools for complete JIRA issue management. Always use Enhanced Context MCP first to get proper epic prefix format and story structure before creating issues.',
    transport: 'http',
    authentication: {
      type: 'api-key',
      header: 'X-API-Key',
      note: 'Use project API key from Project Registry'
    },
    toolsEndpoint: null, // From webpage
    tools: [
      {
        name: 'search_issues',
        description: 'Search JIRA issues using JQL (JIRA Query Language). Examples: "project = MYPROJ AND type = Epic", "Epic Link = MYPROJ-123", "assignee = currentUser() AND status != Done"',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'get_issue',
        description: 'Get JIRA issue details by key with specified fields',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'create_issue',
        description: 'Create JIRA issue (Epic, Story, Task, Subtask, Bug). For epics: use epic_name field. For stories: use epic_link to link to parent epic. For subtasks: use parent_key to link to parent story.',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'update_issue',
        description: 'Update existing JIRA issue fields including summary, description, status, assignee, labels, priority, and custom fields',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'add_comment',
        description: 'Add comment to JIRA issue',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'transition_issue',
        description: 'Transition issue to different status (To Do, In Progress, In Review, Done, Blocked)',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'get_issue_transitions',
        description: 'Get available transitions for an issue (workflow states)',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'link_issues',
        description: 'Link two JIRA issues with relationship type (blocks, relates to, depends on, duplicates, causes)',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'get_issue_links',
        description: 'Get all links for a specific issue (inward and outward links)',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'get_dependency_tree',
        description: 'Get complete dependency tree for an issue (recursive dependency graph)',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'get_link_types',
        description: 'Get available link types for the JIRA instance (blocks, relates to, etc.)',
        endpoint: '/api/mcp',
        method: 'POST'
      }
    ]
  },
  'confluence': {
    name: 'Confluence MCP',
    url: 'https://confluence-mcp-six.vercel.app',
    description: 'Create, update, and manage Confluence documentation pages. Supports 10 tools for space management, content search, page operations, and attachments. Use Enhanced Context MCP first to get proper documentation templates and structure.',
    transport: 'http',
    authentication: {
      type: 'api-key',
      header: 'X-API-Key',
      note: 'Use project API key from Project Registry'
    },
    toolsEndpoint: null, // From webpage
    tools: [
      {
        name: 'get_spaces',
        description: 'Get list of all Confluence spaces',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'get_space',
        description: 'Get details of a specific Confluence space by key',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'get_content_by_id',
        description: 'Get Confluence page content by page ID',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'get_content_by_space_and_title',
        description: 'Get Confluence page by space key and title',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'search',
        description: 'Search Confluence content using CQL (Confluence Query Language). Examples: "type = page AND space = MYSP AND label = architecture", "title ~ Payment*", "created >= now(-7d)"',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'create_page',
        description: 'Create a new Confluence page with title, content (HTML storage format), optional parent_id for hierarchical structure, and labels',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'update_page',
        description: 'Update an existing Confluence page content with version comment to track changes',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'get_page_children',
        description: 'Get child pages of a Confluence page (page hierarchy)',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'get_page_attachments',
        description: 'Get attachments for a Confluence page',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'add_page_labels',
        description: 'Add labels to a Confluence page for categorization and search',
        endpoint: '/api/mcp',
        method: 'POST'
      }
    ]
  },
  'storycrafter': {
    name: 'StoryCrafter MCP',
    url: 'https://storycrafter-mcp.vercel.app',
    description: 'AI-powered backlog generator for VISHKAR 3-agent consensus discussions. Generates 6-8 comprehensive epics with 20-40 detailed user stories, complete with acceptance criteria, technical tasks, story points, and time estimates. Use this AFTER Enhanced Context MCP when you have consensus messages and need to create a complete project backlog.',
    transport: 'http',
    authentication: {
      type: 'none',
      note: 'No authentication required (service handles its own API keys)'
    },
    toolsEndpoint: null,
    tools: [
      {
        name: 'generate_backlog',
        description: 'Generate complete project backlog from VISHKAR 3-agent consensus discussion (system, alex, blake, casey messages). Returns structured backlog with 6-8 epics, 20-40 stories, acceptance criteria in Given/When/Then format, technical implementation tasks, story points (Fibonacci scale), estimated hours, dependencies, tags, and MVP prioritization. Takes 30-60 seconds to generate.',
        endpoint: '/api/mcp',
        method: 'POST'
      },
      {
        name: 'get_backlog_summary',
        description: 'Extract summary statistics from a generated backlog: total epics, total stories, total hours, and breakdown by epic',
        endpoint: '/api/mcp',
        method: 'POST'
      }
    ]
  }
};

async function fetchTools(service, config) {
  if (!config.toolsEndpoint) {
    // Use manually defined tools
    return config.tools;
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${config.url}${config.toolsEndpoint}`, {
      method: config.toolsMethod || 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: config.toolsPayload ? JSON.stringify(config.toolsPayload) : undefined
    });

    if (!response.ok) {
      console.warn(`⚠️  Failed to fetch tools for ${service}: ${response.statusText}`);
      return config.tools || [];
    }

    const data = await response.json();

    // Extract tools from MCP response
    if (data.tools) {
      return data.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        endpoint: config.toolsEndpoint,
        method: 'POST'
      }));
    }

    return config.tools || [];
  } catch (error) {
    console.warn(`⚠️  Error fetching tools for ${service}:`, error.message);
    return config.tools || [];
  }
}

async function generateRegistry() {
  console.log('🔄 Generating MCP Registry from live services...\n');

  const registry = {
    version: '1.3.0',
    lastUpdated: new Date().toISOString(),
    mcpServers: {}
  };

  for (const [key, config] of Object.entries(SERVICES)) {
    console.log(`📡 Fetching ${config.name}...`);

    const tools = await fetchTools(key, config);

    registry.mcpServers[key] = {
      name: config.name,
      url: config.url,
      description: config.description,
      transport: config.transport,
      authentication: config.authentication,
      tools: tools
    };

    console.log(`   ✅ ${tools.length} tools registered\n`);
  }

  // Write to file
  const outputPath = path.join(__dirname, '../public/mcp-registry.json');
  fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2));

  console.log('✅ Registry generated successfully!');
  console.log(`📝 Written to: ${outputPath}`);
  console.log(`📊 Total services: ${Object.keys(registry.mcpServers).length}`);
  console.log(`📊 Total tools: ${Object.values(registry.mcpServers).reduce((sum, s) => sum + s.tools.length, 0)}`);

  return registry;
}

// Run if called directly
if (require.main === module) {
  generateRegistry().catch(console.error);
}

module.exports = { generateRegistry };
