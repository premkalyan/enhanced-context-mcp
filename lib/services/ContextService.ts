/**
 * Context Service
 * Handles loading and managing contexts
 */

import { Context } from '../domain/Context';
import { IStorageAdapter } from '../infrastructure/storage/IStorageAdapter';
import ConfigLoader from '../config/configLoader';

export class ContextService {
  constructor(private readonly storageAdapter: IStorageAdapter) {}

  /**
   * Load global WAMA contexts by names
   */
  async loadGlobalContexts(contextNames: string[]): Promise<Context[]> {
    const contexts: Context[] = [];
    const config = ConfigLoader.getInstance().loadServerConfig();
    const contextDir = config.storage.contextSubdirectory;

    for (const contextName of contextNames) {
      const contextPath = `${contextDir}/${contextName}.mdc`;

      try {
        if (await this.storageAdapter.exists(contextPath)) {
          const content = await this.storageAdapter.read(contextPath);
          const context = Context.fromFile(contextName, content, 'global_wama');
          contexts.push(context);
        }
      } catch (error) {
        console.error(`Failed to load context ${contextName}:`, error);
      }
    }

    return contexts;
  }

  /**
   * Load project-specific rules from a project path
   */
  async loadProjectRules(projectPath?: string): Promise<Context[]> {
    const rules: Context[] = [];

    if (!projectPath) {
      return rules;
    }

    // Validate path to prevent path traversal
    if (!this.isValidProjectPath(projectPath)) {
      console.error('[Security] Invalid project path rejected:', projectPath);
      return rules;
    }

    try {
      const rulesPath = `${projectPath}/.wama/rules`;
      const ruleFiles = await this.storageAdapter.list(rulesPath);

      for (const ruleFile of ruleFiles) {
        try {
          const content = await this.storageAdapter.read(ruleFile);
          const ruleName = ruleFile.split('/').pop()?.replace(/\.(md|mdc)$/, '') || ruleFile;
          const context = Context.fromFile(ruleName, content, 'project_rules');
          rules.push(context);
        } catch (error) {
          console.error(`Failed to load project rule ${ruleFile}:`, error);
        }
      }
    } catch (error) {
      // Project rules are optional, so just log and continue
      console.log('No project rules found or error loading them:', error);
    }

    return rules;
  }

  /**
   * Validate project path to prevent path traversal attacks
   */
  private isValidProjectPath(projectPath: string): boolean {
    // Check for path traversal attempts
    if (projectPath.includes('..')) {
      return false;
    }

    // Ensure path doesn't start with / or ~ (should be relative)
    if (projectPath.startsWith('/') || projectPath.startsWith('~')) {
      return false;
    }

    return true;
  }

  /**
   * Get context by name
   */
  async getContextByName(contextName: string): Promise<Context | null> {
    const contexts = await this.loadGlobalContexts([contextName]);
    return contexts.length > 0 ? contexts[0] : null;
  }

  /**
   * List all available contexts
   */
  async listAvailableContexts(): Promise<string[]> {
    const config = ConfigLoader.getInstance().loadServerConfig();
    const contextDir = config.storage.contextSubdirectory;

    try {
      const contextFiles = await this.storageAdapter.list(contextDir);
      return contextFiles.map(file =>
        file.split('/').pop()?.replace('.mdc', '') || file
      );
    } catch (error) {
      console.error('Failed to list contexts:', error);
      return [];
    }
  }
}
