# Enhanced Context MCP - Intelligence Improvements Proposal

## Executive Summary

**Current Problem**: "Sometimes I feel we don't get the right context back" - User feedback is 100% accurate. The current system uses static mappings with zero intelligence.

**Root Cause**: Context selection is a simple dictionary lookup with no analysis of actual needs, project characteristics, or user intent.

**Solution**: Transform from "dumb mapping" to "intelligent context selection" with semantic understanding and project profiling.

---

## Current State Analysis

### What Works Now
✅ Clean separation of concerns (services are well-structured)
✅ Basic caching (agent profiles cached for 1 hour)
✅ Parallel loading (contexts, templates, agents loaded concurrently)
✅ Type-safe TypeScript throughout

### What Doesn't Work
❌ **Static context mapping** - No intelligence, just hardcoded lists
❌ **Agent selection ignores templates** - Doesn't consider template requirements
❌ **No project profiling** - Treats all projects the same
❌ **No semantic understanding** - Can't understand actual user intent
❌ **All-or-nothing loading** - Loads ALL contexts from mapping, no prioritization
❌ **No feedback loop** - Doesn't learn from what works

---

## Improvement 1: Intelligent Context Selection

### Current Logic (Dumb)
```typescript
// config/context-mappings.json
{
  "story": {
    "contexts": ["c-core-sdlc", "c-jira-management"],
    "templates": ["epic-specification"]
  }
}

// Always loads ALL these contexts, regardless of need
const contexts = await this.contextService.loadGlobalContexts(mapping.contexts);
```

**Problem**: No analysis. If query type is "story", ALWAYS load Jira context even if project doesn't use Jira.

### Proposed Logic (Smart)
```typescript
interface ContextRelevanceScore {
  contextName: string;
  relevanceScore: number;  // 0-1
  reasoning: string[];
  source: 'required' | 'recommended' | 'optional';
}

async selectRelevantContexts(args: {
  query_type: string;
  project_path?: string;
  user_query?: string;
  max_contexts?: number;
}): Promise<ContextSelectionResult> {

  // 1. Get base mapping
  const mapping = ConfigLoader.getInstance().getMapping(args.query_type);

  // 2. Profile the project
  const projectProfile = await this.analyzeProjectProfile(args.project_path);

  // 3. Score each context for relevance
  const candidateContexts = await this.listAvailableContexts();
  const scoredContexts = await Promise.all(
    candidateContexts.map(ctx =>
      this.scoreContextRelevance(ctx, args.query_type, projectProfile, args.user_query)
    )
  );

  // 4. Filter and rank
  const relevantContexts = scoredContexts
    .filter(c => c.relevanceScore >= 0.3) // Only load if 30%+ relevant
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, args.max_contexts || 5);

  // 5. Ensure critical contexts are included
  const criticalContexts = mapping.contexts.filter(name =>
    this.isCriticalContext(name, args.query_type)
  );

  return {
    contexts: this.mergeContexts(criticalContexts, relevantContexts),
    reasoning: this.explainSelection(relevantContexts, projectProfile),
    projectProfile
  };
}
```

### Context Relevance Scoring Algorithm

