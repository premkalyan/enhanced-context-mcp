/**
 * Test Vercel deployment of domain agents
 */

const API_KEY = 'pk_AllWagRUmWiusBjhrboPSbkkc2LDIVsVvaWHL6ThN6Q';
const BASE_URL = 'https://enhanced-context-mcp.vercel.app';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testDebugEndpoint() {
  console.log('🔍 1. Checking Debug Endpoint...\n');

  try {
    const response = await fetch(`${BASE_URL}/api/debug`);
    const data = await response.json();

    if (!data.success) {
      console.error('❌ Debug endpoint failed:', data.error);
      return false;
    }

    console.log('✅ Debug endpoint working');
    console.log('\n📊 Environment:');
    console.log(`  - Node ENV: ${data.debug.environment.nodeEnv}`);
    console.log(`  - Is Vercel: ${data.debug.environment.isVercel}`);
    console.log(`  - CWD: ${data.debug.environment.cwd}`);

    console.log('\n📁 File System:');
    console.log(`  - WAMA exists: ${data.debug.fileSystem.wamaExists}`);
    console.log(`  - Agents count: ${data.debug.fileSystem.agentsCount || 'N/A'}`);
    console.log(`  - Domain agents count: ${data.debug.fileSystem.domainAgentsCount || 0}`);

    if (data.debug.fileSystem.domainAgentsList) {
      console.log(`  - Domain agents files: ${data.debug.fileSystem.domainAgentsList.join(', ')}`);
    }

    console.log('\n🤖 Agent Service:');

    // Show direct storage adapter tests
    if (data.debug.agentService.directListAgents !== undefined) {
      console.log(`  - Direct list agents: ${data.debug.agentService.directListAgents} files`);
    }
    if (data.debug.agentService.directListAgentsError) {
      console.error(`     Error listing agents: ${data.debug.agentService.directListAgentsError}`);
    }

    if (data.debug.agentService.directListDomainAgents !== undefined) {
      console.log(`  - Direct list domain-agents: ${data.debug.agentService.directListDomainAgents} files`);
    }
    if (data.debug.agentService.directListDomainAgentsError) {
      console.error(`     Error listing domain-agents: ${data.debug.agentService.directListDomainAgentsError}`);
    }

    console.log(`  - All agents: ${data.debug.agentService.allAgentsCount || 0}`);
    if (data.debug.agentService.allAgentsError) {
      console.error(`     Error: ${data.debug.agentService.allAgentsError}`);
    }

    console.log(`  - Technical agents: ${data.debug.agentService.technicalAgentsCount || 0}`);
    if (data.debug.agentService.technicalAgentsError) {
      console.error(`     Error: ${data.debug.agentService.technicalAgentsError}`);
    }

    console.log(`  - Domain agents: ${data.debug.agentService.domainAgentsCount || 0}`);
    if (data.debug.agentService.domainAgentsError) {
      console.error(`     Error: ${data.debug.agentService.domainAgentsError}`);
    }

    if (data.debug.agentService.domainAgents && data.debug.agentService.domainAgents.length > 0) {
      console.log('\n✅ Domain agents found:');
      data.debug.agentService.domainAgents.forEach(agent => {
        console.log(`  - ${agent.id} (${agent.name})`);
      });
    } else {
      console.log('\n⚠️  No domain agents found in AgentService');
      if (data.debug.agentService.error) {
        console.error(`     General error: ${data.debug.agentService.error}`);
      }
    }

    return data.debug.agentService.domainAgentsCount > 0;

  } catch (error) {
    console.error('❌ Failed to call debug endpoint:', error.message);
    return false;
  }
}

async function testListAgentsAPI() {
  console.log('\n\n🔍 2. Testing list_vishkar_agents API...\n');

  const tests = [
    { type: 'all', label: 'All agents' },
    { type: 'domain_expert', label: 'Domain expert agents' },
    { type: 'technical', label: 'Technical agents' }
  ];

  for (const test of tests) {
    try {
      console.log(`\n📋 Testing: ${test.label} (type="${test.type}")`);

      const response = await fetch(`${BASE_URL}/api/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          tool: 'list_vishkar_agents',
          arguments: {
            agent_type: test.type
          }
        })
      });

      const data = await response.json();

      if (!data.success) {
        console.error(`  ❌ Failed: ${data.error}`);
        continue;
      }

      const agents = data.result || [];
      console.log(`  ✅ Found ${agents.length} agents`);

      if (agents.length > 0) {
        const sample = agents.slice(0, 3);
        sample.forEach(agent => {
          console.log(`     - ${agent.id} (${agent.type}): ${agent.name}`);
        });
        if (agents.length > 3) {
          console.log(`     ... and ${agents.length - 3} more`);
        }
      }

    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }
}

async function testLoadSpecificAgent() {
  console.log('\n\n🔍 3. Testing load_vishkar_agent for specific domain agent...\n');

  const agentId = 'd-ecommerce-specialist';

  try {
    console.log(`📦 Loading agent: ${agentId}`);

    const response = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        tool: 'load_vishkar_agent',
        arguments: {
          agent_id: agentId
        }
      })
    });

    const data = await response.json();

    if (!data.success) {
      console.error(`❌ Failed to load agent: ${data.error}`);
      return false;
    }

    const agent = data.result;
    console.log(`✅ Successfully loaded agent`);
    console.log(`   ID: ${agent.id}`);
    console.log(`   Name: ${agent.name}`);
    console.log(`   Type: ${agent.type}`);
    console.log(`   Description: ${agent.description?.substring(0, 100)}...`);
    console.log(`   Content size: ${agent.content?.length || 0} characters`);

    return true;

  } catch (error) {
    console.error(`❌ Error loading agent: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing Enhanced Context MCP Deployment\n');
  console.log('=' .repeat(60));

  // Wait a bit for deployment to be ready
  console.log('\n⏳ Waiting 5 seconds for deployment to be ready...\n');
  await sleep(5000);

  const debugSuccess = await testDebugEndpoint();
  await testListAgentsAPI();

  if (debugSuccess) {
    await testLoadSpecificAgent();
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Testing complete!\n');

  if (!debugSuccess) {
    console.log('⚠️  Domain agents not found. Possible issues:');
    console.log('   1. Deployment may still be in progress');
    console.log('   2. Files may not be included in deployment');
    console.log('   3. Storage adapter may not be finding the files');
    console.log('\n💡 Check Vercel deployment logs for more details.');
  }
}

main().catch(console.error);
