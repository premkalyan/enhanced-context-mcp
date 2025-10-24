# WAMA Data Files

This directory contains all the WAMA (Workflow Automation and Management Architecture) data files used by the Enhanced Context MCP Server.

## Directory Structure

```
wama/
├── contexts/      # Context files (.mdc) - SDLC workflows, best practices
├── templates/     # Template files (.md) - VISHKAR templates for structured output
└── agents/        # Agent profile files (.md) - Specialized AI agent personas
```

## Contents

### Contexts (11 files)
Context files provide domain knowledge and best practices:
- `c-core-sdlc.mdc` - Core SDLC principles
- `c-jira-management.mdc` - JIRA workflows
- `c-testing-strategy.mdc` - Testing methodologies
- `c-pr-review.mdc` - Pull request review guidelines
- `c-architecture-generation.mdc` - Architecture patterns
- `c-git-workflows.mdc` - Git workflows
- `c-confluence-docs.mdc` - Documentation standards
- `c-browser-tools-testing.mdc` - Browser automation
- `c-infrastructure-as-code.mdc` - IaC best practices
- `c-cloud-data-engineering.mdc` - Cloud data patterns
- And more...

### Templates (11 files)
Template files provide structured formats for output:
- `t-epic-specification.md` - Epic/user story format
- `t-test-plan.md` - Test planning template
- `t-technical-architecture.md` - Architecture documentation
- `t-project-plan.md` - Project planning format
- `t-story-breakdown.md` - Story breakdown template
- `t-confluence-page.md` - Confluence page structure
- `t-flow-diagrams.md` - Flow diagram guidelines
- `t-infrastructure-diagrams.md` - Infrastructure diagrams
- `t-terraform-module.md` - Terraform module template
- `t-data-lake-architecture.md` - Data lake design
- And more...

### Agents (32 files)
Agent profile files define specialized AI personas:

**Frontend Specialists:**
- `a-frontend-developer.md` - React/Next.js expert
- `a-frontend-engineer.md` - Component architecture specialist
- `a-frontend-security-coder.md` - Frontend security expert

**Backend Specialists:**
- `a-backend-engineer.md` - API development expert
- `a-backend-architect.md` - Backend architecture design
- `a-backend-security-coder.md` - Backend security specialist
- `a-fastapi-pro.md` - FastAPI expert

**Cloud & Infrastructure:**
- `a-cloud-architect.md` - Multi-cloud architecture expert
- `a-deployment-engineer.md` - CI/CD and GitOps specialist
- `a-terraform-specialist.md` - IaC expert
- `a-data-engineer.md` - Data pipeline specialist

**Quality & Security:**
- `a-code-reviewer.md` - Code quality expert
- `a-security-auditor.md` - Security audit specialist
- `a-performance-engineer.md` - Performance optimization expert
- `a-test-automator.md` - Test automation specialist

**Architecture & Review:**
- `a-architect-review.md` - System architecture reviewer
- `a-pr-orchestrator.md` - Pull request orchestration
- `a-prompt-engineer.md` - AI prompt optimization

**Languages & Frameworks:**
- `a-javascript-pro.md` - JavaScript/Node.js expert
- `a-typescript-pro.md` - TypeScript expert
- `a-python-expert.md` - Python specialist

**Project Management:**
- `a-project-manager.md` - Agile project management
- `a-documentation-specialist.md` - Technical documentation

And more specialized agents...

## Usage in Development

In local development, the server uses `FileSystemAdapter` which reads from `~/.wama`:
```typescript
const wamaDir = path.join(os.homedir(), '.wama');
```

## Usage in Production (Vercel)

For production deployment, we have **three options**:

### Option 1: Read from Repo Files (Recommended for Read-Only)
- Simple and straightforward
- Files are version controlled
- Updates require new deployment
- Zero Vercel Blob storage costs
- Fast cold starts (files in deployment bundle)

### Option 2: Seed Vercel Blob from Repo (Recommended for Updates)
- Files copied to Vercel Blob on first deployment
- MCP `update_agent` tool can modify files
- Version controlled defaults
- Requires Vercel Blob storage
- Best balance of flexibility and control

### Option 3: Manual Upload to Vercel Blob
- Users upload their own contexts/templates/agents
- Fully customizable per deployment
- No repo files used in production
- Most flexible but requires manual setup

## Updating Files

The MCP server includes an `update_agent` tool that can update agent files:
```json
{
  "tool": "update_agent",
  "arguments": {
    "agent_name": "backend-engineer",
    "operation": "update",
    "agent_data": {
      "name": "Backend Engineer",
      "description": "Updated description",
      "content": "Updated content..."
    }
  }
}
```

## File Formats

### Context Files (.mdc)
Markdown with context-specific formatting:
```markdown
# Context Name

## Purpose
Description of what this context provides

## Content
The actual context information...
```

### Template Files (.md)
Markdown templates with variable placeholders:
```markdown
# {{title}}

## Description
{{description}}

## Variables
- {{variable1}}
- {{variable2}}
```

### Agent Files (.md)
YAML frontmatter + markdown content:
```markdown
---
name: Agent Name
type: technical
specializations: [frontend, react]
model: sonnet
---

# Agent Persona

System prompt and instructions...
```

## Version Control

All files in this directory are version controlled with the repo. Any changes should be:
1. Tested locally first
2. Committed to git
3. Pushed to GitHub
4. Deployed to Vercel (if using Option 1)

Or:

1. Updated via MCP `update_agent` tool (if using Option 2)
2. Periodically synced back to repo for backup

## Contributing

To add new contexts, templates, or agents:
1. Create the file in the appropriate subdirectory
2. Follow the naming convention: `c-`, `t-`, or `a-` prefix
3. Include proper metadata and documentation
4. Test with the MCP server
5. Commit and push
