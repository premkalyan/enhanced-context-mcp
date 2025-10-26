# Architecture Diagrams Template (Mermaid)

**Agent Persona:** Blake (Technical Architect)
**Purpose:** Create high-quality system architecture diagrams using Mermaid for MCP servers, microservices, and distributed systems

## System Architecture Diagram (Recommended)

```mermaid
graph TB
    subgraph "Client Layer"
        Client[Client Application<br/>Web/Mobile/Desktop]
    end

    subgraph "API Gateway Layer"
        Gateway[API Gateway<br/>Load Balancing & Routing]
    end

    subgraph "Service Layer"
        Service1[Service A<br/>Authentication & Auth]
        Service2[Service B<br/>Business Logic]
        Service3[Service C<br/>Data Processing]
    end

    subgraph "Data Layer"
        DB1[(Primary Database<br/>PostgreSQL)]
        Cache[(Redis Cache<br/>Session Storage)]
        Queue[Message Queue<br/>RabbitMQ/SQS]
    end

    subgraph "External Services"
        External1[Third-Party API<br/>Payment Gateway]
        External2[Cloud Storage<br/>S3/Azure Blob]
    end

    Client -->|HTTPS Requests| Gateway
    Gateway -->|Route| Service1
    Gateway -->|Route| Service2
    Gateway -->|Route| Service3

    Service1 -->|Read/Write| DB1
    Service2 -->|Read/Write| DB1
    Service3 -->|Read/Write| DB1

    Service1 -->|Cache Sessions| Cache
    Service2 -->|Cache Data| Cache

    Service3 -->|Publish Events| Queue
    Service2 -->|Subscribe Events| Queue

    Service2 -.->|API Calls| External1
    Service3 -.->|Upload Files| External2

    style Client fill:#e1f5ff
    style Gateway fill:#fff4e6
    style Service1 fill:#e8f5e9
    style Service2 fill:#e8f5e9
    style Service3 fill:#e8f5e9
    style DB1 fill:#fce4ec
    style Cache fill:#fce4ec
    style Queue fill:#fce4ec
    style External1 fill:#f3e5f5
    style External2 fill:#f3e5f5
```

**Key Design Principles:**

1. **Logical Layering**: Organize components into clear layers (Client, Gateway, Services, Data, External)
2. **Multi-line Labels**: Use `<br/>` to add descriptions: `Service[Service Name<br/>Purpose/Description]`
3. **Subgraph Organization**: Group related components in labeled subgraphs with quotes: `subgraph "Layer Name"`
4. **Arrow Types**:
   - Solid arrows `-->` for primary data flow
   - Dotted arrows `-.->` for optional/external connections
   - Thick arrows `==>` for critical paths
5. **Arrow Labels**: Use `|Label|` to describe relationships: `Service -->|Action| Database`
6. **Color Coding**: Apply consistent colors by layer:
   - Client: Light blue `#e1f5ff`
   - Gateway: Light orange `#fff4e6`
   - Services: Light green `#e8f5e9`
   - Data: Light pink `#fce4ec`
   - External: Light purple `#f3e5f5`

## MCP Server Architecture

```mermaid
graph TB
    subgraph "AI Agent Layer"
        Agent[AI Agent/LLM<br/>Claude, GPT, Gemini]
    end

    subgraph "MCP Orchestration"
        Registry[MCP Registry<br/>Service Discovery]
        Context[Context Provider<br/>Templates & Guidance]
    end

    subgraph "MCP Server Layer"
        MCP1[JIRA MCP<br/>24 Issue Tools]
        MCP2[Confluence MCP<br/>32 Doc Tools]
        MCP3[Custom MCP<br/>Domain-Specific]
    end

    subgraph "Integration Layer"
        ProjectReg[Project Registry<br/>Credentials & Config]
    end

    subgraph "External Services"
        Service1[JIRA Cloud<br/>Issues & Boards]
        Service2[Confluence Cloud<br/>Pages & Spaces]
        Service3[Custom API<br/>Third-Party Service]
    end

    Agent -->|1. Load Context| Context
    Agent -->|2. Discover Services| Registry
    Agent -->|3. Get Credentials| ProjectReg

    Context -.->|Provides Templates| Agent
    Registry -.->|Service Metadata| Agent

    Agent -->|Tool Calls| MCP1
    Agent -->|Tool Calls| MCP2
    Agent -->|Tool Calls| MCP3

    ProjectReg -.->|API Keys & Tokens| MCP1
    ProjectReg -.->|API Keys & Tokens| MCP2
    ProjectReg -.->|API Keys & Tokens| MCP3

    MCP1 -->|REST API v3| Service1
    MCP2 -->|REST API| Service2
    MCP3 -->|HTTP/gRPC| Service3

    style Agent fill:#e1f5ff
    style Registry fill:#fff4e6
    style Context fill:#fff4e6
    style MCP1 fill:#e8f5e9
    style MCP2 fill:#e8f5e9
    style MCP3 fill:#e8f5e9
    style ProjectReg fill:#fce4ec
    style Service1 fill:#c8e6c9
    style Service2 fill:#c8e6c9
    style Service3 fill:#c8e6c9
```

