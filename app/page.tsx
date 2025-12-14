import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-purple-200 text-sm">Part of VISHKAR MCP Ecosystem</span>
            <a href="https://project-registry-henna.vercel.app" className="text-purple-200 hover:text-white text-sm">
              ← Back to Ecosystem Hub
            </a>
          </div>
          <h1 className="text-4xl font-bold mb-3">Enhanced Context MCP</h1>
          <p className="text-xl text-purple-100 mb-4">
            AI Intelligence Layer - SDLC Guidance, VISHKAR Agents &amp; Context-Aware Development
          </p>
          <div className="flex gap-3 flex-wrap">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">17-Step SDLC</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">38 VISHKAR Agents</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">10 Tools</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">v2.0.0</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Role in Ecosystem */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-purple-600">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Role in the Ecosystem</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-600 mb-4">
                  Enhanced Context MCP is the <strong>AI Intelligence Layer</strong> of the VISHKAR ecosystem.
                  It provides development methodology guidance, specialized agent profiles, and context-aware
                  tooling for autonomous software development.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span> 17-Step Enhanced SDLC with 4-Angle Internal Review
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span> 38 specialized VISHKAR agents (32 technical + 6 domain)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span> Contextual agent selection by file patterns
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span> POC building methodology (QIP framework)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span> Intent-based context loading
                  </li>
                </ul>
              </div>
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Quick Example</h3>
                <pre className="text-xs bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`# Get SDLC guidance
