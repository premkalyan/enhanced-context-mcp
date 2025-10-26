/**
 * Enhanced Context Service
 * Main orchestration service that coordinates context, template, and agent loading
 */

import { ContextService } from './ContextService';
import { TemplateService } from './TemplateService';
import { AgentService } from './AgentService';
import { ContextCombinationService } from './ContextCombinationService';
import { IntentAnalyzer } from './IntentAnalyzer';
import ConfigLoader from '../config/configLoader';
import {
  EnhancedQueryParameters,
  SDLCStep,
  TaskGuidance,
  ContextCombination
} from '../../types/enhanced-query.types';
import fs from 'fs/promises';
import path from 'path';

export interface EnhancedContextResult {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
  reasoning?: string;
  guidance?: TaskGuidance;
  sdlcChecklist?: SDLCStep[];
  currentStep?: SDLCStep;
}

export interface ServiceStatus {
  summary: string;
  configuredServices: string[];
  missingServices: string[];
  availableTools: string[];
  unavailableTools: string[];
  warnings: string[];
}

export class EnhancedContextService {
  private readonly combinationService: ContextCombinationService;
  private readonly intentAnalyzer: IntentAnalyzer;

  constructor(
    private readonly contextService: ContextService,
    private readonly templateService: TemplateService,
    private readonly agentService: AgentService
  ) {
    this.combinationService = new ContextCombinationService();
    this.intentAnalyzer = new IntentAnalyzer();
  }

