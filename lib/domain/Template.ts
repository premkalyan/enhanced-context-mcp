/**
 * Template Domain Entity
 * Represents a VISHKAR template
 */

export class Template {
  constructor(
    public readonly name: string,
    public readonly content: string,
    public readonly source: 'wama_templates' | 'custom',
    public readonly variables?: string[]
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Template name is required and must be a string');
    }
    if (!this.content || typeof this.content !== 'string') {
      throw new Error('Template content is required and must be a string');
    }
    if (!['wama_templates', 'custom'].includes(this.source)) {
      throw new Error(`Invalid template source: ${this.source}`);
    }
  }

  getSize(): number {
    return Buffer.byteLength(this.content, 'utf8');
  }

  extractVariables(): string[] {
    if (this.variables) {
      return this.variables;
    }

    // Extract variables from template content (e.g., {{variable}}, {variable}, etc.)
    const variablePattern = /\{\{(\w+)\}\}/g;
    const matches = this.content.matchAll(variablePattern);
    return Array.from(matches, m => m[1]);
  }

  getSummary(): string {
    const vars = this.extractVariables();
    return `${this.name}: ${this.getSize()} bytes, ${vars.length} variables`;
  }

  toJSON() {
    return {
      name: this.name,
      content: this.content,
      source: this.source,
      variables: this.extractVariables(),
      size: this.getSize()
    };
  }

  static fromFile(name: string, content: string): Template {
    return new Template(name, content, 'wama_templates');
  }
}