**MCP-Specific Guidelines:**

- Show clear separation between AI Agent, MCP layer, and External Services
- Number interaction steps: `|1. Action|`, `|2. Action|`, etc.
- Highlight credential flow from Project Registry to MCPs
- Use lighter colors for external cloud services (`#c8e6c9` vs `#e8f5e9`)
- Show both synchronous (solid) and asynchronous (dotted) connections

## Microservices Architecture

```mermaid
graph TB
    subgraph "Edge Layer"
        CDN[CDN<br/>CloudFlare/CloudFront]
        WAF[WAF<br/>Web Application Firewall]
        Gateway[API Gateway<br/>Kong/NGINX]
    end

    subgraph "Authentication"
        Auth[Auth Service<br/>JWT/OAuth2]
    end

    subgraph "Core Services"
        UserSvc[User Service<br/>Profile Management]
        OrderSvc[Order Service<br/>Order Processing]
        PaymentSvc[Payment Service<br/>Transactions]
        NotifySvc[Notification Service<br/>Email/SMS/Push]
    end

    subgraph "Data Services"
        UserDB[(User DB<br/>PostgreSQL)]
        OrderDB[(Order DB<br/>PostgreSQL)]
        PaymentDB[(Payment DB<br/>PostgreSQL)]
    end

    subgraph "Infrastructure"
        Cache[(Redis<br/>Distributed Cache)]
        Queue[Event Bus<br/>RabbitMQ/Kafka]
        Metrics[Monitoring<br/>Prometheus/Grafana]
    end

    CDN --> WAF
    WAF --> Gateway
    Gateway --> Auth

    Auth --> UserSvc
    Auth --> OrderSvc
    Auth --> PaymentSvc

    UserSvc --> UserDB
    OrderSvc --> OrderDB
    PaymentSvc --> PaymentDB

    UserSvc --> Cache
    OrderSvc --> Cache
    PaymentSvc --> Cache

    OrderSvc -->|Order Created| Queue
    PaymentSvc -->|Payment Success| Queue
    Queue -->|Events| NotifySvc

    UserSvc -.->|Metrics| Metrics
    OrderSvc -.->|Metrics| Metrics
    PaymentSvc -.->|Metrics| Metrics

    style CDN fill:#e1f5ff
    style WAF fill:#e1f5ff
    style Gateway fill:#fff4e6
    style Auth fill:#fff4e6
    style UserSvc fill:#e8f5e9
    style OrderSvc fill:#e8f5e9
    style PaymentSvc fill:#e8f5e9
    style NotifySvc fill:#e8f5e9
    style UserDB fill:#fce4ec
    style OrderDB fill:#fce4ec
    style PaymentDB fill:#fce4ec
    style Cache fill:#f3e5f5
    style Queue fill:#f3e5f5
    style Metrics fill:#fff9c4
```

**Microservices Best Practices:**

- Show edge layer (CDN, WAF, Gateway) separately
- Group services by domain/bounded context
- Show database per service (no shared databases)
- Indicate event-driven communication via message bus
- Include cross-cutting concerns (cache, monitoring)
- Use different arrow types for sync vs async communication

## Data Flow Architecture

```mermaid
graph LR
    subgraph "Data Sources"
        API[REST APIs<br/>External Data]
        Stream[Event Stream<br/>Kafka/Kinesis]
        DB[Legacy DB<br/>PostgreSQL]
    end

    subgraph "Ingestion Layer"
        Collector[Data Collector<br/>Logstash/Fluentd]
        Validator[Data Validator<br/>Schema Validation]
    end

    subgraph "Processing Layer"
        Transform[ETL Pipeline<br/>Spark/Airflow]
        Enrich[Data Enrichment<br/>Add Context]
    end

    subgraph "Storage Layer"
        Lake[(Data Lake<br/>S3/ADLS)]
        Warehouse[(Data Warehouse<br/>Snowflake/BigQuery)]
    end

    subgraph "Analytics Layer"
        BI[BI Tools<br/>Tableau/PowerBI]
        ML[ML Platform<br/>SageMaker/Vertex]
    end

    API --> Collector
    Stream --> Collector
    DB --> Collector

    Collector --> Validator
    Validator --> Transform

    Transform --> Enrich
    Enrich --> Lake
    Lake --> Warehouse

    Warehouse --> BI
    Warehouse --> ML

    style API fill:#e1f5ff
    style Stream fill:#e1f5ff
    style DB fill:#e1f5ff
    style Collector fill:#fff4e6
    style Validator fill:#fff4e6
    style Transform fill:#e8f5e9
    style Enrich fill:#e8f5e9
    style Lake fill:#fce4ec
    style Warehouse fill:#fce4ec
    style BI fill:#f3e5f5
    style ML fill:#f3e5f5
```