```typescript
async scoreContextRelevance(
  contextName: string,
  queryType: string,
  projectProfile: ProjectProfile,
  userQuery?: string
): Promise<ContextRelevanceScore> {

  let score = 0;
  const reasoning: string[] = [];
  let source: 'required' | 'recommended' | 'optional' = 'optional';

  // FACTOR 1: Base mapping (50% weight)
  const mapping = this.getMapping(queryType);
  if (mapping.contexts.includes(contextName)) {
    score += 0.5;
    source = 'required';
    reasoning.push(`Required for ${queryType} queries`);
  }

  // FACTOR 2: Project technology matching (30% weight)
  const techMatch = this.calculateTechnologyMatch(contextName, projectProfile);
  if (techMatch > 0) {
    score += techMatch * 0.3;
    reasoning.push(`Project uses ${projectProfile.technologies.join(', ')}`);
  }

  // FACTOR 3: Framework alignment (10% weight)
  const frameworkMatch = this.calculateFrameworkMatch(contextName, projectProfile);
  if (frameworkMatch > 0) {
    score += frameworkMatch * 0.1;
    reasoning.push(`Matches project framework: ${projectProfile.frameworks.join(', ')}`);
  }

  // FACTOR 4: Semantic similarity to user query (10% weight)
  if (userQuery) {
    const semanticScore = await this.calculateSemanticSimilarity(
      userQuery,
      contextName,
      await this.getContextSummary(contextName)
    );
    score += semanticScore * 0.1;
    if (semanticScore > 0.5) {
      reasoning.push(`High semantic relevance to query: "${userQuery}"`);
    }
  }

  // FACTOR 5: Historical usage patterns (bonus)
  const usageData = await this.getContextUsageStats(contextName, queryType);
  if (usageData && usageData.successRate > 0.7) {
    score *= 1.1; // 10% bonus
    reasoning.push(`High success rate in similar queries (${Math.round(usageData.successRate * 100)}%)`);
  }

  // FACTOR 6: Project-specific overrides
  const projectOverrides = await this.getProjectContextPreferences(projectProfile.projectId);
  if (projectOverrides?.preferred.includes(contextName)) {
    score += 0.2;
    source = 'recommended';
    reasoning.push('Explicitly preferred for this project');
  }
  if (projectOverrides?.excluded.includes(contextName)) {
    score = 0;
    reasoning.push('Explicitly excluded for this project');
  }

  return {
    contextName,
    relevanceScore: Math.min(score, 1.0),
    reasoning,
    source
  };
}
```

### Technology Matching
```typescript
private calculateTechnologyMatch(
  contextName: string,
  projectProfile: ProjectProfile
): number {
  // Map context names to technologies
  const contextTechMap: Record<string, string[]> = {
    'c-jira-management': ['jira', 'atlassian'],
    'c-testing-strategy': ['jest', 'mocha', 'vitest', 'cypress', 'playwright'],
    'c-pr-review': ['git', 'github', 'gitlab'],
    'c-confluence-docs': ['confluence', 'atlassian'],
    'c-infrastructure-as-code': ['terraform', 'pulumi', 'cloudformation'],
    'c-browser-tools-testing': ['selenium', 'puppeteer', 'playwright', 'cypress'],
    'c-cloud-data-engineering': ['airflow', 'spark', 'databricks', 'snowflake'],
  };

  const contextTechs = contextTechMap[contextName] || [];
  const projectTechs = projectProfile.technologies.map(t => t.toLowerCase());

  const matches = contextTechs.filter(tech =>
    projectTechs.some(pt => pt.includes(tech) || tech.includes(pt))
  );

  return matches.length / Math.max(contextTechs.length, 1);
}
```

---

## Improvement 2: Project Profiling

### Why It's Critical
**Current**: Treats all projects the same. A React frontend project gets same contexts as a Python ML backend.

**Proposed**: Analyze project structure and characteristics to tailor context selection.

### Implementation

