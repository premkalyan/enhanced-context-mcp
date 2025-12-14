# Enhanced Context MCP - Extension Specification

## Document Info
- **Version**: 1.0.0
- **Date**: 2024-12-14
- **Author**: PULSE Context Agent Team
- **Status**: Draft for Review

---

## 1. Tree Structure Design

### 1.1 Hierarchy Overview

```
Project Registry (Root)
├── get_started (unauthenticated entry point)
│
├── Enhanced Context MCP
│   ├── Onboarding
│   │   └── get_started
│   ├── Context Loading
│   │   └── load_enhanced_context
│   ├── Agent Discovery
│   │   └── list_vishkar_agents
│   ├── SDLC Guidance
│   │   ├── get_sdlc_guidance
│   │   └── get_poc_building_guide
│   ├── JIRA Automation (NEW)
│   │   ├── generate_jira_structure
│   │   ├── get_workflow_guidance
│   │   ├── generate_status_report
│   │   └── get_jira_field_mappings
│   └── Templates & Personas (NEW)
│       ├── jira_best_practices
│       ├── confluence_templates
│       └── sdlc_workflows
│
├── JIRA MCP
│   ├── Issue Management
│   │   ├── create_issue
│   │   ├── update_issue
│   │   ├── get_issue
│   │   └── search_issues
│   └── Workflow
│       ├── transition_issue
│       └── add_worklog
│
├── Confluence MCP
│   ├── Page Management
│   │   ├── create_page
│   │   ├── update_page
│   │   └── get_page
│   └── Space Operations
│       └── get_space
│
├── Story Crafter MCP
│   └── Story Generation
│       └── craft_story
│
└── PR-Agent MCP
    └── Pull Request Analysis
        └── analyze_pr
```

### 1.2 Discovery Flow

When an LLM connects to VISHKAR ecosystem:

```
1. Call: project_registry.get_started()
   Returns:
   - Ecosystem overview
   - List of all MCPs with descriptions
   - Authentication requirements
   - Recommended next steps

2. Call: enhanced_context.get_started()
   Returns:
   - Available tool categories
   - 13-step SDLC overview
   - 38 agent summaries
   - How to load context

3. Call: enhanced_context.list_tools()
   Returns:
   - Complete tool inventory with parameters
   - Usage examples per tool
   - Tool dependencies

4. Based on task intent, call specific tools
```

---

## 2. New Tools Specification

### 2.1 JIRA Automation Tools

#### 2.1.1 `generate_jira_structure`

**Purpose**: Convert implementation plans (WBS) into JIRA-ready JSON payloads

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `plan_content` | string | Yes | Markdown or text content of implementation plan |
| `project_key` | string | Yes | JIRA project key (e.g., "V1") |
| `structure_type` | enum | Yes | `epic_with_stories` \| `initiative_epic_story` \| `flat_stories` |
| `include_acceptance_criteria` | boolean | No | Extract AC from plan (default: true) |
| `include_story_points` | boolean | No | Suggest story points (default: false) |

**Returns**:
```json
{
  "epic": {
    "summary": "Phase 1: Foundation",
    "description": "...",
    "issueType": "Epic"
  },
  "stories": [
    {
      "summary": "1.1 Docker Infrastructure Setup",
      "description": "...",
      "acceptanceCriteria": ["AC1", "AC2"],
      "issueType": "Story",
      "parentKey": "${epic.key}"
    }
  ],
  "execution_order": ["create_epic", "create_stories", "link_to_epic"],
  "jira_api_payloads": [...]
}
```

---

#### 2.1.2 `get_workflow_guidance`

