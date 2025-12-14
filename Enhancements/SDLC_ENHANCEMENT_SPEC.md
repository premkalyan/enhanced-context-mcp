# VISHKAR Enhanced SDLC Specification

## Version: 2.0.0
## Date: 2024-12-14
## Status: Proposed for Enhanced Context MCP Update

---

## Overview

This document specifies enhancements to the VISHKAR 13-Step SDLC to include a **4-Angle Internal Review System** after task implementation, before the formal PR review process.

## Key Changes from v1.0

1. Added **4-Angle Internal Review** (Steps 3-6) after implementation
2. Renumbered subsequent steps (total now 17 steps)
3. **Review feedback stored** for LLM learning (prevents repeated mistakes)
4. **Test cases stored in JSON** format (TCM-ready)
5. Critical/High issues must be addressed before proceeding

---

## VISHKAR 17-Step Enhanced SDLC

```json
{
  "name": "VISHKAR 17-Step Enhanced SDLC",
  "version": "2.0.0",
  "description": "Enhanced development lifecycle with 4-angle internal review after task implementation",
  "philosophy": "Quality at source - review early, fix early",
  "total_steps": 17,
  "human_gates": 1,
  "automated_steps": 16,
  "quality_thresholds": {
    "minimum_quality_score": 7,
    "test_pass_rate": 90,
    "max_retries": 3,
    "escalation_trigger": "After 3 failed retries, escalate to human",
    "critical_issues_allowed": 0,
    "high_issues_allowed": 0
  }
}
```

---

## Step Definitions

### Phase 1: Task Selection
```json
{
  "step": 1,
  "name": "Story/Task Selection",
  "automation_level": "automated",
  "description": "Select task from JIRA backlog and move to In Progress",
  "actions": [
    "Query JIRA for ready tasks",
    "Select highest priority task",
    "Transition to In Progress",
    "Create feature branch"
  ],
  "outputs": ["task_id", "branch_name"],
  "jira_transition": "To Do → In Progress"
}
```

### Phase 2: Implementation
```json
{
  "step": 2,
  "name": "Implementation",
  "automation_level": "automated",
  "description": "Implement the task following coding standards",
  "actions": [
    "Analyze acceptance criteria",
    "Write implementation code",
    "Follow project conventions",
    "Add inline documentation"
  ],
  "outputs": ["changed_files[]", "implementation_summary"]
}
```

### Phase 3: 4-Angle Internal Review (NEW)

This is the key enhancement. After implementation, run 4 parallel reviews:

#### Step 3: Architecture Review
```json
{
  "step": 3,
  "name": "Architecture Review",
  "automation_level": "automated",
  "description": "Review system design and architectural implications",
  "agent": "a-architect-review",
  "mandatory": true,
  "focus_areas": [
    "System design patterns",
    "Component boundaries",
    "Scalability implications",
    "Integration points",
    "Technical debt assessment",
    "Dependency management"
  ],
  "blocking_on": ["critical", "high"],
  "outputs": ["architecture_findings[]"]
}
```

#### Step 4: Security Review
```json
{
  "step": 4,
  "name": "Security Review",
  "automation_level": "automated",
  "description": "Review for security vulnerabilities and compliance",
  "agent": "a-security-auditor",
  "mandatory": true,
  "focus_areas": [
    "OWASP Top 10 vulnerabilities",
    "Authentication/Authorization",
    "Input validation and sanitization",
    "Secrets management",
    "SQL injection, XSS, CSRF",
    "API security patterns",
    "Data encryption"
  ],
  "blocking_on": ["critical", "high"],
  "outputs": ["security_findings[]"]
}
```

#### Step 5: Code Quality Review
```json
{
  "step": 5,
  "name": "Code Quality Review",
  "automation_level": "automated",
  "description": "Review for code quality and maintainability",
  "agent": "a-code-reviewer",
  "mandatory": true,
  "focus_areas": [
    "SOLID principles adherence",
    "Clean code practices",
    "DRY principle",
    "Error handling patterns",
    "Logging and observability",
    "Code organization",
    "Naming conventions"
  ],
  "blocking_on": ["critical", "high"],
  "outputs": ["quality_findings[]"]
}
```

