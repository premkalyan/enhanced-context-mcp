# Flow Diagrams Template

**Agent Persona:** Blake (Technical Architect) / Business Analyst
Purpose: Document user flows, system processes, and data flows for VISHKAR projects

## User Journey Flow

```mermaid
journey
    title [Feature Name] User Journey
    section Discovery
      User lands on page: 5: User
      Reads content: 4: User
      System loads data: 3: System
    section Engagement
      User clicks CTA: 5: User
      System validates: 4: System
      Shows personalized content: 5: System
    section Conversion
      User completes action: 5: User
      System confirms: 5: System
      User receives confirmation: 5: User
```

- Rate each step from 1-5 (1=poor experience, 5=excellent experience)
- Include both user actions and system responses
- Group steps into logical sections (phases of journey)
- Highlight pain points with low scores (<3)
- Use sections to show progression through feature

## Process Flow Diagram

```mermaid
flowchart TD
    Start([Start Process]) --> Step1[Step 1: User Authentication]
    Step1 --> Decision1{User Authorized?}
    Decision1 -->|Yes| Step2A[Step 2: Load User Data]
    Decision1 -->|No| Step2B[Show Login Page]
    Step2B --> Step1
    Step2A --> Step3[Step 3: Display Dashboard]
    Step3 --> Decision2{User Action?}
    Decision2 -->|Create| Step4A[Create New Item]
    Decision2 -->|Edit| Step4B[Edit Existing Item]
    Decision2 -->|Delete| Step4C[Delete Item]
    Step4A --> Step5[Save Changes]
    Step4B --> Step5
    Step4C --> Step5
    Step5 --> Step6[Show Confirmation]
    Step6 --> End([End Process])
```

- Use clear, descriptive step labels
- Show all decision points with `{}`
- Include start `([Start])` and end `([End])` nodes
- Use `-->` for flow direction
- Add labels on decision branches (`|Yes|`, `|No|`)
- Show loops where processes repeat

## Swimlane Diagram (Cross-Functional Process)

```mermaid
flowchart TB
    subgraph User[" User"]
        U1[Access Application]
        U2[Submit Request]
        U3[View Response]
    end

    subgraph Frontend[" Frontend"]
        F1[Validate Input]
        F2[Send to Backend]
        F3[Display Result]
    end

    subgraph Backend[" Backend"]
        B1[Receive Request]
        B2[Process Business Logic]
        B3[Query Database]
        B4[Return Response]
    end

    subgraph Database[" Database"]
        D1[(Execute Query)]
        D2[(Return Data)]
    end

    U1 --> F1
    U2 --> F1
    F1 --> F2
    F2 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> D1
    D1 --> D2
    D2 --> B4
    B4 --> F3
    F3 --> U3
```

- Use subgraphs for each actor/system
- Label subgraphs with role/system name
- Show interactions across boundaries
- Include all touchpoints between actors
- Use emojis for visual clarity (optional)

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> UnderReview: Submit for Review
    UnderReview --> Approved: Approve
    UnderReview --> Rejected: Reject
    UnderReview --> Draft: Request Changes
    Rejected --> Draft: Revise
    Approved --> Published: Publish
    Published --> Archived: Archive
    Archived --> [*]

    note right of Draft
        Initial state
        User can edit
    end note

    note right of Published
        Visible to public
        Read-only
    end note
```

- Define all possible states
- Show transitions with action labels
- Include notes for state descriptions
- Show entry `[*]` and exit states
- Include rollback paths for failures

## Entity Relationship Flow

```mermaid
flowchart LR
    User[ User] -->|Creates| Post[ Post]
    User -->|Writes| Comment[ Comment]
    Post -->|Has many| Comment
    Comment -->|Belongs to| Post
    User -->|Follows| User
    Post -->|Tagged with| Tag[ Tag]
    Tag -->|Applied to| Post
```

- Show entity relationships
- Use emojis for entity types
- Label relationships with verbs
- Show cardinality (one-to-many, many-to-many)
- Include all key entities

## Error Handling Flow

```mermaid
flowchart TD
    Start[User Action] --> Validate{Input Valid?}
    Validate -->|Yes| Process[Process Request]
    Validate -->|No| Error1[Show Validation Error]
    Error1 --> Start

    Process --> APICall{API Available?}
    APICall -->|Yes| Execute[Execute Operation]
    APICall -->|No| Error2[Show Service Unavailable]
    Error2 --> Retry{Retry?}
    Retry -->|Yes| APICall
    Retry -->|No| Cancel[Cancel Operation]

    Execute --> Result{Success?}
    Result -->|Yes| Success[Show Success Message]
    Result -->|No| Error3[Show Error Message]
    Error3 --> LogError[Log Error]
    LogError --> Retry

    Success --> End([Complete])
    Cancel --> End
```

- Show happy path and error paths
- Include retry logic
- Show error logging/reporting
- Include user feedback at each error
- Show recovery options

## Timing Diagram (Sequence with Time Constraints)

```mermaid
sequenceDiagram
    participant User
    participant Web
    participant API
    participant DB

    User->>Web: Click Submit
    Note over Web: < 50ms
    Web->>API: POST /api/create
    Note over API: < 200ms
    API->>DB: INSERT query
    Note over DB: < 100ms
    DB-->>API: Success
    API-->>Web: 201 Created
    Note over Web: < 50ms
    Web-->>User: Show confirmation

    Note over User,DB: Total time < 400ms
```

- Add time constraints using `Note over`
- Show performance targets
- Include total duration
- Highlight time-critical sections
- Use for performance planning

## Template Usage Instructions

### When to Use This Template

Use this template when you need to:
- Document user journeys and experiences
- Map business processes
- Show system interactions
- Define state transitions
- Document error handling flows
- Show timing and performance requirements

### How AI Should Populate This Template

1. **Analyze Requirements:** Understand the feature/process being documented
2. **Choose Appropriate Diagram:** Select the diagram type that best represents the flow
3. **Map All Steps:** Include all user actions, system responses, and decisions
4. **Show Alternatives:** Include error paths, edge cases, and alternatives
5. **Add Context:** Use notes and labels to clarify complex points
6. **Validate Completeness:** Ensure all scenarios are covered

### Diagram Selection Guide

| Use Case | Recommended Diagram |
|----------|-------------------|
| User experience mapping | User Journey Flow |
| Business process | Process Flow Diagram |
| Cross-team workflow | Swimlane Diagram |
| Object lifecycle | State Machine Diagram |
| Data relationships | Entity Relationship Flow |
| Error scenarios | Error Handling Flow |
| Performance planning | Timing Diagram |

## Mermaid Syntax Quick Reference

### Common Elements

```markdown
- Nodes: `A[Rectangle]`, `B(Rounded)`, `C{Decision}`, `D([Stadium])`
- Connections: `-->` (arrow), `-.->` (dotted), `==>` (thick)
- Labels: `A -->|Label| B`
- Subgraphs: `subgraph Name ... end`
```

### Styling (Optional)

```mermaid
flowchart TD
    A[Start] --> B[Process]
    B --> C[End]

    style A fill:#90EE90
    style C fill:#FFB6C1
```

**Next Step:** After creating flow diagrams, integrate into appropriate documentation (Confluence, JIRA, technical specs).
