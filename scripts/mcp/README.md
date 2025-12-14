# VISHKAR MCP Helper Scripts

Shell scripts for calling VISHKAR MCP services. Use these instead of manual curl commands.

## Setup

```bash
# 1. Copy .env.example to your project
cp /path/to/enhanced-context-mcp/.env.example .env

# 2. Add your API key
echo "VISHKAR_API_KEY=pk_your_key_here" >> .env

# 3. Make scripts executable
chmod +x /path/to/enhanced-context-mcp/scripts/mcp/*.sh
```

## Scripts

| Script | Auth | MCP Endpoint |
|--------|------|--------------|
| `project_registry.sh` | None | project-registry-henna.vercel.app |
| `enhanced_context.sh` | X-API-Key | enhanced-context-mcp.vercel.app |
| `jira.sh` | Bearer | jira-mcp-pi.vercel.app |
| `confluence.sh` | Bearer | confluence-mcp-six.vercel.app |
| `story_crafter.sh` | X-API-Key | storycrafter-mcp.vercel.app |

## Usage

All scripts take a JSON request file as input:

```bash
./scripts/mcp/jira.sh /path/to/request.json
```

### Example: Get SDLC Guidance

```bash
cat > /tmp/sdlc.json << 'JSONEOF'
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get_sdlc_guidance",
    "arguments": { "section": "overview" }
  },
  "id": 1
}
JSONEOF

./scripts/mcp/enhanced_context.sh /tmp/sdlc.json
```

### Example: Search JIRA

```bash
cat > /tmp/search.json << 'JSONEOF'
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "search_issues",
    "arguments": { "jql": "project = MYPROJ", "maxResults": 10 }
  },
  "id": 1
}
JSONEOF

./scripts/mcp/jira.sh /tmp/search.json
```

## Environment Variables

```bash
VISHKAR_API_KEY=pk_xxx  # Required for authenticated MCPs
```
