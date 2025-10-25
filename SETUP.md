# Event-Driven Registry Setup Guide

This guide explains how to configure the event-driven MCP registry update system.

## Overview

The event-driven registry system allows each MCP service to automatically update its registry entry after successful deployment. This eliminates the need for manual updates or scheduled jobs.

## Architecture

```
MCP Service Deploy → Post-Build Hook → Registry API → GitHub Commit → Auto-Deploy Registry
```

## Required Environment Variables

### 1. Enhanced Context MCP (Registry Server)

Set these in the Vercel project settings for `enhanced-context-mcp`:

#### `REGISTRY_UPDATE_TOKEN`
- **Purpose**: Authentication token for registry update API
- **Format**: Secure random string (recommended: 32+ characters)
- **Generate**: `openssl rand -base64 32`
- **Where**: Vercel → enhanced-context-mcp → Settings → Environment Variables
- **Environments**: Production, Preview, Development

#### `GITHUB_TOKEN`
- **Purpose**: GitHub API access for committing registry updates
- **Format**: GitHub Personal Access Token (classic or fine-grained)
- **Permissions Required**:
  - `repo` (for classic tokens)
  - Repository access: `enhanced-context-mcp`
  - Permissions: `Contents: Read and Write`
- **Generate**: GitHub → Settings → Developer settings → Personal access tokens
- **Where**: Vercel → enhanced-context-mcp → Settings → Environment Variables
- **Environments**: Production, Preview, Development

### 2. MCP Services (StoryCrafter, JIRA, Confluence, etc.)

Each MCP service that wants to auto-update the registry needs:

#### `REGISTRY_UPDATE_TOKEN`
- **Purpose**: Same token as Enhanced Context MCP (for authentication)
- **Value**: Must match the token set in Enhanced Context MCP
- **Where**: Vercel → [service-name] → Settings → Environment Variables
- **Environments**: Production, Preview, Development

## Step-by-Step Setup

### Step 1: Generate Tokens

```bash
# Generate a secure REGISTRY_UPDATE_TOKEN
openssl rand -base64 32
# Example output: XyZ123abc...DEF789 (use this value)

# Create GitHub Personal Access Token
# Go to: https://github.com/settings/tokens
# Click: Generate new token → Fine-grained token
# Repository: premkalyan/enhanced-context-mcp
# Permissions: Contents (Read and Write)
# Generate token and copy it
```

### Step 2: Configure Enhanced Context MCP

1. Go to https://vercel.com/premkalyan/enhanced-context-mcp/settings/environment-variables
2. Add `REGISTRY_UPDATE_TOKEN`:
   - Key: `REGISTRY_UPDATE_TOKEN`
   - Value: [the token you generated above]
   - Environments: Production, Preview, Development
3. Add `GITHUB_TOKEN`:
   - Key: `GITHUB_TOKEN`
   - Value: [your GitHub personal access token]
   - Environments: Production, Preview, Development
4. Redeploy: Vercel → Deployments → [latest] → Redeploy

### Step 3: Configure MCP Services

For each MCP service (StoryCrafter, JIRA, Confluence):

1. Go to https://vercel.com/premkalyan/[service-name]/settings/environment-variables
2. Add `REGISTRY_UPDATE_TOKEN`:
   - Key: `REGISTRY_UPDATE_TOKEN`
   - Value: [same token from Step 2]
   - Environments: Production, Preview, Development
3. Redeploy the service

### Step 4: Verify Setup

```bash
# Test Enhanced Context MCP registry API
curl https://enhanced-context-mcp.vercel.app/api/registry/update

# Should return API documentation (not an error)

# Test with authentication (replace YOUR_TOKEN)
curl -X POST https://enhanced-context-mcp.vercel.app/api/registry/update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceKey": "test",
    "serviceName": "Test Service",
    "url": "https://test.vercel.app",
    "description": "Test",
    "tools": [{"name":"test","description":"test","endpoint":"/api","method":"POST"}]
  }'

# Should return success with commit URL
```

### Step 5: Deploy and Test

```bash
# Deploy an MCP service with registry integration
cd /path/to/storycrafter-mcp
git push origin main

# Watch Vercel deployment logs
# Should see: "✅ Registry updated successfully!"

# Verify registry was updated
curl https://enhanced-context-mcp.vercel.app/mcp-registry.json | jq '.mcpServers.storycrafter'
```

## Services Using Event-Driven Updates

### ✅ StoryCrafter MCP
- Status: Integration complete
- Script: `/scripts/update-registry.js`
- PostBuild Hook: ✅ Configured
- Environment Variable: ⚠️  Needs REGISTRY_UPDATE_TOKEN

### ⏳ JIRA MCP
- Status: Pending integration
- Next Step: Copy update-registry template and configure

### ⏳ Confluence MCP
- Status: Pending integration
- Next Step: Copy update-registry template and configure

### ⏳ Project Registry
- Status: Pending integration
- Next Step: Copy update-registry template and configure

## Troubleshooting

### Error: "REGISTRY_UPDATE_TOKEN environment variable is required"

**Cause**: Token not set in MCP service's Vercel environment

**Fix**:
1. Go to Vercel → [service] → Settings → Environment Variables
2. Add `REGISTRY_UPDATE_TOKEN` with the same value used in Enhanced Context MCP
3. Redeploy the service

### Error: "GITHUB_TOKEN not configured"

**Cause**: GitHub token not set in Enhanced Context MCP

**Fix**:
1. Generate GitHub PAT: https://github.com/settings/tokens
2. Add to Vercel → enhanced-context-mcp → Settings → Environment Variables
3. Redeploy Enhanced Context MCP

### Error: "Unauthorized"

**Cause**: Token mismatch or invalid token

**Fix**:
1. Verify tokens match between Enhanced Context MCP and MCP service
2. Regenerate token if necessary
3. Update both services and redeploy

### Deployment succeeds but registry not updated

**Cause**: `postbuild` hook not configured or failing silently

**Fix**:
1. Check package.json has `"postbuild": "npm run update-registry"`
2. Check deployment logs for registry update messages
3. Verify `REGISTRY_UPDATE_TOKEN` is set

### Registry update API returns 500 error

**Cause**: GitHub API error or invalid repository access

**Fix**:
1. Check `GITHUB_TOKEN` has correct permissions
2. Verify token has access to `enhanced-context-mcp` repository
3. Check GitHub API rate limits: https://api.github.com/rate_limit

## Security Best Practices

1. **Use Strong Tokens**: Generate tokens with `openssl rand -base64 32` or similar
2. **Rotate Regularly**: Change tokens periodically (recommended: every 90 days)
3. **Limit Permissions**: GitHub token should only have `Contents: Read and Write` for the registry repo
4. **Environment Separation**: Use different tokens for production vs. preview if needed
5. **Monitor Usage**: Check GitHub commit history for unauthorized registry updates

## Next Steps

1. Set `REGISTRY_UPDATE_TOKEN` and `GITHUB_TOKEN` in Enhanced Context MCP
2. Set `REGISTRY_UPDATE_TOKEN` in StoryCrafter MCP
3. Redeploy both services
4. Verify StoryCrafter deployment succeeds and updates registry
5. Integrate remaining MCP services (JIRA, Confluence, Project Registry)

---

**Last Updated**: October 25, 2025
**Maintained By**: Claude Code