curl -X POST \\
  https://enhanced-context-mcp.vercel.app/api/mcp \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: pk_your_key" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get_sdlc_guidance",
      "arguments": {"section": "overview"}
    },
    "id": 1
  }'`}
                </pre>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Link href="/docs" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium">
                View API Documentation →
              </Link>
            </div>
          </div>
        </section>

        {/* Architecture Position */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ecosystem Architecture</h2>
          <div className="bg-white rounded-2xl shadow-xl p-6 overflow-x-auto">
            <pre className="text-xs font-mono text-gray-700 leading-relaxed">
{`┌─────────────────────────────────────────────────────────────────┐
│                     VISHKAR AI Agent                             │
└──────────────────────────────┬──────────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                      ▼
┌───────────────────────┐              ┌───────────────────────┐
│   PROJECT REGISTRY    │◄────────────►│  ENHANCED CONTEXT MCP │ ◄── YOU ARE HERE
│   (Entry Point)       │              │   (AI Intelligence)   │
└───────────────────────┘              └───────────┬───────────┘
                                                   │
              ┌────────────────────────────────────┼────────────────┐
              ▼                                    ▼                ▼
┌───────────────────────┐    ┌───────────────────────┐    ┌───────────────────┐
│      JIRA MCP         │    │   CONFLUENCE MCP      │    │  STORYCRAFTER MCP │
│   (41 Tools)          │    │    (32 Tools)         │    │   (4 Tools)       │
└───────────────────────┘    └───────────────────────┘    └───────────────────┘

Enhanced Context MCP Provides:
• 17-Step SDLC Guidance → Development methodology for all MCPs
• 38 VISHKAR Agents    → Specialized reviewers (architecture, security, etc.)
• Contextual Selection → "Give me the right architect" for any file
• POC Methodology      → QIP framework for proof-of-concept sites`}
            </pre>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Capabilities</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* 17-Step SDLC */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-600">
              <h3 className="text-lg font-bold text-gray-900 mb-3">17-Step Enhanced SDLC</h3>
              <p className="text-gray-600 text-sm mb-4">
                Autonomous development lifecycle with 7 phases including 4-Angle Internal Review.
              </p>
              <div className="bg-purple-50 rounded-lg p-4 text-sm">
                <div className="font-semibold text-purple-800 mb-2">Phases:</div>
                <ol className="text-gray-600 space-y-1 text-xs">
                  <li>1. Task Selection</li>
                  <li>2. Implementation</li>
                  <li>3-6. <span className="text-purple-600 font-medium">4-Angle Internal Review</span> (Arch, Security, Quality, Tech-Stack)</li>
                  <li>7. Feedback Integration</li>
                  <li>8-11. Testing (Unit, Integration, E2E, Security)</li>
                  <li>12-14. PR &amp; Review</li>
                  <li>15-17. Merge &amp; Deploy</li>
                </ol>
              </div>
            </div>

            {/* VISHKAR Agents */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-600">
              <h3 className="text-lg font-bold text-gray-900 mb-3">38 VISHKAR Agents</h3>
              <p className="text-gray-600 text-sm mb-4">
                Specialized AI agents for every development discipline.
              </p>
              <div className="bg-indigo-50 rounded-lg p-4 text-sm">
                <div className="font-semibold text-indigo-800 mb-2">Agent Categories:</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>• Architecture Review</div>
                  <div>• Security Audit</div>
                  <div>• Frontend Dev</div>
                  <div>• Backend Engineer</div>
                  <div>• TypeScript Pro</div>
                  <div>• FastAPI Expert</div>
                  <div>• Terraform Specialist</div>
                  <div>• Test Automator</div>
                  <div>• E-Commerce Planning</div>
                  <div>• Healthcare Domain</div>
                  <div>• FinTech Compliance</div>
                  <div>• + 27 more...</div>
                </div>
              </div>
            </div>

            {/* Contextual Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-600">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Contextual Agent Selection</h3>
              <p className="text-gray-600 text-sm mb-4">
                &quot;Give me the right architect&quot; - automatic agent matching based on file patterns.
              </p>
              <div className="bg-green-50 rounded-lg p-4 text-xs">
                <pre className="text-gray-700">
{`get_contextual_agent({
  file_paths: [
    "backend/src/api.py",
    "frontend/Button.tsx",
    "terraform/main.tf"
  ]
})

→ Returns: fastapi-pro, frontend-dev,
           terraform-specialist`}
                </pre>
              </div>
            </div>

            {/* POC Methodology */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-amber-600">
              <h3 className="text-lg font-bold text-gray-900 mb-3">POC Building Guide</h3>
              <p className="text-gray-600 text-sm mb-4">
                QIP methodology for interactive proof-of-concept sites.
              </p>
              <div className="bg-amber-50 rounded-lg p-4 text-sm">
                <div className="font-semibold text-amber-800 mb-2">6-Section Framework:</div>
                <ol className="text-gray-600 space-y-1 text-xs">
                  <li>1. Questions (Clarifying Questions)</li>
                  <li>2. Architecture (System Design)</li>
                  <li>3. Delivery (Timeline &amp; WBS)</li>
                  <li>4. Risks (Risk Analysis)</li>
                  <li>5. North Star (Vision &amp; Goals)</li>
                  <li>6. Demo (Interactive Prototype)</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Available Tools */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Tools</h2>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-4 text-gray-700 font-semibold">Tool</th>
                  <th className="text-left px-6 py-4 text-gray-700 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-6 py-3 font-mono text-purple-600">get_started</td>
                  <td className="px-6 py-3 text-gray-600">Onboarding and ecosystem overview</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-mono text-purple-600">get_sdlc_guidance</td>
                  <td className="px-6 py-3 text-gray-600">17-Step SDLC with agent mappings and quality gates</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-mono text-purple-600">get_contextual_agent</td>
                  <td className="px-6 py-3 text-gray-600">Match files to specialist agents automatically</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-mono text-purple-600">load_enhanced_context</td>
                  <td className="px-6 py-3 text-gray-600">Intent-based context loading with smart selection</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-mono text-purple-600">list_vishkar_agents</td>
                  <td className="px-6 py-3 text-gray-600">List all 38 VISHKAR agents with filtering</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-mono text-purple-600">load_vishkar_agent</td>
                  <td className="px-6 py-3 text-gray-600">Load complete agent profile with examples</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-mono text-purple-600">get_poc_building_guide</td>
                  <td className="px-6 py-3 text-gray-600">QIP methodology for POC sites</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-mono text-purple-600">validate_vishkar_agent_profile</td>
                  <td className="px-6 py-3 text-gray-600">Validate agent profile format</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-mono text-purple-600">refresh_agent_cache</td>
                  <td className="px-6 py-3 text-gray-600">Clear and reload agent profiles</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-mono text-purple-600">update_agent</td>
                  <td className="px-6 py-3 text-gray-600">Update agent configurations with learning</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage Examples</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Get 17-Step SDLC Overview</h3>
              <pre className="text-xs bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`POST /api/mcp
X-API-Key: pk_your_key

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get_sdlc_guidance",
    "arguments": { "section": "overview" }
  },
  "id": 1
}`}
              </pre>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">List VISHKAR Agents by Type</h3>
              <pre className="text-xs bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`POST /api/mcp
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list_vishkar_agents",
    "arguments": { "agent_type": "domain_expert" }
  },
  "id": 1
}`}
              </pre>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Get Right Architect for Files</h3>
              <pre className="text-xs bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`POST /api/mcp
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get_contextual_agent",
    "arguments": {
      "file_paths": ["backend/api/routes.py", "frontend/src/App.tsx"]
    }
  },
  "id": 1
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Other MCPs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related MCP Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="https://project-registry-henna.vercel.app" className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
              <h3 className="font-semibold text-blue-600">Project Registry</h3>
              <p className="text-xs text-gray-500">Entry Point • 6 Tools</p>
            </a>
            <a href="https://jira-mcp-pi.vercel.app" className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
              <h3 className="font-semibold text-indigo-600">JIRA MCP</h3>
              <p className="text-xs text-gray-500">Project Mgmt • 41 Tools</p>
            </a>
            <a href="https://confluence-mcp-six.vercel.app" className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
              <h3 className="font-semibold text-green-600">Confluence MCP</h3>
              <p className="text-xs text-gray-500">Documentation • 32 Tools</p>
            </a>
            <a href="https://storycrafter-mcp.vercel.app" className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
              <h3 className="font-semibold text-amber-600">StoryCrafter MCP</h3>
              <p className="text-xs text-gray-500">AI Backlog • 4 Tools</p>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-400">
            Enhanced Context MCP v2.0.0 - Part of the VISHKAR MCP Ecosystem
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <a href="/docs" className="text-purple-400 hover:text-white">API Docs</a>
            <a href="https://project-registry-henna.vercel.app/docs" className="text-slate-400 hover:text-white">All MCPs</a>
            <a href="https://modelcontextprotocol.io" className="text-slate-400 hover:text-white">MCP Spec</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
