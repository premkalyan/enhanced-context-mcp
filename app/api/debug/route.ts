/**
 * Debug endpoint to check storage adapter and file system on Vercel
 */

import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '../../../lib/services/ServiceFactory';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function GET(request: NextRequest) {
  try {
    const debugInfo: any = {
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isVercel: process.env.VERCEL === '1',
        useVercelBlob: process.env.USE_VERCEL_BLOB,
        cwd: process.cwd(),
        homedir: os.homedir(),
      },
      paths: {},
      fileSystem: {},
      agentService: {},
    };

    // Check if wama directory exists
    const wamaPath = path.join(process.cwd(), 'wama');
    debugInfo.paths.wama = wamaPath;

    try {
      const wamaStats = await fs.stat(wamaPath);
      debugInfo.fileSystem.wamaExists = true;
      debugInfo.fileSystem.wamaIsDirectory = wamaStats.isDirectory();
    } catch (error) {
      debugInfo.fileSystem.wamaExists = false;
      debugInfo.fileSystem.wamaError = (error as Error).message;
    }

    // Check agents directory
    const agentsPath = path.join(process.cwd(), 'wama', 'agents');
    debugInfo.paths.agents = agentsPath;

    try {
      const agentFiles = await fs.readdir(agentsPath);
      debugInfo.fileSystem.agentsCount = agentFiles.filter(f => f.endsWith('.md')).length;
      debugInfo.fileSystem.agentsSample = agentFiles.slice(0, 5);
    } catch (error) {
      debugInfo.fileSystem.agentsError = (error as Error).message;
    }

    // Check domain-agents directory
    const domainAgentsPath = path.join(process.cwd(), 'wama', 'domain-agents');
    debugInfo.paths.domainAgents = domainAgentsPath;

    try {
      const domainAgentFiles = await fs.readdir(domainAgentsPath);
      debugInfo.fileSystem.domainAgentsCount = domainAgentFiles.filter(f => f.endsWith('.md')).length;
      debugInfo.fileSystem.domainAgentsList = domainAgentFiles.filter(f => f.endsWith('.md'));
    } catch (error) {
      debugInfo.fileSystem.domainAgentsError = (error as Error).message;
    }

    // Test AgentService
    try {
      const agentService = ServiceFactory.createAgentService();

      // Try listing all agents
      const allAgents = await agentService.listVishkarAgents('all');
      debugInfo.agentService.allAgentsCount = allAgents.length;
      debugInfo.agentService.allAgentsSample = allAgents.slice(0, 5).map(a => ({
        id: a.id,
        name: a.name,
        type: a.type
      }));

      // Try listing domain agents
      const domainAgents = await agentService.listVishkarAgents('domain_expert');
      debugInfo.agentService.domainAgentsCount = domainAgents.length;
      debugInfo.agentService.domainAgents = domainAgents.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        description: a.description?.substring(0, 100)
      }));

      // Try listing technical agents
      const technicalAgents = await agentService.listVishkarAgents('technical');
      debugInfo.agentService.technicalAgentsCount = technicalAgents.length;
      debugInfo.agentService.technicalAgentsSample = technicalAgents.slice(0, 3).map(a => a.id);

    } catch (error) {
      debugInfo.agentService.error = (error as Error).message;
      debugInfo.agentService.stack = (error as Error).stack;
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      debug: debugInfo
    });

  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        stack: err.stack
      },
      { status: 500 }
    );
  }
}
