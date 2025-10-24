# MCP Registry - Simplified Approach

## Core Insight

Vishkar (LLM) already has the intelligence to choose which MCP to use. We just need to tell it:
1. What MCPs exist
2. Where they are (URLs)
3. What tools they provide

The LLM will intelligently decide which to call based on context.

---

## Solution: Simple MCP Registry Endpoint

### Central Configuration Endpoint

**URL**: Any of our MCPs can serve this, or create a simple static endpoint

**Endpoint**: `GET /api/mcp-registry`

**Response**:
```json
{
  "mcpServers": {
    "project-registry": {
      "name": "Project Registry",
      "url": "https://project-registry-henna.vercel.app",
      "description": "Manage project metadata, API keys, and configuration",
      "transport": "http",
      "tools": [
        {
          "name": "list_projects",
          "description": "List all registered projects"
        },
        {
          "name": "get_project",
          "description": "Get project by ID including JIRA key, Confluence space"
        },
        {
          "name": "create_project",
          "description": "Create a new project with metadata"
        },
        {
          "name": "validate_token",
          "description": "Validate API token"
        }
      ]
    },
    "enhanced-context": {
      "name": "Enhanced Context MCP",
      "url": "https://enhanced-context-mcp.vercel.app",
      "description": "Intelligent context, template, and agent selection based on task intent, scope, and complexity. Provides SDLC guidance and quality checks.",
      "transport": "http",
      "tools": [
        {
          "name": "load_enhanced_context",
          "description": "Load contexts, templates, and agents based on task intent (create/refine/breakdown/review), scope (epic/story), complexity (simple/complex), and domain focus (security/payments/etc). Returns structured guidance with quality checks, common mistakes, and best practices."
        },
        {
          "name": "list_vishkar_agents",
          "description": "List all available VISHKAR agent profiles"
        },
        {
          "name": "load_vishkar_agent",
          "description": "Load specific agent profile by ID"
        }
      ]
    },
    "jira": {
      "name": "JIRA MCP",
      "url": "https://jira-mcp.vercel.app",
      "description": "Create, update, and manage JIRA issues (epics, stories, tasks, subtasks, bugs). Search issues with JQL.",
      "transport": "http",
      "tools": [
        {
          "name": "create_issue",
          "description": "Create JIRA issue (Epic, Story, Task, Subtask, Bug) with proper format, acceptance criteria, and linking"
        },
        {
          "name": "update_issue",
          "description": "Update existing JIRA issue fields, status, assignee"
        },
        {
          "name": "get_issue",
          "description": "Get JIRA issue details by key"
        },
        {
          "name": "search_issues",
          "description": "Search JIRA issues using JQL (JIRA Query Language)"
        },
        {
          "name": "add_comment",
          "description": "Add comment to JIRA issue"
        },
        {
          "name": "link_issues",
          "description": "Link two JIRA issues (blocks, depends on, relates to)"
        },
        {
          "name": "transition_issue",
          "description": "Transition issue to different status (To Do, In Progress, Done)"
        }
      ]
    },
    "confluence": {
      "name": "Confluence MCP",
      "url": "https://confluence-mcp.vercel.app",
      "description": "Create, update, and manage Confluence documentation pages. Upload attachments and search pages.",
      "transport": "http",
      "tools": [
        {
          "name": "create_page",
          "description": "Create Confluence page with title, content, and optional parent"
        },
        {
          "name": "update_page",
          "description": "Update existing Confluence page content"
        },
        {
          "name": "get_page",
          "description": "Get Confluence page details by ID"
        },
        {
          "name": "search_pages",
          "description": "Search Confluence pages using CQL (Confluence Query Language)"
        },
        {
          "name": "upload_attachment",
          "description": "Upload file attachment to Confluence page"
        },
        {
          "name": "add_page_comment",
          "description": "Add comment to Confluence page"
        }
      ]
    }
  }
}
```

---

## How Vishkar Uses This

### 1. Load Registry on Startup

```javascript
// Vishkar initialization
class Vishkar {
  private mcpRegistry: MCPRegistry;

  async initialize() {
    // Load registry from configuration endpoint
    const response = await fetch("https://enhanced-context-mcp.vercel.app/api/mcp-registry");
    this.mcpRegistry = response.mcpServers;

    // Now Vishkar knows all available MCPs and their tools
    console.log("Loaded MCPs:", Object.keys(this.mcpRegistry));
  }
}
```

### 2. LLM Decides Which MCP to Call