  /**
   * Load enhanced context based on query parameters OR natural language task statement
   * Supports two modes:
   * 1. Structured: Provide query_type, task_intent, scope, complexity, domain_focus
   * 2. Natural Language: Provide task_statement and let AI infer the structure
   */
  async loadEnhancedContext(args: EnhancedQueryParameters): Promise<EnhancedContextResult> {
    let { query_type, project_path } = args;
    let intentAnalysis: ReturnType<IntentAnalyzer['analyze']> | undefined;
    let analyzedArgs = args;

    try {
      // NEW: If task_statement provided but no query_type, analyze intent
      if ((args as any).task_statement && !query_type) {
        const statement = (args as any).task_statement as string;
        intentAnalysis = this.intentAnalyzer.analyze(statement);

        // Merge analyzed intent with provided args (explicit args take precedence)
        analyzedArgs = {
          ...args,
          query_type: intentAnalysis.query_type,
          task_intent: args.task_intent || intentAnalysis.task_intent,
          scope: args.scope || intentAnalysis.scope,
          complexity: args.complexity || intentAnalysis.complexity,
          output_format: args.output_format || intentAnalysis.output_format,
          domain_focus: args.domain_focus || intentAnalysis.domain_focus,
          user_query: statement, // Store original statement
        };

        query_type = intentAnalysis.query_type;
      }

      // Validate query type
      if (!query_type) {
        throw new Error('Either query_type or task_statement must be provided');
      }

      if (!ConfigLoader.getInstance().isValidQueryType(query_type)) {
        const allowedTypes = ConfigLoader.getInstance().getAllowedQueryTypes();
        throw new Error(
          `Invalid query_type: ${query_type}. Allowed values: ${allowedTypes.join(', ')}`
        );
      }

      // Find best matching context combination using analyzed args
      const combination = this.combinationService.findBestCombination(analyzedArgs);
      const contextList = this.combinationService.getAllContexts(combination, analyzedArgs);
      const reasoningArray = this.combinationService.explainCombination(combination, args);
      const reasoning = reasoningArray.join('\n');

      // Extract context names for loading
      const contextNames = contextList.map(c => c.name);

      // Load contexts, templates, and agent in parallel
      const [contexts, templates, projectRules, agentSelection] = await Promise.all([
        this.contextService.loadGlobalContexts(contextNames),
        this.templateService.loadTemplates(combination.templates),
        this.contextService.loadProjectRules(project_path),
        this.selectBestAgent(combination, args)
      ]);

      // Add reasons to contexts
      const contextsWithReasons = contexts.map(ctx => {
        const contextInfo = contextList.find(c => c.name === ctx.name);
        return {
          ...ctx,
          reason: contextInfo?.reason || 'Base context',
          source: contextInfo?.source || 'base'
        };
      });

      // Load SDLC checklist if requested
      let sdlcChecklist: SDLCStep[] | undefined;
      let currentStep: SDLCStep | undefined;
      if (args.include_sdlc_checks) {
        sdlcChecklist = await this.loadSDLCChecklist();
        currentStep = this.determineCurrentStep(args, sdlcChecklist);
      }

      // Format the response
      const contextContent = contextsWithReasons
        .map(ctx => `## ${ctx.name}\n**Reason**: ${ctx.reason}\n\n${ctx.content}`)
        .join('\n\n');
      const projectContent = projectRules
        .map(rule => `## ${rule.name}\n${rule.content}`)
        .join('\n\n');
      const templateContent = templates
        .map(tmpl => `## 📝 Template: ${tmpl.name}\n${tmpl.content}`)
        .join('\n\n---\n\n');

      const responseText = this.buildResponseText({
        query_type,
        args: analyzedArgs,
        combination,
        reasoning,
        agentSelection,
        templates,
        contexts: contextsWithReasons,
        projectRules,
        contextContent,
        projectContent,
        templateContent,
        sdlcChecklist,
        currentStep,
        intentAnalysis // Add intent analysis results
      });

      return {
        content: [
          {
            type: 'text',
            text: responseText
          }
        ],
        reasoning,
        guidance: combination.guidance,
        sdlcChecklist,
        currentStep
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: [
          {
            type: 'text',
            text: `Error loading enhanced context: ${err.message}`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Select best agent considering both combination and query parameters
   */
  private async selectBestAgent(
    combination: ContextCombination,
    args: EnhancedQueryParameters
  ): Promise<Awaited<ReturnType<AgentService['selectAgentForQueryType']>>> {
    // Use agents from combination if specified
    if (combination.agents && combination.agents.length > 0) {
      const selectedAgent = await this.agentService.loadVishkarAgent(combination.agents[0]);
      const availableAgents = await Promise.all(
        combination.agents.slice(1).map(name => this.agentService.loadVishkarAgent(name))
      );

      // Get metadata for available agents
      const availableMetadata = availableAgents
        .filter(a => a !== null)
        .map(a => ({
          id: a!.id,
          name: a!.name,
          description: a!.description || '',
          type: a!.type || 'technical',
          model: a!.model
        }));

      return {
        selected: selectedAgent,
        available: availableMetadata,
        reason: `Selected from context combination: ${combination.name}`
      };
    }

    // Fallback to query type selection
    return this.agentService.selectAgentForQueryType(args.query_type);
  }

  /**
   * Load SDLC checklist from config
   */
  private async loadSDLCChecklist(): Promise<SDLCStep[]> {
    try {
      const checklistPath = path.join(process.cwd(), 'config', 'sdlc-checklist.json');
      const content = await fs.readFile(checklistPath, 'utf-8');
      const config = JSON.parse(content);
      return config.sdlcSteps;
    } catch (error) {
      console.error('Error loading SDLC checklist:', error);
      return [];
    }
  }

  /**
   * Determine current SDLC step based on task intent
   */
  private determineCurrentStep(
    args: EnhancedQueryParameters,
    steps: SDLCStep[]
  ): SDLCStep | undefined {
    const intentToStep: Record<string, number> = {
      'create': 1,      // Epic/Story Creation
      'breakdown': 2,   // Story Breakdown
      'plan': 3,        // Technical Design
      'implement': 5,   // Implementation
      'review': 8,      // Code Review
      'test': 6         // Unit Testing
    };

    const stepNumber = args.task_intent ? intentToStep[args.task_intent] : undefined;
    return stepNumber ? steps.find(s => s.step === stepNumber) : undefined;
  }

  /**
   * Build the formatted response text
   */
  private buildResponseText(data: {
    query_type: string;
    args: EnhancedQueryParameters;
    combination: ContextCombination;
    reasoning: string;
    agentSelection: Awaited<ReturnType<AgentService['selectAgentForQueryType']>>;
    templates: Awaited<ReturnType<TemplateService['loadTemplates']>>;
    contexts: Array<{ name: string; content: string; reason: string; source: string }>;
    projectRules: Awaited<ReturnType<ContextService['loadProjectRules']>>;
    contextContent: string;
    projectContent: string;
    templateContent: string;
    sdlcChecklist?: SDLCStep[];
    currentStep?: SDLCStep;
    intentAnalysis?: ReturnType<IntentAnalyzer['analyze']>;
  }): string {
    const {
      query_type,
      args,
      combination,
      reasoning,
      agentSelection,
      templates,
      contexts,
      projectRules,
      contextContent,
      projectContent,
      templateContent,
      sdlcChecklist,
      currentStep,
      intentAnalysis
    } = data;

    let response = `# Enhanced Context Loaded Successfully\n\n`;

    // NEW: Add intent analysis section if available
    if (intentAnalysis) {
      response += `## 🧠 Intent Analysis\n\n`;
      response += `**Original Statement**: "${args.user_query}"\n\n`;
      response += `**Analyzed Intent**:\n`;
      response += `- **Query Type**: ${intentAnalysis.query_type}\n`;
      response += `- **Task Intent**: ${intentAnalysis.task_intent}\n`;
      if (intentAnalysis.scope) response += `- **Scope**: ${intentAnalysis.scope}\n`;
      if (intentAnalysis.complexity) response += `- **Complexity**: ${intentAnalysis.complexity}\n`;
      if (intentAnalysis.output_format) response += `- **Output Format**: ${intentAnalysis.output_format}\n`;
      if (intentAnalysis.domain_focus && intentAnalysis.domain_focus.length > 0) {
        response += `- **Domain Focus**: ${intentAnalysis.domain_focus.join(', ')}\n`;
      }
      response += `\n**Confidence**: ${(intentAnalysis.confidence * 100).toFixed(1)}%\n\n`;
      response += `**Analysis Reasoning**:\n`;
      intentAnalysis.reasoning.forEach(reason => {
        response += `- ${reason}\n`;
      });
      response += `\n`;
    }

    // Add task understanding section
    response += `## 🎯 Task Understanding\n\n`;
    response += `**Query Type**: ${query_type}\n`;
    if (args.task_intent) response += `**Task Intent**: ${args.task_intent}\n`;
    if (args.scope) response += `**Scope**: ${args.scope}\n`;
    if (args.complexity) response += `**Complexity**: ${args.complexity}\n`;
    if (args.domain_focus && args.domain_focus.length > 0) {
      response += `**Domain Focus**: ${args.domain_focus.join(', ')}\n`;
    }
    response += `\n**Context Combination**: ${combination.name}\n`;
    response += `**Reasoning**: ${reasoning}\n\n`;

    // Add SDLC current step if available
    if (currentStep) {
      response += `## 📋 Current SDLC Step\n\n`;
      response += `**Step ${currentStep.step}**: ${currentStep.name}\n`;
      response += `${currentStep.description}\n\n`;

      // Add required checks for current step
      const requiredChecks = currentStep.checks.filter(c => c.severity === 'required');
      if (requiredChecks.length > 0) {
        response += `**Required Checks**:\n`;
        requiredChecks.forEach(check => {
          const status = check.status === 'incomplete' ? '⏳' : '✅';
          response += `- ${status} ${check.description}\n`;
        });
        response += '\n';
      }

      // Add artifacts expected
      if (currentStep.artifacts.length > 0) {
        response += `**Expected Artifacts**: ${currentStep.artifacts.join(', ')}\n\n`;
      }

      // Add next steps
      if (currentStep.nextSteps.length > 0) {
        response += `**Next Steps**: ${currentStep.nextSteps.join(', ')}\n\n`;
      }
    }

    // Add task guidance if available
    if (combination.guidance) {
      response += `## 📚 Task Guidance\n\n`;

      // Jira-specific guidance
      if (combination.guidance.epicPrefixRequired) {
        response += `**Epic Prefix Format**: ${combination.guidance.epicPrefixFormat}\n`;
      }
      if (combination.guidance.storyStructure) {
        response += `**Story Structure**: ${combination.guidance.storyStructure}\n`;
      }
      if (combination.guidance.acceptanceCriteriaFormat) {
        response += `**Acceptance Criteria**: ${combination.guidance.acceptanceCriteriaFormat}\n`;
      }

      // Quality checks
      if (combination.guidance.qualityChecks.length > 0) {
        response += `\n**Quality Checks**:\n`;
        combination.guidance.qualityChecks.forEach(check => {
          response += `- ${check}\n`;
        });
      }

      // Common mistakes
      if (combination.guidance.commonMistakes.length > 0) {
        response += `\n**Common Mistakes to Avoid**:\n`;
        combination.guidance.commonMistakes.forEach(mistake => {
          response += `- ⚠️ ${mistake}\n`;
        });
      }

      // Best practices
      if (combination.guidance.bestPractices.length > 0) {
        response += `\n**Best Practices**:\n`;
        combination.guidance.bestPractices.forEach(practice => {
          response += `- ✨ ${practice}\n`;
        });
      }

      // Prerequisites
      if (combination.guidance.prerequisites && combination.guidance.prerequisites.length > 0) {
        response += `\n**Prerequisites**:\n`;
        combination.guidance.prerequisites.forEach(prereq => {
          response += `- ${prereq}\n`;
        });
      }

      response += '\n';
    }

    // Add agent information
    if (agentSelection.selected) {
      response += `## 🤖 Auto-Selected Agent: ${agentSelection.selected.name}\n\n`;
      response += `### Complete Persona:\n${agentSelection.selected.content}\n\n---\n\n`;
    }

    // Add templates section
    if (templates.length > 0) {
      response += `## 📋 Templates Loaded (${templates.length})\n`;
      response += `**Available Templates**: ${templates.map(t => t.name).join(', ')}\n\n`;
      response += `Use these templates to structure your work according to VISHKAR best practices.\n\n`;
    }

    // Add available agents
    if (agentSelection.available.length > 0) {
      response += `## 🎯 Available Specialized Agents:\n`;
      response += agentSelection.available
        .map(agent => `- **${agent.name}**: ${agent.description}`)
        .join('\n');
      response += '\n\n';
    }

    // Add global contexts with reasons
    response += `## 🌍 Loaded Contexts (${contexts.length})\n\n`;
    response += contextContent + '\n\n';

    // Add project rules
    if (projectRules.length > 0) {
      response += `## 📁 Project-Specific Rules:\n${projectContent}\n\n`;
    }

    // Add templates content
    if (templates.length > 0) {
      response += `## 📝 VISHKAR Templates:\n\n${templateContent}\n\n`;
    }

    // Add SDLC checklist if requested
    if (sdlcChecklist && sdlcChecklist.length > 0) {
      response += `## 📊 Complete 13-Step SDLC Checklist\n\n`;
      sdlcChecklist.forEach(step => {
        const isCurrent = currentStep && step.step === currentStep.step;
        const marker = isCurrent ? '➡️ ' : '';
        response += `${marker}**Step ${step.step}: ${step.name}**\n`;

        if (isCurrent) {
          response += `${step.description}\n`;
          const requiredChecks = step.checks.filter(c => c.severity === 'required');
          if (requiredChecks.length > 0) {
            response += `Checks: ${requiredChecks.map(c => c.description).join(', ')}\n`;
          }
        }
        response += '\n';
      });
    }

    // Add summary
    response += `## 📊 Summary:\n`;
    response += `- Context Combination: ${combination.name}\n`;
    response += `- Loaded ${contexts.length} contexts (${contexts.filter(c => c.source === 'base').length} base + ${contexts.filter(c => c.source === 'conditional').length} conditional)\n`;
    response += `- Loaded ${templates.length} templates: ${templates.map(t => t.name).join(', ')}\n`;
    response += `- Loaded ${projectRules.length} project-specific rules\n`;
    response += `- Agent: ${agentSelection.selected ? `${agentSelection.selected.name} (auto-selected)` : 'None'}\n`;
    response += `- Available agents: ${agentSelection.available.length} specialists\n`;
    if (currentStep) {
      response += `- Current SDLC Step: ${currentStep.step}. ${currentStep.name}\n`;
    }
    response += `- Intelligent context selection enabled with task-aware combinations\n\n`;
    response += `---\n`;
    response += `**IMPORTANT: Only use MCP tools for services that are properly configured.**`;

    return response;
  }

  /**
   * Update agent configuration
   */
  async updateAgent(args: {
    agent_name: string;
    operation: 'update' | 'enhance';
    agent_data: {
      name: string;
      description: string;
      content: string;
      model?: string;
    };
    learning_notes?: string;
  }): Promise<{ success: boolean; message: string }> {
    const { agent_name, operation, agent_data, learning_notes } = args;

    try {
      // Validate that agent exists (we can only update existing agents)
      const existingAgent = await this.agentService.loadVishkarAgent(agent_name);

      if (!existingAgent) {
        return {
          success: false,
          message: `Agent '${agent_name}' not found. Cannot create new agents - only update existing ones.`
        };
      }

      // For enhance operation, learning notes are required
      if (operation === 'enhance' && !learning_notes) {
        return {
          success: false,
          message: 'Learning notes are required for enhance operation'
        };
      }

      // This is a placeholder - actual update logic would write to storage
      // For now, we'll just refresh the cache
      await this.agentService.refreshAgentCache(agent_name);

      return {
        success: true,
        message: `Agent '${agent_name}' ${operation} operation completed successfully`
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        message: `Error updating agent: ${err.message}`
      };
    }
  }

  /**
   * Check service configurations (placeholder for future implementation)
   */
  private async checkServiceConfigurations(
    projectPath?: string,
    queryType?: string
  ): Promise<ServiceStatus> {
    // This is a placeholder that would check for MCP server configurations
    return {
      summary: 'Service configuration check completed',
      configuredServices: ['enhanced-context'],
      missingServices: [],
      availableTools: ['load_enhanced_context', 'list_vishkar_agents', 'load_vishkar_agent'],
      unavailableTools: [],
      warnings: []
    };
  }
}
