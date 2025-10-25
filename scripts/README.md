# MCP Registry Auto-Generation

This directory contains scripts for automatically generating and maintaining the MCP registry.

## 🎯 Overview

The MCP registry (`public/mcp-registry.json`) uses an **event-driven architecture** where each MCP service owns and updates its own registry entry after successful deployment. This ensures the registry always reflects live service capabilities.

### 🚀 How It Works (Event-Driven - Option 4)

1. **MCP Service Deploys** → Vercel or CI/CD builds the service
2. **Post-Build Hook** → Calls `update-registry.js` script
3. **Registry API** → Service sends tool metadata to `/api/registry/update`
4. **GitHub Commit** → API updates `mcp-registry.json` and commits to repo
5. **Auto-Deploy** → Vercel detects commit and deploys updated registry

**Benefits:**
- ✅ Immediate updates (no waiting for scheduled jobs)
- ✅ Service ownership (each MCP controls its entry)
- ✅ Self-documenting (registry matches deployed code)
- ✅ No polling required (event-driven)

---

## 📝 Scripts

### `generate-registry.js`

Fetches tool information from all deployed MCP services and generates `mcp-registry.json`.

**Usage:**
```bash
# Manual generation
node scripts/generate-registry.js

# Or via npm
npm run generate-registry
```

**What it does:**
1. Fetches tool lists from each MCP service
2. Combines service metadata with live tool information
3. Generates formatted JSON registry
4. Writes to `public/mcp-registry.json`

**Output:**
```
🔄 Generating MCP Registry from live services...

📡 Fetching Project Registry...
   ✅ 6 tools registered

📡 Fetching Enhanced Context MCP...
   ✅ 6 tools registered

📡 Fetching JIRA MCP...
   ✅ 11 tools registered

📡 Fetching Confluence MCP...
   ✅ 10 tools registered

📡 Fetching StoryCrafter MCP...
   ✅ 2 tools registered

✅ Registry generated successfully!
📝 Written to: public/mcp-registry.json
📊 Total services: 5
📊 Total tools: 35
```

### `update-registry-template.js`

A reusable template script that MCP services can copy and customize to update their registry entry.

**Usage:**
1. Copy `update-registry-template.js` to your MCP service repo
2. Customize the `SERVICE_CONFIG` section
3. Add to your build process (see Integration Guide below)

---

## 🔗 Integration Guide

### Adding Registry Updates to Your MCP Service

Follow these steps to make your MCP service automatically update the registry after deployment:

#### Step 1: Copy Update Script

```bash
# From your MCP service repository
mkdir -p scripts
curl -o scripts/update-registry.js https://raw.githubusercontent.com/premkalyan/enhanced-context-mcp/master/scripts/update-registry-template.js
chmod +x scripts/update-registry.js
```

#### Step 2: Customize Configuration

Edit `scripts/update-registry.js` and update the `SERVICE_CONFIG`:

```javascript
const SERVICE_CONFIG = {
  serviceKey: 'my-service',           // Unique identifier
  serviceName: 'My MCP Service',       // Display name
  description: 'What your service does',
  transport: 'http',
  authentication: {
    type: 'api-key',                   // none | api-key | bearer
    header: 'X-API-Key',
    note: 'Auth instructions'
  },
  tools: [
    {
      name: 'my_tool',
      description: 'What this tool does',
      endpoint: '/api/mcp',
      method: 'POST'
    }
  ]
};
```

#### Step 3: Add npm Script

Add to your `package.json`:

```json
{
  "scripts": {
    "update-registry": "node scripts/update-registry.js",
    "postbuild": "npm run update-registry"
  }
}
```

The `postbuild` script runs automatically after `npm run build` completes successfully.

#### Step 4: Set Environment Variable

Add `REGISTRY_UPDATE_TOKEN` to your deployment environment:

**Vercel:**
1. Go to your project settings
2. Environment Variables
3. Add: `REGISTRY_UPDATE_TOKEN` = `<token>`
4. Select Production, Preview, and Development

**GitHub Actions:**
```yaml
env:
  REGISTRY_UPDATE_TOKEN: ${{ secrets.REGISTRY_UPDATE_TOKEN }}
```

