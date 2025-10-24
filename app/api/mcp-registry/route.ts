/**
 * MCP Registry Endpoint
 * Returns list of all available MCP servers for Vishkar to discover
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the registry JSON file
    const registryPath = path.join(process.cwd(), 'public', 'mcp-registry.json');
    const registryContent = fs.readFileSync(registryPath, 'utf-8');
    const registry = JSON.parse(registryContent);

    return NextResponse.json(registry);
  } catch (error) {
    const err = error as Error;
    console.error('Error loading MCP registry:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to load MCP registry' },
      { status: 500 }
    );
  }
}
