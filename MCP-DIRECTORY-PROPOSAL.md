# MCP Directory Service - Architectural Proposal

## Problem Statement

Currently, Vishkar must **hardcode** which MCP servers exist:
```javascript
// ❌ HARDCODED: Must update code when adding new MCPs
const MCP_SERVERS = {
  projectRegistry: "https://project-registry-henna.vercel.app",
  enhancedContext: "https://enhanced-context-mcp.vercel.app",
  jira: "https://jira-mcp.vercel.app",
  confluence: "https://confluence-mcp.vercel.app"
};
```

**Issues:**
1. Cannot dynamically discover new MCPs
2. Cannot query capabilities before calling
3. No central catalog of available services
4. Hard to maintain as we add more MCPs
5. No version management for MCPs

---

## Solution: MCP Directory Service

A centralized **service registry** that:
1. Maintains catalog of all available MCP servers
2. Provides discovery API for clients (Vishkar)
3. Includes server capabilities, health status, versions
4. Supports dynamic registration
5. Follows MCP protocol standards

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VISHKAR (Client)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 1. Discover MCPs
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              MCP DIRECTORY SERVICE                           │
│                                                              │
│  - Registry of all MCP servers                              │
│  - Capabilities catalog                                     │
│  - Health monitoring                                        │
│  - Version management                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 2. Returns available MCPs
                     │
        ┌────────────┴───────────┬──────────────┬──────────────┐
        │                        │              │              │
        ▼                        ▼              ▼              ▼