```typescript
interface ProjectProfile {
  projectId?: string;
  projectType: 'frontend' | 'backend' | 'fullstack' | 'library' | 'mobile' | 'data' | 'ml';
  technologies: string[];  // ['React', 'TypeScript', 'Jest']
  frameworks: string[];    // ['Next.js', 'Express']
  languages: string[];     // ['TypeScript', 'Python']
  hasTests: boolean;
  testFrameworks: string[];
  hasCI: boolean;
  ciTools: string[];
  hasDocker: boolean;
  hasTerraform: boolean;
  hasJiraIntegration: boolean;
  hasConfluence: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'pip' | 'poetry' | 'cargo' | 'go' | 'gradle';
  monorepo: boolean;
  teamSize?: 'solo' | 'small' | 'medium' | 'large';
  maturity?: 'prototype' | 'mvp' | 'production';
}

async analyzeProjectProfile(projectPath?: string): Promise<ProjectProfile> {
  if (!projectPath) {
    return this.getDefaultProfile();
  }

  const profile: ProjectProfile = {
    projectType: 'fullstack',
    technologies: [],
    frameworks: [],
    languages: [],
    hasTests: false,
    testFrameworks: [],
    hasCI: false,
    ciTools: [],
    hasDocker: false,
    hasTerraform: false,
    hasJiraIntegration: false,
    hasConfluence: false,
    packageManager: 'npm',
    monorepo: false,
  };

  try {
    // 1. Analyze package.json (Node.js projects)
    const packageJson = await this.readPackageJson(projectPath);
    if (packageJson) {
      profile.technologies = this.extractTechnologies(packageJson);
      profile.frameworks = this.extractFrameworks(packageJson);
      profile.hasTests = !!packageJson.scripts?.test;
      profile.testFrameworks = this.detectTestFrameworks(packageJson);
      profile.packageManager = await this.detectPackageManager(projectPath);
    }

    // 2. Analyze pyproject.toml / requirements.txt (Python projects)
    const pythonConfig = await this.analyzePythonProject(projectPath);
    if (pythonConfig) {
      profile.technologies.push(...pythonConfig.technologies);
      profile.languages.push('Python');
      profile.packageManager = pythonConfig.packageManager;
    }

    // 3. Check for CI configuration
    const ciConfig = await this.detectCITools(projectPath);
    profile.hasCI = ciConfig.length > 0;
    profile.ciTools = ciConfig;

    // 4. Check for Docker
    profile.hasDocker = await this.storageAdapter.exists(`${projectPath}/Dockerfile`) ||
                        await this.storageAdapter.exists(`${projectPath}/docker-compose.yml`);

    // 5. Check for Terraform
    profile.hasTerraform = (await this.storageAdapter.list(`${projectPath}`))
      .some(file => file.endsWith('.tf'));

    // 6. Check for Jira integration
    profile.hasJiraIntegration = await this.detectJiraIntegration(projectPath);

    // 7. Check for Confluence
    profile.hasConfluence = await this.storageAdapter.exists(`${projectPath}/.confluence`);

    // 8. Detect monorepo
    profile.monorepo = await this.isMonorepo(projectPath);

    // 9. Infer project type
    profile.projectType = this.inferProjectType(profile);

    // 10. Detect languages
    profile.languages = await this.detectLanguages(projectPath);

  } catch (error) {
    console.error('Error profiling project:', error);
  }

  return profile;
}

private extractTechnologies(packageJson: any): string[] {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  const techMap: Record<string, string[]> = {
    'react': ['React'],
    'vue': ['Vue'],
    'angular': ['Angular'],
    'next': ['Next.js'],
    'express': ['Express'],
    'fastapi': ['FastAPI'],
    'jest': ['Jest'],
    'vitest': ['Vitest'],
    'playwright': ['Playwright'],
    'cypress': ['Cypress'],
    'prisma': ['Prisma'],
    'typeorm': ['TypeORM'],
    '@vercel/blob': ['Vercel Blob'],
    '@vercel/kv': ['Vercel KV'],
  };

  const technologies: Set<string> = new Set();

  for (const [dep, tech] of Object.entries(techMap)) {
    if (deps[dep]) {
      tech.forEach(t => technologies.add(t));
    }
  }

  return Array.from(technologies);
}

private detectTestFrameworks(packageJson: any): string[] {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  const frameworks = [];
  if (deps.jest) frameworks.push('Jest');
  if (deps.vitest) frameworks.push('Vitest');
  if (deps.mocha) frameworks.push('Mocha');
  if (deps.playwright) frameworks.push('Playwright');
  if (deps.cypress) frameworks.push('Cypress');

  return frameworks;
}

private async detectCITools(projectPath: string): Promise<string[]> {
  const tools = [];

  if (await this.storageAdapter.exists(`${projectPath}/.github/workflows`)) {
    tools.push('GitHub Actions');
  }
  if (await this.storageAdapter.exists(`${projectPath}/.gitlab-ci.yml`)) {
    tools.push('GitLab CI');
  }
  if (await this.storageAdapter.exists(`${projectPath}/.circleci`)) {
    tools.push('CircleCI');
  }
  if (await this.storageAdapter.exists(`${projectPath}/.travis.yml`)) {
    tools.push('Travis CI');
  }
  if (await this.storageAdapter.exists(`${projectPath}/Jenkinsfile`)) {
    tools.push('Jenkins');
  }

  return tools;
}

private inferProjectType(profile: ProjectProfile): ProjectProfile['projectType'] {
  // Frontend indicators
  const frontendTechs = ['React', 'Vue', 'Angular', 'Next.js', 'Svelte'];
  const hasFrontend = profile.technologies.some(t => frontendTechs.includes(t));

  // Backend indicators
  const backendTechs = ['Express', 'FastAPI', 'Django', 'Flask', 'NestJS'];
  const hasBackend = profile.technologies.some(t => backendTechs.includes(t));

  // Data/ML indicators
  const dataTechs = ['Spark', 'Airflow', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch'];
  const hasData = profile.technologies.some(t => dataTechs.includes(t));

  if (hasData) return 'data';
  if (hasFrontend && hasBackend) return 'fullstack';
  if (hasFrontend) return 'frontend';
  if (hasBackend) return 'backend';

  // Check for library indicators
  if (profile.frameworks.length === 0 && profile.technologies.length > 0) {
    return 'library';
  }

  return 'fullstack'; // Default
}
```

