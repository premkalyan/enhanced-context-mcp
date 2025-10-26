/**
 * Intent Analyzer Service
 * Analyzes natural language task statements to infer structured context parameters
 * Uses pattern matching and keyword analysis to determine intent, scope, complexity, and domain focus
 */

export interface AnalyzedIntent {
  query_type: string;
  task_intent: 'create' | 'refine' | 'breakdown' | 'review' | 'plan' | 'implement';
  scope?: 'epic' | 'story' | 'subtask' | 'portfolio' | 'theme' | 'spike';
  complexity?: 'simple' | 'medium' | 'complex' | 'critical';
  output_format?: 'jira' | 'confluence' | 'github' | 'gitlab';
  domain_focus?: string[];
  confidence: number; // 0-1
  reasoning: string[];
  suggested_templates?: string[];
  suggested_contexts?: string[];
}

export class IntentAnalyzer {
  private readonly queryTypePatterns: Record<string, RegExp[]> = {
    'story': [
      /\b(create|write|draft|generate)\b.*\b(story|stories|user story|backlog)\b/i,
      /\b(story|stories)\b.*\b(for|about|regarding)\b/i,
      /\bwrite.*epic/i,
      /\bcreate.*backlog/i,
    ],
    'testing': [
      /\b(test|testing|qa|quality)\b/i,
      /\b(write|create)\b.*\b(test|tests|test plan|test case)\b/i,
      /\b(unit test|integration test|e2e test|end-to-end)\b/i,
    ],
    'security': [
      /\b(security|secure|vulnerability|vulnerabilities|audit|penetration)\b/i,
      /\b(review|audit|assess)\b.*\b(security|vulnerabilities)\b/i,
      /\b(authentication|authorization|encryption|compliance)\b/i,
    ],
    'architecture': [
      /\b(architecture|architectural|design|system design)\b/i,
      /\b(design|architect|structure)\b.*\b(system|application|service)\b/i,
      /\b(microservices|monolith|distributed|cloud)\b/i,
      /\btech stack/i,
    ],
    'architecture-diagrams': [
      /\b(diagram|diagrams|visual|visualization)\b/i,
      /\b(draw|create|generate)\b.*\b(diagram|architecture|flowchart)\b/i,
      /\b(mermaid|sequence diagram|flow diagram|component diagram)\b/i,
      /\b(architecture|system|infrastructure)\b.*\b(diagram|chart)\b/i,
      /\b(visualize|show|illustrate)\b.*\b(architecture|system|flow)\b/i,
    ],
    'pr-review': [
      /\b(review|pr|pull request|merge request|code review)\b/i,
      /\b(review|check|examine)\b.*\b(code|pr|pull request)\b/i,
    ],
    'browser-testing': [
      /\b(browser|playwright|selenium|cypress|puppeteer)\b/i,
      /\b(ui test|browser automation|e2e|end-to-end)\b/i,
    ],
    'project-planning': [
      /\b(plan|planning|project|roadmap|timeline)\b/i,
      /\b(project)\b.*\b(plan|planning|management)\b/i,
      /\b(sprint|milestone|release)\b/i,
    ],
    'story-breakdown': [
      /\b(breakdown|break down|decompose|split)\b/i,
      /\b(epic)\b.*\b(into|to)\b.*\b(stories|tasks)\b/i,
      /\b(break|split|divide)\b.*\b(epic|story)\b/i,
    ],
    'documentation': [
      /\b(document|documentation|doc|docs|confluence)\b/i,
      /\b(write|create)\b.*\b(documentation|guide|readme)\b/i,
      /\b(technical|api|user)\b.*\b(documentation|guide)\b/i,
    ],
    'flow-diagrams': [
      /\b(flow|flowchart|process flow|workflow)\b/i,
      /\b(user journey|user flow|process diagram)\b/i,
      /\b(sequence|swimlane|state)\b.*\b(diagram|flow)\b/i,
    ],
    'infrastructure': [
      /\b(infrastructure|terraform|cloudformation|iac|kubernetes|docker)\b/i,
      /\b(deploy|deployment|devops|ci\/cd|pipeline)\b/i,
      /\b(aws|azure|gcp|cloud)\b/i,
    ],
  };

  private readonly intentPatterns: Record<string, RegExp[]> = {
    'create': [
      /\b(create|write|draft|generate|build|make|develop)\b/i,
      /\bnew\b/i,
    ],
    'refine': [
      /\b(improve|enhance|refine|optimize|polish|update)\b/i,
      /\b(better|refactor)\b/i,
    ],
    'breakdown': [
      /\b(breakdown|break down|decompose|split|divide)\b/i,
      /\binto\b.*\b(smaller|tasks|subtasks)\b/i,
    ],
    'review': [
      /\b(review|audit|check|examine|assess|evaluate)\b/i,
    ],
    'plan': [
      /\b(plan|design|architect|strategize)\b/i,
      /\bhow to\b/i,
    ],
    'implement': [
      /\b(implement|code|develop|build)\b/i,
      /\bwrite.*code/i,
    ],
  };