#### Step 6: Tech-Stack Review
```json
{
  "step": 6,
  "name": "Tech-Stack Review",
  "automation_level": "automated",
  "description": "Review for technology-specific best practices",
  "agent": "contextual",
  "mandatory": true,
  "agent_selection": {
    "rules": [
      {
        "pattern": "backend/**/*.py",
        "agents": ["a-fastapi-pro"]
      },
      {
        "pattern": "frontend/**/*.tsx",
        "agents": ["a-frontend-developer", "a-typescript-pro"]
      },
      {
        "pattern": "frontend/**/*.ts",
        "agents": ["a-typescript-pro"]
      },
      {
        "pattern": "frontend/**/*.js",
        "agents": ["a-javascript-pro"]
      },
      {
        "pattern": "docker/**/*",
        "agents": ["a-deployment-engineer"]
      },
      {
        "pattern": "*.yml",
        "agents": ["a-deployment-engineer"]
      },
      {
        "pattern": "terraform/**/*",
        "agents": ["a-terraform-specialist"]
      },
      {
        "pattern": "tests/**/*",
        "agents": ["a-test-automator"]
      }
    ],
    "default": ["a-backend-engineer"]
  },
  "focus_areas": [
    "Framework-specific patterns",
    "Performance optimization",
    "Async patterns (if applicable)",
    "Database query optimization",
    "Caching strategies",
    "API design patterns"
  ],
  "blocking_on": ["critical", "high"],
  "outputs": ["tech_findings[]"]
}
```

### Step 7: Feedback Implementation & Storage
```json
{
  "step": 7,
  "name": "Feedback Implementation & Storage",
  "automation_level": "automated",
  "description": "Address findings from 4-angle review and store for LLM learning",
  "actions": [
    "Fix all Critical issues",
    "Fix all High issues",
    "Address Medium issues (recommended)",
    "Document Low issues for backlog",
    "Store findings to .reviews/findings/{task_id}_findings.json",
    "Update .reviews/lessons_learned.json with new patterns"
  ],
  "exit_criteria": {
    "critical_count": 0,
    "high_count": 0
  },
  "retry_limit": 3,
  "on_retry_exceeded": "escalate_to_human",
  "storage": {
    "findings_per_task": ".reviews/findings/{task_id}_findings.json",
    "lessons_aggregated": ".reviews/lessons_learned.json",
    "purpose": "LLM learning - prevent repeated mistakes"
  }
}
```

### Phase 4: Testing

#### Step 8: Manual Verification
```json
{
  "step": 8,
  "name": "Manual Verification",
  "automation_level": "automated",
  "description": "Developer verifies implementation works locally",
  "actions": [
    "Run application locally",
    "Verify acceptance criteria",
    "Test edge cases manually",
    "Verify no regressions"
  ]
}
```

#### Step 9: Create Test Cases
```json
{
  "step": 9,
  "name": "Create Test Cases",
  "automation_level": "automated",
  "description": "Define test scenarios for the implementation",
  "actions": [
    "Identify test scenarios from AC",
    "Define positive test cases",
    "Define negative test cases",
    "Define edge cases",
    "Store test cases in JSON format (for future TCM)"
  ],
  "outputs": ["test_cases.json"],
  "storage_format": {
    "location": "tests/cases/{task_id}.json",
    "schema": "TCM-compatible"
  }
}
```

#### Step 10: Implement Tests
```json
{
  "step": 10,
  "name": "Implement Tests",
  "automation_level": "automated",
  "description": "Write automated tests",
  "actions": [
    "Write unit tests (pytest)",
    "Write integration tests",
    "Ensure coverage meets threshold"
  ],
  "coverage_threshold": 80
}
```

#### Step 11: Execute Tests
```json
{
  "step": 11,
  "name": "Execute Tests",
  "automation_level": "automated",
  "description": "Run full test suite",
  "actions": [
    "Run pytest with coverage",
    "Generate coverage report",
    "Verify all tests pass"
  ],
  "pass_criteria": {
    "all_tests_pass": true,
    "coverage_minimum": 80
  }
}
```

### Phase 5: PR & Review

#### Step 12: PR Creation
```json
{
  "step": 12,
  "name": "PR Creation",
  "automation_level": "automated",
  "description": "Create pull request with review checklist",
  "actions": [
    "Push branch to remote",
    "Create PR with template",
    "Include test results",
    "Link JIRA task"
  ],
  "pr_template": {
    "sections": [
      "Summary of changes",
      "JIRA link",
      "Test results",
      "Screenshots (if UI)",
      "Checklist"
    ]
  }
}
```

#### Step 13: PR Review (Formal)
```json
{
  "step": 13,
  "name": "PR Review",
  "automation_level": "automated",
  "description": "Formal PR review by peers/agents",
  "agent": "a-pr-orchestrator",
  "actions": [
    "Orchestrate review across relevant agents",
    "Collect reviewer feedback",
    "Request changes if needed"
  ]
}
```

