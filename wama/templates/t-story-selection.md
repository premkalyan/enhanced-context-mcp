# Story Selection Template

**Agent Persona:** Project Manager
**Purpose:** Help select the next story to work on based on prioritization rules

---

## Current Sprint Context

| Attribute | Value |
|-----------|-------|
| **Sprint** | {{sprint_name}} |
| **Days Remaining** | {{days_remaining}} days |
| **Stories Completed** | {{completed_stories}}/{{total_stories}} |
| **Points Completed** | {{completed_points}}/{{committed_points}} |

---

## Current Work Status

### In Progress (COMPLETE FIRST)

| Story | Summary | Priority | Points | Days In Progress |
|-------|---------|----------|--------|------------------|
| {{in_progress_story_key}} | {{in_progress_story_summary}} | {{in_progress_priority}} | {{in_progress_points}} | {{days_in_progress}} |

> **Action Required:** If you have work in progress, continue that story before picking up new work.

### Recently Unblocked (HIGH PRIORITY)

| Story | Summary | Unblocked Date | Was Blocked By |
|-------|---------|----------------|----------------|
| {{unblocked_story_key}} | {{unblocked_story_summary}} | {{unblocked_date}} | {{blocked_reason}} |

---

## Prioritized Story Queue

### Sprint Committed (Not Started)

| Rank | Story | Summary | Priority | Points | Assignee | Dependencies |
|------|-------|---------|----------|--------|----------|--------------|
| 1 | {{story_key_1}} | {{story_summary_1}} | {{priority_1}} | {{points_1}} | {{assignee_1}} | {{deps_1}} |
| 2 | {{story_key_2}} | {{story_summary_2}} | {{priority_2}} | {{points_2}} | {{assignee_2}} | {{deps_2}} |
| 3 | {{story_key_3}} | {{story_summary_3}} | {{priority_3}} | {{points_3}} | {{assignee_3}} | {{deps_3}} |

---

## Selection Recommendation

### Recommended Next Story

**Story:** {{recommended_story_key}}: {{recommended_story_summary}}

**Selection Reasoning:**
1. {{selection_reason_1}}
2. {{selection_reason_2}}
3. {{selection_reason_3}}

### Pre-Selection Checklist

Before starting this story, verify:

- [ ] Story requirements are clear and complete
- [ ] Acceptance criteria are testable
- [ ] Dependencies are resolved
- [ ] Estimation is validated
- [ ] Technical approach is understood
- [ ] No blocking issues exist

---

## JQL Query Used

```jql
project = "{{project_key}}"
AND sprint in openSprints()
AND status = "To Do"
AND (assignee = currentUser() OR assignee is EMPTY)
ORDER BY priority DESC, rank ASC
```

---

## Action Items

### 1. Review Story Details
```typescript
await mcp_jira_get_issue_details({
  issueKey: "{{recommended_story_key}}"
});
```

### 2. Verify Readiness
- Check acceptance criteria completeness
- Review technical requirements
- Confirm dependencies are clear

### 3. Start Implementation
```typescript
// Transition to In Progress
await mcp_jira_transition_issue({
  issueKey: "{{recommended_story_key}}",
  transitionName: "Start Progress"
});

// Add start comment
await mcp_jira_add_comment({
  issueKey: "{{recommended_story_key}}",
  body: "IMPLEMENTATION STARTED\n\nApproach: [your approach here]"
});
```

### 4. Create Feature Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/{{recommended_story_key}}-{{short_description}}
```

---

## Priority Decision Tree

```
1. Do you have IN PROGRESS work?
   ├── YES → Continue that work
   └── NO → Continue to step 2

2. Was anything UNBLOCKED in last 24h?
   ├── YES → Pick the unblocked story
   └── NO → Continue to step 3

3. Is there a SPRINT-COMMITTED story?
   ├── YES → Pick highest ranked
   └── NO → Continue to step 4

4. Is there a HIGH PRIORITY story?
   ├── YES → Pick highest priority
   └── NO → Pick from backlog by rank
```

---

## Next Step

After selecting a story, proceed with the **Implementation Checklist** to start coding.