┌──────────────┐    ┌──────────────┐  ┌──────────┐  ┌──────────┐
│   Project    │    │  Enhanced    │  │   JIRA   │  │Confluence│
│   Registry   │    │   Context    │  │   MCP    │  │   MCP    │
└──────────────┘    └──────────────┘  └──────────┘  └──────────┘
```

---

## MCP Directory API Specification

### Base URL
```
https://mcp-directory.vercel.app
```

### 1. List All MCPs
**Endpoint**: `GET /api/mcps`

**Response**:
```json
{
  "success": true,
  "mcps": [
    {
      "id": "project-registry",
      "name": "Project Registry",
      "description": "Central project metadata and configuration management",
      "version": "2.0.0",
      "baseUrl": "https://project-registry-henna.vercel.app",
      "category": "infrastructure",
      "status": "healthy",
      "lastHealthCheck": "2025-10-24T15:30:00.000Z",
      "capabilities": [
        "project-management",
        "api-key-management",
        "metadata-storage"
      ],
      "tools": [
        {
          "name": "list_projects",
          "description": "List all projects",
          "endpoint": "/api/projects",
          "method": "GET"
        },
        {
          "name": "create_project",
          "description": "Create new project",
          "endpoint": "/api/projects",
          "method": "POST"
        }
      ],
      "authentication": {
        "type": "bearer",
        "header": "Authorization"
      },
      "rateLimit": {
        "requests": 1000,
        "window": "1h"
      },
      "dependencies": [],
      "tags": ["core", "infrastructure", "registry"]
    },
    {
      "id": "enhanced-context",
      "name": "Enhanced Context MCP",
      "description": "Intelligent context, template, and agent selection based on task intent",
      "version": "2.0.0",
      "baseUrl": "https://enhanced-context-mcp.vercel.app",
      "category": "intelligence",
      "status": "healthy",
      "lastHealthCheck": "2025-10-24T15:30:00.000Z",
      "capabilities": [
        "context-selection",
        "template-management",
        "agent-selection",
        "sdlc-guidance"
      ],
      "tools": [
        {
          "name": "load_enhanced_context",
          "description": "Load contexts based on task intent, scope, complexity",
          "endpoint": "/api/mcp",
          "method": "POST",
          "requiredParams": ["query_type"],
          "optionalParams": ["task_intent", "scope", "complexity", "domain_focus", "include_sdlc_checks"]
        },
        {
          "name": "list_vishkar_agents",
          "description": "List all available VISHKAR agents",
          "endpoint": "/api/mcp",
          "method": "POST"
        }
      ],
      "authentication": {
        "type": "api-key",
        "header": "X-API-Key"
      },
      "rateLimit": {
        "requests": 500,
        "window": "1h"
      },
      "dependencies": ["project-registry"],
      "tags": ["core", "intelligence", "context", "orchestrator"]
    },
    {
      "id": "jira-mcp",
      "name": "JIRA MCP",
      "description": "JIRA integration for issue management (epics, stories, subtasks)",
      "version": "1.0.0",
      "baseUrl": "https://jira-mcp.vercel.app",
      "category": "integration",
      "status": "healthy",
      "lastHealthCheck": "2025-10-24T15:30:00.000Z",
      "capabilities": [
        "issue-management",
        "jira-integration",
        "workflow-automation"
      ],
      "tools": [
        {
          "name": "create_issue",
          "description": "Create JIRA issue (Epic, Story, Task, Subtask, Bug)",
          "endpoint": "/api/mcp",
          "method": "POST",
          "requiredParams": ["project_key", "issue_type", "summary"]
        },
        {
          "name": "update_issue",
          "description": "Update existing JIRA issue",
          "endpoint": "/api/mcp",
          "method": "POST",
          "requiredParams": ["issue_key"]
        },
        {
          "name": "search_issues",
          "description": "Search JIRA issues with JQL",
          "endpoint": "/api/mcp",
          "method": "POST",
          "requiredParams": ["jql"]
        }
      ],
      "authentication": {
        "type": "api-key",
        "header": "X-API-Key"
      },
      "rateLimit": {
        "requests": 300,
        "window": "1h"
      },
      "dependencies": ["project-registry", "enhanced-context"],
      "tags": ["integration", "jira", "issue-tracking"]
    },
    {
      "id": "confluence-mcp",
      "name": "Confluence MCP",
      "description": "Confluence integration for documentation management",
      "version": "1.0.0",
      "baseUrl": "https://confluence-mcp.vercel.app",
      "category": "integration",
      "status": "healthy",
      "lastHealthCheck": "2025-10-24T15:30:00.000Z",
      "capabilities": [
        "documentation-management",
        "confluence-integration",
        "page-creation"
      ],
      "tools": [
        {
          "name": "create_page",
          "description": "Create Confluence page",
          "endpoint": "/api/mcp",
          "method": "POST",
          "requiredParams": ["space_key", "title", "content"]
        },
        {
          "name": "update_page",
          "description": "Update existing Confluence page",
          "endpoint": "/api/mcp",
          "method": "POST",
          "requiredParams": ["page_id", "content"]
        },
        {
          "name": "search_pages",
          "description": "Search Confluence pages with CQL",
          "endpoint": "/api/mcp",
          "method": "POST",
          "requiredParams": ["space_key", "cql"]
        }
      ],
      "authentication": {
        "type": "api-key",
        "header": "X-API-Key"
      },
      "rateLimit": {
        "requests": 300,
        "window": "1h"
      },
      "dependencies": ["project-registry", "enhanced-context"],
      "tags": ["integration", "confluence", "documentation"]
    }
  ]
}
```

### 2. Get Specific MCP
**Endpoint**: `GET /api/mcps/:id`

**Example**: `GET /api/mcps/enhanced-context`

**Response**:
```json
{
  "success": true,
  "mcp": {
    "id": "enhanced-context",
    "name": "Enhanced Context MCP",
    "description": "Intelligent context, template, and agent selection",
    "version": "2.0.0",
    "baseUrl": "https://enhanced-context-mcp.vercel.app",
    "status": "healthy",
    "tools": [...],
    "documentation": "https://github.com/premkalyan/enhanced-context-mcp/blob/master/README.md"
  }
}
```

### 3. Query MCPs by Capability
**Endpoint**: `GET /api/mcps?capability=context-selection`

**Response**:
```json
{
  "success": true,
  "mcps": [
    {
      "id": "enhanced-context",
      "name": "Enhanced Context MCP",
      "capabilities": ["context-selection", "template-management", "agent-selection"]
    }
  ]
}
```

### 4. Query MCPs by Category
**Endpoint**: `GET /api/mcps?category=integration`

**Response**:
```json
{
  "success": true,
  "mcps": [
    { "id": "jira-mcp", "name": "JIRA MCP", "category": "integration" },
    { "id": "confluence-mcp", "name": "Confluence MCP", "category": "integration" }
  ]
}
```

### 5. Query MCPs by Tag
**Endpoint**: `GET /api/mcps?tag=core`

**Response**:
```json
{
  "success": true,
  "mcps": [
    { "id": "project-registry", "tags": ["core", "infrastructure"] },
    { "id": "enhanced-context", "tags": ["core", "intelligence"] }
  ]
}
```

### 6. Get MCP Health Status
**Endpoint**: `GET /api/mcps/:id/health`

**Response**:
```json
{
  "success": true,
  "mcp": "enhanced-context",
  "status": "healthy",
  "lastCheck": "2025-10-24T15:30:00.000Z",
  "responseTime": 145,
  "uptime": 99.9,
  "metrics": {
    "requestsPerHour": 234,
    "averageLatency": 150,
    "errorRate": 0.01
  }
}
```

### 7. Register New MCP (Admin)
**Endpoint**: `POST /api/mcps`

**Request**:
```json
{
  "id": "new-mcp",
  "name": "New MCP Service",
  "description": "Description of the service",
  "baseUrl": "https://new-mcp.vercel.app",
  "category": "integration",
  "capabilities": ["new-capability"],
  "tools": [...],
  "authentication": { "type": "api-key", "header": "X-API-Key" },
  "dependencies": ["project-registry"],
  "tags": ["new", "experimental"]
}
```

**Response**:
```json
{
  "success": true,
  "mcp": {
    "id": "new-mcp",
    "status": "registered",
    "registeredAt": "2025-10-24T15:35:00.000Z"
  }
}
```

**Authentication**: Requires admin token
```http
Authorization: Bearer <admin-token>
```

### 8. Update MCP Registration
**Endpoint**: `PUT /api/mcps/:id`

**Request**:
```json
{
  "version": "2.1.0",
  "tools": [...],
  "status": "healthy"
}
```

### 9. Deregister MCP
**Endpoint**: `DELETE /api/mcps/:id`

**Response**:
```json
{
  "success": true,
  "message": "MCP deregistered successfully"
}
```

---

## MCP Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| `infrastructure` | Core platform services | Project Registry |
| `intelligence` | Context and decision-making | Enhanced Context |
| `integration` | External system integrations | JIRA, Confluence, GitHub |
| `security` | Security and compliance | API Key Manager, Audit Service |
| `monitoring` | Observability and metrics | Logging, Tracing, Metrics |
| `data` | Data processing and storage | Database, Cache, File Storage |

---

## MCP Capabilities

| Capability | Description | MCPs |
|------------|-------------|------|
| `project-management` | Manage projects and metadata | Project Registry |
| `context-selection` | Intelligent context selection | Enhanced Context |
| `template-management` | Template storage and retrieval | Enhanced Context |
| `agent-selection` | Agent persona selection | Enhanced Context |
| `sdlc-guidance` | SDLC step guidance | Enhanced Context |
| `issue-management` | JIRA issue CRUD | JIRA MCP |
| `documentation-management` | Confluence page CRUD | Confluence MCP |
| `api-key-management` | API key generation/validation | Project Registry |

---

## Vishkar Integration Flow

### Before (Hardcoded):
```javascript
// ❌ Must know all MCPs in advance
async function createEpic() {
  const context = await fetch("https://enhanced-context-mcp.vercel.app/api/mcp", {...});
  const epic = await fetch("https://jira-mcp.vercel.app/api/mcp", {...});
}
```

### After (Discovery):
```javascript
// ✅ Dynamically discover MCPs
async function createEpic() {
  // 1. Discover available MCPs
  const directory = await fetch("https://mcp-directory.vercel.app/api/mcps");

  // 2. Find MCPs by capability
  const contextMCP = directory.mcps.find(m =>
    m.capabilities.includes("context-selection")
  );

  const jiraMCP = directory.mcps.find(m =>
    m.capabilities.includes("issue-management")
  );

  // 3. Use discovered endpoints
  const context = await fetch(`${contextMCP.baseUrl}/api/mcp`, {...});
  const epic = await fetch(`${jiraMCP.baseUrl}/api/mcp`, {...});
}
```

---

## Benefits

### 1. Dynamic Discovery
- Vishkar doesn't need to know all MCPs upfront
- New MCPs can be added without updating Vishkar
- Query by capability, not by hardcoded names

### 2. Health Monitoring
- Know which MCPs are available before calling
- Fallback to alternative MCPs if one is down
- Real-time status information

### 3. Version Management
- Track MCP versions
- Handle breaking changes gracefully
- Support multiple versions simultaneously

### 4. Dependency Management
- Know which MCPs depend on others
- Determine correct call order
- Validate dependencies before workflow

### 5. Capability-Based Routing
- Ask: "Which MCP can do context-selection?"
- Route requests to appropriate service
- Support multiple MCPs with same capability

### 6. Documentation Discovery
- Get tool schemas dynamically
- Know required/optional parameters
- Validate requests before sending

---

## Implementation Plan

### Phase 1: MCP Directory Service
**Timeline**: 2-3 days

1. Create Next.js project: `mcp-directory`
2. Implement directory API endpoints
3. Deploy to Vercel
4. Manually register 4 existing MCPs

**Files to Create**:
```
mcp-directory/
├── app/
│   └── api/
│       └── mcps/
│           ├── route.ts          # GET /api/mcps, POST /api/mcps
│           ├── [id]/
│           │   ├── route.ts      # GET /api/mcps/:id
│           │   └── health/
│           │       └── route.ts  # GET /api/mcps/:id/health
│           └── query/
│               └── route.ts      # Query by capability/category/tag
├── lib/
│   ├── registry.ts               # In-memory or Vercel KV storage
│   └── health-checker.ts         # Periodic health checks
└── types/
    └── mcp.types.ts              # MCP type definitions