**Data Pipeline Guidelines:**

- Use left-to-right layout `graph LR` for pipeline flow
- Show clear stages: Ingestion → Processing → Storage → Analytics
- Label each component with technology stack
- Show data transformation points
- Indicate data quality gates (validation, enrichment)

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        Dev[Developer<br/>Local Environment]
        Git[Git Repository<br/>GitHub/GitLab]
    end

    subgraph "CI/CD Pipeline"
        CI[Build & Test<br/>GitHub Actions]
        Scan[Security Scan<br/>Snyk/SonarQube]
        Build[Container Build<br/>Docker]
        Registry[Container Registry<br/>ECR/ACR/GCR]
    end

    subgraph "Environments"
        Dev_Env[Development<br/>Auto-Deploy]
        Stage_Env[Staging<br/>Manual Approval]
        Prod_Env[Production<br/>Blue-Green]
    end

    subgraph "Infrastructure"
        K8s[Kubernetes<br/>EKS/AKS/GKE]
        Monitor[Monitoring<br/>DataDog/NewRelic]
    end

    Dev -->|Push Code| Git
    Git -->|Webhook| CI
    CI --> Scan
    Scan --> Build
    Build --> Registry

    Registry -->|Deploy| Dev_Env
    Registry -.->|Approval| Stage_Env
    Stage_Env -.->|Approval| Prod_Env

    Dev_Env --> K8s
    Stage_Env --> K8s
    Prod_Env --> K8s

    K8s -.->|Metrics| Monitor

    style Dev fill:#e1f5ff
    style Git fill:#fff4e6
    style CI fill:#e8f5e9
    style Scan fill:#e8f5e9
    style Build fill:#e8f5e9
    style Registry fill:#fce4ec
    style Dev_Env fill:#fff9c4
    style Stage_Env fill:#fff9c4
    style Prod_Env fill:#fff9c4
    style K8s fill:#f3e5f5
    style Monitor fill:#f3e5f5
```

**Deployment Best Practices:**

- Show complete pipeline from code to production
- Indicate approval gates with dotted arrows `-.->|Approval|`
- Show environment progression (dev → staging → production)
- Include security scanning in pipeline
- Show monitoring/observability layer

## Advanced Styling Techniques

### Node Shape Reference

```mermaid
graph LR
    A[Rectangle<br/>Default Shape]
    B(Rounded Rectangle<br/>Process/Service)
    C([Stadium Shape<br/>Start/End Points])
    D[[Subroutine<br/>Module/Package]]
    E[(Database<br/>Data Storage)]
    F{Diamond<br/>Decision Point}
    G>Flag Shape<br/>Output/Report]
    H[/Parallelogram<br/>Input/Output/]
    I[\Inverted Parallelogram<br/>Output/Input\]
    J[/Trapezoid<br/>Manual Operation\]
    K[\Inverted Trapezoid<br/>Manual Input/]
```

### Arrow Types and Labels

```mermaid
graph LR
    A --> B
    B -.-> C
    C ==> D
    D -->|Label| E
    E -.->|Optional| F
    F ==>|Critical| G

    A[Solid Arrow<br/>Primary Flow]
    B[Node B]
    C[Dotted Arrow<br/>Secondary/Optional]
    D[Node D]
    E[Thick Arrow<br/>High Volume]
    F[Node F]
    G[Node G]
