# Enhanced Context MCP - Tool Configuration Specification

## New Tool: `get_tool_configuration`

Add a new tool that returns the appropriate configuration/instructions for different AI coding tools.

### Tool Definition

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

### Response Format

```json
{
  "tool": "claude",
  "filename": "CLAUDE.md",
  "location": "Project root",
  "content": "... full CLAUDE.md content ...",
  "instructions": "Save this content to CLAUDE.md in your project root. Claude Code will automatically read it.",
  "other_tools": {
    "cursor": { "filename": ".cursorrules", "available": true },
    "aider": { "filename": ".aider.conf.yml", "available": true }
  }
}
```

### Standard CLAUDE.md Content

The content returned for `tool: 'claude'` should be:

```markdown
# Engineering Standards Enforcement

## MANDATORY: Read Before Implementing

Before writing ANY code, you MUST read the relevant engineering standards from `.standards/` directory.

### Pre-Implementation Checklist

| Task Type | Required Reading |
|-----------|------------------|
| Python backend | `.standards/python.md` |
| FastAPI/API routes | `.standards/fastapi.md` |
| Database/SQLAlchemy | `.standards/database.md` |
| Testing | `.standards/testing.md` |
| Security | `.standards/security.md` |
| Frontend/React | `.standards/frontend.md` |
| Refactoring | `.standards/code_quality.md` |

### Enforcement Rules (NON-NEGOTIABLE)

1. **Type Hints**: ALL functions MUST have complete type hints
2. **Async**: NEVER block the event loop - always use async/await for I/O
3. **Database**: Always use `text()` for raw SQL, use connection pooling
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

If `.standards/` directory doesn't exist, fetch from Enhanced Context MCP:
```bash
curl -X POST https://enhanced-context-mcp.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_engineering_standards","arguments":{"format":"files"}},"id":1}'
```

Or use the setup script:
```bash
./vishkar-utils/scripts/setup/init_standards.sh
```
```

### Standard .cursorrules Content

For Cursor IDE:

```markdown
# Cursor Rules - Engineering Standards

## Always Read Standards First

Before implementing any code, read the relevant standard from `.standards/`:
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
```

### Standard .aider.conf.yml Content

For Aider:

```yaml
# Aider configuration for engineering standards enforcement

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
```

## Update to 4-Angle Review Agents

The review agents should also check against standards. Update the agent prompts to include:

```
## Code Review Against Standards

When reviewing code, you MUST verify compliance with .standards/:

1. **Python Standards** (.standards/python.md)
   - Type hints present on all functions?
   - Async patterns correct (no blocking)?
   - Import ordering correct?

2. **FastAPI Standards** (.standards/fastapi.md)
   - Response models defined?
   - Dependency injection used?
   - CORS configured properly?

3. **Security Standards** (.standards/security.md)
   - Input validation with Pydantic?
   - No SQL injection vulnerabilities?
   - Secrets not hardcoded?

4. **Testing Standards** (.standards/testing.md)
   - Tests follow naming convention?
   - Appropriate markers used?
   - Fixtures properly scoped?

Flag ANY violation as a required fix, not a suggestion.
```

## Implementation in route.ts

Add handler for `get_tool_configuration`:

```typescript
case 'get_tool_configuration':
  result = handleToolConfiguration(args || {});
  break;
```

```typescript
function handleToolConfiguration(args: { tool?: string; project_type?: string; include_standards?: boolean }) {
  const { tool = 'claude', project_type = 'generic', include_standards = true } = args;
  
  const configs = {
    claude: {
      filename: 'CLAUDE.md',
      location: 'Project root',
      content: CLAUDE_MD_CONTENT, // The standard content above
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
      instructions: 'Save to .goose/config.yaml'
    }
  };
  
  if (tool === 'all') {
    return { configs, project_type, include_standards };
  }
  
  return configs[tool] || { error: 'Unknown tool' };
}
```

## Usage Flow

1. **User registers project** with Project Registry
2. **Project Registry response** includes:
   ```
   "next_steps": [
     "1. Get tool configuration: get_tool_configuration({ tool: 'claude' })",
     "2. Save CLAUDE.md to your project root",
     "3. Fetch standards: get_engineering_standards({ format: 'files' })",
     "4. Save to .standards/ directory"
   ]
   ```
3. **User saves CLAUDE.md** (or .cursorrules, etc.)
4. **AI tool reads config** and follows standards
5. **Review agents verify** code against same standards
