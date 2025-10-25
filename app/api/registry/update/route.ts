import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

/**
 * Registry Update API
 *
 * Allows MCP services to update their registry entry after deployment.
 * This creates an event-driven registry where services own their entries.
 *
 * POST /api/registry/update
 *
 * Authentication: Bearer token (REGISTRY_UPDATE_TOKEN)
 * Body: {
 *   serviceKey: string (e.g., "jira", "confluence", "storycrafter")
 *   serviceName: string
 *   url: string
 *   description: string
 *   tools: Array<{name: string, description: string, endpoint: string, method: string}>
 *   authentication?: {type: string, header?: string, note?: string}
 * }
 */

interface UpdateRegistryRequest {
  serviceKey: string;
  serviceName: string;
  url: string;
  description: string;
  transport?: string;
  tools: Array<{
    name: string;
    description: string;
    endpoint: string;
    method: string;
  }>;
  authentication?: {
    type: string;
    header?: string;
    note?: string;
  };
}

// Validate update token
function validateToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.REGISTRY_UPDATE_TOKEN;

  if (!expectedToken) {
    console.warn('⚠️  REGISTRY_UPDATE_TOKEN not configured');
    return false;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  return token === expectedToken;
}

// Update registry via GitHub API
async function updateRegistryViaGitHub(
  serviceData: UpdateRegistryRequest
): Promise<{ success: boolean; message: string; commitUrl?: string }> {
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    throw new Error('GITHUB_TOKEN not configured');
  }

  const octokit = new Octokit({ auth: githubToken });

  try {
    // 1. Get current registry file
    const { data: currentFile } = await octokit.repos.getContent({
      owner: 'premkalyan',
      repo: 'enhanced-context-mcp',
      path: 'public/mcp-registry.json',
      ref: 'master'
    });

    if (!('content' in currentFile)) {
      throw new Error('Registry file not found');
    }

    // 2. Decode current content
    const currentContent = Buffer.from(currentFile.content, 'base64').toString('utf-8');
    const registry = JSON.parse(currentContent);

    // 3. Update service entry
    registry.mcpServers[serviceData.serviceKey] = {
      name: serviceData.serviceName,
      url: serviceData.url,
      description: serviceData.description,
      transport: serviceData.transport || 'http',
      authentication: serviceData.authentication || {
        type: 'none',
        note: 'No authentication required'
      },
      tools: serviceData.tools
    };

    // 4. Update metadata
    registry.lastUpdated = new Date().toISOString();
    const versionParts = registry.version.split('.');
    versionParts[2] = String(parseInt(versionParts[2]) + 1); // Increment patch version
    registry.version = versionParts.join('.');

    // 5. Commit updated registry
    const newContent = Buffer.from(JSON.stringify(registry, null, 2)).toString('base64');

    const { data: commit } = await octokit.repos.createOrUpdateFileContents({
      owner: 'premkalyan',
      repo: 'enhanced-context-mcp',
      path: 'public/mcp-registry.json',
      message: `chore: update ${serviceData.serviceName} registry entry

Service: ${serviceData.serviceName}
URL: ${serviceData.url}
Tools: ${serviceData.tools.length}

Updated by: ${serviceData.serviceKey} service deployment

🤖 Auto-updated via registry API`,
      content: newContent,
      sha: currentFile.sha,
      branch: 'master'
    });

    return {
      success: true,
      message: `Registry updated successfully for ${serviceData.serviceName}`,
      commitUrl: commit.commit.html_url
    };

  } catch (error: any) {
    console.error('Failed to update registry:', error);
    throw new Error(`GitHub API error: ${error.message}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validate authentication
    if (!validateToken(request)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Valid REGISTRY_UPDATE_TOKEN required'
        },
        { status: 401 }
      );
    }

    // 2. Parse and validate request
    const body = await request.json() as UpdateRegistryRequest;

    // Validate required fields
    if (!body.serviceKey || !body.serviceName || !body.url) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'serviceKey, serviceName, and url are required'
        },
        { status: 400 }
      );
    }

    if (!body.tools || !Array.isArray(body.tools) || body.tools.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'tools array is required and must not be empty'
        },
        { status: 400 }
      );
    }

    // 3. Update registry
    const result = await updateRegistryViaGitHub(body);

    // 4. Return success
    return NextResponse.json({
      success: true,
      message: result.message,
      commitUrl: result.commitUrl,
      service: body.serviceKey,
      toolsCount: body.tools.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Registry update error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal error',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// GET endpoint for API documentation
export async function GET() {
  return NextResponse.json({
    name: 'Registry Update API',
    version: '1.0.0',
    description: 'Event-driven MCP registry updates. Services call this endpoint after successful deployment to update their registry entry.',

    endpoint: {
      method: 'POST',
      path: '/api/registry/update',
      authentication: {
        type: 'Bearer token',
        header: 'Authorization: Bearer <REGISTRY_UPDATE_TOKEN>',
        note: 'Contact admin for update token'
      }
    },

    requestBody: {
      serviceKey: 'string (required) - Service identifier (e.g., "jira", "storycrafter")',
      serviceName: 'string (required) - Display name',
      url: 'string (required) - Service URL',
      description: 'string (required) - Service description',
      transport: 'string (optional) - Default: "http"',
      tools: 'array (required) - List of tools with name, description, endpoint, method',
      authentication: 'object (optional) - Auth requirements'
    },

    example: {
      serviceKey: 'my-mcp',
      serviceName: 'My MCP Service',
      url: 'https://my-mcp.vercel.app',
      description: 'My amazing MCP service',
      tools: [
        {
          name: 'my_tool',
          description: 'What my tool does',
          endpoint: '/api/mcp',
          method: 'POST'
        }
      ]
    },

    usage: {
      curl: `curl -X POST https://enhanced-context-mcp.vercel.app/api/registry/update \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"serviceKey":"my-mcp","serviceName":"My MCP",...}'`,

      vercelBuild: 'Add to vercel.json: "buildCommand": "npm run build && npm run update-registry"',

      githubAction: 'Call after successful Vercel deployment in GitHub Actions workflow'
    },

    benefits: [
      'Event-driven: Registry updates immediately on deployment',
      'Service-owned: Each MCP owns its registry entry',
      'No polling: No weekly scheduled updates needed',
      'Self-documenting: Registry always matches deployed code',
      'Atomic: Each service update is independent'
    ]
  });
}
