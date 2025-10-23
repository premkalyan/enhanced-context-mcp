/**
 * Template Service
 * Handles loading and managing VISHKAR templates
 */

import { Template } from '../domain/Template';
import { IStorageAdapter } from '../infrastructure/storage/IStorageAdapter';
import ConfigLoader from '../config/configLoader';

export class TemplateService {
  constructor(private readonly storageAdapter: IStorageAdapter) {}

  /**
   * Load templates by names
   */
  async loadTemplates(templateNames: string[]): Promise<Template[]> {
    const templates: Template[] = [];
    const config = ConfigLoader.getInstance().loadServerConfig();
    const templateDir = config.storage.templateSubdirectory;

    for (const templateName of templateNames) {
      const templatePath = `${templateDir}/${templateName}.md`;

      try {
        if (await this.storageAdapter.exists(templatePath)) {
          const content = await this.storageAdapter.read(templatePath);
          const template = Template.fromFile(templateName, content);
          templates.push(template);
        }
      } catch (error) {
        console.error(`Failed to load template ${templateName}:`, error);
      }
    }

    return templates;
  }

  /**
   * Get template by name
   */
  async getTemplateByName(templateName: string): Promise<Template | null> {
    const templates = await this.loadTemplates([templateName]);
    return templates.length > 0 ? templates[0] : null;
  }

  /**
   * List all available templates
   */
  async listAvailableTemplates(): Promise<string[]> {
    const config = ConfigLoader.getInstance().loadServerConfig();
    const templateDir = config.storage.templateSubdirectory;

    try {
      const templateFiles = await this.storageAdapter.list(templateDir);
      return templateFiles.map(file =>
        file.split('/').pop()?.replace('.md', '') || file
      );
    } catch (error) {
      console.error('Failed to list templates:', error);
      return [];
    }
  }

  /**
   * Render template with variables
   */
  renderTemplate(template: Template, variables: Record<string, string>): string {
    let rendered = template.content;

    // Replace {{variable}} with values
    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      rendered = rendered.replace(pattern, value);
    }

    return rendered;
  }
}