**Purpose**: Provide phase-specific JIRA workflow instructions with timestamps

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sdlc_step` | integer | Yes | SDLC step number (1-13) |
| `current_status` | string | No | Current ticket status |
| `include_worklog_template` | boolean | No | Include time logging format |

**Returns**:
```json
{
  "sdlc_step": 1,
  "step_name": "Requirement Analysis",
  "jira_actions": [
    {
      "action": "transition",
      "from_status": "To Do",
      "to_status": "In Progress",
      "trigger": "Start working on requirement analysis"
    },
    {
      "action": "add_comment",
      "template": "Starting requirement analysis. Estimated completion: {date}"
    },
    {
      "action": "add_worklog",
      "template": {
        "timeSpent": "2h",
        "comment": "Requirement analysis - reviewed {doc_count} documents"
      }
    }
  ],
  "completion_criteria": [
    "All requirements documented",
    "Stakeholder sign-off received"
  ],
  "next_step": {
    "sdlc_step": 2,
    "transition_to": "Ready for Design"
  }
}
```

---

#### 2.1.3 `generate_status_report`

**Purpose**: Generate status reports from JIRA data with metrics

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `report_type` | enum | Yes | `daily` \| `weekly` \| `sprint` \| `phase` |
| `project_key` | string | Yes | JIRA project key |
| `epic_key` | string | No | Filter by specific epic |
| `include_metrics` | array | No | `["velocity", "burndown", "cycle_time", "lead_time"]` |
| `format` | enum | No | `markdown` \| `json` \| `confluence_xhtml` |

**Returns**:
```json
{
  "report_period": "2024-12-09 to 2024-12-14",
  "summary": {
    "total_stories": 3,
    "completed": 3,
    "in_progress": 0,
    "blocked": 0
  },
  "metrics": {
    "velocity": 13,
    "average_cycle_time": "2.3 days",
    "completion_rate": "100%"
  },
  "completed_items": [
    {
      "key": "V1-45",
      "summary": "Docker Infrastructure Setup",
      "completed_date": "2024-12-10",
      "time_logged": "4h"
    }
  ],
  "formatted_report": "## Weekly Status Report\n..."
}
```

---

#### 2.1.4 `get_jira_field_mappings`

**Purpose**: Provide correct JIRA field names and API mappings

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `operation` | enum | Yes | `create_issue` \| `update_issue` \| `link_issues` \| `transition` |
| `issue_type` | string | No | Filter by issue type |
| `include_examples` | boolean | No | Include usage examples |

**Returns**:
```json
{
  "operation": "link_issues",
  "field_mappings": {
    "link_story_to_epic": {
      "correct_field": "parentKey",
      "incorrect_alternatives": ["epicKey", "epic", "parent"],
      "example": {
        "issueKey": "V1-45",
        "parentKey": "V1-44"
      },
      "note": "Use parentKey for next-gen projects, epicLink for classic projects"
    }
  },
  "common_mistakes": [
    {
      "mistake": "Using epicKey to link story to epic",
      "correction": "Use parentKey instead",
      "reason": "epicKey is not a valid field in JIRA Cloud API"
    }
  ]
}
```

---

### 2.2 Templates & Personas Extension

#### 2.2.1 JIRA Best Practices Template

**Location**: `templates/jira_best_practices`

```yaml
name: jira_best_practices
version: "1.0"
category: project_management

practices:
  epic_story_linking:
    description: "How to properly link stories to epics"
    correct_approach:
      field: "parentKey"
      api_endpoint: "PUT /rest/api/3/issue/{issueKey}"
      example:
        issueKey: "V1-45"
        parentKey: "V1-44"
    common_mistakes:
      - field: "epicKey"
        reason: "Not a valid JIRA Cloud API field"
      - field: "epicLink"
        reason: "Only works in classic projects, not next-gen"

  status_transitions:
    workflow: "To Do → In Progress → In Review → Done"
    best_practices:
      - "Always add a comment when transitioning"
      - "Log time spent before marking complete"
      - "Update acceptance criteria checklist"
    transition_ids:
      to_do_to_in_progress: 21
      in_progress_to_in_review: 31
      in_review_to_done: 41

  worklog_formatting:
    time_format: "1w 2d 3h 4m"
    required_fields:
      - timeSpent
      - comment
    template: |
      {
        "timeSpent": "2h",
        "comment": "[SDLC Step {step}] {activity_description}"
      }

  acceptance_criteria:
    format: "Given-When-Then or bullet points"
    placement: "Description field with AC: header"
    example: |
      **Acceptance Criteria:**
      - [ ] Docker containers start successfully
      - [ ] PostgreSQL accessible on port 5250
      - [ ] pgvector extension enabled

  story_points:
    scale: "fibonacci"
    values: [1, 2, 3, 5, 8, 13, 21]
    guidelines:
      1: "Trivial change, < 1 hour"
      3: "Small feature, half day"
      5: "Medium feature, 1-2 days"
      8: "Large feature, 3-5 days"
      13: "Epic-sized, should be broken down"
```

---

#### 2.2.2 SDLC Workflow Template

**Location**: `templates/sdlc_workflow`

```yaml
name: sdlc_workflow_jira
version: "1.0"
category: development_lifecycle

phases:
  phase_1_planning:
    sdlc_steps: [1, 2, 3]
    jira_workflow:
      initial_status: "To Do"
      working_status: "In Progress"
      review_status: "In Review"
      done_status: "Done"
    deliverables:
      - "Requirements document"
      - "Architecture design"
      - "Implementation plan"

  phase_2_implementation:
    sdlc_steps: [4, 5, 6, 7]
    jira_workflow:
      labels: ["implementation", "coding"]
      components: ["backend", "frontend", "infrastructure"]
    deliverables:
      - "Working code"
      - "Unit tests"
      - "Integration tests"

  phase_3_quality:
    sdlc_steps: [8, 9, 10]
    jira_workflow:
      labels: ["qa", "testing"]
    deliverables:
      - "Test reports"
      - "Bug fixes"
      - "Performance metrics"

  phase_4_deployment:
    sdlc_steps: [11, 12, 13]
    jira_workflow:
      labels: ["deployment", "release"]
    deliverables:
      - "Deployment scripts"
      - "Release notes"
      - "Documentation"

