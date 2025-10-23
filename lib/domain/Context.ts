/**
 * Context Domain Entity
 * Represents a context file (e.g., WAMA context, project rules)
 */

import { ContextMetadata, ContextFormat, ContextCategory } from '@/types/context.types';

export class Context {
  constructor(
    public readonly name: string,
    public readonly content: string,
    public readonly source: 'global_wama' | 'project_rules' | 'custom',
    public readonly metadata?: ContextMetadata
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Context name is required and must be a string');
    }
    if (!this.content || typeof this.content !== 'string') {
      throw new Error('Context content is required and must be a string');
    }
    if (!['global_wama', 'project_rules', 'custom'].includes(this.source)) {
      throw new Error(`Invalid context source: ${this.source}`);
    }
  }

  getSize(): number {
    return Buffer.byteLength(this.content, 'utf8');
  }

  getLines(): number {
    return this.content.split('\n').length;
  }

  getSummary(): string {
    return `${this.name} (${this.source}): ${this.getSize()} bytes, ${this.getLines()} lines`;
  }

  toJSON() {
    return {
      name: this.name,
      content: this.content,
      source: this.source,
      metadata: this.metadata,
      size: this.getSize(),
      lines: this.getLines()
    };
  }

  static fromFile(name: string, content: string, source: Context['source']): Context {
    return new Context(name, content, source);
  }
}