#### Step 14: PR Feedback Implementation
```json
{
  "step": 14,
  "name": "PR Feedback Implementation",
  "automation_level": "automated",
  "description": "Address PR review comments",
  "actions": [
    "Address reviewer comments",
    "Push updates",
    "Request re-review"
  ]
}
```

### Phase 6: Merge & Deploy

#### Step 15: CI/CD Pipeline
```json
{
  "step": 15,
  "name": "CI/CD Pipeline",
  "automation_level": "automated",
  "description": "Automated CI/CD checks",
  "actions": [
    "Run automated tests",
    "Run linting and formatting",
    "Run security scans",
    "Build artifacts"
  ]
}
```

#### Step 16: Human Merge Approval
```json
{
  "step": 16,
  "name": "Human Merge Approval",
  "automation_level": "human",
  "description": "Final human sign-off before merge",
  "gate_type": "HUMAN GATE",
  "approvers": ["tech_lead", "product_owner"],
  "actions": [
    "Review PR summary",
    "Verify all checks pass",
    "Approve and merge"
  ]
}
```

#### Step 17: Story Closure
```json
{
  "step": 17,
  "name": "Story Closure",
  "automation_level": "automated",
  "description": "Close task and update documentation",
  "actions": [
    "Transition JIRA to Done",
    "Update Confluence documentation",
    "Log time if not already done",
    "Tag release if applicable"
  ],
  "jira_transition": "In Progress → Done"
}
```

---

## Review Finding Severity Levels

```json
{
  "severity_levels": [
    {
      "level": "critical",
      "symbol": "🔴",
      "description": "Security vulnerabilities, production-breaking issues",
      "action": "MUST fix before proceeding",
      "blocking": true
    },
    {
      "level": "high",
      "symbol": "🟠",
      "description": "Performance issues, significant maintainability concerns",
      "action": "MUST fix before proceeding",
      "blocking": true
    },
    {
      "level": "medium",
      "symbol": "🟡",
      "description": "Code quality improvements, best practice suggestions",
      "action": "SHOULD fix, recommended",
      "blocking": false
    },
    {
      "level": "low",
      "symbol": "🟢",
      "description": "Style preferences, minor optimizations",
      "action": "MAY fix, or log for future",
      "blocking": false
    }
  ]
}
```

---

## Test Case Storage Format (TCM-Ready)

```json
{
  "test_case_schema": {
    "id": "TC-{task_id}-{sequence}",
    "title": "string",
    "description": "string",
    "type": "unit | integration | e2e",
    "priority": "critical | high | medium | low",
    "preconditions": ["string"],
    "steps": [
      {
        "step_number": 1,
        "action": "string",
        "expected_result": "string",
        "test_data": "string (optional)"
      }
    ],
    "jira_link": "V1-XX",
    "automation_status": "manual | automated | pending",
    "automation_path": "tests/path/to/test.py::test_function"
  }
}
```

Example:
```json
{
  "id": "TC-V1-49-001",
  "title": "FastAPI application starts successfully",
  "description": "Verify the FastAPI application starts and health endpoint responds",
  "type": "integration",
  "priority": "critical",
  "preconditions": ["Docker containers running", "Database migrated"],
  "steps": [
    {
      "step_number": 1,
      "action": "Start FastAPI application",
      "expected_result": "Application starts without errors"
    },
    {
      "step_number": 2,
      "action": "Call GET /health endpoint",
      "expected_result": "Returns 200 OK with status: healthy"
    }
  ],
  "jira_link": "V1-49",
  "automation_status": "automated",
  "automation_path": "tests/integration/test_health.py::test_health_endpoint"
}
```

---

