# Implementation Checklist Template

**Agent Persona:** Backend Engineer / Frontend Developer
**Purpose:** Structured checklist for starting and completing story implementation

---

## Story Information

| Attribute | Value |
|-----------|-------|
| **Story** | {{story_key}}: {{story_summary}} |
| **Sprint** | {{sprint_name}} |
| **Points** | {{story_points}} |
| **Priority** | {{priority}} |
| **Assignee** | {{assignee}} |

---

## Pre-Implementation Checklist

### Requirements Understanding

- [ ] Read story description completely
- [ ] Review all acceptance criteria
- [ ] Understand user perspective and business value
- [ ] Identify edge cases and error scenarios
- [ ] Clarify any ambiguities with Product Owner

### Technical Preparation

- [ ] Review related code/components
- [ ] Understand existing patterns to follow
- [ ] Identify files/modules to modify
- [ ] Plan database changes (if any)
- [ ] Plan API changes (if any)
- [ ] Identify potential impacts on other features

### Environment Ready

- [ ] Local dev environment working
- [ ] Latest main branch pulled
- [ ] All dependencies installed
- [ ] Services/databases accessible
- [ ] Test environment available

---

## Implementation Start

### Step 1: Update Story Status

```typescript
// Transition story to In Progress
await mcp_jira_transition_issue({
  issueKey: "{{story_key}}",
  transitionName: "Start Progress"
});
```

### Step 2: Document Your Approach

```typescript
// Add implementation start comment
await mcp_jira_add_comment({
  issueKey: "{{story_key}}",
  body: `IMPLEMENTATION STARTED

TECHNICAL APPROACH:
- {{approach_point_1}}
- {{approach_point_2}}
- {{approach_point_3}}

ACCEPTANCE CRITERIA MAPPING:
- AC1: {{ac1_implementation}}
- AC2: {{ac2_implementation}}
- AC3: {{ac3_implementation}}

ESTIMATED COMPLETION: {{estimated_completion}}`
});
```

### Step 3: Create Feature Branch

```bash
# Ensure on latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/{{story_key}}-{{short_description}}
```

---

## TDD Implementation Flow

### For Each Acceptance Criterion:

#### 1. RED - Write Failing Test

```typescript
describe('{{feature_name}}', () => {
  describe('{{scenario}}', () => {
    it('{{expected_behavior}}', async () => {
      // Arrange
      const input = {{test_input}};

      // Act
      const result = await {{function_under_test}}(input);

      // Assert
      expect(result).toEqual({{expected_output}});
    });
  });
});
```

#### 2. GREEN - Implement Minimal Code

```typescript
// Write just enough code to pass the test
export async function {{function_name}}(input: {{InputType}}): Promise<{{OutputType}}> {
  // Implementation
}
```

#### 3. REFACTOR - Clean Up

```typescript
// Improve code quality while keeping tests green
// - Extract common logic
// - Improve naming
// - Add error handling
```

---

## Quality Gates Checklist

### Before Each Commit

```bash
# Run linter
npm run lint

# Run type check
npm run type-check

# Run tests
npm test

# Check coverage
npm run test:coverage
```

- [ ] All tests passing
- [ ] Linting passes (0 errors)
- [ ] No TypeScript errors
- [ ] Coverage meets threshold (>90% for new code)

### Before Creating PR

- [ ] All acceptance criteria implemented
- [ ] Error handling complete
- [ ] Logging appropriate
- [ ] No console.log statements
- [ ] No hardcoded values/secrets
- [ ] Documentation updated (if needed)

---

## Progress Updates

### Daily Update Template

```
PROGRESS UPDATE - {{date}}

COMPLETED:
- {{completed_item_1}}
- {{completed_item_2}}

IN PROGRESS:
- {{current_work}}

BLOCKERS:
- {{blocker_or_none}}

NEXT:
- {{next_steps}}

ETA: {{estimated_completion}}
```

---

## Commit Guidelines

### Commit Message Format

```bash
# Pattern: {STORY_KEY}: {type}: {description}
# Types: feat, fix, refactor, test, docs, chore

git commit -m "{{story_key}}: feat: {{feature_description}}"
git commit -m "{{story_key}}: test: add unit tests for {{component}}"
git commit -m "{{story_key}}: fix: {{bug_fix_description}}"
```

### Commit Best Practices

- Commit frequently (logical units of work)
- Keep commits focused (one concern per commit)
- Write descriptive messages
- Reference story key in every commit

---

## PR Creation

### When Ready for Review

```bash
# Push feature branch
git push origin feature/{{story_key}}-{{short_description}}

# Create PR
gh pr create --title "{{story_key}}: {{pr_title}}" --body "## Summary
{{pr_summary}}

## Acceptance Criteria
- [x] AC1: {{ac1}}
- [x] AC2: {{ac2}}
- [x] AC3: {{ac3}}

## Testing
- Unit tests: {{coverage}}% coverage
- Manual testing: {{manual_test_status}}

## Screenshots
{{screenshots_if_applicable}}"
```

---

## Completion Checklist

### Before Marking Complete

- [ ] All acceptance criteria verified
- [ ] PR approved and merged
- [ ] No remaining test failures
- [ ] Documentation updated
- [ ] Story transitioned to Done

### Update JIRA

```typescript
// Transition to Done
await mcp_jira_transition_issue({
  issueKey: "{{story_key}}",
  transitionName: "Done"
});

// Add completion comment
await mcp_jira_add_comment({
  issueKey: "{{story_key}}",
  body: `IMPLEMENTATION COMPLETE

PR: {{pr_url}}
MERGED: {{merge_date}}

DELIVERED:
- {{delivered_item_1}}
- {{delivered_item_2}}

NOTES:
- {{any_notes}}`
});
```

---

## Next Step

After completing implementation and PR approval, proceed to merge and verify in staging environment.
