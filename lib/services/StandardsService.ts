/**
 * StandardsService - Loads engineering standards from .standards/ files
 *
 * This service reads markdown files from the .standards/ directory instead of
 * using hardcoded content, allowing standards to be updated without code changes.
 */

import fs from 'fs/promises';
import path from 'path';

// Section to filename mapping
const SECTION_FILE_MAP: Record<string, string> = {
  overview: 'README.md',
  python: 'python.md',
  fastapi: 'fastapi.md',
  database: 'database.md',
  testing: 'testing.md',
  frontend: 'frontend.md',
  security: 'security.md',
  code_quality: 'code_quality.md',
  diagrams: 'diagrams.md'
};

// Available sections
export const AVAILABLE_SECTIONS = Object.keys(SECTION_FILE_MAP);

/**
 * Load a single standard file by section name
 */
export async function loadStandardFromFile(section: string): Promise<string> {
  const fileName = SECTION_FILE_MAP[section];
  if (!fileName) {
    throw new Error(`Unknown section: ${section}. Available: ${AVAILABLE_SECTIONS.join(', ')}`);
  }

  const filePath = path.join(process.cwd(), '.standards', fileName);

  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    // Fallback: return error message but don't crash
    console.error(`Failed to read standards file: ${filePath}`, error);
    throw new Error(`Standards file not found: ${fileName}. Ensure .standards/ directory exists.`);
  }
}

/**
 * Load all standards files
 */
export async function loadAllStandards(): Promise<Record<string, string>> {
  const standards: Record<string, string> = {};

  for (const section of AVAILABLE_SECTIONS) {
    try {
      standards[section] = await loadStandardFromFile(section);
    } catch (error) {
      standards[section] = `Error loading ${section}: ${(error as Error).message}`;
    }
  }

  return standards;
}

/**
 * Get list of all available standard files with metadata
 */
export async function listStandardFiles(): Promise<Array<{ section: string; filename: string; exists: boolean }>> {
  const results = [];

  for (const [section, filename] of Object.entries(SECTION_FILE_MAP)) {
    const filePath = path.join(process.cwd(), '.standards', filename);
    let exists = false;

    try {
      await fs.access(filePath);
      exists = true;
    } catch {
      exists = false;
    }

    results.push({ section, filename, exists });
  }

  return results;
}

/**
 * Get standards directory info
 */
export function getStandardsInfo() {
  return {
    directory: '.standards/',
    files: SECTION_FILE_MAP,
    available_sections: AVAILABLE_SECTIONS,
    source: 'https://github.com/premkalyan/enhanced-context-mcp',
    usage: {
      llm: 'Read relevant standard files before implementing features',
      team: 'Modify files as needed, commit to Git for version control',
      refresh: 'Pull latest from repository to update standards'
    }
  };
}

/**
 * Load helper scripts information
 */
export async function loadHelperScripts(category: 'mcp' | 'db' | 'setup' | 'all' = 'all'): Promise<Record<string, any>> {
  const scriptsInfo: Record<string, any> = {
    repository: 'https://github.com/premkalyan/enhanced-context-mcp',
    base_path: 'scripts/',
    categories: {}
  };

  const categories = category === 'all' ? ['mcp', 'db', 'setup'] : [category];

  for (const cat of categories) {
    const catPath = path.join(process.cwd(), 'scripts', cat);

    try {
      const files = await fs.readdir(catPath);
      const scripts = files.filter(f => f.endsWith('.sh') || f.endsWith('.js'));

      scriptsInfo.categories[cat] = {
        path: `scripts/${cat}/`,
        scripts: scripts,
        count: scripts.length
      };
    } catch (error) {
      scriptsInfo.categories[cat] = {
        path: `scripts/${cat}/`,
        scripts: [],
        error: 'Directory not found or not readable'
      };
    }
  }

  // Add usage examples for MCP scripts
  if (category === 'all' || category === 'mcp') {
    scriptsInfo.usage = {
      setup: [
        '1. Clone repo: git clone https://github.com/premkalyan/enhanced-context-mcp.git vishkar-utils',
        '2. Set API key: export VISHKAR_API_KEY=pk_xxx',
        '3. Make executable: chmod +x vishkar-utils/scripts/mcp/*.sh'
      ],
      examples: {
        jira: './vishkar-utils/scripts/mcp/jira.sh \'{"tool":"search_issues","arguments":{"jql":"project=PROJ"}}\'',
        confluence: './vishkar-utils/scripts/mcp/confluence.sh \'{"tool":"search","arguments":{"cql":"space=DOCS"}}\'',
        enhanced_context: './vishkar-utils/scripts/mcp/enhanced_context.sh \'{"tool":"get_sdlc_guidance","arguments":{}}\''
      }
    };
  }

  return scriptsInfo;
}
