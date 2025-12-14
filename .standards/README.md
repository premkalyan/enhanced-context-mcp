# Engineering Standards

**Version:** 1.0.0
**Source:** Enhanced Context MCP
**Last Updated:** 2024-12-14

## Overview

These standards ensure consistency, quality, and efficiency across the project. The LLM should read these before implementing any features.

## Principles

1. **Explicit over Implicit** - Be clear about intentions in code
2. **Simple over Complex** - Prefer straightforward solutions
3. **Consistent over Creative** - Follow established patterns
4. **Secure by Default** - Security is not optional
5. **Test Everything** - Untested code is broken code

## Scope

| Layer | Technologies |
|-------|--------------|
| Backend | Python 3.12+, FastAPI 0.115+, SQLAlchemy 2.0+ |
| Frontend | Next.js 14/15, React 18+, TypeScript 5+ |
| Database | PostgreSQL 16+, pgvector, Alembic |
| Testing | pytest, pytest-asyncio, Jest, Playwright |
| Infrastructure | Docker, Redis, Kubernetes |

## Standards Files

| File | Description |
|------|-------------|
| [python.md](./python.md) | Python backend conventions |
| [fastapi.md](./fastapi.md) | FastAPI patterns and practices |
| [database.md](./database.md) | SQLAlchemy/Alembic standards |
| [testing.md](./testing.md) | Test structure and patterns |
| [frontend.md](./frontend.md) | Next.js/React standards |
| [security.md](./security.md) | OWASP API security checklist |
| [code_quality.md](./code_quality.md) | Quality guidelines |
| [diagrams.md](./diagrams.md) | Architecture diagram standards |

## Usage

### For LLM

Before implementing any feature:
1. Read relevant standard files
2. Follow the patterns defined
3. Update `lessons_learned.json` if you discover issues

### For Team

- Modify these files as needed for project-specific requirements
- Commit changes to Git for version control
- All team members follow these standards

## Distribution Model

```
Enhanced Context MCP → .standards/ (local) → Team customizes → Git version control
```

To refresh standards from MCP:
```bash
# Call get_engineering_standards from Enhanced Context MCP
```
