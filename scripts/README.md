# MCP Registry Auto-Generation

This directory contains scripts for automatically generating and maintaining the MCP registry.

## 🎯 Overview

The MCP registry (`public/mcp-registry.json`) is automatically generated from live service endpoints, ensuring it always has up-to-date tool information and URLs.

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

---

## 🤖 Automated Updates

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

*Last Updated: October 25, 2025*
*Maintained By: Claude Code*
