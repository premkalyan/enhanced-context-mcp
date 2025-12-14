# Enhanced Context MCP - Agent Implementation Instructions

## Overview

You need to implement the following changes to the Enhanced Context MCP codebase. These specs have been created and are ready for implementation.

## Priority Order

1. **TOOL_CONFIGURATIONS_SPEC.md** - New `get_tool_configuration` tool (HIGH PRIORITY)
2. **CONSOLIDATION_INSTRUCTIONS.md** - Update existing tools to read from files

---

## Task 1: Implement `get_tool_configuration` Tool

**File to modify:** `app/api/mcp/route.ts`

### Step 1.1: Add Tool Definition

In the `tools` array (around line 50-100), add:

```typescript
{
  name: 'get_tool_configuration',
  description: 'Get configuration/instructions for AI coding tools to enforce engineering standards. Returns tool-specific config (CLAUDE.md for Claude Code, .cursorrules for Cursor, etc.)',
  inputSchema: {
    type: 'object',
    properties: {
      tool: {
        type: 'string',
        enum: ['claude', 'cursor', 'aider', 'goose', 'copilot', 'all'],
        description: 'The AI coding tool to get configuration for'
      },
      project_type: {
        type: 'string',
        enum: ['python_backend', 'fastapi', 'nextjs', 'fullstack', 'generic'],
        description: 'Type of project for context-specific instructions'
      },
      include_standards: {
        type: 'boolean',
        description: 'Include full engineering standards in the config (default: true)'
      }
    },
    required: ['tool']
  }
}
```

### Step 1.2: Add Tool Handler

In the switch statement for tool handling, add:

```typescript
case 'get_tool_configuration':
  result = handleToolConfiguration(args || {});
  break;
```

### Step 1.3: Implement Handler Function

Add this function (can be in a separate file like `lib/handlers/toolConfiguration.ts`):

```typescript
const CLAUDE_MD_CONTENT = `# Engineering Standards Enforcement

## MANDATORY: Read Before Implementing

Before writing ANY code, you MUST read the relevant engineering standards from \`.standards/\` directory.

### Pre-Implementation Checklist

| Task Type | Required Reading |
|-----------|------------------|
| Python backend | \`.standards/python.md\` |
| FastAPI/API routes | \`.standards/fastapi.md\` |
| Database/SQLAlchemy | \`.standards/database.md\` |
| Testing | \`.standards/testing.md\` |
| Security | \`.standards/security.md\` |
| Frontend/React | \`.standards/frontend.md\` |
| Refactoring | \`.standards/code_quality.md\` |

### Enforcement Rules (NON-NEGOTIABLE)

1. **Type Hints**: ALL functions MUST have complete type hints
2. **Async**: NEVER block the event loop - always use async/await for I/O
3. **Database**: Always use \`text()\` for raw SQL, use connection pooling
4. **Testing**: Use pytest markers (@pytest.mark.unit, etc.), maintain 80%+ coverage
5. **Security**: Follow OWASP API Top 10, validate all inputs with Pydantic
6. **Error Handling**: Use specific exceptions, sanitize error messages

### Code Review Standards

When reviewing code, verify:
- [ ] Type hints on all functions
- [ ] No blocking calls in async functions
- [ ] Parameterized queries (no SQL injection)
- [ ] Input validation with Pydantic
- [ ] Proper error handling
- [ ] Test coverage adequate

### Getting Standards

If \`.standards/\` directory doesn't exist, clone from VISHKAR:
\`\`\`bash
git clone https://github.com/premkalyan/enhanced-context-mcp.git vishkar-utils
cp -r vishkar-utils/.standards .standards/
\`\`\`
`;

const CURSOR_RULES_CONTENT = `# Cursor Rules - Engineering Standards

## Always Read Standards First

Before implementing any code, read the relevant standard from \`.standards/\`:
- Python: .standards/python.md
- FastAPI: .standards/fastapi.md
- Database: .standards/database.md
- Testing: .standards/testing.md
- Security: .standards/security.md

## Code Quality Rules

- All functions must have type hints
- Never block async event loop
- Use parameterized queries
- Validate inputs with Pydantic
- Minimum 80% test coverage

## When Reviewing Code

Check against .standards/code_quality.md and .standards/security.md
`;

const AIDER_CONFIG_CONTENT = `# Aider configuration for engineering standards enforcement

# Always read these files for context
read:
  - .standards/README.md
  - .standards/python.md
  - .standards/testing.md

# Add standards to every prompt
auto-commits: false
attribute-author: false

# Custom instructions
extra-context: |
  IMPORTANT: Follow engineering standards in .standards/ directory.
  - All functions need type hints
  - Use async/await for I/O operations
  - Follow OWASP security guidelines
`;

const GOOSE_CONFIG_CONTENT = `# Goose configuration for engineering standards

instructions: |
  Before implementing any code, read the relevant standards from .standards/:
  - Python: .standards/python.md
  - FastAPI: .standards/fastapi.md
  - Database: .standards/database.md
  - Security: .standards/security.md

  All code must follow these standards. Non-compliance is not acceptable.
`;

