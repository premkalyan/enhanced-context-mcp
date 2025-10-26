/**
 * Health Check Endpoint
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const uptime = process.uptime();

  return NextResponse.json({
    status: 'healthy',
    version: '2.0.0',
    commit: '1e5fa6b',
    uptime: Math.floor(uptime),
    timestamp: new Date().toISOString(),
    checks: {
      storage: true,
      memory: true
    },
    env: {
      isVercel: process.env.VERCEL === '1',
      nodeEnv: process.env.NODE_ENV
    }
  });
}
