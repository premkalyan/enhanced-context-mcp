/**
 * Context Combination Service
 * Handles matching task intent to context combinations and evaluating conditions
 */

import fs from 'fs';
import path from 'path';
import {
  ContextCombination,
  ConditionalContext,
  EnhancedQueryParameters,
  TaskComplexity,
  TaskIntent,
  TaskScope
} from '@/types/enhanced-query.types';

interface CombinationsConfig {
  combinations: ContextCombination[];
  defaultCombination: ContextCombination;
}

export class ContextCombinationService {
  private config: CombinationsConfig | null = null;

  /**
   * Load context combinations from config file
   */
  private loadConfig(): CombinationsConfig {
    if (this.config) {
      return this.config;
    }

    const configPath = path.join(process.cwd(), 'config', 'context-combinations.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    this.config = JSON.parse(configData);
    return this.config!;
  }

  /**
   * Find the best matching context combination for a query
   */
  findBestCombination(params: EnhancedQueryParameters): ContextCombination {
    const config = this.loadConfig();

    // Score each combination
    const scoredCombinations = config.combinations.map(combo => ({
      combination: combo,
      score: this.calculateMatchScore(combo, params)
    }));

    // Sort by score descending
    scoredCombinations.sort((a, b) => b.score - a.score);

    // Return best match if score is > 0, otherwise default
    const bestMatch = scoredCombinations[0];
    if (bestMatch && bestMatch.score > 0) {
      return bestMatch.combination;
    }

    return config.defaultCombination;
  }

  /**
   * Calculate how well a combination matches the query parameters
   */
  private calculateMatchScore(
    combination: ContextCombination,
    params: EnhancedQueryParameters
  ): number {
    let score = 0;

    // Query type match (required) - 40% weight
    if (combination.queryType === params.query_type) {
      score += 0.4;
    } else {
      return 0; // Query type must match
    }

    // Task intent match - 25% weight
    if (combination.taskIntent) {
      if (combination.taskIntent === params.task_intent) {
        score += 0.25;
      } else if (!params.task_intent) {
        score += 0.1; // Partial credit if not specified
      }
    } else {
      score += 0.25; // Full credit if combination doesn't require specific intent
    }

    // Scope match - 20% weight
    if (combination.scope) {
      if (combination.scope === params.scope) {
        score += 0.2;
      } else if (!params.scope) {
        score += 0.1; // Partial credit if not specified
      }
    } else {
      score += 0.2; // Full credit if combination doesn't require specific scope
    }

    // Complexity match - 15% weight
    if (combination.complexity) {
      if (combination.complexity === params.complexity) {
        score += 0.15;
      } else if (!params.complexity) {
        score += 0.075; // Partial credit if not specified
      }
    } else {
      score += 0.15; // Full credit if combination doesn't require specific complexity
    }

    return score;
  }

  /**
   * Evaluate conditional contexts and determine which should be included
   */
  evaluateConditionalContexts(
    combination: ContextCombination,
    params: EnhancedQueryParameters
  ): Array<{contexts: string[]; reason: string}> {
    const results: Array<{contexts: string[]; reason: string}> = [];

    for (const conditional of combination.conditionalContexts || []) {
      if (this.evaluateCondition(conditional.condition, params)) {
        results.push({
          contexts: conditional.contexts,
          reason: conditional.reason
        });
      }
    }

    return results;
  }

  /**
   * Evaluate a condition string against query parameters
   */
  private evaluateCondition(condition: string, params: EnhancedQueryParameters): boolean {
    try {
      // Create a safe evaluation context
      const context = {
        complexity: params.complexity,
        task_intent: params.task_intent,
        scope: params.scope,
        output_format: params.output_format,
        domain_focus: params.domain_focus || [],
        include_sdlc_checks: params.include_sdlc_checks || false
      };

      // Simple condition evaluation
      // Support: complexity === 'complex', domain_focus.includes('security'), etc.

      // Handle includes() for arrays
      if (condition.includes('.includes(')) {
        const match = condition.match(/(\w+)\.includes\(['"]([^'"]+)['"]\)/);
        if (match) {
          const [, arrayName, value] = match;
          const array = context[arrayName as keyof typeof context];
          return Array.isArray(array) && array.includes(value);
        }
      }

      // Handle equality checks
      if (condition.includes('===')) {
        const match = condition.match(/(\w+)\s*===\s*['"]([^'"]+)['"]/);
        if (match) {
          const [, varName, value] = match;
          return context[varName as keyof typeof context] === value;
        }
      }

      // Handle OR conditions
      if (condition.includes('||')) {
        const parts = condition.split('||').map(p => p.trim());
        return parts.some(part => this.evaluateCondition(part, params));
      }

      // Handle AND conditions
      if (condition.includes('&&')) {
        const parts = condition.split('&&').map(p => p.trim());
        return parts.every(part => this.evaluateCondition(part, params));
      }

      return false;
    } catch (error) {
      console.error(`Failed to evaluate condition: ${condition}`, error);
      return false;
    }
  }

  /**
   * Get all contexts for a combination (base + conditionals)
   */
  getAllContexts(
    combination: ContextCombination,
    params: EnhancedQueryParameters
  ): Array<{name: string; source: 'base' | 'conditional'; reason: string}> {
    const contexts: Array<{name: string; source: 'base' | 'conditional'; reason: string}> = [];

    // Add base contexts
    for (const contextName of combination.baseContexts) {
      contexts.push({
        name: contextName,
        source: 'base',
        reason: `Required for ${combination.name}`
      });
    }

    // Add conditional contexts
    const conditionalResults = this.evaluateConditionalContexts(combination, params);
    for (const result of conditionalResults) {
      for (const contextName of result.contexts) {
        contexts.push({
          name: contextName,
          source: 'conditional',
          reason: result.reason
        });
      }
    }

    return contexts;
  }

  /**
   * Get explanation of why this combination was selected
   */
  explainCombination(
    combination: ContextCombination,
    params: EnhancedQueryParameters
  ): string[] {
    const explanations: string[] = [];

    explanations.push(`Selected combination: ${combination.name}`);
    explanations.push(`Reason: ${combination.description}`);

    if (params.task_intent) {
      explanations.push(`Task intent: ${params.task_intent}`);
    }

    if (params.scope) {
      explanations.push(`Scope: ${params.scope}`);
    }

    if (params.complexity) {
      explanations.push(`Complexity: ${params.complexity}`);
    }

    if (params.domain_focus && params.domain_focus.length > 0) {
      explanations.push(`Domain focus: ${params.domain_focus.join(', ')}`);
    }

    const conditionalResults = this.evaluateConditionalContexts(combination, params);
    if (conditionalResults.length > 0) {
      explanations.push(`Additional contexts included based on:`);
      for (const result of conditionalResults) {
        explanations.push(`  - ${result.reason}`);
      }
    }

    return explanations;
  }

  /**
   * Validate that combination has all required fields
   */
  validateCombination(combination: ContextCombination): {valid: boolean; errors: string[]} {
    const errors: string[] = [];

    if (!combination.id) {
      errors.push('Combination missing id');
    }

    if (!combination.queryType) {
      errors.push('Combination missing queryType');
    }

    if (!combination.baseContexts || combination.baseContexts.length === 0) {
      errors.push('Combination must have at least one base context');
    }

    if (!combination.guidance) {
      errors.push('Combination missing guidance');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get list of all available combinations
   */
  listCombinations(): ContextCombination[] {
    const config = this.loadConfig();
    return config.combinations;
  }

  /**
   * Get combination by ID
   */
  getCombinationById(id: string): ContextCombination | null {
    const config = this.loadConfig();
    return config.combinations.find(c => c.id === id) || null;
  }
}