```

### Phase 2: Auto-Registration
**Timeline**: 1 day

Each MCP server adds self-registration on startup:
```typescript
// In each MCP server startup
async function registerWithDirectory() {
  await fetch("https://mcp-directory.vercel.app/api/mcps", {
    method: "POST",
    headers: { "Authorization": "Bearer <server-token>" },
    body: JSON.stringify({
      id: "enhanced-context",
      name: "Enhanced Context MCP",
      baseUrl: process.env.VERCEL_URL,
      capabilities: ["context-selection", "template-management"],
      tools: TOOLS // From existing code
    })
  });
}
```

### Phase 3: Vishkar Integration
**Timeline**: 1 day

Update Vishkar to use directory:
```typescript
class VishkarMCPClient {
  private directory: MCPDirectory;

  async initialize() {
    // Load directory on startup
    this.directory = await fetch("https://mcp-directory.vercel.app/api/mcps");
  }

  async getMCP(capability: string) {
    return this.directory.mcps.find(m =>
      m.capabilities.includes(capability)
    );
  }

  async executeWorkflow() {
    // Discover MCPs dynamically
    const contextMCP = await this.getMCP("context-selection");
    const jiraMCP = await this.getMCP("issue-management");

    // Execute workflow
    // ...
  }
}
```

### Phase 4: Health Monitoring
**Timeline**: 2 days

- Periodic health checks (every 5 minutes)
- Update status in directory
- Alert on failures
- Metrics collection

---

## Storage Options

### Option 1: Vercel KV (Recommended)
```typescript
import { kv } from '@vercel/kv';