#### Step 5: Test Locally

```bash
export REGISTRY_UPDATE_TOKEN="your_token_here"
npm run build
# Should see: "✅ Registry updated successfully!"
```

#### Step 6: Deploy and Verify

```bash
git add scripts/ package.json
git commit -m "feat: add automatic registry updates"
git push
# Vercel will deploy and update registry automatically
```

---

### Example: StoryCrafter Integration

See `/Users/premkalyan/code/mcp/storycrafter-mcp/scripts/update-registry.js` for a complete working example with:
- Custom service configuration
- 2 tools (generate_backlog, get_backlog_summary)
- Integrated with Vercel deployment
- Automatic updates on every build

---

## 🤖 Automated Updates (Legacy)

### GitHub Actions Workflow

**File:** `.github/workflows/update-registry.yml`

**Triggers:**
1. **Manual:** Via GitHub Actions UI (workflow_dispatch)
2. **Scheduled:** Every Monday at 9 AM UTC
3. **Webhook:** When services deploy (repository_dispatch)

**Process:**
1. Checks out repository
2. Installs dependencies
3. Runs `npm run generate-registry`
4. Checks for changes in `mcp-registry.json`
5. Commits and pushes if changed
6. Auto-deploys to Vercel

### Manual Trigger

```bash
# Via GitHub CLI
gh workflow run update-registry.yml

# Or via GitHub UI:
# Actions → Update MCP Registry → Run workflow
```

### Webhook Trigger

To trigger from another service (e.g., when a service deploys):

```bash
curl -X POST \
  https://api.github.com/repos/premkalyan/enhanced-context-mcp/dispatches \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event_type":"update-registry","client_payload":{"service":"jira-mcp"}}'
```

---

## 🔧 Adding New Services

To add a new MCP service to the registry:

1. **Edit `generate-registry.js`**

```javascript
const SERVICES = {
  // ... existing services
  'my-new-service': {
    name: 'My New Service MCP',
    url: 'https://my-new-service.vercel.app',
    description: 'Description of what this service does',
    transport: 'http',
    authentication: {
      type: 'api-key',
      header: 'X-API-Key',
      note: 'Auth notes'
    },
    toolsEndpoint: '/api/mcp', // Set to null for manual tools
    toolsMethod: 'POST',
    toolsPayload: { method: 'tools/list' }
  }
};
```

2. **Regenerate registry**

```bash
npm run generate-registry
```

3. **Commit changes**

```bash
git add scripts/generate-registry.js public/mcp-registry.json
git commit -m "feat: add My New Service to MCP registry"
git push
```

---

## 📊 Registry Format

The generated registry follows this structure:

```json
{
  "version": "1.3.0",
  "lastUpdated": "2025-10-25T17:50:00.000Z",
  "mcpServers": {
    "service-key": {
      "name": "Service Name",
      "url": "https://service.vercel.app",
      "description": "Service description",
      "transport": "http",
      "authentication": {
        "type": "api-key",
        "header": "X-API-Key",
        "note": "Usage notes"
      },
      "tools": [
        {
          "name": "tool_name",
          "description": "What the tool does",
          "endpoint": "/api/mcp",
          "method": "POST"
        }
      ]
    }
  }
}
```

---

## 🚀 Deployment Flow

```
Service Update → Vercel Deploy → Webhook (optional) → GitHub Action
                                                              ↓
                                            Generate Registry (fetch tools)
                                                              ↓
                                            Commit to repo (if changed)
                                                              ↓
                                            Vercel auto-deploy → Live Registry
```

---

## ✅ Benefits

1. **Always Up-to-Date:** Registry reflects live service capabilities
2. **No Manual Updates:** Tools automatically discovered
3. **Version Control:** Changes tracked in git history
4. **Automated:** Weekly refresh + on-demand updates
5. **Verifiable:** Can see exactly what tools are available

---

## 🔍 Troubleshooting

### Script fails to fetch tools

**Issue:** Service requires authentication or returns error

**Solution:** Add tools manually in `SERVICES` config:
```javascript
tools: [
  {
    name: 'tool_name',
    description: 'Description',
    endpoint: '/api/endpoint',
    method: 'POST'
  }
]
```

### GitHub Action fails

