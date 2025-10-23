export default function Home() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto bg-white text-black">
      <h1 className="text-4xl font-bold mb-4 text-black">Enhanced Context MCP Server</h1>
      <p className="mb-4 text-gray-700">Version 2.0.0 - Serverless with Project Registry Integration</p>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-black">Available Endpoints</h2>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><code className="bg-gray-100 px-2 py-1 rounded text-black">/api/health</code> - Health check</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-black">/api/mcp</code> - Main MCP endpoint (POST)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-black">Available Tools (6 total)</h2>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-black">Context Loading</h3>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong className="text-black">load_enhanced_context</strong> - Load global WAMA contexts, templates, and project-specific rules</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-black">Agent Management</h3>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong className="text-black">list_vishkar_agents</strong> - List all available VISHKAR agent profiles</li>
          <li><strong className="text-black">load_vishkar_agent</strong> - Load complete VISHKAR agent profile by ID</li>
          <li><strong className="text-black">validate_vishkar_agent_profile</strong> - Validate VISHKAR agent profile format</li>
          <li><strong className="text-black">refresh_agent_cache</strong> - Clear cached agent profiles and reload from disk</li>
          <li><strong className="text-black">update_agent</strong> - Update existing agent configurations with learning improvements</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-black">Query Types</h2>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong>story</strong> - User story and epic creation</li>
          <li><strong>testing</strong> - Test planning and strategy</li>
          <li><strong>security</strong> - Security reviews and audits</li>
          <li><strong>architecture</strong> - Architecture design and documentation</li>
          <li><strong>pr-review</strong> - Pull request reviews</li>
          <li><strong>browser-testing</strong> - Browser automation testing</li>
          <li><strong>project-planning</strong> - Project planning and management</li>
          <li><strong>story-breakdown</strong> - Breaking down epics into stories</li>
          <li><strong>documentation</strong> - Technical documentation</li>
          <li><strong>flow-diagrams</strong> - Flow and sequence diagrams</li>
          <li><strong>infrastructure</strong> - Infrastructure as code and cloud architecture</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-black">Usage</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-black">
{`POST /api/mcp
Headers:
  X-API-Key: pk_your_api_key
  Content-Type: application/json

Body:
{
  "tool": "load_enhanced_context",
  "arguments": {
    "query_type": "story",
    "project_path": "/path/to/project"
  }
}`}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-black">Example Response</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-black">
{`{
  "success": true,
  "tool": "load_enhanced_context",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Enhanced Context Loaded Successfully..."
      }
    ]
  }
}`}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-black">Integration</h2>
        <p className="mb-4 text-black">This Enhanced Context MCP server integrates with the Project Registry to fetch credentials securely:</p>
        <ol className="list-decimal pl-6 space-y-2 text-black">
          <li>Register your project with credentials in the Project Registry</li>
          <li>Use the provided API key in the X-API-Key header</li>
          <li>The server fetches and validates your credentials automatically</li>
          <li>Enhanced context operations are executed with proper authorization</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-black">Features</h2>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li>🎯 Automatic agent selection based on query type</li>
          <li>📝 Template loading from VISHKAR repository</li>
          <li>🔧 Project-specific rules and configurations</li>
          <li>💾 Vercel Blob storage for scalable file access</li>
          <li>⚡ Vercel KV caching for fast responses</li>
          <li>🔒 Secure authentication via Project Registry</li>
          <li>🚀 Serverless deployment on Vercel</li>
        </ul>
      </section>

      <footer className="mt-12 pt-8 border-t border-gray-300 text-center text-sm text-gray-700">
        <p>Enhanced Context MCP Server v2.0.0 - Part of the Prometheus MCP Ecosystem</p>
      </footer>
    </div>
  );
}