// Store MCP registration
await kv.hset('mcps', mcpId, mcpData);

// Get all MCPs
const mcps = await kv.hgetall('mcps');
```

**Pros**: Fast, serverless-friendly, persistent
**Cons**: Costs money (but minimal)

### Option 2: In-Memory + GitHub Backup
```typescript
// In-memory cache
const mcpRegistry = new Map<string, MCP>();

// Backup to GitHub (config file)
await commitToGitHub('mcp-registry.json', mcps);
```

**Pros**: Free, version controlled
**Cons**: Slower, requires rebuild on changes

### Option 3: Vercel Postgres
```typescript
// SQL table for MCPs
await sql`
  INSERT INTO mcps (id, name, baseUrl, capabilities)
  VALUES (${id}, ${name}, ${baseUrl}, ${capabilities})
`;
```

**Pros**: Relational queries, full database features
**Cons**: Overkill for simple registry

**Recommendation**: Start with Vercel KV, migrate to Postgres if needed.

---

## MCP Protocol Compliance

### Standard MCP Endpoints (All servers MUST implement):

1. **Tools List** - `GET /api/mcp`
   ```json
   { "tools": [...] }
   ```

2. **Tool Execution** - `POST /api/mcp`
   ```json
   { "tool": "tool_name", "arguments": {...} }
   ```

3. **Health Check** - `GET /api/health` or `GET /api/mcp/health`
   ```json
   { "status": "healthy", "timestamp": "..." }
   ```

### Directory-Specific Extensions:

4. **Registration Info** - `GET /api/mcp/info`
   ```json
   {
     "id": "enhanced-context",
     "name": "Enhanced Context MCP",
     "version": "2.0.0",
     "capabilities": [...],
     "dependencies": [...]
   }
   ```

---

## Example: Complete Workflow with Discovery

```typescript
// Vishkar workflow with MCP Directory
class VishkarWorkflow {
  private directory: MCPDirectory;

