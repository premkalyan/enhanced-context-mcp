/**
 * Enhanced Query Type Definitions
 * Provides rich parameters for better task intent understanding
 */

export type TaskIntent = 'create' | 'refine' | 'breakdown' | 'review' | 'plan' | 'implement';
export type TaskScope = 'epic' | 'story' | 'subtask' | 'portfolio' | 'theme' | 'spike';
export type TaskComplexity = 'simple' | 'medium' | 'complex' | 'critical';
export type OutputFormat = 'jira' | 'confluence' | 'github' | 'gitlab' | 'report' | 'presentation';

export interface EnhancedQueryParameters {
  // Base query type (existing)
  query_type: string;

  // Enhanced parameters for better understanding
  task_intent?: TaskIntent;
  scope?: TaskScope;
  complexity?: TaskComplexity;
  output_format?: OutputFormat;

  // SDLC integration
  include_sdlc_checks?: boolean;
  current_sdlc_step?: number;

  // Domain-specific needs
  domain_focus?: string[];  // e.g., ['security', 'payments', 'compliance']

  // User context
  user_query?: string;  // Free-form description of what they want
  project_path?: string; // Still useful for some analysis

  // Multi-step workflow
  previous_step?: string;  // What was done before
  next_steps?: string[];   // What comes after
}

export interface SDLCStep {
  step: number;
  name: string;
  status: 'completed' | 'current' | 'pending' | 'skipped';
  description: string;
  checks: SDLCCheck[];
  artifacts: string[];  // Expected deliverables
  nextSteps: string[];  // What to do next
}

export interface SDLCCheck {
  id: string;
  description: string;
  status: 'complete' | 'incomplete' | 'not_applicable';
  severity: 'required' | 'recommended' | 'optional';
  automatable: boolean;
}

export interface TaskGuidance {
  // Jira-specific guidance
  epicPrefixRequired?: boolean;
  epicPrefixFormat?: string;
  storyStructure?: string;
  acceptanceCriteriaFormat?: string;

  // Quality checks
  qualityChecks: string[];

  // Common pitfalls
  commonMistakes: string[];

  // Best practices
  bestPractices: string[];

  // Dependencies
  prerequisites: string[];
  dependencies: string[];
}

export interface ContextCombination {
  id: string;
  name: string;
  description: string;

  // Matching criteria
  queryType: string;
  taskIntent?: TaskIntent;
  scope?: TaskScope;
  complexity?: TaskComplexity;

  // Context selection
  baseContexts: string[];  // Always included
  conditionalContexts: ConditionalContext[];

  // Suggested resources
  templates: string[];
  agents: string[];  // Ordered by preference

  // Guidance
  guidance: TaskGuidance;
}

export interface ConditionalContext {
  condition: string;  // e.g., "complexity === 'complex'"
  contexts: string[];
  reason: string;     // Why these contexts are included
}

export interface TaskAlignment {
  agent: string;
  template: string;
  contexts: string[];

  validation: {
    agentTemplateMatch: ValidationResult;
    templateContextMatch: ValidationResult;
    contextCompleteness: ValidationResult;
    overall: boolean;
  };

  suggestions: string[];
}

export interface ValidationResult {
  valid: boolean;
  score: number;  // 0-1
  issues: string[];
  warnings: string[];
}

export interface EnhancedContextResult {
  // Basic information
  queryType: string;
  taskIntent?: TaskIntent;
  scope?: TaskScope;

  // Loaded resources
  contexts: Array<{
    name: string;
    content: string;
    reason: string;  // Why this context was included
    source: 'base' | 'conditional' | 'recommended';
  }>;

  templates: Array<{
    name: string;
    content: string;
    reason: string;
  }>;

  agent: {
    name: string;
    content: string;
    score: number;
    reason: string;
    alternatives: Array<{ name: string; score: number }>;
  };

  // SDLC Integration
  sdlcChecklist?: SDLCStep[];
  currentStep?: SDLCStep;

  // Task guidance
  guidance: TaskGuidance;

  // Alignment validation
  alignment: TaskAlignment;

  // Summary
  summary: string;
  reasoning: string[];
}