---

## Improvement 3: Template-Aware Agent Selection

### Current Problem
```typescript
// AgentService.ts:119-131
const agentMappings: Record<string, string> = {
  'story': 'product-manager',
  'testing': 'qa-engineer',
  // Static mapping - ignores template requirements!
};
```

**Issue**: If query type is "story" but template is "technical-architecture", we still select product-manager (wrong!).

### Proposed Solution

```typescript
async selectAgentForQueryType(
  queryType: string,
  templateNames: string[],
  projectProfile?: ProjectProfile,
  taskComplexity?: 'simple' | 'medium' | 'complex'
): Promise<EnhancedAgentSelection> {

  // 1. Analyze template requirements
  const templateRequirements = await this.analyzeTemplateRequirements(templateNames);

  // 2. Get all agents
  const allAgents = await this.listVishkarAgents('all');

  // 3. Score each agent
  const scoredAgents = await Promise.all(
    allAgents.map(async agent => ({
      agent,
      score: await this.calculateAgentFitScore(
        agent,
        queryType,
        templateRequirements,
        projectProfile,
        taskComplexity
      ),
      reasoning: []
    }))
  );

  // 4. Sort by score
  const ranked = scoredAgents
    .sort((a, b) => b.score - a.score);

  // 5. For complex tasks, suggest multiple agents
  const topAgent = ranked[0];
  const alternatives = ranked.slice(1, 4);

  return {
    selected: topAgent?.agent || null,
    score: topAgent?.score || 0,
    alternatives: alternatives.map(a => ({
      agent: a.agent,
      score: a.score
    })),
    reasoning: this.explainAgentSelection(topAgent, templateRequirements),
    suggestMultiAgent: taskComplexity === 'complex' && ranked.length >= 2
  };
}

async calculateAgentFitScore(
  agent: AgentMetadata,
  queryType: string,
  templateReqs: TemplateRequirements,
  projectProfile?: ProjectProfile,
  complexity?: string
): Promise<number> {

  let score = 0;

  // FACTOR 1: Base query type match (40% weight)
  const baseMapping = this.getBaseAgentMapping(queryType);
  if (agent.id === baseMapping) {
    score += 0.4;
  }

  // FACTOR 2: Template specialization match (30% weight)
  const specializationMatch = this.calculateSpecializationMatch(
    agent.specializations || [],
    templateReqs.requiredSpecializations
  );
  score += specializationMatch * 0.3;

  // FACTOR 3: Project technology alignment (20% weight)
  if (projectProfile) {
    const techAlignment = this.calculateTechAlignment(
      agent,
      projectProfile
    );
    score += techAlignment * 0.2;
  }

  // FACTOR 4: Complexity handling (10% weight)
  if (complexity === 'complex') {
    // Prefer senior/architect agents for complex tasks
    if (agent.name.toLowerCase().includes('architect') ||
        agent.name.toLowerCase().includes('senior')) {
      score += 0.1;
    }
  }

  return Math.min(score, 1.0);
}

async analyzeTemplateRequirements(templateNames: string[]): Promise<TemplateRequirements> {
  const requirements: TemplateRequirements = {
    requiredSpecializations: [],
    preferredAgentTypes: [],
    complexity: 'medium'
  };

  for (const templateName of templateNames) {
    const template = await this.templateService.getTemplateByName(templateName);
    if (!template) continue;

    // Analyze template content for required skills
    if (templateName.includes('architecture')) {
      requirements.requiredSpecializations.push('architecture', 'design');
      requirements.preferredAgentTypes.push('architect', 'technical');
    }

    if (templateName.includes('epic') || templateName.includes('story')) {
      requirements.requiredSpecializations.push('product', 'agile', 'user-stories');
      requirements.preferredAgentTypes.push('product-manager', 'business-analyst');
    }

    if (templateName.includes('test')) {
      requirements.requiredSpecializations.push('testing', 'qa', 'automation');
      requirements.preferredAgentTypes.push('qa-engineer', 'test-automation');
    }

    if (templateName.includes('security')) {
      requirements.requiredSpecializations.push('security', 'compliance');
      requirements.preferredAgentTypes.push('security-engineer', 'security-auditor');
    }

    if (templateName.includes('infrastructure') || templateName.includes('terraform')) {
      requirements.requiredSpecializations.push('devops', 'infrastructure', 'cloud');
      requirements.preferredAgentTypes.push('devops-engineer', 'cloud-architect');
    }
  }

  return requirements;
}
```