timestamp_tracking:
  format: "ISO 8601"
  events:
    - "started_at: When status changes to In Progress"
    - "completed_at: When status changes to Done"
    - "time_in_status: Calculated per status"
  jira_fields:
    created: "Issue creation timestamp"
    updated: "Last modification timestamp"
    resolutiondate: "When marked as Done"
  custom_tracking: |
    Add comment on each transition:
    "[{timestamp}] Status: {from} → {to} | SDLC Step: {step}"
```

---

## 3. API Endpoint Structure

### 3.1 Enhanced Context MCP Endpoints

```
Base URL: https://enhanced-context-mcp.vercel.app

POST /api/mcp
  Body: JSON-RPC 2.0 format
  Headers:
    - Content-Type: application/json
    - X-API-Key: {api_key}

GET /api/howto
  Returns: Tool documentation (unauthenticated)

GET /api/health
  Returns: Service health status
```

### 3.2 New Endpoints for JIRA Automation

```
POST /api/mcp
  Tool: generate_jira_structure
  Tool: get_workflow_guidance
  Tool: generate_status_report
  Tool: get_jira_field_mappings

GET /api/templates/jira_best_practices
  Returns: JIRA best practices template

GET /api/templates/sdlc_workflow
  Returns: SDLC workflow template
```

---

## 4. Implementation Priority

### Phase 1: Foundation (Week 1)
1. `get_jira_field_mappings` - Critical for correct API usage
2. `jira_best_practices` template - Prevent common mistakes

### Phase 2: Automation (Week 2)
3. `generate_jira_structure` - WBS to JIRA conversion
4. `get_workflow_guidance` - SDLC step guidance

### Phase 3: Reporting (Week 3)
5. `generate_status_report` - Metrics and reporting
6. `sdlc_workflow` template - Complete workflow automation

---

## 5. Integration Examples

### 5.1 Creating Phase from WBS

```javascript
// Step 1: Generate JIRA structure from implementation plan
const structure = await enhancedContext.call('generate_jira_structure', {
  plan_content: implementationPlanMarkdown,
  project_key: 'V1',
  structure_type: 'epic_with_stories',
  include_acceptance_criteria: true
});

// Step 2: Create Epic via JIRA MCP
const epic = await jiraMcp.call('create_issue', structure.epic);

// Step 3: Create Stories with parent link
for (const story of structure.stories) {
  story.parentKey = epic.key;
  await jiraMcp.call('create_issue', story);
}
```

### 5.2 Workflow Progression

```javascript
// Get guidance for current SDLC step
const guidance = await enhancedContext.call('get_workflow_guidance', {
  sdlc_step: 4,
  current_status: 'To Do',
  include_worklog_template: true
});

// Execute recommended actions
for (const action of guidance.jira_actions) {
  if (action.action === 'transition') {
    await jiraMcp.call('transition_issue', {
      issueKey: 'V1-45',
      transitionId: guidance.transition_ids[action.to_status]
    });
  }
  if (action.action === 'add_worklog') {
    await jiraMcp.call('add_worklog', {
      issueKey: 'V1-45',
      ...action.template
    });
  }
}
```

### 5.3 Status Report Generation

```javascript
// Generate weekly report
const report = await enhancedContext.call('generate_status_report', {
  report_type: 'weekly',
  project_key: 'V1',
  epic_key: 'V1-44',
  include_metrics: ['velocity', 'cycle_time'],
  format: 'confluence_xhtml'
});

// Publish to Confluence
await confluenceMcp.call('create_page', {
  spaceKey: 'CINCARA',
  title: `Weekly Status Report - ${report.report_period}`,
  parentId: '264468638236712',
  content: report.formatted_report
});
```

---

## 6. Error Handling

### 6.1 Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid field: epicKey` | Using wrong field for epic linking | Use `parentKey` instead |
| `Transition not allowed` | Invalid status transition | Check `get_workflow_guidance` for valid transitions |
| `Missing required field` | Incomplete API payload | Use `get_jira_field_mappings` for required fields |
| `Authentication failed` | Invalid or expired API key | Regenerate via Project Registry |

### 6.2 Validation Rules

```yaml
generate_jira_structure:
  - plan_content: "Must be non-empty string"
  - project_key: "Must match /^[A-Z][A-Z0-9_]{1,9}$/"
  - structure_type: "Must be one of allowed enum values"

get_workflow_guidance:
  - sdlc_step: "Must be integer 1-13"
  - current_status: "Must match known JIRA statuses"

generate_status_report:
  - report_type: "Required, must be valid enum"
  - project_key: "Required, valid JIRA project"
```

---

## 7. Security Considerations

1. **API Key Handling**: Never expose API keys in responses or logs
2. **Rate Limiting**: Respect 100 requests/15 min limit
3. **Data Validation**: Sanitize all user inputs before JIRA API calls
4. **Audit Trail**: Log all JIRA modifications with timestamps

---

## 8. Next Steps

1. [ ] Review specification with Enhanced Context MCP team
2. [ ] Prioritize tool implementation order
3. [ ] Create test cases for each new tool
4. [ ] Update `/api/howto` documentation
5. [ ] Add templates to template registry
6. [ ] Integration testing with JIRA MCP