**User Request**: "Create an epic for payment processing"

**Vishkar's Decision Process** (LLM reasoning):
```
1. Analyze request: Need to create a JIRA epic
2. Look at available MCPs:
   - project-registry: Has metadata tools ✓ (need this first for project key)
   - enhanced-context: Has context selection tools ✓ (need guidance on epic format)
   - jira: Has create_issue tool ✓ (this is what I need!)
   - confluence: Has page creation tools (not needed yet)
3. Decide call sequence:
   Step 1: Call project-registry.get_project (get JIRA key)
   Step 2: Call enhanced-context.load_enhanced_context (get epic format guidance)
   Step 3: Call jira.create_issue (create the epic)
```

**No explicit routing logic needed!** The LLM understands from:
- Tool descriptions
- Context of the request
- Its general knowledge of workflows

### 3. Execute Calls

```javascript
async function handleUserRequest(request: string) {
  // LLM decides: "I need project metadata first"
  const project = await this.call(
    this.mcpRegistry["project-registry"],
    "get_project",
    { id: projectId }
  );

  // LLM decides: "I need epic creation guidance"
  const context = await this.call(
    this.mcpRegistry["enhanced-context"],
    "load_enhanced_context",
    {
      query_type: "story",
      task_intent: "create",
      scope: "epic",
      complexity: "complex"
    }
  );

  // LLM decides: "Now I can create the epic"
  const epic = await this.call(
    this.mcpRegistry["jira"],
    "create_issue",
    {
      project_key: project.jiraProjectKey,
      issue_type: "Epic",
      summary: `${context.guidance.epicPrefixFormat}: Payment Processing`,
      description: this.formatDescription(context.guidance)
    }
  );

  return epic;
}
```

---

## Where to Host This Registry

### Option 1: Static JSON in Each MCP (Simplest)

Each MCP has an endpoint that returns the full registry:

```typescript
// In enhanced-context-mcp/app/api/mcp-registry/route.ts
export async function GET() {
  return NextResponse.json({
    mcpServers: {
      "project-registry": { ... },
      "enhanced-context": { ... },
      "jira": { ... },
      "confluence": { ... }
    }
  });
}
```

**Pros**: Simple, no extra infrastructure
**Cons**: Must update all MCPs when adding new one

### Option 2: Centralized Static File (Recommended)

Host a static `mcp-registry.json` file that Vishkar loads:

```
https://enhanced-context-mcp.vercel.app/mcp-registry.json
```

**Pros**: Single source of truth, easy to update
**Cons**: Static, requires redeployment to update

### Option 3: Dynamic Registry (Project Registry)

Add to Project Registry (already central):

```typescript
// In project-registry/app/api/mcp-registry/route.ts
export async function GET() {
  // Can be dynamic, stored in Vercel KV
  const registry = await kv.get("mcp-registry");
  return NextResponse.json(registry);
}
```

**Pros**: Dynamic, can update without redeployment
**Cons**: Adds dependency on Project Registry

**Recommendation**: **Option 2 or 3** - Either static file or dynamic from Project Registry

---

## Example: Complete Workflow

### User Says: "Create a payment processing epic with security requirements"

### Vishkar's Reasoning (Automatic):

```
Analysis:
- User wants to CREATE an EPIC
- Domain: payments, security
- Need: JIRA integration

Available MCPs:
- project-registry: For getting project JIRA key
- enhanced-context: For epic format and security guidance
- jira: For creating the epic
- confluence: Not needed for this task

Call Sequence (I decide this):
1. project-registry.get_project → Get JIRA key
2. enhanced-context.load_enhanced_context → Get guidance
3. jira.create_issue → Create epic
```

### Vishkar Executes:

```javascript
// 1. Get project metadata
const project = await mcp["project-registry"].call("get_project", { id: "proj_123" });

// 2. Load enhanced context with domain focus
const context = await mcp["enhanced-context"].call("load_enhanced_context", {
  query_type: "story",
  task_intent: "create",
  scope: "epic",
  complexity: "complex",
  domain_focus: ["security", "payments"]
});

// 3. Create JIRA epic using guidance
const epic = await mcp["jira"].call("create_issue", {
  project_key: project.jiraProjectKey,
  issue_type: "Epic",
  summary: `${context.guidance.epicPrefixFormat}: Payment Processing System`,
  description: formatWithGuidance(context),
  labels: ["payments", "security", "epic"]
});

// Done! LLM decided all of this automatically
```

---

## Comparison with Over-Engineered Approach

