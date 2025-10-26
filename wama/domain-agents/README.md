# Domain Planning Agents

Domain planning agents are specialized experts for pre-development planning and business analysis. Unlike technical agents that focus on code implementation, domain agents help with requirements gathering, feature breakdown, compliance planning, and strategic decision-making during the planning phase.

## Purpose

Domain planning agents are designed for the **VISHKAR planning phase** where teams:
- Discuss business requirements and user needs
- Break down features into user stories and epics
- Estimate scope and identify dependencies
- Plan for domain-specific compliance and regulations
- Make architectural and strategic decisions

## Agent Type Classification

The Enhanced Context MCP system categorizes agents into two types:

1. **Technical Agents** (`type: technical`)
   - Located in: `wama/agents/`
   - Purpose: Code implementation, technical reviews, deployments
   - Examples: code-reviewer, terraform-specialist, fastapi-pro
   - Used by: Claude Code and other development tools

2. **Domain Expert Agents** (`type: domain_expert`)
   - Located in: `wama/domain-agents/`
   - Purpose: Business planning, requirements analysis, domain knowledge
   - Examples: ecommerce-specialist, healthcare-compliance, fintech-analyst
   - Used by: VISHKAR and other planning tools

## Available Domain Agents

### E-commerce Specialist (`d-ecommerce-specialist`)
**Specializations:**
- Online retail strategy
- Payment processing systems
- Inventory management
- Shopping cart optimization
- Order fulfillment workflows

**Use for:** Planning e-commerce features, marketplaces, retail platforms, checkout flows, and customer retention strategies.

### Healthcare Compliance (`d-healthcare-compliance`)
**Specializations:**
- HIPAA compliance (Privacy & Security Rules)
- Patient data protection
- Medical records management
- Healthcare security requirements
- Clinical workflow planning

**Use for:** Planning healthcare applications, patient portals, EHR integrations, telemedicine platforms, and medical data systems.

### Fintech Analyst (`d-fintech-analyst`)
**Specializations:**
- Banking systems and payment processing
- Financial compliance (KYC, AML, BSA)
- Fraud prevention and risk management
- Transaction management and reconciliation
- Regulatory requirements

**Use for:** Planning fintech applications, payment systems, banking platforms, digital wallets, and financial operations.

### Customer Experience Designer (`d-cx-designer`)
**Specializations:**
- User journey mapping
- Service design and blueprinting
- Customer touchpoint optimization
- Experience measurement (CSAT, NPS, CES)
- Omnichannel strategy

**Use for:** Planning customer-facing features, onboarding flows, support systems, and multi-channel experiences.

### Data Privacy Officer (`d-data-privacy-officer`)
**Specializations:**
- GDPR, CCPA, and privacy regulations
- Data governance and classification
- Privacy by design principles
- Consent management systems
- Data subject rights (access, deletion, portability)

**Use for:** Planning features with privacy considerations, data collection, user consent, cross-border data transfers, and compliance requirements.

### Supply Chain Analyst (`d-supply-chain-analyst`)
**Specializations:**
- Procurement and sourcing systems
- Inventory optimization
- Warehouse management
- Demand forecasting and planning
- Logistics and distribution

**Use for:** Planning supply chain systems, inventory management, warehouse operations, procurement platforms, and logistics optimization.

## Agent File Format

Domain agents use YAML frontmatter with the following structure:

```markdown
---
name: agent-id
description: Brief description of the agent's expertise and use cases
type: domain_expert
specializations:
  - specialization-1
  - specialization-2
  - specialization-3
model: sonnet
---

# Agent Name

[Agent system prompt and detailed instructions...]
```

**Required Fields:**
- `name`: Unique identifier for the agent (kebab-case)
- `description`: Clear description of agent's role and when to use it
- `type`: Must be `domain_expert` for domain agents
- `specializations`: Array of expertise areas
- `model`: Preferred model (e.g., sonnet, gpt-4)

## API Usage

### List All Domain Agents

Fetch only domain planning agents:

```bash
curl -X POST https://enhanced-context-mcp.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_your_api_key" \
  -d '{
    "tool": "list_vishkar_agents",
    "arguments": {
      "agent_type": "domain_expert"
    }
  }'
```

### List All Technical Agents

Fetch only technical implementation agents:

```bash
curl -X POST https://enhanced-context-mcp.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_your_api_key" \
  -d '{
    "tool": "list_vishkar_agents",
    "arguments": {
      "agent_type": "technical"
    }
  }'
```

### List All Agents

Fetch both types:

```bash
curl -X POST https://enhanced-context-mcp.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_your_api_key" \
  -d '{
    "tool": "list_vishkar_agents",
    "arguments": {
      "agent_type": "all"
    }
  }'
```

### Load Specific Agent

Load a domain agent by ID:

```bash
curl -X POST https://enhanced-context-mcp.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_your_api_key" \
  -d '{
    "tool": "load_vishkar_agent",
    "arguments": {
      "agent_id": "d-ecommerce-specialist"
    }
  }'
```

## VISHKAR Integration

VISHKAR should fetch only domain agents for planning discussions:

```typescript
// Fetch domain planning agents
const response = await fetch(
  'https://enhanced-context-mcp.vercel.app/api/mcp',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': prometheusApiKey
    },
    body: JSON.stringify({
      tool: 'list_vishkar_agents',
      arguments: {
        agent_type: 'domain_expert'
      }
    })
  }
);

const data = await response.json();
const domainAgents = data.result; // Array of domain expert agents
```

## Creating New Domain Agents

To create a new domain agent:

1. **Identify the domain**: What business domain or industry does this cover?
2. **Define expertise**: What specific knowledge areas does this agent cover?
3. **Create agent file**: Use the naming convention `d-{domain-name}.md`
4. **Add frontmatter**: Include required fields with `type: domain_expert`
5. **Write system prompt**: Focus on planning, requirements, and business decisions
6. **Document usage**: When should teams use this agent?

**File naming convention:**
- Prefix with `d-` (domain)
- Use kebab-case
- Example: `d-ecommerce-specialist.md`, `d-healthcare-compliance.md`

**Content guidelines:**
- Focus on business requirements and planning
- Include domain-specific terminology and frameworks
- Provide examples of planning deliverables
- Address compliance and regulatory considerations
- Emphasize questions to ask during planning
- Balance business goals with technical feasibility

## Benefits of Separation

### Clean Separation of Concerns
- Planning agents don't clutter technical tooling
- Technical agents don't confuse business planning
- Clear boundaries between phases (planning vs. implementation)

### Reusable Across Projects
- Domain agents applicable to any project in that domain
- Centralized knowledge management
- Consistent planning approach across teams

### Easier Discovery
- Filter agents by purpose and phase
- Find relevant expertise quickly
- Reduce cognitive load in agent selection

### Scalability
- Add new domains without affecting technical agents
- Independent evolution of planning and technical agents
- Support for industry-specific customization

## Migration from v1

If you have existing VISHKAR agents:

1. **Move to domain-agents directory**: Copy agent files to `wama/domain-agents/`
2. **Update agent type**: Change `type: technical` to `type: domain_expert`
3. **Update agent IDs**: Prefix with `d-` for consistency
4. **Update references**: Update any hardcoded agent IDs in VISHKAR
5. **Test filtering**: Verify agents appear when filtering by `domain_expert`

## Support and Feedback

For questions or to request new domain agents, please open an issue in the repository with:
- Domain area needed
- Use cases and scenarios
- Key expertise areas to cover
- Compliance or regulatory considerations
