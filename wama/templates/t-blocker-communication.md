# Blocker Communication Template

**Agent Persona:** Project Manager
**Purpose:** Communicate blockers effectively and escalate appropriately

---

## Blocker Information

| Attribute | Value |
|-----------|-------|
| **Story Blocked** | {{story_key}}: {{story_summary}} |
| **Blocker Type** | {{blocker_type}} |
| **Severity** | {{severity}} |
| **Blocked Since** | {{blocked_since}} |
| **Duration** | {{blocked_duration}} |

### Blocker Types
- **Technical:** Code dependency, infrastructure issue, technical limitation
- **External:** Third-party service, vendor dependency, external team
- **Resource:** Missing skills, unavailable team member, hardware
- **Decision:** Pending approval, unclear requirements, priority conflict

### Severity Levels
- **Critical:** Sprint goal at risk, customer impact imminent
- **High:** Multiple stories blocked, significant delay expected
- **Medium:** Single story blocked, workaround possible
- **Low:** Minor delay, minimal impact

---

## Blocker Details

### What is Blocked

{{blocked_description}}

### Why it's Blocked

{{blocker_root_cause}}

### Impact Assessment

| Impact Area | Description |
|-------------|-------------|
| **Sprint Impact** | {{sprint_impact}} |
| **Dependent Stories** | {{dependent_stories}} |
| **Team Members Affected** | {{affected_members}} |
| **Deadline Risk** | {{deadline_risk}} |

---

## What Has Been Tried

| # | Attempt | Result | Date |
|---|---------|--------|------|
| 1 | {{attempt_1}} | {{result_1}} | {{date_1}} |
| 2 | {{attempt_2}} | {{result_2}} | {{date_2}} |
| 3 | {{attempt_3}} | {{result_3}} | {{date_3}} |

---

## Proposed Solutions

### Option 1: {{solution_1_name}}

| Aspect | Details |
|--------|---------|
| **Description** | {{solution_1_description}} |
| **Pros** | {{solution_1_pros}} |
| **Cons** | {{solution_1_cons}} |
| **Timeline** | {{solution_1_timeline}} |
| **Resources Needed** | {{solution_1_resources}} |

### Option 2: {{solution_2_name}}

| Aspect | Details |
|--------|---------|
| **Description** | {{solution_2_description}} |
| **Pros** | {{solution_2_pros}} |
| **Cons** | {{solution_2_cons}} |
| **Timeline** | {{solution_2_timeline}} |
| **Resources Needed** | {{solution_2_resources}} |

### Recommended Solution

**Recommendation:** {{recommended_solution}}

**Reasoning:** {{recommendation_reasoning}}

---

## Escalation Chain

### Level 1: Team Lead

| Attribute | Value |
|-----------|-------|
| **Contact** | {{team_lead_name}} |
| **Status** | {{level_1_status}} |
| **Contacted** | {{level_1_date}} |
| **Response** | {{level_1_response}} |

### Level 2: Engineering Manager

| Attribute | Value |
|-----------|-------|
| **Contact** | {{eng_manager_name}} |
| **Status** | {{level_2_status}} |
| **Contacted** | {{level_2_date}} |
| **Response** | {{level_2_response}} |

### Level 3: Director/VP

| Attribute | Value |
|-----------|-------|
| **Contact** | {{director_name}} |
| **Status** | {{level_3_status}} |
| **Contacted** | {{level_3_date}} |
| **Response** | {{level_3_response}} |

---

## Communication Templates

### Slack/Teams Quick Message

```
BLOCKED: {{story_key}}

What: {{brief_description}}
Impact: {{sprint_impact}}
Tried: {{what_was_tried}}
Need: {{specific_ask}}

Can someone help unblock this?
```

### Email Escalation

```
Subject: [{{severity}}] Blocker on {{story_key}} - {{brief_description}}

Hi {{recipient_name}},

We have a blocker on {{story_key}} that is impacting our sprint delivery.

SITUATION:
{{detailed_description}}

IMPACT:
- Sprint: {{sprint_impact}}
- Deadline: {{deadline_risk}}
- Team: {{team_impact}}

WHAT WE'VE TRIED:
1. {{attempt_1}}
2. {{attempt_2}}
3. {{attempt_3}}

PROPOSED SOLUTIONS:
1. {{solution_1}} (Recommended)
2. {{solution_2}} (Alternative)

ASK:
{{specific_request}}

Timeline: We need resolution by {{deadline}} to meet our sprint commitment.

Please let me know if you need any additional information or would like to discuss.

Thanks,
{{your_name}}
```

### JIRA Blocker Comment

```typescript
await mcp_jira_add_comment({
  issueKey: "{{story_key}}",
  body: `BLOCKED - {{date}}

BLOCKER: {{blocker_description}}

TYPE: {{blocker_type}}
SEVERITY: {{severity}}

IMPACT:
- Sprint: {{sprint_impact}}
- Dependencies: {{dependent_stories}}

ATTEMPTED SOLUTIONS:
1. {{attempt_1}} - {{result_1}}
2. {{attempt_2}} - {{result_2}}

WAITING ON:
- {{waiting_on}}

ESCALATED TO: {{escalation_contact}}
EXPECTED RESOLUTION: {{expected_resolution_date}}`
});
```

---

## Resolution Documentation

### When Unblocked

```typescript
await mcp_jira_add_comment({
  issueKey: "{{story_key}}",
  body: `UNBLOCKED - {{resolution_date}}

RESOLUTION: {{how_resolved}}
RESOLVED BY: {{resolver_name}}
TIME BLOCKED: {{total_blocked_time}}

ROOT CAUSE:
{{root_cause}}

LESSONS LEARNED:
- {{lesson_1}}
- {{lesson_2}}

PREVENTION:
- {{prevention_measure}}

RESUMING: Implementation continues`
});

// Transition back to In Progress
await mcp_jira_transition_issue({
  issueKey: "{{story_key}}",
  transitionName: "Unblock"
});
```

---

## Blocker Prevention Checklist

### Before Starting Story

- [ ] Dependencies clearly identified
- [ ] External dependencies confirmed available
- [ ] Required access/permissions verified
- [ ] Technical approach validated
- [ ] Resources/skills available

### During Implementation

- [ ] Early escalation of potential blockers
- [ ] Regular communication with dependencies
- [ ] Alternative approaches identified
- [ ] Stakeholders informed of risks

---

## Escalation Decision Matrix

| Severity | Time Blocked | Action |
|----------|--------------|--------|
| Critical | > 2 hours | Escalate to Director |
| Critical | > 30 min | Escalate to Manager |
| High | > 1 day | Escalate to Manager |
| High | > 4 hours | Escalate to Team Lead |
| Medium | > 2 days | Escalate to Team Lead |
| Low | > 3 days | Escalate to Team Lead |

---

## Next Step

After resolution, document lessons learned and update any processes to prevent similar blockers.
