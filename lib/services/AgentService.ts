/**
 * Agent Service
 * Handles loading and managing VISHKAR agents
 */

import { Agent, AgentMetadata } from '../domain/Agent';
import { IStorageAdapter, ICacheAdapter } from '../infrastructure/storage/IStorageAdapter';
import ConfigLoader from '../config/configLoader';
import * as yaml from 'js-yaml';

export interface AgentSelection {
  selected: Agent | null;
  available: AgentMetadata[];
  reason: string;
}

export class AgentService {
  private agentCache: Map<string, Agent> = new Map();

  constructor(
    private readonly storageAdapter: IStorageAdapter,
    private readonly cacheAdapter?: ICacheAdapter
  ) {}

  /**
   * Load all VISHKAR agents
   */
  async listVishkarAgents(agentType?: 'domain_expert' | 'technical' | 'all'): Promise<AgentMetadata[]> {
    const config = ConfigLoader.getInstance().loadServerConfig();
    const agentDir = config.storage.agentSubdirectory;

    try {
      const agentFiles = await this.storageAdapter.list(agentDir);
      const agents: AgentMetadata[] = [];

      for (const agentFile of agentFiles) {
        if (!agentFile.endsWith('.md')) continue;

        try {
          const agentId = agentFile.split('/').pop()?.replace('.md', '') || agentFile;
          const content = await this.storageAdapter.read(agentFile);
          const partialMetadata = this.parseAgentMetadata(agentId, content);

          // Ensure we have required fields
          const metadata: AgentMetadata = {
            id: partialMetadata.id || agentId,
            name: partialMetadata.name || agentId,
            description: partialMetadata.description || '',
            type: partialMetadata.type || 'technical',
            specializations: partialMetadata.specializations,
            model: partialMetadata.model
          };

          if (!agentType || agentType === 'all' || metadata.type === agentType) {
            agents.push(metadata);
          }
        } catch (error) {
          console.error(`Failed to parse agent ${agentFile}:`, error);
        }
      }

      return agents;
    } catch (error) {
      console.error('Failed to list agents:', error);
      return [];
    }
  }

  /**
   * Load a specific VISHKAR agent by ID
   */
  async loadVishkarAgent(agentId: string): Promise<Agent | null> {
    // Check cache first
    if (this.agentCache.has(agentId)) {
      return this.agentCache.get(agentId)!;
    }

    // Check adapter cache
    if (this.cacheAdapter) {
      const cached = await this.cacheAdapter.get<Agent>(`agent:${agentId}`);
      if (cached) {
        this.agentCache.set(agentId, cached);
        return cached;
      }
    }

    const config = ConfigLoader.getInstance().loadServerConfig();
    const agentDir = config.storage.agentSubdirectory;
    const agentPath = `${agentDir}/${agentId}.md`;

    try {
      if (await this.storageAdapter.exists(agentPath)) {
        const content = await this.storageAdapter.read(agentPath);
        const metadata = this.parseAgentMetadata(agentId, content);
        const agent = Agent.fromFile(agentId, content, metadata);

        // Cache the agent
        this.agentCache.set(agentId, agent);
        if (this.cacheAdapter) {
          await this.cacheAdapter.set(`agent:${agentId}`, agent, 3600); // 1 hour TTL
        }

        return agent;
      }
    } catch (error) {
      console.error(`Failed to load agent ${agentId}:`, error);
    }

    return null;
  }

  /**
   * Auto-select agent based on query type
   */
  async selectAgentForQueryType(queryType: string): Promise<AgentSelection> {
    const allAgents = await this.listVishkarAgents('all');

    // Simple agent selection logic based on query type
    const agentMappings: Record<string, string> = {
      'story': 'product-manager',
      'testing': 'qa-engineer',
      'security': 'security-engineer',
      'architecture': 'architect',
      'pr-review': 'code-reviewer',
      'browser-testing': 'qa-automation',
      'project-planning': 'product-manager',
      'story-breakdown': 'product-manager',
      'documentation': 'technical-writer',
      'flow-diagrams': 'architect',
      'infrastructure': 'devops-engineer'
    };

    const preferredAgentId = agentMappings[queryType];
    let selectedAgent: Agent | null = null;

    if (preferredAgentId) {
      selectedAgent = await this.loadVishkarAgent(preferredAgentId);
    }

    return {
      selected: selectedAgent,
      available: allAgents,
      reason: selectedAgent
        ? `Auto-selected ${selectedAgent.name} based on query type: ${queryType}`
        : `No agent auto-selected for query type: ${queryType}`
    };
  }

  /**
   * Refresh agent cache
   */
  async refreshAgentCache(agentId?: string): Promise<void> {
    if (agentId) {
      this.agentCache.delete(agentId);
      if (this.cacheAdapter) {
        await this.cacheAdapter.delete(`agent:${agentId}`);
      }
    } else {
      this.agentCache.clear();
      if (this.cacheAdapter) {
        await this.cacheAdapter.clear('agent:');
      }
    }
  }

  /**
   * Parse agent metadata from content
   */
  private parseAgentMetadata(agentId: string, content: string): Partial<AgentMetadata> {
    // Try to extract YAML frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (frontmatterMatch) {
      try {
        const frontmatter = yaml.load(frontmatterMatch[1]) as Record<string, unknown>;
        return {
          id: agentId,
          name: frontmatter.name as string || agentId,
          description: frontmatter.description as string || '',
          type: (frontmatter.type as 'domain_expert' | 'technical') || 'technical',
          specializations: (frontmatter.specializations as string[]) || [],
          model: frontmatter.model as string
        };
      } catch (error) {
        console.error(`Failed to parse YAML frontmatter for ${agentId}:`, error);
      }
    }

    // Fallback: extract from markdown headers
    const nameMatch = content.match(/^#\s+(.+)$/m);
    const descMatch = content.match(/^##\s+Description\s*\n(.+)$/m);

    return {
      id: agentId,
      name: nameMatch ? nameMatch[1] : agentId,
      description: descMatch ? descMatch[1] : '',
      type: 'technical'
    };
  }

  /**
   * Validate agent profile
   */
  async validateAgentProfile(agentId: string, strictMode = false): Promise<{ valid: boolean; errors: string[] }> {
    const agent = await this.loadVishkarAgent(agentId);

    if (!agent) {
      return { valid: false, errors: [`Agent ${agentId} not found`] };
    }

    const errors: string[] = [];

    // Basic validation
    if (!agent.name) errors.push('Agent name is missing');
    if (!agent.description) errors.push('Agent description is missing');
    if (!agent.content || agent.content.length < 100) {
      errors.push('Agent content is too short (minimum 100 characters)');
    }

    // Strict mode validation
    if (strictMode) {
      if (agent.specializations.length === 0) {
        errors.push('Agent has no specializations defined');
      }
      if (!agent.model) {
        errors.push('Agent model preference is not defined');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