function handleToolConfiguration(args: { tool?: string; project_type?: string; include_standards?: boolean }) {
  const { tool = 'claude', project_type = 'generic', include_standards = true } = args;

  const configs: Record<string, any> = {
    claude: {
      filename: 'CLAUDE.md',
      location: 'Project root',
      content: CLAUDE_MD_CONTENT,
      instructions: 'Save to CLAUDE.md in project root. Claude Code reads this automatically.'
    },
    cursor: {
      filename: '.cursorrules',
      location: 'Project root',
      content: CURSOR_RULES_CONTENT,
      instructions: 'Save to .cursorrules in project root. Cursor reads this automatically.'
    },
    aider: {
      filename: '.aider.conf.yml',
      location: 'Project root',
      content: AIDER_CONFIG_CONTENT,
      instructions: 'Save to .aider.conf.yml in project root.'
    },
    goose: {
      filename: '.goose/config.yaml',
      location: '.goose directory',
      content: GOOSE_CONFIG_CONTENT,
      instructions: 'Create .goose directory and save to .goose/config.yaml'
    },
    copilot: {
      filename: '.github/copilot-instructions.md',
      location: '.github directory',
      content: CLAUDE_MD_CONTENT, // Similar content works for Copilot
      instructions: 'Create .github directory and save to .github/copilot-instructions.md'
    }
  };

  if (tool === 'all') {
    return {
      configs,
      project_type,
      include_standards,
      clone_command: 'git clone https://github.com/premkalyan/enhanced-context-mcp.git vishkar-utils',
      standards_location: 'vishkar-utils/.standards/'
    };
  }

  const config = configs[tool];
  if (!config) {
    return { error: `Unknown tool: ${tool}. Valid options: claude, cursor, aider, goose, copilot, all` };
  }

  return {
    ...config,
    project_type,
    clone_command: 'git clone https://github.com/premkalyan/enhanced-context-mcp.git vishkar-utils',
    standards_location: 'vishkar-utils/.standards/',
    other_tools: Object.keys(configs)
      .filter(t => t !== tool)
      .reduce((acc, t) => ({ ...acc, [t]: { filename: configs[t].filename, available: true } }), {})
  };
}
```

---

## Task 2: Update `get_started` Tool Response

**File to modify:** `app/api/mcp/route.ts`

Find the `get_started` handler and update the response to include:

```typescript
// Add to the quick_start section
quick_start: {
  // ... existing steps ...
  step_4: {
    action: 'Clone VISHKAR utilities',
    command: 'git clone https://github.com/premkalyan/enhanced-context-mcp.git vishkar-utils',
    details: 'Contains engineering standards (.standards/) and helper scripts (scripts/)'
  }
},
utilities: {
  clone_command: 'git clone https://github.com/premkalyan/enhanced-context-mcp.git vishkar-utils',
  standards: 'vishkar-utils/.standards/*.md - Engineering standards for code quality',
  helper_scripts: 'vishkar-utils/scripts/mcp/*.sh - Shell scripts for calling MCPs',
  setup_scripts: 'vishkar-utils/scripts/setup/*.sh - Project setup utilities'
},
tools_available: {
  get_tool_configuration: 'Get CLAUDE.md, .cursorrules, .aider.conf.yml for AI tools',
  get_engineering_standards: 'Fetch engineering standards by section',
  // ... other tools
}
```

---

## Task 3: Update `get_engineering_standards` to Read from Files

**Current:** Standards are hardcoded in route.ts

**Required:** Read from `.standards/*.md` files

```typescript
import fs from 'fs/promises';
import path from 'path';

async function loadStandardFromFile(section: string): Promise<string> {
  const filePath = path.join(process.cwd(), '.standards', `${section}.md`);
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    // Fallback to hardcoded if file not found (for Vercel deployment)
    return getHardcodedStandard(section);
  }
}
```

**Note:** Keep hardcoded standards as fallback since Vercel may not have file system access.

---

## Task 4: Add `get_helper_scripts` Tool (Optional)

Add a tool that returns information about available helper scripts:

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

---

## Testing After Implementation

1. Test `get_tool_configuration`:
   ```bash
   curl -X POST https://enhanced-context-mcp.vercel.app/api/mcp \
     -H "Content-Type: application/json" \
     -H "X-API-Key: YOUR_KEY" \
     -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_tool_configuration","arguments":{"tool":"claude"}},"id":1}'
   ```

2. Test `get_tool_configuration` with `all`:
   ```bash
   curl -X POST https://enhanced-context-mcp.vercel.app/api/mcp \
     -H "Content-Type: application/json" \
     -H "X-API-Key: YOUR_KEY" \
     -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_tool_configuration","arguments":{"tool":"all"}},"id":1}'
   ```

3. Verify `get_started` includes new utilities info

---

## Files Reference

- Spec files are in: `Enhancements/`
  - `TOOL_CONFIGURATIONS_SPEC.md` - Full spec for get_tool_configuration
  - `CONSOLIDATION_INSTRUCTIONS.md` - Instructions for consolidation changes
  - `AGENT_INSTRUCTIONS.md` - This file

- Standards are in: `.standards/`
  - python.md, fastapi.md, database.md, testing.md, frontend.md, security.md, code_quality.md

- Helper scripts are in: `scripts/mcp/`
  - jira.sh, confluence.sh, enhanced_context.sh, project_registry.sh, story_crafter.sh