---

## Improvement 4: Context Usage Analytics

### Track What Actually Works

```typescript
interface ContextUsageEvent {
  requestId: string;
  timestamp: Date;
  queryType: string;
  projectProfile: ProjectProfile;
  contextsLoaded: string[];
  templatesUsed: string[];
  agentSelected: string;
  userFeedback?: 'helpful' | 'not_helpful';
  completionTime?: number;
}

class ContextAnalyticsService {
  async trackUsage(event: ContextUsageEvent): Promise<void> {
    // Store in Vercel KV for analysis
    await kv.lpush('context-usage-events', JSON.stringify(event));

    // Update aggregated statistics
    for (const contextName of event.contextsLoaded) {
      await this.incrementContextUsage(contextName, event.queryType);
    }
  }

  async getContextEffectiveness(
    contextName: string,
    queryType: string
  ): Promise<ContextEffectiveness> {
    const usageKey = `context-stats:${contextName}:${queryType}`;
    const stats = await kv.hgetall(usageKey);

    if (!stats) {
      return {
        usageCount: 0,
        successRate: 0.5, // Neutral default
        averageCompletionTime: 0
      };
    }

    return {
      usageCount: stats.count || 0,
      successRate: stats.helpful / (stats.helpful + stats.not_helpful) || 0.5,
      averageCompletionTime: stats.totalTime / stats.count || 0
    };
  }

  async getOptimalContextsForQueryType(queryType: string): Promise<string[]> {
    // Get all contexts with usage data
    const allContexts = await this.contextService.listAvailableContexts();

    const effectiveness = await Promise.all(
      allContexts.map(async ctx => ({
        context: ctx,
        stats: await this.getContextEffectiveness(ctx, queryType)
      }))
    );

    // Return contexts with >70% success rate, sorted by usage
    return effectiveness
      .filter(e => e.stats.successRate > 0.7 && e.stats.usageCount > 5)
      .sort((a, b) => b.stats.usageCount - a.stats.usageCount)
      .map(e => e.context);
  }
}
```

---

## Improvement 5: Semantic Context Matching

### For Advanced Query Understanding

