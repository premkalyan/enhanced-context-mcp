/**
 * MCP Validation Tests
 * Automated tests to validate Enhanced Context MCP functionality
 */

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
  details?: any;
}

export class MCPValidator {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://enhanced-context-mcp.vercel.app') {
    this.baseUrl = baseUrl;
  }

  /**
   * Run all validation tests
   */
  async runAllTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    results.push(await this.testHealthEndpoint());
    results.push(await this.testAgentListing());
    results.push(await this.testDomainAgents());
    results.push(await this.testTechnicalAgents());
    results.push(await this.testEnhancedContextBasic());
    results.push(await this.testEnhancedContextWithIntent());
    results.push(await this.testEnhancedContextArchitecture());
    results.push(await this.testAgentTypeFiltering());
    results.push(await this.testContextVariety());

    return results;
  }

  /**
   * Test health endpoint
   */
  private async testHealthEndpoint(): Promise<TestResult> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const data = await response.json();

      const passed = response.ok &&
                    data.status === 'healthy' &&
                    data.version === '2.0.0' &&
                    data.checks.storage === true;

      return {
        name: 'Health Endpoint',
        passed,
        message: passed ? 'Health check passed' : 'Health check failed',
        duration: Date.now() - start,
        details: data
      };
    } catch (error) {
      return {
        name: 'Health Endpoint',
        passed: false,
        message: `Error: ${(error as Error).message}`,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Test agent listing
   */
  private async testAgentListing(): Promise<TestResult> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'tools/call',
          params: {
            name: 'list_vishkar_agents',
            arguments: { agent_type: 'all' }
          }
        })
      });

      const data = await response.json();
      const agents = data.content?.[0]?.text ? JSON.parse(data.content[0].text) : [];

      const passed = response.ok &&
                    Array.isArray(agents) &&
                    agents.length >= 38; // 32 technical + 6 domain experts

      return {
        name: 'Agent Listing',
        passed,
        message: passed ?
          `Found ${agents.length} agents` :
          `Expected at least 38 agents, found ${agents.length}`,
        duration: Date.now() - start,
        details: { count: agents.length }
      };
    } catch (error) {
      return {
        name: 'Agent Listing',
        passed: false,
        message: `Error: ${(error as Error).message}`,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Test domain agent filtering
   */
  private async testDomainAgents(): Promise<TestResult> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'tools/call',
          params: {
            name: 'list_vishkar_agents',
            arguments: { agent_type: 'domain_expert' }
          }
        })
      });

      const data = await response.json();
      const agents = data.content?.[0]?.text ? JSON.parse(data.content[0].text) : [];

      const expectedDomains = ['ecommerce', 'healthcare', 'fintech', 'cx-designer', 'privacy', 'supply-chain'];
      const foundDomains = agents.filter((a: any) =>
        expectedDomains.some(d => a.id.includes(d))
      );

      const passed = response.ok &&
                    agents.length >= 6 &&
                    agents.every((a: any) => a.type === 'domain_expert') &&
                    foundDomains.length >= 6;

      return {
        name: 'Domain Agents',
        passed,
        message: passed ?
          `Found ${agents.length} domain experts with correct types` :
          `Domain agent validation failed`,
        duration: Date.now() - start,
        details: { count: agents.length, found: foundDomains.length }
      };
    } catch (error) {
      return {
        name: 'Domain Agents',
        passed: false,
        message: `Error: ${(error as Error).message}`,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Test technical agent filtering
   */
  private async testTechnicalAgents(): Promise<TestResult> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'tools/call',
          params: {
            name: 'list_vishkar_agents',
            arguments: { agent_type: 'technical' }
          }
        })
      });

      const data = await response.json();
      const agents = data.content?.[0]?.text ? JSON.parse(data.content[0].text) : [];

      const passed = response.ok &&
                    agents.length >= 32 &&
                    agents.every((a: any) => !a.type || a.type === 'technical');

      return {
        name: 'Technical Agents',
        passed,
        message: passed ?
          `Found ${agents.length} technical agents` :
          `Expected at least 32 technical agents, found ${agents.length}`,
        duration: Date.now() - start,
        details: { count: agents.length }
      };
    } catch (error) {
      return {
        name: 'Technical Agents',
        passed: false,
        message: `Error: ${(error as Error).message}`,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Test basic enhanced context loading
   */
  private async testEnhancedContextBasic(): Promise<TestResult> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'tools/call',
          params: {
            name: 'load_enhanced_context',
            arguments: {
              query_type: 'story',
              user_query: 'Create a user authentication feature'
            }
          }
        })
      });

      const data = await response.json();
      const result = data.content?.[0]?.text ? JSON.parse(data.content[0].text) : null;

      const passed = response.ok &&
                    result?.contexts?.length > 0 &&
                    result?.templates?.length > 0 &&
                    result?.agents?.length > 0;

      return {
        name: 'Enhanced Context - Basic',
        passed,
        message: passed ?
          `Loaded ${result.contexts.length} contexts, ${result.templates.length} templates, ${result.agents.length} agents` :
          'Basic context loading failed',
        duration: Date.now() - start,
        details: result
      };
    } catch (error) {
      return {
        name: 'Enhanced Context - Basic',
        passed: false,
        message: `Error: ${(error as Error).message}`,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Test enhanced context with intent analysis
   */
  private async testEnhancedContextWithIntent(): Promise<TestResult> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'tools/call',
          params: {
            name: 'load_enhanced_context',
            arguments: {
              query_type: 'story',
              task_intent: 'create',
              scope: 'story',
              complexity: 'medium',
              domain_focus: ['security', 'payments'],
              user_query: 'Create secure payment processing'
            }
          }
        })
      });

      const data = await response.json();
      const result = data.content?.[0]?.text ? JSON.parse(data.content[0].text) : null;

      const passed = response.ok &&
                    result?.contexts?.length > 0 &&
                    result?.agents?.length > 0;

      return {
        name: 'Enhanced Context - Intent',
        passed,
        message: passed ?
          'Intent-based context loading works correctly' :
          'Intent-based loading failed',
        duration: Date.now() - start,
        details: result
      };
    } catch (error) {
      return {
        name: 'Enhanced Context - Intent',
        passed: false,
        message: `Error: ${(error as Error).message}`,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Test architecture diagram context
   */
  private async testEnhancedContextArchitecture(): Promise<TestResult> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'tools/call',
          params: {
            name: 'load_enhanced_context',
            arguments: {
              query_type: 'architecture-diagrams',
              complexity: 'complex',
              user_query: 'Design microservices architecture'
            }
          }
        })
      });

      const data = await response.json();
      const result = data.content?.[0]?.text ? JSON.parse(data.content[0].text) : null;

      const hasArchContext = result?.contexts?.some((c: any) =>
        c.name?.toLowerCase().includes('architecture') ||
        c.content?.toLowerCase().includes('mermaid')
      );

      const passed = response.ok && hasArchContext;

      return {
        name: 'Architecture Context',
        passed,
        message: passed ?
          'Architecture-specific context loaded' :
          'Architecture context not found',
        duration: Date.now() - start,
        details: result
      };
    } catch (error) {
      return {
        name: 'Architecture Context',
        passed: false,
        message: `Error: ${(error as Error).message}`,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Test agent type filtering consistency
   */
  private async testAgentTypeFiltering(): Promise<TestResult> {
    const start = Date.now();
    try {
      // Get all agents
      const allResponse = await fetch(`${this.baseUrl}/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'tools/call',
          params: {
            name: 'list_vishkar_agents',
            arguments: { agent_type: 'all' }
          }
        })
      });
      const allData = await allResponse.json();
      const allAgents = allData.content?.[0]?.text ? JSON.parse(allData.content[0].text) : [];

      // Get domain agents
      const domainResponse = await fetch(`${this.baseUrl}/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'tools/call',
          params: {
            name: 'list_vishkar_agents',
            arguments: { agent_type: 'domain_expert' }
          }
        })
      });
      const domainData = await domainResponse.json();
      const domainAgents = domainData.content?.[0]?.text ? JSON.parse(domainData.content[0].text) : [];

      // Get technical agents
      const techResponse = await fetch(`${this.baseUrl}/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'tools/call',
          params: {
            name: 'list_vishkar_agents',
            arguments: { agent_type: 'technical' }
          }
        })
      });
      const techData = await techResponse.json();
      const techAgents = techData.content?.[0]?.text ? JSON.parse(techData.content[0].text) : [];

      const sumMatches = (domainAgents.length + techAgents.length) === allAgents.length;
      const noOverlap = !domainAgents.some((d: any) =>
        techAgents.some((t: any) => t.id === d.id)
      );

      const passed = sumMatches && noOverlap;

      return {
        name: 'Agent Type Filtering',
        passed,
        message: passed ?
          'Agent filtering is consistent and non-overlapping' :
          'Agent filtering inconsistency detected',
        duration: Date.now() - start,
        details: {
          all: allAgents.length,
          domain: domainAgents.length,
          technical: techAgents.length,
          sumMatches,
          noOverlap
        }
      };
    } catch (error) {
      return {
        name: 'Agent Type Filtering',
        passed: false,
        message: `Error: ${(error as Error).message}`,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Test context variety across different query types
   */
  private async testContextVariety(): Promise<TestResult> {
    const start = Date.now();
    try {
      const queryTypes = ['story', 'security', 'architecture-diagrams', 'api-spec'];
      const results = [];

      for (const queryType of queryTypes) {
        const response = await fetch(`${this.baseUrl}/api/mcp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'tools/call',
            params: {
              name: 'load_enhanced_context',
              arguments: {
                query_type: queryType,
                user_query: `Test query for ${queryType}`
              }
            }
          })
        });

        const data = await response.json();
        const result = data.content?.[0]?.text ? JSON.parse(data.content[0].text) : null;

        results.push({
          queryType,
          contexts: result?.contexts?.length || 0,
          templates: result?.templates?.length || 0,
          agents: result?.agents?.length || 0
        });
      }

      // Each query type should return different context combinations
      const hasVariety = results.some(r => r.contexts > 0) &&
                         results.some(r => r.templates > 0) &&
                         results.some(r => r.agents > 0);

      const passed = hasVariety;

      return {
        name: 'Context Variety',
        passed,
        message: passed ?
          'Different query types return varied contexts' :
          'Context variety test failed',
        duration: Date.now() - start,
        details: results
      };
    } catch (error) {
      return {
        name: 'Context Variety',
        passed: false,
        message: `Error: ${(error as Error).message}`,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Generate test summary
   */
  generateSummary(results: TestResult[]): {
    total: number;
    passed: number;
    failed: number;
    successRate: number;
    totalDuration: number;
  } {
    return {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      successRate: (results.filter(r => r.passed).length / results.length) * 100,
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0)
    };
  }
}
