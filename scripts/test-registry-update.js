#!/usr/bin/env node

/**
 * Test Registry Update API
 *
 * Tests the /api/registry/update endpoint locally or on Vercel
 */

const https = require('https');

// Configuration
const API_URL = process.env.API_URL || 'https://enhanced-context-mcp.vercel.app';
const REGISTRY_UPDATE_TOKEN = process.env.REGISTRY_UPDATE_TOKEN;

if (!REGISTRY_UPDATE_TOKEN) {
  console.error('❌ Error: REGISTRY_UPDATE_TOKEN environment variable is required');
  console.error('Usage: REGISTRY_UPDATE_TOKEN=your_token node scripts/test-registry-update.js');
  process.exit(1);
}

// Sample test payload
const testPayload = {
  serviceKey: 'test-service',
  serviceName: 'Test MCP Service',
  url: 'https://test-mcp.vercel.app',
  description: 'Test service for registry update API validation',
  transport: 'http',
  authentication: {
    type: 'api-key',
    header: 'X-API-Key',
    note: 'Test authentication'
  },
  tools: [
    {
      name: 'test_tool_1',
      description: 'First test tool',
      endpoint: '/api/mcp',
      method: 'POST'
    },
    {
      name: 'test_tool_2',
      description: 'Second test tool',
      endpoint: '/api/mcp',
      method: 'POST'
    }
  ]
};

console.log('🧪 Testing Registry Update API');
console.log('━'.repeat(50));
console.log(`📡 API URL: ${API_URL}/api/registry/update`);
console.log(`🔑 Token: ${REGISTRY_UPDATE_TOKEN.substring(0, 10)}...`);
console.log('');

// Make POST request
const url = new URL('/api/registry/update', API_URL);
const postData = JSON.stringify(testPayload);

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
    console.log(`📊 Response Status: ${res.statusCode}`);
    console.log('');

    try {
      const response = JSON.parse(data);
      console.log('📦 Response Body:');
      console.log(JSON.stringify(response, null, 2));
      console.log('');

      if (res.statusCode === 200 && response.success) {
        console.log('✅ Registry update successful!');
        if (response.commitUrl) {
          console.log(`🔗 Commit URL: ${response.commitUrl}`);
        }
        console.log(`📊 Tools updated: ${response.toolsCount}`);
        console.log(`🕐 Timestamp: ${response.timestamp}`);
      } else {
        console.log('❌ Registry update failed');
        console.log(`Error: ${response.error || 'Unknown error'}`);
        console.log(`Message: ${response.message || 'No message'}`);
      }
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  process.exit(1);
});

// Send the request
req.write(postData);
req.end();