```typescript
async calculateSemanticSimilarity(
  userQuery: string,
  contextName: string,
  contextSummary: string
): Promise<number> {
  // Simple keyword-based matching (can be upgraded to embedding-based later)

  const queryTokens = this.tokenize(userQuery.toLowerCase());
  const contextTokens = this.tokenize(contextSummary.toLowerCase());

  // Calculate Jaccard similarity
  const intersection = queryTokens.filter(t => contextTokens.includes(t));
  const union = new Set([...queryTokens, ...contextTokens]);

  const jaccardScore = intersection.length / union.size;

  // Boost for exact matches
  let score = jaccardScore;
  const contextNameTokens = this.tokenize(contextName.toLowerCase());
  if (queryTokens.some(qt => contextNameTokens.includes(qt))) {
    score *= 1.5; // 50% boost
  }

  return Math.min(score, 1.0);
}

// For future: Use embeddings for better semantic matching
async calculateSemanticSimilarityWithEmbeddings(
  userQuery: string,
  contextSummary: string
): Promise<number> {
  // Use OpenAI embeddings or similar
  // This would provide much better semantic understanding
  // But requires external API call

  // const queryEmbedding = await openai.embeddings.create({
  //   model: "text-embedding-ada-002",
  //   input: userQuery,
  // });

  // const contextEmbedding = await openai.embeddings.create({
  //   model: "text-embedding-ada-002",
  //   input: contextSummary,
  // });

  // return cosineSimilarity(queryEmbedding, contextEmbedding);

  return 0.5; // Placeholder
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
**Priority: Critical - Fixes broken intelligence**

1. ✅ **Implement Project Profiling**
   - Files: `lib/services/ProjectProfileService.ts` (NEW)
   - Test: `tests/services/ProjectProfileService.test.ts` (NEW)
   - Estimated: 8 hours

2. ✅ **Add Context Relevance Scoring**
   - Files: `lib/services/ContextService.ts` (UPDATE)
   - Add: `scoreContextRelevance()` method
   - Estimated: 6 hours

3. ✅ **Update EnhancedContextService to use scoring**
   - Files: `lib/services/EnhancedContextService.ts` (UPDATE)
   - Change: `loadEnhancedContext()` to use smart selection
   - Estimated: 4 hours

**Deliverable**: Context loading becomes intelligent instead of static

---

### Phase 2: Agent Intelligence (Week 2)
**Priority: High - Addresses template/agent mismatch**

4. ✅ **Implement Template Requirements Analysis**
   - Files: `lib/services/TemplateService.ts` (UPDATE)
   - Add: `analyzeTemplateRequirements()` method
   - Estimated: 4 hours

5. ✅ **Update Agent Selection Algorithm**
   - Files: `lib/services/AgentService.ts` (UPDATE)
   - Add: `calculateAgentFitScore()` method
   - Estimated: 6 hours

6. ✅ **Integrate Template-Aware Selection**
   - Files: `lib/services/EnhancedContextService.ts` (UPDATE)
   - Pass template info to agent selection
   - Estimated: 2 hours

**Deliverable**: Agent selection considers templates and project type

---

### Phase 3: Analytics & Learning (Week 3)
**Priority: Medium - Enables continuous improvement**

7. ✅ **Implement Usage Tracking**
   - Files: `lib/services/ContextAnalyticsService.ts` (NEW)
   - Storage: Vercel KV
   - Estimated: 6 hours

8. ✅ **Add Feedback Mechanism**
   - Files: `app/api/mcp/route.ts` (UPDATE)
   - New endpoint: `/api/mcp/feedback`
   - Estimated: 4 hours

9. ✅ **Integrate Analytics into Selection**
   - Files: `lib/services/ContextService.ts` (UPDATE)
   - Use historical data to boost scores
   - Estimated: 4 hours

**Deliverable**: System learns from usage patterns

---

### Phase 4: Advanced Features (Week 4)
**Priority: Low - Nice to have**

10. ✅ **Semantic Similarity Matching**
    - Files: `lib/utils/semanticMatcher.ts` (NEW)
    - Optional: Integrate OpenAI embeddings API
    - Estimated: 8 hours

11. ✅ **Context Explanation System**
    - Files: `lib/services/ExplanationService.ts` (NEW)
    - Generate human-readable reasoning
    - Estimated: 4 hours

12. ✅ **A/B Testing Framework**
    - Test different selection algorithms
    - Estimated: 6 hours

**Deliverable**: Advanced AI-powered context selection

---

## Expected Improvements

### Before (Current System)
```json
{
  "query_type": "story",
  "contexts_loaded": [
    "c-core-sdlc",      // Always loaded
    "c-jira-management"  // Always loaded (even if no Jira!)
  ],
  "reasoning": "Static mapping for query type: story"
}
```

### After (Smart System)
```json
{
  "query_type": "story",
  "project_profile": {
    "type": "frontend",
    "technologies": ["React", "TypeScript", "Vite"],
    "has_jira": false,
    "has_ci": true
  },
  "contexts_loaded": [
    {
      "name": "c-core-sdlc",
      "relevance_score": 0.95,
      "reasoning": [
        "Required for story queries",
        "Project uses agile workflow"
      ]
    },
    {
      "name": "c-pr-review",
      "relevance_score": 0.72,
      "reasoning": [
        "Project has GitHub Actions CI",
        "High historical success rate (85%) for frontend projects"
      ]
    }
  ],
  "contexts_excluded": [
    {
      "name": "c-jira-management",
      "relevance_score": 0.15,
      "reasoning": [
        "Project does not use Jira",
        "No .jira/ directory found"
      ]
    }
  ],
  "agent_selected": {
    "name": "frontend-engineer",
    "score": 0.88,
    "reasoning": [
      "Project is React-based frontend",
      "Template requires UI/component expertise",
      "Agent specializes in React, TypeScript, component architecture"
    ],
    "alternatives": [
      {
        "name": "product-manager",
        "score": 0.45,
        "reasoning": "Good for story creation but lacks technical frontend knowledge"
      }
    ]
  }
}
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('ContextService - Smart Selection', () => {
  it('should score Jira context low for non-Jira projects', async () => {
    const projectProfile = {
      projectType: 'frontend',
      technologies: ['React'],
      hasJiraIntegration: false
    };

    const score = await contextService.scoreContextRelevance(
      'c-jira-management',
      'story',
      projectProfile
    );

    expect(score.relevanceScore).toBeLessThan(0.3);
  });

  it('should score Jira context high for Jira projects', async () => {
    const projectProfile = {
      projectType: 'fullstack',
      technologies: ['React', 'Node.js'],
      hasJiraIntegration: true
    };

    const score = await contextService.scoreContextRelevance(
      'c-jira-management',
      'story',
      projectProfile
    );

    expect(score.relevanceScore).toBeGreaterThan(0.7);
  });
});

