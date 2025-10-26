# Intent-Based Context Loading

## Overview

The Enhanced Context MCP now supports **intelligent intent-based context loading**. Instead of requiring structured parameters like `query_type`, `task_intent`, `scope`, etc., you can simply describe what you're trying to do in natural language, and the AI will automatically infer the best contexts, templates, and guidance to provide.

## Two Modes of Operation

### Mode 1: Natural Language (Recommended)

**Just describe what you want to do!**

```json
{
  "tool": "load_enhanced_context",
  "arguments": {
    "task_statement": "I want to create an architecture diagram showing our MCP server system with all the services and connections"
  }
}
```

The AI will analyze your statement and automatically determine:
- Query type: `architecture-diagrams`
- Task intent: `create`
- Scope: (inferred from context)
- Complexity: (inferred from keywords)
- Domain focus: (inferred from keywords)

### Mode 2: Structured (Traditional)

**Provide explicit parameters:**

```json
{
  "tool": "load_enhanced_context",
  "arguments": {
    "query_type": "architecture-diagrams",
    "task_intent": "create",
    "scope": "epic",
    "complexity": "medium"
  }
}
```

## Example Use Cases

### 1. Architecture Diagrams

**Natural Language:**
```json
{
  "tool": "load_enhanced_context",
  "arguments": {
    "task_statement": "Create a system architecture diagram for our microservices platform showing API gateway, auth service, and payment processing"
  }
}
```

**AI Analysis:**
```
Query Type: architecture-diagrams (detected from "architecture diagram")
Task Intent: create (detected from "create")
Complexity: complex (detected from "microservices")
Domain Focus: [security, payments] (detected from "auth", "payment")
Confidence: 95.0%
```

### 2. User Stories

**Natural Language:**
```json
{
  "tool": "load_enhanced_context",
  "arguments": {
    "task_statement": "Help me write user stories for a new payment checkout feature with credit card processing"
  }
}
```

**AI Analysis:**
```
Query Type: story (detected from "user stories")
Task Intent: create (detected from "write")
Scope: story (detected from "stories")
Complexity: critical (detected from "payment")
Domain Focus: [payments] (detected from "payment", "credit card")
Confidence: 90.5%
```

### 3. Security Review

**Natural Language:**
```json
{
  "tool": "load_enhanced_context",
  "arguments": {
    "task_statement": "Review the security of our authentication system to ensure it's compliant with GDPR"
  }
}
```

**AI Analysis:**
```
Query Type: security (detected from "security")
Task Intent: review (detected from "review")
Complexity: critical (detected from "authentication", "compliance")
Domain Focus: [security, compliance] (detected from "authentication", "GDPR")
Confidence: 92.0%
```

### 4. Story Breakdown

**Natural Language:**
```json
{
  "tool": "load_enhanced_context",
  "arguments": {
    "task_statement": "Break down the user management epic into smaller stories and tasks"
  }
}
```

**AI Analysis:**
```
Query Type: story-breakdown (detected from "break down", "epic")
Task Intent: breakdown (detected from "break down")
Scope: epic (detected from "epic")
Confidence: 88.0%
```

### 5. Infrastructure as Code

**Natural Language:**
```json
{
  "tool": "load_enhanced_context",
  "arguments": {
    "task_statement": "Help me plan the Terraform infrastructure for deploying our app to AWS with Kubernetes"
  }
}
```

**AI Analysis:**
```
Query Type: infrastructure (detected from "Terraform", "infrastructure")
Task Intent: plan (detected from "plan")
Complexity: complex (detected from "Kubernetes")
Domain Focus: [infrastructure] (detected from "Terraform", "AWS", "Kubernetes")
Confidence: 93.5%
```

### 6. Documentation

**Natural Language:**
```json
{
  "tool": "load_enhanced_context",
  "arguments": {
    "task_statement": "Write API documentation for our REST endpoints in Confluence"
  }
}
```

**AI Analysis:**
```
Query Type: documentation (detected from "documentation")
Task Intent: create (detected from "write")
Output Format: confluence (detected from "Confluence")
Domain Focus: [api] (detected from "API", "REST endpoints")
Confidence: 87.0%
```

### 7. Testing Strategy

**Natural Language:**
```json
{
  "tool": "load_enhanced_context",
  "arguments": {
    "task_statement": "Create a comprehensive test plan for our e2e browser automation tests using Playwright"
  }
}
```

**AI Analysis:**
```
Query Type: testing (detected from "test plan", "tests")
Task Intent: create (detected from "create")
Complexity: medium (inferred)
Domain Focus: [performance] (inferred from "automation")
Confidence: 85.0%
```

## Response Format

When using intent-based loading, the response will include:

