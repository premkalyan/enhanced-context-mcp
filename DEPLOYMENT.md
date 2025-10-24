# Deployment Guide

## WAMA Data Strategy

The repo includes all WAMA data files (contexts, templates, agents) in the `/wama` directory. You have **three deployment options**:

---

## Option 1: Use Repo Files (Recommended - Simple & Self-Contained)

✅ **Best for:** Teams who version-control their contexts/templates/agents
✅ **Pros:** No external storage needed, fast, version controlled, zero storage costs
❌ **Cons:** Updates require new deployment

### How It Works
The `HybridFileSystemAdapter` automatically:
1. Tries to read from `~/.wama` (if exists)
2. Falls back to `./wama` (repo files)

### Deployment Steps
```bash
# 1. Push to GitHub (already done)
git push origin master

# 2. In Vercel Dashboard:
#    - Import GitHub repo
#    - Set environment variables:
PROJECT_REGISTRY_URL=https://project-registry-henna.vercel.app
NODE_ENV=production

# 3. Deploy!
# The /wama directory is automatically included in the deployment
```

### Updating Files
To update contexts/templates/agents:
```bash
# Edit files locally
vim wama/agents/a-backend-engineer.md

# Commit and push
git add wama/
git commit -m "Update backend engineer agent"
git push

# Vercel auto-deploys with new files
```

**This is the default behavior - no additional configuration needed!**

---

## Option 2: Use Vercel Blob Storage (For MCP Updates)

✅ **Best for:** Dynamic updates via MCP `update_agent` tool
✅ **Pros:** Runtime updates work, MCP tools can modify files
❌ **Cons:** Requires Vercel Blob setup, storage costs

### How It Works
Files are stored in Vercel Blob and can be updated via MCP tools without redeployment.

### Deployment Steps
```bash
# 1. In Vercel Dashboard:
#    - Go to Storage tab
#    - Create new Blob Store
#    - Environment variables auto-injected:
#      BLOB_READ_WRITE_TOKEN

# 2. Set environment variable:
USE_VERCEL_BLOB=true
PROJECT_REGISTRY_URL=https://project-registry-henna.vercel.app
NODE_ENV=production

# 3. Create migration endpoint to seed initial data
```

### Seeding Vercel Blob (One-Time)
You'll need to create a migration script or API endpoint to copy files from `/wama` to Vercel Blob on first deployment.

**Example seed script:**
```typescript
// scripts/seed-vercel-blob.ts
import { put } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';

async function seedBlob() {
  const dirs = ['contexts', 'templates', 'agents'];

  for (const dir of dirs) {
    const files = await fs.readdir(`./wama/${dir}`);

    for (const file of files) {
      const content = await fs.readFile(`./wama/${dir}/${file}`, 'utf-8');
      await put(`wama/${dir}/${file}`, content, {
        access: 'public',
        contentType: 'text/plain'
      });
      console.log(`Uploaded: ${dir}/${file}`);
    }
  }
}

seedBlob();
```

### Updating Files
Use MCP `update_agent` tool:
```json
{
  "tool": "update_agent",
  "arguments": {
    "agent_name": "backend-engineer",
    "operation": "update",
    "agent_data": {
      "name": "Backend Engineer",
      "description": "Updated...",
      "content": "New content..."
    }
  }
}
```

---

## Option 3: Hybrid Approach (Best of Both Worlds)

✅ **Best for:** Version-controlled defaults + runtime customization
✅ **Pros:** Repo files as defaults, Vercel Blob for overrides
❌ **Cons:** Most complex setup

### How It Works
1. Default files in `/wama` (repo)
2. Custom overrides in Vercel Blob
3. System checks Blob first, falls back to repo

### Implementation
Requires custom logic in storage adapter to check both locations.

---

## Recommended Strategy

### For Most Teams: **Option 1 (Repo Files)**

This is already configured and working! The `HybridFileSystemAdapter`:
- ✅ Works out of the box
- ✅ Self-contained deployment
- ✅ Version controlled
- ✅ Zero storage costs
- ✅ Fast cold starts

Just set these environment variables in Vercel:
```
PROJECT_REGISTRY_URL=https://project-registry-henna.vercel.app
NODE_ENV=production
```

### For Dynamic Updates: **Option 2 (Vercel Blob)**

Add this environment variable:
```
USE_VERCEL_BLOB=true
```

Then create a seed script to populate Blob storage from `/wama`.

---

## Storage Adapter Behavior

| Environment | USE_VERCEL_BLOB | Behavior |
|-------------|-----------------|----------|
| Development | (any) | HybridFileSystem: `~/.wama` → `./wama` |
| Production | `false` or unset | HybridFileSystem: `~/.wama` → `./wama` |
| Production | `true` | VercelBlobAdapter |

---

## Caching

Agent profiles are cached in Vercel KV (Redis) with 1-hour TTL regardless of storage adapter:

| Environment | Cache |
|-------------|-------|
| Development | InMemory |
| Production | Vercel KV (auto-configured) |

---

## Testing Locally

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Test with repo files
curl http://localhost:3000/api/mcp \
  -H "X-API-Key: test" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "load_enhanced_context",
    "arguments": {
      "query_type": "story"
    }
  }'
```

The server will automatically use files from `./wama` if `~/.wama` doesn't exist.

---

## File Structure in Production

With **Option 1** (default), your Vercel deployment includes:

```
/var/task/
├── app/              # Next.js app
├── lib/              # Services & domain logic
├── wama/             # ✅ ALL DATA FILES INCLUDED
│   ├── contexts/     # 11 context files
│   ├── templates/    # 11 template files
│   └── agents/       # 32 agent files
├── config/           # Configuration
└── ...
```

---

## Migration Path

**Current Setup:** Option 1 (Repo Files) - Ready to deploy!

**To enable Option 2 later:**
1. Create Vercel Blob store
2. Set `USE_VERCEL_BLOB=true`
3. Run seed script to populate Blob
4. Redeploy

**To revert to Option 1:**
1. Remove `USE_VERCEL_BLOB` env var
2. Redeploy

---

## Summary

**You're all set with Option 1!** The repo is self-contained with all WAMA data. Just deploy to Vercel and it will work immediately using the files from the `/wama` directory.

The `update_agent` MCP tool will write to `~/.wama` in production (which won't persist between serverless invocations), so if you need persistent updates, follow Option 2 to enable Vercel Blob storage.
