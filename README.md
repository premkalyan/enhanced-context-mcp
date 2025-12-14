# VISHKAR Utils

Engineering standards and helper scripts for VISHKAR ecosystem projects.

## Quick Start

```bash
# Clone to hidden .vishkar-utils folder
git clone -b utils-only https://github.com/premkalyan/enhanced-context-mcp.git .vishkar-utils

# Copy standards to your project
cp -r .vishkar-utils/.standards .standards/
```

## Contents

```
.vishkar-utils/
├── .standards/           # Engineering standards (copy to your project)
│   ├── python.md         # Python coding standards
│   ├── fastapi.md        # FastAPI patterns
│   ├── database.md       # SQLAlchemy/Alembic
│   ├── testing.md        # pytest configuration
│   ├── frontend.md       # Next.js/React
│   ├── security.md       # OWASP API Top 10
│   └── code_quality.md   # SOLID, DRY principles
├── scripts/
│   ├── mcp/              # MCP helper scripts
│   │   ├── jira.sh
│   │   ├── confluence.sh
│   │   ├── enhanced_context.sh
│   │   └── project_registry.sh
│   └── setup/            # Project setup scripts
│       └── init_standards.sh
├── lib/
│   └── standards-injection/  # TypeScript utils for LLM prompts
└── Enhancements/         # Implementation specs (reference)
```

## Usage

### 1. Copy Standards to Your Project

```bash
cp -r .vishkar-utils/.standards .standards/
```

### 2. Use MCP Helper Scripts

```bash
# Set API key
export VISHKAR_API_KEY=pk_xxx

# Call JIRA MCP
./.vishkar-utils/scripts/mcp/jira.sh /tmp/request.json
```

### 3. Get AI Tool Configuration

Use Enhanced Context MCP to get CLAUDE.md, .cursorrules, etc.:

```bash
curl -X POST https://enhanced-context-mcp.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $VISHKAR_API_KEY" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_tool_configuration","arguments":{"tool":"claude"}},"id":1}'
```

## For Full MCP Server

This branch contains only utilities. For the full Enhanced Context MCP server, use the `master` branch:

```bash
git clone https://github.com/premkalyan/enhanced-context-mcp.git
```