```

### Color Palette Guide

Use consistent colors across your architecture diagrams:

```mermaid
graph TB
    Client[Client/User Layer<br/>#e1f5ff Light Blue]
    Gateway[API Gateway Layer<br/>#fff4e6 Light Orange]
    Service[Service Layer<br/>#e8f5e9 Light Green]
    Data[Data Layer<br/>#fce4ec Light Pink]
    External[External Services<br/>#f3e5f5 Light Purple]
    Infra[Infrastructure<br/>#fff9c4 Light Yellow]
    Cloud[Cloud Services<br/>#c8e6c9 Darker Green]

    style Client fill:#e1f5ff
    style Gateway fill:#fff4e6
    style Service fill:#e8f5e9
    style Data fill:#fce4ec
    style External fill:#f3e5f5
    style Infra fill:#fff9c4
    style Cloud fill:#c8e6c9
```

## Template Usage Instructions

### When to Use This Template

Use this template when you need to:
- Document system architecture for MCP servers
- Show microservices architecture and communication patterns
- Visualize data pipelines and ETL workflows
- Document deployment pipelines and infrastructure
- Communicate technical architecture to stakeholders
- Create architecture diagrams for Confluence/JIRA

### How AI Should Populate This Template

1. **Identify Architecture Type:**
   - System architecture → Use layered approach (Client, Gateway, Services, Data)
   - MCP architecture → Show Agent → MCP → External Services flow
   - Microservices → Show service mesh with databases and messaging
   - Data pipeline → Use left-right flow with clear stages
   - Deployment → Show CI/CD pipeline with environments

2. **Apply Design Principles:**
   - Start with logical layers using subgraphs
   - Use multi-line labels with `<br/>` to add context
   - Add technology stack names for clarity
   - Number interaction steps for sequential flows
   - Use consistent color coding by layer type

3. **Choose Arrow Types:**
   - Solid `-->` for primary synchronous calls
   - Dotted `-.->` for optional/asynchronous/secondary flows
   - Thick `==>` for critical/high-volume paths
   - Add labels `|Action|` to describe relationships

4. **Add Styling:**
   - Apply colors consistently across diagram
   - Use same color for similar layer types
   - Make external services visually distinct
   - Highlight critical components with brighter colors

5. **Optimize Layout:**
   - Use `graph TB` (top-bottom) for layered architectures
   - Use `graph LR` (left-right) for pipeline/flow diagrams
   - Keep related components close together in subgraphs
   - Minimize crossing arrows for clarity

### Quality Checklist

Before finalizing the diagram, verify:

- [ ] All components have multi-line labels with descriptions
- [ ] Subgraphs are used to group related components
- [ ] Arrow types correctly represent relationship types
- [ ] Arrow labels clearly describe actions/data flow
- [ ] Consistent color coding applied to all nodes
- [ ] Technology stack names included where relevant
- [ ] Layout direction (TB/LR) appropriate for diagram type
- [ ] No orphaned nodes (all components connected)
- [ ] Critical paths clearly visible
- [ ] External dependencies clearly marked

### Integration with Confluence

After generating the Mermaid diagram:

1. **Test Rendering:**
   - Copy diagram code to https://mermaid.ink
   - Verify layout and styling
   - Adjust as needed for clarity

2. **Generate Image:**
   - Use mermaid.ink API: `https://mermaid.ink/img/{base64_encoded_diagram}`
   - Or use `upload_and_embed_document` tool with base64 PNG

3. **Embed in Confluence:**
   - Use `create_page` tool without spaceKey (auto-fetched)
   - Use `upload_and_embed_document` with:
     - `width: 800` (or larger for complex diagrams)
     - `position: "center"`
     - Auto-embedding handles formatting

### Common Anti-Patterns to Avoid

❌ **Don't:**
- Use single-line labels without context
- Skip subgraph organization
- Use inconsistent colors
- Omit arrow labels
- Create flat diagrams without layers
- Mix TB and LR layouts in same diagram
- Use default styling (always add colors)

✅ **Do:**
- Use multi-line labels with `<br/>`
- Group related components in subgraphs
- Apply consistent color palette
- Label all arrows with actions
- Show clear layering (horizontal or vertical)
- Choose one layout direction and stick with it
- Always add styling for visual clarity

## Mermaid Syntax Reference

### Graph Directions
```markdown
graph TB   # Top to Bottom (vertical layering)
graph BT   # Bottom to Top
graph LR   # Left to Right (pipeline flow)
graph RL   # Right to Left
```

### Subgraph Syntax
```markdown
subgraph "Layer Name"
    Component1[Service A<br/>Description]
    Component2[Service B<br/>Description]
end
```

### Connection Styles
```markdown
A --> B           # Solid arrow
A -.-> B          # Dotted arrow
A ==> B           # Thick arrow
A -->|Label| B    # Labeled arrow
A -.->|Label| B   # Labeled dotted arrow
```

### Node Styling
```markdown
style NodeID fill:#hexcolor
style NodeID fill:#hexcolor,stroke:#hexcolor,stroke-width:2px
```

**Next Step:** After creating architecture diagrams, upload to Confluence using `upload_and_embed_document` tool and link to relevant JIRA epics/stories.
