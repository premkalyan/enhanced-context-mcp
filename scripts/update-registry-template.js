#!/usr/bin/env node

/**
 * MCP Registry Update Script Template
 *
 * Copy this script to your MCP service repository and customize it.
 * Call this script after successful deployment to update the central registry.
 *
 * Usage:
 *   node update-registry.js
 *
 * Environment Variables:
 *   REGISTRY_UPDATE_TOKEN - Required: Token for registry updates
 *   SERVICE_URL - Optional: Override service URL (defaults to Vercel deployment URL)
 */

const https = require('https');

// ============================================================================
// CONFIGURATION - Customize this section for your MCP service
// ============================================================================

const SERVICE_CONFIG = {
  serviceKey: 'my-service',           // Unique key (e.g., 'jira', 'storycrafter')
  serviceName: 'My MCP Service',       // Display name
  description: 'Description of what this service does', // Service description
  transport: 'http',                   // Transport protocol
  authentication: {                    // Authentication requirements
    type: 'api-key',                   // none | api-key | bearer | oauth
    header: 'X-API-Key',               // Header name (if applicable)
    note: 'Use project API key from Project Registry'
  },
  tools: [                             // List of tools
    {
      name: 'tool_name',
      description: 'What this tool does',
      endpoint: '/api/mcp',
      method: 'POST'
    }
    // Add more tools...
  ]
};

// ============================================================================
// Registry Update Logic - Do not modify below this line
// ============================================================================

const REGISTRY_API_URL = 'https://enhanced-context-mcp.vercel.app';
const REGISTRY_UPDATE_TOKEN = process.env.REGISTRY_UPDATE_TOKEN;
const SERVICE_URL = process.env.SERVICE_URL || `https://${SERVICE_CONFIG.serviceKey}.vercel.app`;

// Validate configuration
if (!REGISTRY_UPDATE_TOKEN) {
  console.error('❌ Error: REGISTRY_UPDATE_TOKEN environment variable is required');
  console.error('Set it in your Vercel project settings or CI/CD environment');
  process.exit(1);
}

if (!SERVICE_CONFIG.serviceKey || !SERVICE_CONFIG.serviceName) {
  console.error('❌ Error: SERVICE_CONFIG.serviceKey and serviceName are required');
  process.exit(1);
}

if (!SERVICE_CONFIG.tools || SERVICE_CONFIG.tools.length === 0) {
  console.error('❌ Error: At least one tool must be defined in SERVICE_CONFIG.tools');
  process.exit(1);
}

// Build payload
const payload = {
  serviceKey: SERVICE_CONFIG.serviceKey,
  serviceName: SERVICE_CONFIG.serviceName,
  url: SERVICE_URL,
  description: SERVICE_CONFIG.description,
  transport: SERVICE_CONFIG.transport,
  authentication: SERVICE_CONFIG.authentication,
  tools: SERVICE_CONFIG.tools
};

console.log('📝 Updating MCP Registry');
console.log('━'.repeat(50));
console.log(`Service: ${SERVICE_CONFIG.serviceName}`);
console.log(`URL: ${SERVICE_URL}`);
console.log(`Tools: ${SERVICE_CONFIG.tools.length}`);
console.log('');

// Make POST request to registry update API
const url = new URL('/api/registry/update', REGISTRY_API_URL);
const postData = JSON.stringify(payload);

const options = {
  hostname: url.hostname,
  port: url.port || 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${REGISTRY_UPDATE_TOKEN}`
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);

      if (res.statusCode === 200 && response.success) {
        console.log('✅ Registry updated successfully!');
        console.log('');
        console.log(`📊 Tools registered: ${response.toolsCount}`);
        console.log(`🕐 Timestamp: ${response.timestamp}`);
        if (response.commitUrl) {
          console.log(`🔗 Commit: ${response.commitUrl}`);
        }
        console.log('');
        console.log('🎉 Your service is now discoverable in the MCP registry!');
      } else {
        console.error('❌ Registry update failed');
        console.error(`Status: ${res.statusCode}`);
        console.error(`Error: ${response.error || 'Unknown error'}`);
        console.error(`Message: ${response.message || 'No message'}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
      console.error('Raw response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  process.exit(1);
});

req.write(postData);
req.end();