describe('AgentService - Template-Aware Selection', () => {
  it('should select architect for architecture templates', async () => {
    const selection = await agentService.selectAgentForQueryType(
      'architecture',
      ['technical-architecture'],
      mockProjectProfile
    );

    expect(selection.selected?.name).toContain('architect');
  });

  it('should select product manager for epic templates', async () => {
    const selection = await agentService.selectAgentForQueryType(
      'story',
      ['epic-specification'],
      mockProjectProfile
    );

    expect(selection.selected?.name).toContain('product-manager');
  });
});
```

### Integration Tests
```typescript
describe('EnhancedContextService - End-to-End', () => {
  it('should return smart context selection for React project', async () => {
    const result = await enhancedContextService.loadEnhancedContext({
      query_type: 'story',
      project_path: '/test/react-project',
      user_query: 'Create user authentication flow'
    });

    expect(result.contexts).toContainEqual(
      expect.objectContaining({
        name: 'c-core-sdlc',
        relevanceScore: expect.any(Number)
      })
    );

    expect(result.reasoning).toBeDefined();
    expect(result.projectProfile).toBeDefined();
  });
});
```

---

## Monitoring & Metrics

### Key Metrics to Track

1. **Context Relevance Accuracy**
   - Track user feedback on context usefulness
   - Target: >80% "helpful" ratings

2. **Load Time Impact**
   - Measure additional latency from profiling
   - Target: <200ms overhead

3. **Agent Selection Accuracy**
   - Track how often selected agent completes task successfully
   - Target: >85% success rate

4. **Context Reduction**
   - Measure how many contexts are filtered out
   - Target: 20-40% reduction in loaded contexts

### Dashboard Metrics
```typescript
interface ContextMetrics {
  totalRequests: number;
  averageContextsLoaded: number;
  averageRelevanceScore: number;
  userFeedbackPositive: number;
  userFeedbackNegative: number;
  averageLoadTime: number;
  mostUsedContexts: Array<{name: string; count: number}>;
  leastUsedContexts: Array<{name: string; count: number}>;
}
```

---

## Success Criteria

### Must Have (Phase 1-2)
- ✅ Context selection considers project characteristics
- ✅ Agent selection considers template requirements
- ✅ System explains its selection reasoning
- ✅ Relevance scoring reduces unnecessary context loading by 20%+

### Should Have (Phase 3)
- ✅ Usage analytics tracks what works
- ✅ System learns from feedback
- ✅ Historical patterns influence future selections

### Nice to Have (Phase 4)
- ✅ Semantic matching for advanced queries
- ✅ A/B testing framework for continuous optimization
- ✅ Multi-agent orchestration for complex tasks

---

## Conclusion

**Current State**: You're right - "Sometimes I feel we don't get the right context back" because the system is using dumb static mappings.

**Root Cause**: No intelligence in context selection, no project awareness, no template consideration in agent selection.

**Solution**: Implement 4-phase improvement plan that transforms the system from static mapping to intelligent, project-aware, learning-enabled context selection.

**Impact**:
- 20-40% reduction in loaded contexts (faster, more focused)
- 80%+ relevance accuracy (right context every time)
- Template-aware agent selection (correct expertise)
- Continuous learning from usage patterns

**Timeline**: 4 weeks to full implementation, 1 week to critical improvements (Phase 1)

**Recommendation**: Start with Phase 1 immediately - it addresses the core complaint and provides immediate value.