## Visual Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      VISHKAR 17-STEP ENHANCED SDLC                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐                                                           │
│  │ 1. Task      │                                                           │
│  │ Selection    │                                                           │
│  └──────┬───────┘                                                           │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────┐                                                           │
│  │ 2. Implement │                                                           │
│  └──────┬───────┘                                                           │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │              4-ANGLE INTERNAL REVIEW (Steps 3-6)                │        │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │        │
│  │  │3.Architect │ │4.Security  │ │5.CodeQuality│ │6.TechStack │   │        │
│  │  │  Review    │ │  Review    │ │   Review   │ │  Review    │   │        │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │        │
│  │                                                                 │        │
│  │  Agents: a-architect-review, a-security-auditor,               │        │
│  │          a-code-reviewer, a-fastapi-pro (contextual)           │        │
│  │                                                                 │        │
│  │  Exit: 0 Critical, 0 High issues                               │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────┐                                                           │
│  │ 7. Fix       │◄──── Retry up to 3x                                       │
│  │ Feedback     │                                                           │
│  └──────┬───────┘                                                           │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────┐                                                           │
│  │ 8. Manual    │                                                           │
│  │ Verification │                                                           │
│  └──────┬───────┘                                                           │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │ 9. Create    │────▶│10. Implement │────▶│11. Execute   │                │
│  │ Test Cases   │     │   Tests      │     │   Tests      │                │
│  └──────────────┘     └──────────────┘     └──────┬───────┘                │
│                                                    │                        │
│         ┌──────────────────────────────────────────┘                        │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────┐                                                           │
│  │12. Create PR │                                                           │
│  └──────┬───────┘                                                           │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────┐     ┌──────────────┐                                      │
│  │13. PR Review │────▶│14. Fix       │                                      │
│  │  (Formal)    │     │ PR Feedback  │                                      │
│  └──────────────┘     └──────┬───────┘                                      │
│                              │                                               │
│         ┌────────────────────┘                                               │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────┐                                                           │
│  │15. CI/CD     │                                                           │
│  │ Pipeline     │                                                           │
│  └──────┬───────┘                                                           │
│         │                                                                    │
│         ▼                                                                    │
│  ╔══════════════╗                                                           │
│  ║16. HUMAN     ║  ◄──── HUMAN GATE                                         │
│  ║ APPROVAL     ║                                                           │
│  ╚══════╤═══════╝                                                           │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────┐                                                           │
│  │17. Story     │                                                           │
│  │ Closure      │                                                           │
│  └──────────────┘                                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Migration from 13-Step to 17-Step

| Old Step | New Step(s) | Change |
|----------|-------------|--------|
| 1. Story Selection | 1. Task Selection | Renamed |
| 2. Implementation | 2. Implementation | Same |
| - | 3-6. 4-Angle Review | **NEW** |
| - | 7. Feedback Implementation | **NEW** |
| 3. Manual Verification | 8. Manual Verification | Renumbered |
| 4. Create Test Cases | 9. Create Test Cases | Renumbered + TCM format |
| 5. Implement Tests | 10. Implement Tests | Renumbered |
| 6. Execute Tests | 11. Execute Tests | Renumbered |
| 7. PR Creation | 12. PR Creation | Renumbered |
| 8. 3-Phase PR Review | 13. PR Review | Renumbered |
| 9. Feedback Implementation | 14. PR Feedback | Renumbered |
| 10. CI/CD Pipeline | 15. CI/CD Pipeline | Renumbered |
| 11. Human Merge Approval | 16. Human Approval | Renumbered |
| 12. Documentation Update | 17. Story Closure | Merged with Story Closure |
| 13. Story Closure | (merged above) | Merged |

---

## Storage Configuration

### Directory Structure
```
project-root/
├── .reviews/                          # Review feedback storage
│   ├── findings/                      # Per-task review findings
│   │   ├── V1-49_findings.json
│   │   ├── V1-50_findings.json
│   │   └── ...
│   └── lessons_learned.json           # Aggregated lessons for LLM context
│
├── tests/
│   ├── cases/                         # Test case definitions (TCM-ready JSON)
│   │   ├── V1-49_test_cases.json
│   │   ├── V1-50_test_cases.json
│   │   └── ...
│   ├── unit/                          # Actual pytest unit test files
│   ├── integration/                   # Integration test files
│   └── conftest.py                    # Shared fixtures
```

### Review Findings Schema (Per-Task)
```json
{
  "schema_version": "1.0.0",
  "task_id": "V1-49",
  "task_summary": "FastAPI Project Setup",
  "review_date": "2024-12-14T10:30:00Z",
  "reviews": {
    "architecture": {
      "agent": "a-architect-review",
      "findings": [
        {
          "id": "ARCH-001",
          "severity": "high",
          "category": "dependency-management",
          "issue": "Missing dependency injection pattern for database connections",
          "file": "backend/src/main.py",
          "line": 45,
          "fix_applied": "Added dependency injection using FastAPI Depends",
          "lesson": "Always use dependency injection for external resources"
        }
      ]
    },
    "security": {
      "agent": "a-security-auditor",
      "findings": []
    },
    "code_quality": {
      "agent": "a-code-reviewer",
      "findings": [
        {
          "id": "QUAL-001",
          "severity": "medium",
          "category": "error-handling",
          "issue": "Generic exception handler catches all exceptions",
          "file": "backend/src/core/exceptions.py",
          "line": 12,
          "fix_applied": "Added specific exception types",
          "lesson": "Always use specific exception types, not bare except"
        }
      ]
    },
    "tech_stack": {
      "agent": "a-fastapi-pro",
      "findings": []
    }
  },
  "summary": {
    "critical": 0,
    "high": 1,
    "medium": 1,
    "low": 0,
    "total_found": 2,
    "total_fixed": 2
  }
}
```