### Over-Engineered (My Previous Proposal):
```javascript
// ❌ Too complex
const contextMCP = directory.getMCPByCapability("context-selection");
const jiraMCP = directory.getMCPByCapability("issue-management");
// Explicit routing logic, capability matching, etc.
```

### Simple (Your Insight):
```javascript
// ✅ Simple - LLM decides
const registry = loadMCPRegistry();
// LLM: "User wants to create JIRA epic, I'll call jira MCP's create_issue tool"
await registry["jira"].call("create_issue", { ... });
```

---

## Implementation

### Step 1: Create Registry File (5 minutes)

```json
// public/mcp-registry.json or API endpoint
{
  "mcpServers": {
    "project-registry": {
      "name": "Project Registry",
      "url": "https://project-registry-henna.vercel.app",
      "description": "Manage project metadata and API keys",
      "tools": [...]
    },
    "enhanced-context": { ... },
    "jira": { ... },
    "confluence": { ... }
  }
}
```

### Step 2: Vishkar Loads Registry (10 minutes)

```typescript
// In Vishkar initialization
const registry = await fetch("https://enhanced-context-mcp.vercel.app/mcp-registry.json");
this.availableMCPs = registry.mcpServers;
```

### Step 3: That's It! (LLM handles the rest)

When user makes a request:
1. LLM analyzes request
2. LLM looks at available MCPs and tools
3. LLM decides which MCP(s) to call
4. LLM executes calls in appropriate order

**No explicit routing logic needed!**

---

## Key Advantages

### 1. Leverages LLM Intelligence
- LLM already knows how to analyze requests
- LLM understands tool descriptions
- LLM can plan multi-step workflows
- No need for complex routing logic

### 2. Simple to Implement
- Just a JSON configuration file
- No complex service discovery
- No health monitoring infrastructure
- Easy to add new MCPs (just update JSON)

### 3. Flexible
- LLM can handle edge cases
- Can do complex multi-MCP workflows
- Adapts to new MCPs automatically
- No hardcoded routing rules

### 4. Follows MCP Protocol
- Same pattern as Cursor/Claude Code
- Standard MCP configuration format
- Compatible with existing tools

---

## How It Works Like Cursor/Claude Code

### In Cursor (Today):
```json
// ~/.cursor/mcp.json
{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": ["/path/to/filesystem-mcp/index.js"]
    },
    "github": {
      "command": "node",
      "args": ["/path/to/github-mcp/index.js"]
    }
  }
}
```

**I (Claude) see this config and decide:**
- User wants to read a file? → Use filesystem MCP
- User wants to create a PR? → Use github MCP

### For Vishkar (Same Pattern):
```json
// mcp-registry.json
{
  "mcpServers": {
    "project-registry": {
      "url": "https://project-registry-henna.vercel.app"
    },
    "jira": {
      "url": "https://jira-mcp.vercel.app"
    }
  }
}
```

**Vishkar sees this and decides:**
- User wants to create an epic? → Use jira MCP
- User needs epic format? → Use enhanced-context MCP first

**Same intelligence, different deployment model (HTTP vs local).**

---

## Update to VISHKAR-MCP-INTEGRATION-GUIDE.md

Add this section at the beginning:

```markdown
## MCP Discovery

Vishkar automatically discovers available MCPs by loading the registry:

**Registry URL**: `https://enhanced-context-mcp.vercel.app/api/mcp-registry`

On startup, Vishkar:
1. Loads the MCP registry
2. Understands all available tools
3. Intelligently decides which MCP to call based on context

You don't need to explicitly route to MCPs. Just make requests naturally:
- "Create an epic for payments" → Vishkar calls jira MCP
- "Get project configuration" → Vishkar calls project-registry MCP
- "I need architecture guidance" → Vishkar calls enhanced-context MCP

The LLM handles routing automatically based on tool descriptions.
```

---

## Summary

**Your insight is correct**: We don't need complex capability-based routing. The LLM (Vishkar) already has the intelligence to:

1. Understand user requests
2. Look at available MCPs and tools
3. Decide which MCP to call
4. Execute multi-step workflows

We just need:
- ✅ A simple registry (JSON file or API endpoint)
- ✅ List of MCPs with URLs and tool descriptions
- ✅ That's it!

**Much simpler than my over-engineered service discovery proposal!**

This follows the exact same pattern as Cursor/Claude Code's `mcp.json` configuration, adapted for HTTP-based MCPs instead of local stdio.

Should I create the simple `mcp-registry.json` file?