  private readonly scopePatterns: Record<string, RegExp[]> = {
    'epic': [
      /\bepic\b/i,
      /\blarge feature\b/i,
      /\bmajor feature\b/i,
    ],
    'story': [
      /\bstory\b/i,
      /\buser story\b/i,
      /\bfeature\b/i,
    ],
    'subtask': [
      /\bsubtask\b/i,
      /\btask\b/i,
      /\bsmall\b/i,
    ],
    'portfolio': [
      /\bportfolio\b/i,
      /\bmultiple epic/i,
    ],
    'theme': [
      /\btheme\b/i,
      /\binitiative\b/i,
      /\bbusiness objective/i,
    ],
    'spike': [
      /\bspike\b/i,
      /\bresearch\b/i,
      /\bproof of concept\b/i,
      /\bpoc\b/i,
    ],
  };

  private readonly complexityIndicators = {
    simple: [
      /\bsimple\b/i,
      /\bbasic\b/i,
      /\bstraightforward\b/i,
      /\beasy\b/i,
      /\bquick\b/i,
    ],
    medium: [
      /\bmedium\b/i,
      /\bmoderate\b/i,
      /\bstandard\b/i,
    ],
    complex: [
      /\bcomplex\b/i,
      /\badvanced\b/i,
      /\bsophisticated\b/i,
      /\bmulti-tier\b/i,
      /\bmicroservices\b/i,
      /\bdistributed\b/i,
      /\bscalable\b/i,
    ],
    critical: [
      /\bcritical\b/i,
      /\bhigh-risk\b/i,
      /\bsecurity-sensitive\b/i,
      /\bmission-critical\b/i,
      /\bpayment\b/i,
      /\bfinancial\b/i,
      /\bcompliance\b/i,
    ],
  };

  private readonly domainKeywords: Record<string, RegExp[]> = {
    security: [
      /\bsecurity\b/i,
      /\bauthentication\b/i,
      /\bauthorization\b/i,
      /\bencryption\b/i,
      /\bvulnerability\b/i,
    ],
    payments: [
      /\bpayment\b/i,
      /\bpci\b/i,
      /\btransaction\b/i,
      /\bbilling\b/i,
    ],
    compliance: [
      /\bcompliance\b/i,
      /\bgdpr\b/i,
      /\bhipaa\b/i,
      /\bsoc2\b/i,
      /\bregulatory\b/i,
    ],
    performance: [
      /\bperformance\b/i,
      /\boptimization\b/i,
      /\bscale\b/i,
      /\blatency\b/i,
      /\bthroughput\b/i,
    ],
    accessibility: [
      /\baccessibility\b/i,
      /\ba11y\b/i,
      /\bwcag\b/i,
      /\bscreen reader\b/i,
    ],
    data: [
      /\bdata\b/i,
      /\bdatabase\b/i,
      /\betl\b/i,
      /\bdata pipeline\b/i,
    ],
    infrastructure: [
      /\binfrastructure\b/i,
      /\bkubernetes\b/i,
      /\bdocker\b/i,
      /\bterraform\b/i,
    ],
    api: [
      /\bapi\b/i,
      /\brest\b/i,
      /\bgraphql\b/i,
      /\bendpoint\b/i,
    ],
    frontend: [
      /\bfrontend\b/i,
      /\bui\b/i,
      /\breact\b/i,
      /\bvue\b/i,
      /\bangular\b/i,
    ],
    backend: [
      /\bbackend\b/i,
      /\bserver\b/i,
      /\bnode\b/i,
      /\bpython\b/i,
      /\bjava\b/i,
    ],
  };

  private readonly outputFormatPatterns: Record<string, RegExp[]> = {
    jira: [
      /\bjira\b/i,
      /\bissue\b/i,
      /\bticket\b/i,
    ],
    confluence: [
      /\bconfluence\b/i,
      /\bwiki\b/i,
      /\bdocumentation\b/i,
    ],
    github: [
      /\bgithub\b/i,
      /\bgh\b/i,
    ],
    gitlab: [
      /\bgitlab\b/i,
    ],
  };

