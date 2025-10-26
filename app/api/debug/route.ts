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
      debugInfo.agentService.created = true;

      // Test storage adapter directly
      const storageAdapter = ServiceFactory.getStorageAdapter();
      debugInfo.agentService.storageAdapterType = storageAdapter.constructor.name;

      // Check what paths the adapter is trying
      const primaryDir = path.join(os.homedir(), '.wama');
      const fallbackDir = path.join(process.cwd(), 'wama');
      debugInfo.agentService.adapterPaths = {
        primary: primaryDir,
        fallback: fallbackDir,
        primaryAgents: path.join(primaryDir, 'agents'),
        fallbackAgents: path.join(fallbackDir, 'agents'),
        primaryDomainAgents: path.join(primaryDir, 'domain-agents'),
        fallbackDomainAgents: path.join(fallbackDir, 'domain-agents')
      };

      // Check if directories exist
      try {
        await fs.access(debugInfo.agentService.adapterPaths.primaryAgents);
        debugInfo.agentService.primaryAgentsExists = true;
      } catch {
        debugInfo.agentService.primaryAgentsExists = false;
      }

      try {
        await fs.access(debugInfo.agentService.adapterPaths.fallbackAgents);
        debugInfo.agentService.fallbackAgentsExists = true;
      } catch {
        debugInfo.agentService.fallbackAgentsExists = false;
      }

      try {
        const agentsList = await storageAdapter.list('agents');
        debugInfo.agentService.directListAgents = agentsList.length;
        debugInfo.agentService.directListAgentsSample = agentsList.slice(0, 3);
      } catch (err) {
        debugInfo.agentService.directListAgentsError = (err as Error).message;
      }

      try {
        const domainAgentsList = await storageAdapter.list('domain-agents');
        debugInfo.agentService.directListDomainAgents = domainAgentsList.length;
        debugInfo.agentService.directListDomainAgentsSample = domainAgentsList.slice(0, 3);
      } catch (err) {
        debugInfo.agentService.directListDomainAgentsError = (err as Error).message;
      }

      // Try listing all agents
      try {
        const allAgents = await agentService.listVishkarAgents('all');
        debugInfo.agentService.allAgentsCount = allAgents.length;
        debugInfo.agentService.allAgentsSample = allAgents.slice(0, 5).map(a => ({
          id: a.id,
          name: a.name,
          type: a.type
        }));
      } catch (err) {
        debugInfo.agentService.allAgentsError = (err as Error).message;
      }

      // Try listing domain agents
      try {
        const domainAgents = await agentService.listVishkarAgents('domain_expert');
        debugInfo.agentService.domainAgentsCount = domainAgents.length;
        debugInfo.agentService.domainAgents = domainAgents.map(a => ({
          id: a.id,
          name: a.name,
          type: a.type,
          description: a.description?.substring(0, 100)
        }));
      } catch (err) {
        debugInfo.agentService.domainAgentsError = (err as Error).message;
      }

      // Try listing technical agents
      try {
        const technicalAgents = await agentService.listVishkarAgents('technical');
        debugInfo.agentService.technicalAgentsCount = technicalAgents.length;
        debugInfo.agentService.technicalAgentsSample = technicalAgents.slice(0, 3).map(a => a.id);
      } catch (err) {
        debugInfo.agentService.technicalAgentsError = (err as Error).message;
      }

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
