/**
 * Standards Injection Utility for VISHKAR UI
 * 
 * Use this to inject engineering standards into LLM prompts
 * ensuring consistent code quality across Claude, GPT, Aider, Goose, etc.
 */

export interface StandardsConfig {
  apiKey: string;
  mcpEndpoint?: string;
}

export type StandardSection = 
  | 'overview' 
  | 'python' 
  | 'fastapi' 
  | 'database' 
  | 'testing' 
  | 'frontend' 
  | 'security' 
  | 'code_quality' 
  | 'all';

const DEFAULT_MCP_ENDPOINT = 'https://enhanced-context-mcp.vercel.app/api/mcp';

/**
 * Fetch standards from Enhanced Context MCP
 */
export async function fetchStandards(
  section: StandardSection,
  config: StandardsConfig
): Promise<string> {
  const endpoint = config.mcpEndpoint || DEFAULT_MCP_ENDPOINT;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'get_engineering_standards',
        arguments: { section, format: 'markdown' }
      },
      id: 1
    })
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Failed to fetch standards: ${data.error.message}`);
  }
  
  return data.result?.data || '';
}

/**
 * Detect which standards are relevant based on task description
 */
export function detectRelevantSections(task: string): StandardSection[] {
  const taskLower = task.toLowerCase();
  const sections: StandardSection[] = [];
  
  // Always include overview for context
  sections.push('overview');
  
  // Detect based on keywords
  if (/test|pytest|spec|coverage|mock|fixture/.test(taskLower)) {
    sections.push('testing');
  }
  
  if (/api|endpoint|route|fastapi|rest|graphql/.test(taskLower)) {
    sections.push('fastapi');
  }
  
  if (/database|model|sqlalchemy|alembic|migration|query|postgres/.test(taskLower)) {
    sections.push('database');
  }
  
  if (/security|auth|password|token|jwt|oauth|permission/.test(taskLower)) {
    sections.push('security');
  }
  
  if (/react|next|frontend|component|ui|css|tailwind/.test(taskLower)) {
    sections.push('frontend');
  }
  
  if (/refactor|clean|quality|solid|dry|lint/.test(taskLower)) {
    sections.push('code_quality');
  }
  
  // Default to Python for backend tasks
  if (/python|backend|service|async|await/.test(taskLower) || sections.length <= 1) {
    sections.push('python');
  }
  
  return [...new Set(sections)]; // Remove duplicates
}

/**
 * Build a system prompt with standards injected
 */
export async function buildSystemPromptWithStandards(
  userTask: string,
  config: StandardsConfig
): Promise<string> {
  const relevantSections = detectRelevantSections(userTask);
  
  // Fetch all relevant standards in parallel
  const standardsPromises = relevantSections.map(section => 
    fetchStandards(section, config).catch(() => '')
  );
  
  const standardsResults = await Promise.all(standardsPromises);
  const combinedStandards = standardsResults
    .filter(Boolean)
    .join('\n\n---\n\n');
  
  return `You are a senior developer working on an enterprise application.

## MANDATORY Engineering Standards

You MUST follow these standards EXACTLY. Non-compliance is not acceptable.

${combinedStandards}

---

## Enforcement Rules

1. Every function MUST have complete type hints
2. Every async operation MUST use await (never block the event loop)
3. Every database query MUST use parameterized queries
4. Every API endpoint MUST have proper error handling and response models
5. Every piece of code MUST be testable

## Your Task

Implement the following request while strictly adhering to ALL standards above:

`;
}

/**
 * Quick helper to inject standards into an existing prompt
 */
export async function injectStandards(
  existingPrompt: string,
  taskContext: string,
  config: StandardsConfig
): Promise<string> {
  const systemPrompt = await buildSystemPromptWithStandards(taskContext, config);
  return `${systemPrompt}\n${existingPrompt}`;
}

// Example usage:
// 
// const config = { apiKey: process.env.VISHKAR_API_KEY };
// const systemPrompt = await buildSystemPromptWithStandards(
//   "Create a FastAPI endpoint for user registration",
//   config
// );
// 
// // Send to any LLM with this system prompt
// const response = await llm.chat({
//   systemPrompt,
//   userMessage: "Create a FastAPI endpoint for user registration"
// });