```markdown
# Enhanced Context Loaded Successfully

## 🧠 Intent Analysis

**Original Statement**: "I want to create an architecture diagram..."

**Analyzed Intent**:
- **Query Type**: architecture-diagrams
- **Task Intent**: create
- **Scope**: epic
- **Complexity**: complex
- **Domain Focus**: security, payments

**Confidence**: 95.0%

**Analysis Reasoning**:
- Detected query type: architecture-diagrams (confidence: 0.95)
- Detected task intent: create (confidence: 0.8)
- Detected complexity: complex (confidence: 0.8)
- Detected domain focus: security, payments

## 🎯 Task Understanding

**Query Type**: architecture-diagrams
**Task Intent**: create
**Scope**: epic
**Complexity**: complex
**Domain Focus**: security, payments

**Context Combination**: Architecture Diagrams - Mermaid Focus
**Reasoning**: Selected contexts for system architecture visualization...

## 📚 Loaded Contexts

[Contexts loaded based on analysis...]

## 📝 Templates

[Templates provided based on query type...]

## 🤖 Recommended Agent

[Agent selection based on task requirements...]
```

## Benefits of Intent-Based Loading

### 1. **Simpler API Calls**
No need to remember exact `query_type` values or understand the taxonomy.

**Before:**
```json
{
  "query_type": "architecture-diagrams",
  "task_intent": "create",
  "scope": "epic",
  "complexity": "complex",
  "domain_focus": ["security", "payments"]
}
```

**After:**
```json
{
  "task_statement": "Create architecture diagram for payment system with security focus"
}
```

### 2. **More Accurate Context Matching**
The AI can detect nuances in your statement that you might not explicitly specify.

Example: "Review authentication security for GDPR compliance"
- Automatically detects: security, compliance, critical complexity
- Provides: Security context, compliance checklist, GDPR guidelines

### 3. **Better Discoverability**
You don't need to know all available query types. Just describe what you want!

### 4. **Confidence Scoring**
See how confident the AI is in its analysis. Low confidence? Try being more specific!

### 5. **Transparency**
Full reasoning provided so you understand why certain contexts were loaded.

## Tips for Best Results

### 1. Be Specific About Actions
✅ Good: "Create user stories for payment checkout"
❌ Vague: "Payment stuff"

### 2. Mention Key Technologies
✅ Good: "Terraform infrastructure for Kubernetes on AWS"
❌ Generic: "Infrastructure setup"

### 3. Include Domain Keywords
✅ Good: "Security review of authentication with GDPR compliance"
❌ Limited: "Check the auth code"

### 4. Specify Output Destination
✅ Good: "Write documentation in Confluence for our API"
❌ Unclear: "Document the API"

### 5. Indicate Complexity When Relevant
✅ Good: "Simple CRUD operations" or "Complex microservices architecture"
❌ Ambiguous: "Backend system"

## Pattern Matching Examples

The AI recognizes these patterns:

### Query Type Indicators

| Query Type | Keywords Detected |
|-----------|-------------------|
| `story` | create story, write epic, user story, backlog |
| `architecture-diagrams` | diagram, mermaid, visualize, architecture diagram |
| `testing` | test, test plan, qa, unit test, e2e |
| `security` | security, audit, vulnerability, authentication |
| `documentation` | documentation, doc, confluence, readme |
| `infrastructure` | terraform, kubernetes, cloud, aws, deployment |
| `story-breakdown` | break down, split epic, decompose |
| `pr-review` | pull request, pr, code review |

### Intent Indicators

| Intent | Keywords Detected |
|--------|-------------------|
| `create` | create, write, build, generate, develop |
| `review` | review, audit, check, examine |
| `breakdown` | break down, split, decompose, divide |
| `plan` | plan, design, architect, how to |
| `refine` | improve, enhance, optimize, refactor |
| `implement` | implement, code, develop |

### Complexity Indicators

| Complexity | Keywords Detected |
|-----------|-------------------|
| `simple` | simple, basic, straightforward, quick |
| `medium` | medium, moderate, standard |
| `complex` | complex, advanced, microservices, distributed |
| `critical` | critical, security, payment, compliance |

## Fallback Behavior

If the AI cannot confidently determine the intent:

1. **Confidence < 50%**: Returns error asking for clarification
2. **Confidence 50-70%**: Defaults to `story` query type with warning
3. **Confidence > 70%**: Proceeds with analysis

## Backward Compatibility

**Don't worry!** The old structured approach still works perfectly:

```json
{
  "tool": "load_enhanced_context",
  "arguments": {
    "query_type": "architecture",
    "task_intent": "create",
    "scope": "epic"
  }
}
```

Both modes can be used together. Explicit parameters take precedence over inferred ones:

```json
{
  "tool": "load_enhanced_context",
  "arguments": {
    "task_statement": "Create a diagram",
    "complexity": "critical"  // Explicit override
  }
}
```

## API Integration

### For Vishkar

```javascript
// Natural language mode
const response = await fetch('https://enhanced-context-mcp.vercel.app/api/mcp', {
  method: 'POST',
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tool: 'load_enhanced_context',
    arguments: {
      task_statement: userInput // User's natural language description
    }
  })
});
```

### For Cursor/Claude

```
Use the enhanced context MCP with this statement:
"Create an architecture diagram for our payment system with microservices"
```

## Next Steps

1. **Try it out**: Use natural language in your next context load
2. **Experiment**: See what confidence levels you get
3. **Refine**: Use the analysis reasoning to understand what worked
4. **Iterate**: Adjust your statements based on feedback

---

**Ready to use?** Just call the MCP with a `task_statement` and let the AI do the heavy lifting!
