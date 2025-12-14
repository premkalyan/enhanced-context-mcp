# Enhanced Context MCP - Consolidation Implementation Instructions

## Context

We've consolidated all VISHKAR utilities into this repository (enhanced-context-mcp) as the single source of truth. The following has been added:

- `scripts/mcp/` - Helper scripts for calling VISHKAR MCPs
- `scripts/db/` - Database query scripts  
- `scripts/setup/` - Project setup scripts
- `.standards/` - Engineering standards markdown files

## Required Changes

### 1. Update `get_engineering_standards` to Read from Files

**Current State:** Engineering standards are hardcoded in `app/api/mcp/route.ts` (around line 1430).

**Required Change:** Modify to read from `.standards/*.md` files instead of hardcoded content.

```typescript
// In route.ts or create new lib/services/StandardsService.ts

import fs from 'fs/promises';
import path from 'path';

async function loadStandardFromFile(section: string): Promise<string> {
  const filePath = path.join(process.cwd(), '.standards', `${section}.md`);
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Standards file not found: ${section}.md`);
  }
}

// Update handleEngineeringStandards function to use loadStandardFromFile
```

**Benefits:**
- Standards can be updated without code changes
- Single source of truth in `.standards/` directory
- Easier maintenance and versioning

### 2. Add `get_started` Response Update

Update the `get_started` tool response to include information about the scripts and standards:

```json
{
  "quick_start": {
    "step_4": {
      "action": "Clone helper scripts and standards",
      "command": "git clone https://github.com/premkalyan/enhanced-context-mcp.git vishkar-utils",
      "details": "Contains vishkar-utils/scripts/mcp/ for MCP helpers, vishkar-utils/.standards/ for coding standards"
    }
  },
  "utilities": {
    "helper_scripts": "vishkar-utils/scripts/mcp/*.sh - Shell scripts for calling MCPs",
    "standards": "vishkar-utils/.standards/*.md - Engineering standards for LLM reference",
    "setup": "vishkar-utils/scripts/setup/*.sh - Project setup utilities"
  }
}
```

### 3. Add New Tool: `get_helper_scripts`

Add a new tool that returns information about available helper scripts:

```typescript
{
  name: 'get_helper_scripts',
  description: 'Get information about VISHKAR helper scripts for MCP operations',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['mcp', 'db', 'setup', 'all'],
        description: 'Category of scripts to retrieve'
      }
    }
  }
}
```

### 4. Update Project Registry Instructions

When a project registers, the response should include:

```json
{
  "next_steps": [
    "1. Save your API key to .env: VISHKAR_API_KEY=pk_xxx",
    "2. Clone utilities: git clone https://github.com/premkalyan/enhanced-context-mcp.git vishkar-utils",
    "3. Use helper scripts: ./vishkar-utils/scripts/mcp/jira.sh request.json",
    "4. Read standards before implementation: vishkar-utils/.standards/"
  ]
}
```

### 5. File Structure After Changes

```
enhanced-context-mcp/
├── .standards/                  # Engineering standards (source of truth)
│   ├── README.md
│   ├── python.md
│   ├── fastapi.md
│   ├── database.md
│   ├── testing.md
│   ├── frontend.md
│   ├── security.md
│   └── code_quality.md
├── scripts/
│   ├── mcp/                     # MCP helper scripts
│   │   ├── README.md
│   │   ├── project_registry.sh
│   │   ├── enhanced_context.sh
│   │   ├── jira.sh
│   │   ├── confluence.sh
│   │   └── story_crafter.sh
│   ├── db/
│   │   └── query.sh
│   └── setup/
│       ├── register_project.sh
│       └── init_standards.sh
├── wama/                        # Existing agents, contexts, templates
├── app/api/mcp/route.ts         # Update to read from .standards/
└── lib/services/
    └── StandardsService.ts      # New service for loading standards
```

## Testing

After implementation:

1. Test `get_engineering_standards` returns content from `.standards/` files
2. Test modifying a `.standards/*.md` file and verifying the API returns updated content
3. Test helper scripts work with API key authentication
4. Verify `get_started` includes new utility information

## Notes

- The VishkarBase repository (github.com/premkalyan/VishkarBase) can be archived or redirected to this repo
- wama-enhanced-mcp-system remains separate (for local Cursor IDE MCP)
- This consolidation makes enhanced-context-mcp the single source for cloud MCP utilities
