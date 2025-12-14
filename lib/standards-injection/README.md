# Standards Injection for LLM Prompts

Utilities to inject engineering standards into LLM prompts. Use this in VISHKAR UI backend to ensure any LLM (Claude, GPT, Aider, Goose, etc.) follows the standards.

## Usage Patterns

### Pattern 1: Fetch from Enhanced Context MCP (Recommended)

```typescript
// TypeScript/JavaScript
async function getStandardsForTask(taskType: string): Promise<string> {
  const response = await fetch('https://enhanced-context-mcp.vercel.app/api/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.VISHKAR_API_KEY
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'get_engineering_standards',
        arguments: { section: taskType, format: 'markdown' }
      },
      id: 1
    })
  });
  
  const data = await response.json();
  return data.result?.data || '';
}

// Inject into system prompt
async function buildSystemPrompt(userTask: string): Promise<string> {
  const taskType = detectTaskType(userTask); // 'python', 'fastapi', 'testing', etc.
  const standards = await getStandardsForTask(taskType);
  
  return `You are a senior developer. Follow these engineering standards EXACTLY:

${standards}

---
Now implement the following task. Ensure ALL code follows the standards above.
`;
}
```

### Pattern 2: Read from Local .standards/ Directory

```python
# Python
import os
from pathlib import Path

def load_standards(standards_dir: str = ".standards") -> dict[str, str]:
    """Load all standards from local directory."""
    standards = {}
    standards_path = Path(standards_dir)
    
    if not standards_path.exists():
        return standards
    
    for file in standards_path.glob("*.md"):
        section = file.stem  # 'python', 'fastapi', etc.
        standards[section] = file.read_text()
    
    return standards

def get_relevant_standards(task: str, standards: dict[str, str]) -> str:
    """Get standards relevant to the task."""
    task_lower = task.lower()
    relevant = []
    
    # Always include overview
    if 'README' in standards:
        relevant.append(standards['README'])
    
    # Detect task type and include relevant standards
    if any(kw in task_lower for kw in ['test', 'pytest', 'spec']):
        relevant.append(standards.get('testing', ''))
    if any(kw in task_lower for kw in ['api', 'endpoint', 'route', 'fastapi']):
        relevant.append(standards.get('fastapi', ''))
    if any(kw in task_lower for kw in ['database', 'model', 'sqlalchemy', 'alembic']):
        relevant.append(standards.get('database', ''))
    if any(kw in task_lower for kw in ['security', 'auth', 'password']):
        relevant.append(standards.get('security', ''))
    
    # Always include Python for backend tasks
    if any(kw in task_lower for kw in ['python', 'backend', 'api', 'service']):
        relevant.append(standards.get('python', ''))
    
    return '\n\n---\n\n'.join(filter(None, relevant))

def build_system_prompt(user_task: str) -> str:
    """Build system prompt with standards injected."""
    standards = load_standards()
    relevant_standards = get_relevant_standards(user_task, standards)
    
    return f"""You are a senior developer working on an enterprise application.

## MANDATORY Engineering Standards

You MUST follow these standards EXACTLY. Non-compliance is not acceptable.

{relevant_standards}

---

## Your Task

Implement the following request while strictly adhering to all standards above.
"""
```

### Pattern 3: System Prompt Template

For any LLM backend, use this template:

```
SYSTEM PROMPT TEMPLATE
======================

You are a senior developer. Before writing ANY code, you MUST follow these engineering standards.

## Standards (NON-NEGOTIABLE)

{INJECT_STANDARDS_HERE}

## Rules

1. Read and understand ALL standards before coding
2. Every function MUST have type hints
3. Every async operation MUST use await (never block)
4. Every database query MUST use parameterized queries
5. Every API endpoint MUST have proper error handling
6. Every piece of code MUST be testable

## Enforcement

If you're unsure whether code follows standards:
1. Re-read the relevant standard section
2. Compare your code against the examples
3. If still unsure, ask for clarification

NEVER write code that violates these standards, even if asked to "just make it work quickly."
```

## Integration Points

### VISHKAR UI Backend

1. **On Task Submission**: Detect task type → Fetch relevant standards → Inject into prompt
2. **On Code Review**: Include code_quality.md and security.md standards
3. **On Test Writing**: Include testing.md standards

### Claude Code

Add to project's `CLAUDE.md`:
```markdown
## Engineering Standards (MANDATORY)
Before implementing ANY code, read `.standards/` directory.
```

### Aider

Add to `.aider.conf.yml`:
```yaml
read:
  - .standards/python.md
  - .standards/fastapi.md
  - .standards/testing.md
```

### Goose

Add to project context or system prompt:
```
Always read and follow .standards/*.md before implementing code.
```