  /**
   * Analyze a natural language task statement to infer structured parameters
   */
  analyze(statement: string): AnalyzedIntent {
    const reasoning: string[] = [];
    const domainFocus: string[] = [];
    let confidence = 0;

    // Normalize statement
    const normalized = statement.toLowerCase().trim();

    // Detect query type (most important)
    const queryType = this.detectQueryType(normalized);
    if (queryType) {
      reasoning.push(`Detected query type: ${queryType.type} (confidence: ${queryType.confidence})`);
      confidence += queryType.confidence * 0.4; // 40% weight
    }

    // Detect task intent
    const taskIntent = this.detectTaskIntent(normalized);
    if (taskIntent) {
      reasoning.push(`Detected task intent: ${taskIntent.intent} (confidence: ${taskIntent.confidence})`);
      confidence += taskIntent.confidence * 0.2; // 20% weight
    }

    // Detect scope
    const scope = this.detectScope(normalized);
    if (scope) {
      reasoning.push(`Detected scope: ${scope.scope} (confidence: ${scope.confidence})`);
      confidence += scope.confidence * 0.15; // 15% weight
    }

    // Detect complexity
    const complexity = this.detectComplexity(normalized);
    if (complexity) {
      reasoning.push(`Detected complexity: ${complexity.level} (confidence: ${complexity.confidence})`);
      confidence += complexity.confidence * 0.1; // 10% weight
    }

    // Detect output format
    const outputFormat = this.detectOutputFormat(normalized);
    if (outputFormat) {
      reasoning.push(`Detected output format: ${outputFormat.format}`);
      confidence += 0.05; // 5% weight
    }

    // Detect domain focus
    const domains = this.detectDomains(normalized);
    if (domains.length > 0) {
      domainFocus.push(...domains);
      reasoning.push(`Detected domain focus: ${domains.join(', ')}`);
      confidence += 0.1; // 10% weight
    }

    // If no query type detected, infer from intent and context
    const finalQueryType = queryType?.type || this.inferQueryTypeFromContext(statement, taskIntent?.intent);
    if (!queryType && finalQueryType) {
      reasoning.push(`Inferred query type from context: ${finalQueryType}`);
      confidence += 0.3;
    }

    // Normalize confidence to 0-1 range
    const normalizedConfidence = Math.min(confidence, 1.0);

    return {
      query_type: finalQueryType,
      task_intent: taskIntent?.intent || 'create',
      scope: scope?.scope,
      complexity: complexity?.level,
      output_format: outputFormat?.format,
      domain_focus: domainFocus.length > 0 ? domainFocus : undefined,
      confidence: normalizedConfidence,
      reasoning,
    };
  }

  private detectQueryType(statement: string): { type: string; confidence: number } | null {
    let bestMatch: { type: string; confidence: number } | null = null;
    let highestScore = 0;

    for (const [type, patterns] of Object.entries(this.queryTypePatterns)) {
      let score = 0;
      let matchCount = 0;

      for (const pattern of patterns) {
        if (pattern.test(statement)) {
          matchCount++;
          // Higher weight for exact matches
          score += pattern.source.includes('\\b') ? 1.0 : 0.5;
        }
      }

      if (matchCount > 0) {
        const confidence = Math.min(score / patterns.length, 1.0);
        if (score > highestScore) {
          highestScore = score;
          bestMatch = { type, confidence };
        }
      }
    }

    return bestMatch;
  }

  private detectTaskIntent(statement: string): { intent: 'create' | 'refine' | 'breakdown' | 'review' | 'plan' | 'implement'; confidence: number } | null {
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(statement)) {
          return {
            intent: intent as 'create' | 'refine' | 'breakdown' | 'review' | 'plan' | 'implement',
            confidence: 0.8,
          };
        }
      }
    }
    return null;
  }

  private detectScope(statement: string): { scope: 'epic' | 'story' | 'subtask' | 'portfolio' | 'theme' | 'spike'; confidence: number } | null {
    for (const [scope, patterns] of Object.entries(this.scopePatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(statement)) {
          return {
            scope: scope as 'epic' | 'story' | 'subtask' | 'portfolio' | 'theme' | 'spike',
            confidence: 0.7,
          };
        }
      }
    }
    return null;
  }

  private detectComplexity(statement: string): { level: 'simple' | 'medium' | 'complex' | 'critical'; confidence: number } | null {
    // Check critical first (highest priority)
    for (const pattern of this.complexityIndicators.critical) {
      if (pattern.test(statement)) {
        return { level: 'critical', confidence: 0.9 };
      }
    }

    // Check complex
    for (const pattern of this.complexityIndicators.complex) {
      if (pattern.test(statement)) {
        return { level: 'complex', confidence: 0.8 };
      }
    }

    // Check simple
    for (const pattern of this.complexityIndicators.simple) {
      if (pattern.test(statement)) {
        return { level: 'simple', confidence: 0.7 };
      }
    }

    // Check medium
    for (const pattern of this.complexityIndicators.medium) {
      if (pattern.test(statement)) {
        return { level: 'medium', confidence: 0.6 };
      }
    }

    // Default to medium if no indicators found
    return null;
  }

  private detectOutputFormat(statement: string): { format: 'jira' | 'confluence' | 'github' | 'gitlab' } | null {
    for (const [format, patterns] of Object.entries(this.outputFormatPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(statement)) {
          return { format: format as 'jira' | 'confluence' | 'github' | 'gitlab' };
        }
      }
    }
    return null;
  }

  private detectDomains(statement: string): string[] {
    const domains: string[] = [];

    for (const [domain, patterns] of Object.entries(this.domainKeywords)) {
      for (const pattern of patterns) {
        if (pattern.test(statement)) {
          domains.push(domain);
          break; // Only add once per domain
        }
      }
    }

    return domains;
  }

  private inferQueryTypeFromContext(statement: string, intent?: string): string {
    // Use intent to guess query type if not directly detected
    if (intent === 'breakdown') return 'story-breakdown';
    if (intent === 'review') return 'pr-review';
    if (intent === 'plan') return 'architecture';
    if (intent === 'implement') return 'documentation';

    // Default fallback
    return 'story';
  }
}
