'use client';

import { useState } from 'react';

interface TestResult {
  success: boolean;
  tool: string;
  result: any;
  error?: string;
}

interface ValidationTestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
  details?: any;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
}

export default function TestPage() {
  const [queryType, setQueryType] = useState('story');
  const [taskIntent, setTaskIntent] = useState('create');
  const [scope, setScope] = useState('story');
  const [complexity, setComplexity] = useState('medium');
  const [agentType, setAgentType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentDetails, setAgentDetails] = useState<any>(null);
  const [validationResults, setValidationResults] = useState<ValidationTestResult[]>([]);
  const [runningValidation, setRunningValidation] = useState(false);

  const queryTypes = [
    'story', 'testing', 'security', 'architecture', 'architecture-diagrams',
    'pr-review', 'browser-testing', 'project-planning', 'story-breakdown',
    'documentation', 'flow-diagrams', 'infrastructure'
  ];

  const testScenarios = [
    {
      name: 'E-commerce User Story',
      query_type: 'story',
      task_intent: 'create',
      scope: 'story',
      complexity: 'medium',
      domain_focus: ['payments', 'security'],
      user_query: 'Create a user story for adding credit card payment processing'
    },
    {
      name: 'Healthcare Security Review',
      query_type: 'security',
      task_intent: 'review',
      scope: 'epic',
      complexity: 'critical',
      domain_focus: ['security', 'compliance'],
      user_query: 'Review patient data encryption and HIPAA compliance'
    },
    {
      name: 'Architecture Design',
      query_type: 'architecture-diagrams',
      task_intent: 'create',
      scope: 'epic',
      complexity: 'complex',
      domain_focus: ['infrastructure', 'backend'],
      user_query: 'Design microservices architecture for order processing system'
    }
  ];

  const testEnhancedContext = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'test-key'
        },
        body: JSON.stringify({
          tool: 'load_enhanced_context',
          arguments: {
            query_type: queryType,
            task_intent: taskIntent,
            scope: scope,
            complexity: complexity,
          }
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        tool: 'load_enhanced_context',
        result: null,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testListAgents = async (type: string) => {
    setLoading(true);
    setResult(null);
    setAgentType(type);

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'test-key'
        },
        body: JSON.stringify({
          tool: 'list_vishkar_agents',
          arguments: {
            agent_type: type
          }
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        tool: 'list_vishkar_agents',
        result: null,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAgentDetails = async (agentId: string) => {
    setSelectedAgent(agentId);
    setAgentDetails(null);

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'test-key'
        },
        body: JSON.stringify({
          tool: 'load_vishkar_agent',
          arguments: {
            agent_id: agentId
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setAgentDetails(data.result);
      }
    } catch (error) {
      console.error('Failed to load agent:', error);
    }
  };

  const runTestScenario = async (scenario: any) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'test-key'
        },
        body: JSON.stringify({
          tool: 'load_enhanced_context',
          arguments: scenario
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        tool: 'load_enhanced_context',
        result: null,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const runValidationTests = async () => {
    setRunningValidation(true);
    setValidationResults([]);

    const baseUrl = window.location.origin;
    const results: ValidationTestResult[] = [];

    // Test 1: Health Endpoint
    try {
      const start = Date.now();
      const response = await fetch(`${baseUrl}/api/health`);
      const data = await response.json();
      results.push({
        name: 'Health Endpoint',
        passed: response.ok && data.status === 'healthy',
        message: response.ok ? 'Health check passed' : 'Health check failed',
        duration: Date.now() - start,
        details: data
      });
    } catch (error) {
      results.push({
        name: 'Health Endpoint',
        passed: false,
        message: `Error: ${(error as Error).message}`,
        duration: 0
      });
    }

    // Test 2: All Agents
    try {
      const start = Date.now();
      const response = await fetch(`${baseUrl}/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'list_vishkar_agents',
          arguments: { agent_type: 'all' }
        })
      });
      const data = await response.json();
      const agents = data.result || [];
      results.push({
        name: 'All Agents',
        passed: response.ok && agents.length >= 38,
        message: `Found ${agents.length} agents (expected 38+)`,
        duration: Date.now() - start,
        details: { count: agents.length }
      });
    } catch (error) {
      results.push({
        name: 'All Agents',
        passed: false,
        message: `Error: ${(error as Error).message}`,
        duration: 0
      });
    }

    // Test 3: Domain Agents
    try {
      const start = Date.now();
      const response = await fetch(`${baseUrl}/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'list_vishkar_agents',
          arguments: { agent_type: 'domain_expert' }
        })
      });
      const data = await response.json();
      const agents = data.result || [];
      results.push({
        name: 'Domain Agents',
        passed: response.ok && agents.length >= 6,
        message: `Found ${agents.length} domain experts (expected 6+)`,
        duration: Date.now() - start,
        details: { count: agents.length }
      });
    } catch (error) {
      results.push({
        name: 'Domain Agents',
        passed: false,
        message: `Error: ${(error as Error).message}`,
        duration: 0
      });
    }

    // Test 4: Technical Agents
    try {
      const start = Date.now();
      const response = await fetch(`${baseUrl}/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'list_vishkar_agents',
          arguments: { agent_type: 'technical' }
        })
      });
      const data = await response.json();
      const agents = data.result || [];
      results.push({
        name: 'Technical Agents',
        passed: response.ok && agents.length >= 32,
        message: `Found ${agents.length} technical agents (expected 32+)`,
        duration: Date.now() - start,
        details: { count: agents.length }
      });
    } catch (error) {
      results.push({
        name: 'Technical Agents',
        passed: false,
        message: `Error: ${(error as Error).message}`,
        duration: 0
      });
    }

    // Test 5: Enhanced Context Basic
    try {
      const start = Date.now();
      const response = await fetch(`${baseUrl}/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'load_enhanced_context',
          arguments: {
            query_type: 'story',
            user_query: 'Test authentication feature'
          }
        })
      });
      const data = await response.json();
      const result = data.result || {};
      const passed = response.ok &&
                    (result.contexts?.length > 0 || false) &&
                    (result.templates?.length > 0 || false);
      results.push({
        name: 'Enhanced Context',
        passed,
        message: passed ? 'Context loading works' : 'Context loading failed',
        duration: Date.now() - start,
        details: {
          contexts: result.contexts?.length || 0,
          templates: result.templates?.length || 0
        }
      });
    } catch (error) {
      results.push({
        name: 'Enhanced Context',
        passed: false,
        message: `Error: ${(error as Error).message}`,
        duration: 0
      });
    }

    // Test 6: Intent-Based Context
    try {
      const start = Date.now();
      const response = await fetch(`${baseUrl}/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'load_enhanced_context',
          arguments: {
            query_type: 'story',
            task_intent: 'create',
            scope: 'story',
            complexity: 'medium',
            domain_focus: ['security'],
            user_query: 'Create secure payment feature'
          }
        })
      });
      const data = await response.json();
      results.push({
        name: 'Intent-Based Context',
        passed: response.ok && data.result,
        message: response.ok ? 'Intent analysis works' : 'Intent analysis failed',
        duration: Date.now() - start
      });
    } catch (error) {
      results.push({
        name: 'Intent-Based Context',
        passed: false,
        message: `Error: ${(error as Error).message}`,
        duration: 0
      });
    }

    setValidationResults(results);
    setRunningValidation(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Enhanced Context MCP Test Console</h1>
        <p className="text-gray-600 mb-8">Test and validate the MCP server functionality</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Test Inputs */}
          <div className="space-y-6">
            {/* Test Enhanced Context */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Test Enhanced Context</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Query Type</label>
                  <select
                    value={queryType}
                    onChange={(e) => setQueryType(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    {queryTypes.map(qt => (
                      <option key={qt} value={qt}>{qt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Task Intent</label>
                  <select
                    value={taskIntent}
                    onChange={(e) => setTaskIntent(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="create">Create</option>
                    <option value="refine">Refine</option>
                    <option value="breakdown">Breakdown</option>
                    <option value="review">Review</option>
                    <option value="plan">Plan</option>
                    <option value="implement">Implement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Scope</label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="epic">Epic</option>
                    <option value="story">Story</option>
                    <option value="subtask">Subtask</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="theme">Theme</option>
                    <option value="spike">Spike</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Complexity</label>
                  <select
                    value={complexity}
                    onChange={(e) => setComplexity(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="simple">Simple</option>
                    <option value="medium">Medium</option>
                    <option value="complex">Complex</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <button
                  onClick={testEnhancedContext}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Loading...' : 'Test Enhanced Context'}
                </button>
              </div>
            </div>

            {/* Test Agent Listing */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Test Agent Listing</h2>

              <div className="space-y-2">
                <button
                  onClick={() => testListAgents('all')}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  List All Agents (38 total)
                </button>
                <button
                  onClick={() => testListAgents('domain_expert')}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
                >
                  List Domain Agents (6)
                </button>
                <button
                  onClick={() => testListAgents('technical')}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  List Technical Agents (32)
                </button>
              </div>
            </div>

            {/* Test Scenarios */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Predefined Test Scenarios</h2>

              <div className="space-y-2">
                {testScenarios.map((scenario, idx) => (
                  <button
                    key={idx}
                    onClick={() => runTestScenario(scenario)}
                    disabled={loading}
                    className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:bg-gray-400 text-left px-4"
                  >
                    <div className="font-medium">{scenario.name}</div>
                    <div className="text-sm opacity-80">{scenario.user_query}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {result && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Results</h2>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? 'Success' : 'Failed'}
                  </span>
                </div>

                {result.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                    <p className="text-red-800 font-medium">Error:</p>
                    <p className="text-red-600">{result.error}</p>
                  </div>
                )}

                {result.success && result.tool === 'list_vishkar_agents' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Found {result.result?.length || 0} agents
                    </p>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {result.result?.map((agent: Agent) => (
                        <div
                          key={agent.id}
                          className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => loadAgentDetails(agent.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{agent.name}</div>
                              <div className="text-sm text-gray-600">ID: {agent.id}</div>
                              <div className="text-xs mt-1">
                                <span className={`px-2 py-1 rounded ${
                                  agent.type === 'domain_expert'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {agent.type}
                                </span>
                              </div>
                              {agent.description && (
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                  {agent.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.success && result.tool === 'load_enhanced_context' && (
                  <div className="space-y-4">
                    {/* Summary */}
                    {result.result?.summary && (
                      <div className="bg-blue-50 rounded p-4">
                        <h3 className="font-semibold mb-2">Summary</h3>
                        <pre className="text-sm whitespace-pre-wrap">{result.result.summary}</pre>
                      </div>
                    )}

                    {/* Contexts */}
                    {result.result?.contexts && result.result.contexts.length > 0 && (
                      <div>
                        <button
                          onClick={() => toggleExpand('contexts')}
                          className="w-full flex items-center justify-between bg-gray-100 px-4 py-2 rounded font-medium hover:bg-gray-200"
                        >
                          <span>Contexts ({result.result.contexts.length})</span>
                          <span>{expandedItems.has('contexts') ? '▼' : '▶'}</span>
                        </button>
                        {expandedItems.has('contexts') && (
                          <div className="mt-2 space-y-2">
                            {result.result.contexts.map((ctx: any, idx: number) => (
                              <div key={idx} className="border rounded p-3">
                                <div className="font-medium text-sm">{ctx.file || ctx.name}</div>
                                <button
                                  onClick={() => toggleExpand(`context-${idx}`)}
                                  className="text-xs text-blue-600 hover:underline mt-1"
                                >
                                  {expandedItems.has(`context-${idx}`) ? 'Hide' : 'Show'} content
                                </button>
                                {expandedItems.has(`context-${idx}`) && (
                                  <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto max-h-96 overflow-y-auto">
                                    {ctx.content || JSON.stringify(ctx, null, 2)}
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Templates */}
                    {result.result?.templates && result.result.templates.length > 0 && (
                      <div>
                        <button
                          onClick={() => toggleExpand('templates')}
                          className="w-full flex items-center justify-between bg-gray-100 px-4 py-2 rounded font-medium hover:bg-gray-200"
                        >
                          <span>Templates ({result.result.templates.length})</span>
                          <span>{expandedItems.has('templates') ? '▼' : '▶'}</span>
                        </button>
                        {expandedItems.has('templates') && (
                          <div className="mt-2 space-y-2">
                            {result.result.templates.map((tpl: any, idx: number) => (
                              <div key={idx} className="border rounded p-3">
                                <div className="font-medium text-sm">{tpl.file || tpl.name}</div>
                                <button
                                  onClick={() => toggleExpand(`template-${idx}`)}
                                  className="text-xs text-blue-600 hover:underline mt-1"
                                >
                                  {expandedItems.has(`template-${idx}`) ? 'Hide' : 'Show'} content
                                </button>
                                {expandedItems.has(`template-${idx}`) && (
                                  <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto max-h-96 overflow-y-auto">
                                    {tpl.content || JSON.stringify(tpl, null, 2)}
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Agent */}
                    {result.result?.agent && (
                      <div>
                        <button
                          onClick={() => toggleExpand('agent')}
                          className="w-full flex items-center justify-between bg-gray-100 px-4 py-2 rounded font-medium hover:bg-gray-200"
                        >
                          <span>Agent: {result.result.agent.name}</span>
                          <span>{expandedItems.has('agent') ? '▼' : '▶'}</span>
                        </button>
                        {expandedItems.has('agent') && (
                          <div className="mt-2 border rounded p-3">
                            <div className="space-y-2 text-sm">
                              <div><strong>ID:</strong> {result.result.agent.id}</div>
                              <div><strong>Type:</strong> {result.result.agent.type}</div>
                              <div><strong>Description:</strong> {result.result.agent.description}</div>
                              <button
                                onClick={() => toggleExpand('agent-content')}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {expandedItems.has('agent-content') ? 'Hide' : 'Show'} full content
                              </button>
                              {expandedItems.has('agent-content') && (
                                <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto max-h-96 overflow-y-auto">
                                  {result.result.agent.content}
                                </pre>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Raw Response */}
                    <div>
                      <button
                        onClick={() => toggleExpand('raw')}
                        className="w-full flex items-center justify-between bg-gray-100 px-4 py-2 rounded font-medium hover:bg-gray-200"
                      >
                        <span>Raw Response</span>
                        <span>{expandedItems.has('raw') ? '▼' : '▶'}</span>
                      </button>
                      {expandedItems.has('raw') && (
                        <pre className="mt-2 text-xs bg-gray-50 p-4 rounded overflow-x-auto max-h-96 overflow-y-auto">
                          {JSON.stringify(result.result, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Agent Details Modal */}
            {selectedAgent && agentDetails && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Agent Details</h2>
                  <button
                    onClick={() => {
                      setSelectedAgent(null);
                      setAgentDetails(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <strong>ID:</strong> {agentDetails.id}
                  </div>
                  <div>
                    <strong>Name:</strong> {agentDetails.name}
                  </div>
                  <div>
                    <strong>Type:</strong>{' '}
                    <span className={`px-2 py-1 rounded text-sm ${
                      agentDetails.type === 'domain_expert'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {agentDetails.type}
                    </span>
                  </div>
                  <div>
                    <strong>Description:</strong>
                    <p className="text-gray-700 mt-1">{agentDetails.description}</p>
                  </div>
                  {agentDetails.specializations && agentDetails.specializations.length > 0 && (
                    <div>
                      <strong>Specializations:</strong>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {agentDetails.specializations.map((spec: string) => (
                          <span
                            key={spec}
                            className="px-2 py-1 bg-gray-100 rounded text-sm"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <strong>Full Content:</strong>
                    <pre className="mt-2 text-xs bg-gray-50 p-4 rounded overflow-x-auto max-h-96 overflow-y-auto">
                      {agentDetails.content}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Automated Validation Tests */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Automated Validation Tests</h2>
              <p className="text-sm text-gray-600 mt-1">
                Run comprehensive automated tests to validate all MCP functionality
              </p>
            </div>
            <button
              onClick={runValidationTests}
              disabled={runningValidation}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 font-medium"
            >
              {runningValidation ? 'Running Tests...' : 'Run All Tests'}
            </button>
          </div>

          {validationResults.length > 0 && (
            <div>
              {/* Summary */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Total Tests</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {validationResults.length}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Passed</div>
                  <div className="text-2xl font-bold text-green-600">
                    {validationResults.filter(r => r.passed).length}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Failed</div>
                  <div className="text-2xl font-bold text-red-600">
                    {validationResults.filter(r => !r.passed).length}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Success Rate</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((validationResults.filter(r => r.passed).length / validationResults.length) * 100)}%
                  </div>
                </div>
              </div>

              {/* Test Results */}
              <div className="space-y-3">
                {validationResults.map((test, idx) => (
                  <div
                    key={idx}
                    className={`border-l-4 rounded-lg p-4 ${
                      test.passed
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {test.passed ? '✅' : '❌'}
                          </span>
                          <div>
                            <div className="font-semibold text-lg">{test.name}</div>
                            <div className={`text-sm ${
                              test.passed ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {test.message}
                            </div>
                          </div>
                        </div>
                        {test.details && (
                          <div className="mt-2 ml-11">
                            <button
                              onClick={() => toggleExpand(`validation-${idx}`)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              {expandedItems.has(`validation-${idx}`) ? 'Hide' : 'Show'} details
                            </button>
                            {expandedItems.has(`validation-${idx}`) && (
                              <pre className="mt-2 text-xs bg-white p-3 rounded overflow-x-auto">
                                {JSON.stringify(test.details, null, 2)}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {test.duration}ms
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
