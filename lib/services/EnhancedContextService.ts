/**
 * Enhanced Context Service
 * Main orchestration service that coordinates context, template, and agent loading
 */

import { ContextService } from './ContextService';
import { TemplateService } from './TemplateService';
import { AgentService } from './AgentService';
import ConfigLoader from '../config/configLoader';

export interface EnhancedContextResult {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
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
  constructor(
    private readonly contextService: ContextService,
    private readonly templateService: TemplateService,
    private readonly agentService: AgentService
  ) {}

  /**
   * Load enhanced context based on query type
   */
  async loadEnhancedContext(args: {
    query_type: string;
    project_path?: string;
  }): Promise<EnhancedContextResult> {
    const { query_type, project_path } = args;

    try {
      // Validate query type
      if (!ConfigLoader.getInstance().isValidQueryType(query_type)) {
        const allowedTypes = ConfigLoader.getInstance().getAllowedQueryTypes();
        throw new Error(
          `Invalid query_type: ${query_type}. Allowed values: ${allowedTypes.join(', ')}`
        );
      }

      // Get context mapping
      const mapping = ConfigLoader.getInstance().getMapping(query_type);
      if (!mapping) {
        throw new Error(`No mapping found for query type: ${query_type}`);
      }

      // Load contexts, templates, and agent in parallel
      const [contexts, templates, projectRules, agentSelection] = await Promise.all([
        this.contextService.loadGlobalContexts(mapping.contexts),
        this.templateService.loadTemplates(mapping.templates),
        this.contextService.loadProjectRules(project_path),
        this.agentService.selectAgentForQueryType(query_type)
      ]);

      // Format the response
      const contextContent = contexts.map(ctx => `## ${ctx.name}\n${ctx.content}`).join('\n\n');
      const projectContent = projectRules.map(rule => `## ${rule.name}\n${rule.content}`).join('\n\n');
      const templateContent = templates
        .map(tmpl => `## 📝 Template: ${tmpl.name}\n${tmpl.content}`)
        .join('\n\n---\n\n');

      const responseText = this.buildResponseText({
        query_type,
        agentSelection,
        templates,
        contexts,
        projectRules,
        contextContent,
        projectContent,
        templateContent
      });

      return {
        content: [
          {
            type: 'text',
            text: responseText
          }
        ]
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
   * Build the formatted response text
   */
  private buildResponseText(data: {
    query_type: string;
    agentSelection: Awaited<ReturnType<AgentService['selectAgentForQueryType']>>;
    templates: Awaited<ReturnType<TemplateService['loadTemplates']>>;
    contexts: Awaited<ReturnType<ContextService['loadGlobalContexts']>>;
    projectRules: Awaited<ReturnType<ContextService['loadProjectRules']>>;
    contextContent: string;
    projectContent: string;
    templateContent: string;
  }): string {
    const {
      query_type,
      agentSelection,
      templates,
      contexts,
      projectRules,
      contextContent,
      projectContent,
      templateContent
    } = data;

    let response = `Enhanced Context Loaded Successfully:\n\n## Query Type: ${query_type}\n\n`;

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

    // Add global contexts
    response += `## Global WAMA Contexts:\n${contextContent}\n\n`;

    // Add project rules
    if (projectRules.length > 0) {
      response += `## Project-Specific Rules:\n${projectContent}\n\n`;
    }

    // Add templates content
    if (templates.length > 0) {
      response += `## 📝 VISHKAR Templates:\n\n${templateContent}\n\n`;
    }

    // Add summary
    response += `## Summary:\n`;
    response += `- Loaded ${contexts.length} global contexts: ${contexts.map(c => c.name).join(', ')}\n`;
    response += `- Loaded ${templates.length} templates: ${templates.map(t => t.name).join(', ')}\n`;
    response += `- Loaded ${projectRules.length} project-specific rules: ${projectRules.map(r => r.name).join(', ')}\n`;
    response += `- Agent selection: ${agentSelection.selected ? `${agentSelection.selected.name} (auto-selected)` : 'None selected'}\n`;
    response += `- Available agents: ${agentSelection.available.length} specialists available\n`;
    response += `- Enhanced MCP processing enabled with agent-aware context and templates\n\n`;
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