**Check:**
1. Repository has write permissions
2. Node.js dependencies install correctly
3. Service URLs are accessible
4. GitHub Actions is enabled

### Registry not deploying

**Vercel auto-deploys on push to master/main:**
1. Check Vercel dashboard for deployment status
2. Verify GitHub integration is connected
3. Check build logs for errors

---

## 📚 Related Files

- `public/mcp-registry.json` - Generated registry (committed to repo)
- `.github/workflows/update-registry.yml` - GitHub Action
- `package.json` - npm scripts for generation

---

## 🎓 Examples

### Update registry after service deployment

```bash
# After deploying a new version of JIRA MCP
npm run generate-registry
git add public/mcp-registry.json
git commit -m "chore: update registry with new JIRA MCP tools"
git push
```

### Check what would change

```bash
# Generate new registry
npm run generate-registry

# See diff
git diff public/mcp-registry.json
```

### Force update via GitHub Actions

```bash
gh workflow run update-registry.yml \
  -f reason="Added new tools to StoryCrafter"
```

---

## 🔐 Registry Update API

The central API endpoint that receives registry updates from MCP services.

### Endpoint

```
POST https://enhanced-context-mcp.vercel.app/api/registry/update
```

### Authentication

```
Authorization: Bearer <REGISTRY_UPDATE_TOKEN>
```

Contact the admin to obtain the `REGISTRY_UPDATE_TOKEN`.

### Request Body

```json
{
  "serviceKey": "string (required)",
  "serviceName": "string (required)",
  "url": "string (required)",
  "description": "string (required)",
  "transport": "string (optional, default: http)",
  "authentication": {
    "type": "string (required)",
    "header": "string (optional)",
    "note": "string (optional)"
  },
  "tools": [
    {
      "name": "string (required)",
      "description": "string (required)",
      "endpoint": "string (required)",
      "method": "string (required)"
    }
  ]
}
```

### Response (Success)

```json
{
  "success": true,
  "message": "Registry updated successfully for My Service",
  "commitUrl": "https://github.com/premkalyan/enhanced-context-mcp/commit/abc123",
  "service": "my-service",
  "toolsCount": 5,
  "timestamp": "2025-10-25T18:00:00.000Z"
}
```

### Response (Error)

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Valid REGISTRY_UPDATE_TOKEN required"
}
```

### Example with curl

```bash
curl -X POST https://enhanced-context-mcp.vercel.app/api/registry/update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceKey": "my-mcp",
    "serviceName": "My MCP Service",
    "url": "https://my-mcp.vercel.app",
    "description": "My amazing MCP service",
    "tools": [
      {
        "name": "my_tool",
        "description": "What my tool does",
        "endpoint": "/api/mcp",
        "method": "POST"
      }
    ]
  }'
```

### How It Works

1. **Authentication**: Validates bearer token
2. **Validation**: Checks required fields (serviceKey, serviceName, url, tools)
3. **GitHub Fetch**: Gets current `mcp-registry.json` from repository
4. **Update**: Merges service entry into registry
5. **Version**: Auto-increments patch version (e.g., 1.3.0 → 1.3.1)
6. **Commit**: Creates commit with updated registry
7. **Deploy**: Vercel auto-deploys updated registry

### API Documentation

```bash
# View API documentation
curl https://enhanced-context-mcp.vercel.app/api/registry/update
```

---

## 📋 Quick Reference

### For MCP Service Developers

**To integrate registry updates:**
1. Copy `update-registry-template.js` to your repo
2. Customize service config
3. Add `postbuild` script to package.json
4. Set `REGISTRY_UPDATE_TOKEN` in Vercel
5. Deploy and verify

**To manually update registry:**
```bash
export REGISTRY_UPDATE_TOKEN="your_token"
node scripts/update-registry.js
```

**To test the API:**
```bash
node scripts/test-registry-update.js
```

### For Registry Maintainers

**To generate registry manually:**
```bash
npm run generate-registry
```

**To update and commit:**
```bash
npm run update-registry
git push
```

**To trigger GitHub Action:**
```bash
gh workflow run update-registry.yml
```

---

*Last Updated: October 25, 2025*
*Maintained By: Claude Code*