  async createEpicWorkflow(userRequest: string) {
    // 1. Initialize directory (once on startup)
    this.directory = await this.loadDirectory();

    // 2. Get project metadata
    const projectMCP = this.directory.getByCapability("project-management");
    const project = await this.call(projectMCP, "get_project", { id: projectId });

    // 3. Load enhanced context
    const contextMCP = this.directory.getByCapability("context-selection");
    const context = await this.call(contextMCP, "load_enhanced_context", {
      query_type: "story",
      task_intent: "create",
      scope: "epic",
      complexity: "complex"
    });

    // 4. Create JIRA epic
    const jiraMCP = this.directory.getByCapability("issue-management");
    const epic = await this.call(jiraMCP, "create_issue", {
      project_key: project.jiraProjectKey,
      issue_type: "Epic",
      summary: this.formatSummary(context.guidance),
      description: this.formatDescription(context.guidance)
    });

    // 5. Create Confluence documentation
    const confluenceMCP = this.directory.getByCapability("documentation-management");
    const doc = await this.call(confluenceMCP, "create_page", {
      space_key: project.confluenceSpaceKey,
      title: `${epic.key}: Documentation`,
      content: this.formatDocumentation(context, epic)
    });

    return { epic, doc };
  }

  private async loadDirectory() {
    const response = await fetch("https://mcp-directory.vercel.app/api/mcps");
    return new MCPDirectory(response.mcps);
  }

  private async call(mcp: MCP, tool: string, args: any) {
    const response = await fetch(`${mcp.baseUrl}/api/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [mcp.authentication.header]: this.getAuthToken(mcp)
      },
      body: JSON.stringify({ tool, arguments: args })
    });
    return response.json();
  }
}
```

---

## Security Considerations

### 1. Authentication
- Directory API requires authentication for registration
- Each MCP validates requests independently
- API keys stored securely in Project Registry

### 2. Authorization
- Only admins can register/update MCPs
- Read-only access to directory listing (public)
- Health checks authenticated via server tokens

### 3. Validation
- Validate MCP registration data
- Verify baseUrl is accessible
- Check tool schemas are valid
- Prevent duplicate registrations

### 4. Rate Limiting
- Directory API has rate limits
- Prevents DoS attacks
- Caching to reduce directory queries

---

## Monitoring & Observability

### Metrics to Track:
1. **Directory Usage**:
   - Queries per minute
   - Most-queried MCPs
   - Discovery latency

2. **MCP Health**:
   - Uptime percentage
   - Response times
   - Error rates
   - Last successful health check

3. **Registration Activity**:
   - New MCPs registered
   - Updates to existing MCPs
   - Deregistrations

### Dashboard:
- Real-time status of all MCPs
- Historical uptime graphs
- Alert on MCP failures
- Capability coverage map

---

## Future Enhancements

### 1. Smart Routing
```typescript
// Automatically route to best MCP based on load/health
const mcp = await directory.getBestMCP("issue-management", {
  preferredRegion: "us-east",
  maxLatency: 200,
  minUptime: 99.5
});
```

### 2. Versioning & Blue-Green Deployments
```typescript
// Support multiple versions
const mcpV1 = await directory.getMCP("enhanced-context", { version: "1.0.0" });
const mcpV2 = await directory.getMCP("enhanced-context", { version: "2.0.0" });

// Gradual rollout
await directory.setTrafficSplit("enhanced-context", {
  "1.0.0": 20,  // 20% traffic
  "2.0.0": 80   // 80% traffic
});
```

### 3. Circuit Breaker Pattern
```typescript
// Automatically fail over if MCP is unhealthy
const mcp = await directory.getMCPWithFallback("issue-management", {
  primary: "jira-mcp",
  fallback: "github-issues-mcp"
});
```

### 4. Capability Composition
```typescript
// Find MCPs that can satisfy multiple capabilities
const mcps = await directory.getMCPsByCapabilities([
  "context-selection",
  "template-management",
  "sdlc-guidance"
]);
```

---

## Conclusion

The MCP Directory Service provides:
- ✅ **Dynamic Discovery**: No hardcoded MCP URLs
- ✅ **Capability-Based Routing**: Query by what you need, not what exists
- ✅ **Health Monitoring**: Know status before calling
- ✅ **Version Management**: Support multiple versions
- ✅ **Extensibility**: Easy to add new MCPs
- ✅ **MCP Protocol Compliance**: Follows standards

This creates a **scalable, maintainable MCP ecosystem** where:
- New MCPs can be added without updating clients
- Vishkar discovers capabilities dynamically
- Health issues are detected proactively
- System scales as we add more MCPs

**Next Step**: Implement Phase 1 (MCP Directory Service) to enable dynamic service discovery.
