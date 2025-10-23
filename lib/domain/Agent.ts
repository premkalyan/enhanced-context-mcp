/**
 * Agent Domain Entity
 * Represents a VISHKAR agent profile
 */

export interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  type: 'domain_expert' | 'technical';
  specializations?: string[];
  model?: string;
}

export class Agent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly content: string,
    public readonly description: string,
    public readonly type: 'domain_expert' | 'technical',
    public readonly specializations: string[] = [],
    public readonly model?: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id || typeof this.id !== 'string') {
      throw new Error('Agent ID is required and must be a string');
    }
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Agent name is required and must be a string');
    }
    if (!this.content || typeof this.content !== 'string') {
      throw new Error('Agent content is required and must be a string');
    }
    if (!['domain_expert', 'technical'].includes(this.type)) {
      throw new Error(`Invalid agent type: ${this.type}`);
    }
  }

  getSize(): number {
    return Buffer.byteLength(this.content, 'utf8');
  }

  hasSpecialization(specialization: string): boolean {
    return this.specializations.includes(specialization);
  }

  getSummary(): string {
    return `${this.name} (${this.type}): ${this.description}`;
  }

  getMetadata(): AgentMetadata {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      specializations: this.specializations,
      model: this.model
    };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      content: this.content,
      description: this.description,
      type: this.type,
      specializations: this.specializations,
      model: this.model,
      size: this.getSize()
    };
  }

  static fromFile(id: string, content: string, metadata: Partial<AgentMetadata>): Agent {
    return new Agent(
      id,
      metadata.name || id,
      content,
      metadata.description || '',
      metadata.type || 'technical',
      metadata.specializations || [],
      metadata.model
    );
  }
}