### Lessons Learned Schema (Aggregated)
```json
{
  "schema_version": "1.0.0",
  "last_updated": "2024-12-14T10:30:00Z",
  "total_reviews": 5,
  "total_findings": 23,
  "categories": {
    "security": {
      "total_count": 3,
      "common_issues": [
        {
          "pattern": "SQL injection via string interpolation",
          "frequency": 2,
          "first_seen": "V1-49",
          "last_seen": "V1-52",
          "prevention": "Always use parameterized queries with SQLAlchemy",
          "example_fix": "Use db.execute(select(User).where(User.id == :id), {'id': user_id})"
        }
      ]
    },
    "architecture": {
      "total_count": 4,
      "common_issues": [
        {
          "pattern": "Missing dependency injection",
          "frequency": 3,
          "first_seen": "V1-49",
          "last_seen": "V1-51",
          "prevention": "Use FastAPI Depends() for all external resources",
          "example_fix": "async def get_db(): yield session"
        }
      ]
    },
    "code_quality": {
      "total_count": 6,
      "common_issues": [
        {
          "pattern": "Generic exception handling",
          "frequency": 2,
          "first_seen": "V1-49",
          "last_seen": "V1-50",
          "prevention": "Define specific exception types in exceptions.py",
          "example_fix": "except ValidationError as e: ..."
        },
        {
          "pattern": "Missing type hints",
          "frequency": 4,
          "first_seen": "V1-49",
          "last_seen": "V1-53",
          "prevention": "Always add type hints to function parameters and returns",
          "example_fix": "def process(data: dict[str, Any]) -> Result:"
        }
      ]
    },
    "tech_stack": {
      "total_count": 10,
      "common_issues": []
    }
  },
  "top_lessons": [
    {
      "rank": 1,
      "lesson": "Always use dependency injection for database/external services",
      "frequency": 3,
      "category": "architecture"
    },
    {
      "rank": 2,
      "lesson": "Use parameterized queries, never string interpolation for SQL",
      "frequency": 2,
      "category": "security"
    },
    {
      "rank": 3,
      "lesson": "Add type hints to all functions",
      "frequency": 4,
      "category": "code_quality"
    },
    {
      "rank": 4,
      "lesson": "Handle specific exceptions, not generic Exception",
      "frequency": 2,
      "category": "code_quality"
    }
  ]
}
```

### How Lessons Learned is Used

At the **start of each implementation** (Step 2), load lessons learned as context:

```
CONTEXT FOR LLM - LESSONS FROM PREVIOUS REVIEWS:
================================================

Based on {total_reviews} previous reviews with {total_findings} findings,
avoid these common mistakes:

TOP LESSONS (by frequency):
1. [architecture] Always use dependency injection for database/external services (3 occurrences)
   → Fix: Use FastAPI Depends() - async def get_db(): yield session

2. [security] Use parameterized queries, never string interpolation for SQL (2 occurrences)
   → Fix: db.execute(select(User).where(User.id == :id), {'id': user_id})

3. [code_quality] Add type hints to all functions (4 occurrences)
   → Fix: def process(data: dict[str, Any]) -> Result:

4. [code_quality] Handle specific exceptions, not generic Exception (2 occurrences)
   → Fix: except ValidationError as e: ...

Apply these lessons to prevent repeated issues.
================================================
```

---

## Implementation Notes

1. **Review Execution**: Steps 3-6 can run in parallel for efficiency
2. **Retry Logic**: If issues found, fix and re-run reviews (max 3 retries)
3. **Feedback Storage**: Store all findings to `.reviews/` for LLM learning
4. **Lessons Aggregation**: Update `lessons_learned.json` after each review cycle
5. **Context Loading**: Load lessons learned at start of each implementation
6. **Test Case Storage**: Store test cases in JSON format in `tests/cases/` for future TCM import
7. **Version Control**: All `.reviews/` and `tests/cases/` files are committed to git

---

*Document for Enhanced Context MCP Update*
*Author: VISHKAR Team*
*Date: 2024-12-14*
