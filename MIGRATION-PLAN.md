# Enhanced Context MCP - Full Refactoring & Migration Plan

**Date**: October 23, 2025
**Status**: Planning → Implementation
**Timeline**: 2-3 weeks (10-15 working days)
**Target**: Production-ready Vercel deployment with ALL features preserved

---

## Executive Summary

This plan details the complete refactoring and migration of the Enhanced Context MCP Server from a monolithic Node.js application to a modern, serverless Next.js application on Vercel. The migration preserves ALL functionality including dynamic agent updates while addressing critical security and architectural issues.

**Why Full Refactoring?**
- This is the "nerve center" for the entire VISHKAR agent ecosystem
- Provides critical context, agent selection, and templates for AI workflows
- Must be reliable, scalable, and maintainable
- Current architecture has 7 security vulnerabilities and architectural blockers for serverless

---

## Current State Analysis

### Codebase Statistics
- **Total Lines**: 2,775 lines
- **Main Server**: 1,227 lines (god class)
- **Agent Loader**: 715 lines (well-designed)
- **HTTP Server**: 243 lines (requires refactoring)
- **Test Suite**: 451 lines (comprehensive)

### Critical Issues Identified
1. 🔴 **God Class Anti-Pattern**: Single 1,227-line class
2. 🔴 **No Authentication**: CVSS 9.8 - Anyone can access
3. 🔴 **No Rate Limiting**: CVSS 7.5 - DoS vulnerability
4. 🔴 **Synchronous File I/O**: 31 blocking calls
5. 🔴 **Filesystem Dependencies**: Reads from ~/.wama/ and ~/.claude/
6. 🟡 **No TypeScript**: Hard to maintain
7. 🟡 **Hardcoded Configuration**: Mappings in code

### What's Working Well
- ✅ Excellent security fixes (path traversal, YAML injection)
- ✅ Comprehensive test suite (75% coverage)
- ✅ Well-designed agent-loader module
- ✅ Clear documentation

---

## New Architecture Design

### Layered Architecture (Clean Architecture Pattern)

```
┌─────────────────────────────────────────────────────────┐
│  Presentation Layer (Next.js API Routes)                │
│  - /api/mcp/route.ts (main MCP endpoint)                │
│  - /api/load-context/route.ts                           │
│  - /api/agents/route.ts                                 │
│  - /api/agents/[id]/route.ts                            │
│  - /api/health/route.ts                                 │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  Application Layer (Business Logic)                     │
│  - ContextLoaderService                                 │
│  - AgentSelectorService                                 │
│  - TemplateManagerService                               │
│  - ServiceValidatorService                              │
│  - AgentUpdateService                                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  Domain Layer (Core Entities & Logic)                   │
│  - Context (entity)                                     │
│  - Agent (entity)                                       │
│  - Template (entity)                                    │
│  - QueryType (enum)                                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  Infrastructure Layer (Data Access)                     │
│  - IStorageAdapter (interface)                          │
│  - VercelBlobStorage (implementation)                   │
│  - VercelKVCache (implementation)                       │
│  - FileSystemStorage (for local dev)                    │
└─────────────────────────────────────────────────────────┘
```

### Project Structure

```
enhanced-context-mcp/
├── app/
│   ├── api/
│   │   ├── mcp/
│   │   │   └── route.ts              # Main MCP endpoint (JSON-RPC)
│   │   ├── load-context/
│   │   │   └── route.ts              # Direct context loading
│   │   ├── agents/
│   │   │   ├── route.ts              # List/create agents
│   │   │   └── [id]/
│   │   │       └── route.ts          # Get/update/delete agent
│   │   └── health/
│   │       └── route.ts              # Health check
│   ├── page.tsx                       # Documentation landing page
│   └── layout.tsx
│
├── lib/
│   ├── services/                      # Application Layer
│   │   ├── context-loader.service.ts
│   │   ├── agent-selector.service.ts
│   │   ├── template-manager.service.ts
│   │   ├── service-validator.service.ts
│   │   └── agent-update.service.ts
│   │
│   ├── domain/                        # Domain Layer
│   │   ├── entities/
│   │   │   ├── context.entity.ts
│   │   │   ├── agent.entity.ts
│   │   │   └── template.entity.ts
│   │   ├── enums/
│   │   │   └── query-type.enum.ts
│   │   └── interfaces/
│   │       ├── context-loader.interface.ts
│   │       └── storage-adapter.interface.ts
│   │
│   ├── infrastructure/                # Infrastructure Layer
│   │   ├── storage/
│   │   │   ├── storage-adapter.interface.ts
│   │   │   ├── vercel-blob-storage.ts
│   │   │   ├── vercel-kv-cache.ts
│   │   │   └── filesystem-storage.ts
│   │   ├── auth/
│   │   │   ├── api-key-auth.ts
│   │   │   └── project-registry-auth.ts
│   │   └── monitoring/
│   │       ├── logger.ts
│   │       └── metrics.ts
│   │
│   ├── utils/
│   │   ├── validation.utils.ts
│   │   ├── security.utils.ts
│   │   └── file.utils.ts
│   │
│   └── config/
│       ├── context-mappings.config.ts
│       ├── agent-preferences.config.ts
│       └── service-configs.config.ts
│
├── types/
│   ├── mcp.types.ts                   # MCP protocol types
│   ├── context.types.ts
│   ├── agent.types.ts
│   └── api.types.ts
│
├── config/
│   ├── context-mappings.json          # External configuration
│   ├── agent-preferences.json
│   └── service-configs.json
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── domain/
│   │   └── utils/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│       └── workflows/
│
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── scripts/
│   ├── migrate-contexts.ts            # Bundle contexts for Vercel
│   ├── migrate-templates.ts           # Bundle templates
│   └── setup-vercel-storage.ts        # Initialize Vercel storage
│
├── .env.example
├── .env.local
├── vercel.json
├── tsconfig.json
├── package.json
└── README.md
```

---

## Phase-by-Phase Implementation

### Phase 1: Project Setup & TypeScript Foundation (Days 1-2)

**Objectives**:
- Set up Next.js 14 project with TypeScript
- Configure ESLint, Prettier, Husky
- Define core types and interfaces
- Extract configuration to JSON files

**Tasks**:
1. Initialize Next.js project with TypeScript
2. Install dependencies (axios, js-yaml, @vercel/blob, @vercel/kv)
3. Create type definitions:
   - `types/mcp.types.ts` - MCP protocol types
   - `types/context.types.ts` - Context and query types
   - `types/agent.types.ts` - Agent types
   - `types/api.types.ts` - API request/response types
4. Extract configuration files:
   - `config/context-mappings.json`
   - `config/agent-preferences.json`
   - `config/service-configs.json`
5. Set up testing framework (Jest + Testing Library)

**Deliverables**:
- TypeScript project with strict configuration
- All type definitions
- Configuration files
- Test infrastructure

**Estimated Time**: 2 days

---

### Phase 2: Domain Layer (Days 3-4)

**Objectives**:
- Create core entities and value objects
- Define domain interfaces
- Implement validation logic

**Tasks**:
1. Create entities:
   ```typescript
   // lib/domain/entities/context.entity.ts
   export class Context {
     constructor(
       public readonly name: string,
       public readonly content: string,
       public readonly type: QueryType,
       public readonly metadata: ContextMetadata
     ) {}
   }

   // lib/domain/entities/agent.entity.ts
   export class Agent {
     constructor(
       public readonly id: string,
       public readonly name: string,
       public readonly persona: string,
       public readonly capabilities: string[],
       public readonly approach: string,
       public readonly metadata: AgentMetadata
     ) {}
   }
   ```

2. Create enums:
   ```typescript
   // lib/domain/enums/query-type.enum.ts
   export enum QueryType {
     STORY = 'story',
     TESTING = 'testing',
     SECURITY = 'security',
     ARCHITECTURE = 'architecture',
     // ... all 11 types
   }
   ```

3. Create domain interfaces:
   ```typescript
   // lib/domain/interfaces/context-loader.interface.ts
   export interface IContextLoader {
     loadGlobalContexts(queryType: QueryType): Promise<Context[]>;
     loadTemplates(queryType: QueryType): Promise<Template[]>;
     loadProjectRules(projectPath?: string): Promise<ProjectRules>;
   }
   ```

**Deliverables**:
- All domain entities
- Domain interfaces
- Validation logic
- Unit tests for entities

**Estimated Time**: 2 days

---

### Phase 3: Infrastructure Layer - Storage Abstraction (Days 5-6)

**Objectives**:
- Create storage adapter interface
- Implement Vercel Blob storage
- Implement Vercel KV cache
- Implement filesystem storage (for local dev)

**Tasks**:
1. Define storage interface:
   ```typescript
   // lib/infrastructure/storage/storage-adapter.interface.ts
   export interface IStorageAdapter {
     // Context operations
     readContext(name: string): Promise<string>;
     listContexts(): Promise<string[]>;

     // Template operations
     readTemplate(name: string): Promise<string>;
     listTemplates(): Promise<string[]>;

     // Agent operations
     readAgent(id: string): Promise<string>;
     writeAgent(id: string, content: string): Promise<void>;
     listAgents(): Promise<AgentMetadata[]>;
     deleteAgent(id: string): Promise<void>;

     // Cache operations
     getCache(key: string): Promise<string | null>;
     setCache(key: string, value: string, ttl?: number): Promise<void>;
     clearCache(pattern?: string): Promise<void>;
   }
   ```

2. Implement Vercel Blob Storage:
   ```typescript
   // lib/infrastructure/storage/vercel-blob-storage.ts
   import { put, get, list, del } from '@vercel/blob';

   export class VercelBlobStorage implements IStorageAdapter {
     private baseUrl: string;

     async readContext(name: string): Promise<string> {
       const blob = await get(`contexts/${name}.mdc`);
       return await blob.text();
     }

     async writeAgent(id: string, content: string): Promise<void> {
       await put(`agents/${id}.md`, content, {
         access: 'public',
         addRandomSuffix: false
       });
     }
     // ... implement all methods
   }
   ```

3. Implement Vercel KV Cache:
   ```typescript
   // lib/infrastructure/storage/vercel-kv-cache.ts
   import { kv } from '@vercel/kv';

   export class VercelKVCache {
     async get(key: string): Promise<string | null> {
       return await kv.get(key);
     }

     async set(key: string, value: string, ttl: number = 300): Promise<void> {
       await kv.set(key, value, { ex: ttl });
     }
   }
   ```

4. Implement FileSystem Storage (local dev):
   ```typescript
   // lib/infrastructure/storage/filesystem-storage.ts
   import { promises as fs } from 'fs';
   import path from 'path';

   export class FileSystemStorage implements IStorageAdapter {
     constructor(private basePath: string) {}

     async readContext(name: string): Promise<string> {
       const filePath = path.join(this.basePath, 'contexts', `${name}.mdc`);
       return await fs.readFile(filePath, 'utf-8');
     }
     // ... all methods using async file I/O
   }
   ```

**Deliverables**:
- Storage adapter interface
- 3 storage implementations (Vercel Blob, Vercel KV, FileSystem)
- Integration tests for each implementation
- Migration scripts for bundling contexts/templates

**Estimated Time**: 2 days

---

### Phase 4: Application Layer - Business Logic Services (Days 7-9)

**Objectives**:
- Extract business logic from god class into services
- Make all services pure and testable
- Implement with dependency injection

**Tasks**:
1. Context Loader Service:
   ```typescript
   // lib/services/context-loader.service.ts
   export class ContextLoaderService {
     constructor(
       private storage: IStorageAdapter,
       private config: ContextMappingsConfig
     ) {}

     async loadEnhancedContext(args: LoadContextArgs): Promise<EnhancedContext> {
       const { query_type, project_path } = args;

       // Validate input
       this.validateQueryType(query_type);

       // Load contexts based on query type
       const mapping = this.config.getMappingForQueryType(query_type);
       const contexts = await this.loadGlobalContexts(mapping.contexts);
       const templates = await this.loadTemplates(mapping.templates);
       const projectRules = await this.loadProjectRules(project_path);

       return {
         contexts,
         templates,
         projectRules,
         agent: await this.agentSelector.selectAgent(query_type)
       };
     }

     private async loadGlobalContexts(names: string[]): Promise<Context[]> {
       // Check cache first
       const cacheKey = `contexts:${names.join(',')}`;
       const cached = await this.storage.getCache(cacheKey);
       if (cached) return JSON.parse(cached);

       // Load from storage
       const contexts = await Promise.all(
         names.map(name => this.storage.readContext(name))
       );

       // Cache for 5 minutes
       await this.storage.setCache(cacheKey, JSON.stringify(contexts), 300);

       return contexts.map(content => new Context(content));
     }
   }
   ```

2. Agent Selector Service:
   ```typescript
   // lib/services/agent-selector.service.ts
   export class AgentSelectorService {
     constructor(
       private storage: IStorageAdapter,
       private config: AgentPreferencesConfig
     ) {}

     async selectAgent(queryType: QueryType): Promise<Agent | null> {
       const preference = this.config.getPreferenceForQueryType(queryType);
       if (!preference) return null;

       const agentContent = await this.storage.readAgent(preference.agentId);
       return this.parseAgent(agentContent);
     }

     async listAvailableAgents(): Promise<AgentMetadata[]> {
       // Check cache
       const cacheKey = 'agents:list';
       const cached = await this.storage.getCache(cacheKey);
       if (cached) return JSON.parse(cached);

       const agents = await this.storage.listAgents();
       await this.storage.setCache(cacheKey, JSON.stringify(agents), 300);

       return agents;
     }
   }
   ```

3. Template Manager Service:
   ```typescript
   // lib/services/template-manager.service.ts
   export class TemplateManagerService {
     constructor(private storage: IStorageAdapter) {}

     async loadTemplates(names: string[]): Promise<Template[]> {
       return await Promise.all(
         names.map(async name => {
           const content = await this.storage.readTemplate(name);
           return new Template(name, content);
         })
       );
     }
   }
   ```

4. Agent Update Service:
   ```typescript
   // lib/services/agent-update.service.ts
   export class AgentUpdateService {
     constructor(private storage: IStorageAdapter) {}

     async updateAgent(args: UpdateAgentArgs): Promise<Agent> {
       const { agent_name, operation, agent_data } = args;

       // Validate
       this.validateAgentName(agent_name);
       this.validateOperation(operation);

       // Load current agent
       const current = await this.storage.readAgent(agent_name);

       // Perform update based on operation
       const updated = this.performUpdate(current, operation, agent_data);

       // Save back
       await this.storage.writeAgent(agent_name, updated);

       // Invalidate cache
       await this.storage.clearCache('agents:*');

       return this.parseAgent(updated);
     }
   }
   ```

5. Service Validator Service:
   ```typescript
   // lib/services/service-validator.service.ts
   export class ServiceValidatorService {
     async checkServiceConfigurations(projectPath?: string): Promise<ServiceStatus[]> {
       const configs = this.getServiceConfigs();

       return await Promise.all(
         configs.map(async config => {
           const status = await this.checkService(config, projectPath);
           return {
             name: config.name,
             status: status ? 'configured' : 'missing',
             envVar: config.envVar
           };
         })
       );
     }

     private async checkService(config: ServiceConfig, projectPath?: string): Promise<boolean> {
       if (projectPath) {
         // Check .env file in project
         const envPath = path.join(projectPath, '.env');
         const envContent = await fs.readFile(envPath, 'utf-8').catch(() => '');
         return envContent.includes(config.envVar);
       }

       // Check process.env
       return !!process.env[config.envVar];
     }
   }
   ```

**Deliverables**:
- 5 service classes with clean interfaces
- Dependency injection pattern
- Comprehensive unit tests (>90% coverage)
- Integration tests

**Estimated Time**: 3 days

---

### Phase 5: Authentication & Security (Day 10)

**Objectives**:
- Implement API key authentication
- Add rate limiting
- Add security headers
- Implement structured logging

**Tasks**:
1. API Key Authentication:
   ```typescript
   // lib/infrastructure/auth/api-key-auth.ts
   import { timingSafeEqual } from 'crypto';

   export async function validateApiKey(apiKey: string): Promise<boolean> {
     const validKey = process.env.API_KEY;
     if (!validKey || !apiKey) return false;

     // Constant-time comparison to prevent timing attacks
     const validKeyBuffer = Buffer.from(validKey);
     const providedKeyBuffer = Buffer.from(apiKey);

     if (validKeyBuffer.length !== providedKeyBuffer.length) return false;

     return timingSafeEqual(validKeyBuffer, providedKeyBuffer);
   }

   // Middleware
   export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
     const apiKey = request.headers.get('X-API-Key');

     if (!apiKey) {
       return NextResponse.json({ error: 'API key required' }, { status: 401 });
     }

     const isValid = await validateApiKey(apiKey);
     if (!isValid) {
       return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
     }

     return null; // Allow request to proceed
   }
   ```

2. Rate Limiting:
   ```typescript
   // lib/infrastructure/middleware/rate-limit.ts
   import { kv } from '@vercel/kv';

   export async function rateLimitMiddleware(
     request: NextRequest,
     limits: { reads: number; writes: number; window: number }
   ): Promise<NextResponse | null> {
     const apiKey = request.headers.get('X-API-Key') || 'anonymous';
     const isWrite = request.method !== 'GET' && request.method !== 'HEAD';

     const key = `ratelimit:${apiKey}:${isWrite ? 'write' : 'read'}`;
     const limit = isWrite ? limits.writes : limits.reads;

     const current = await kv.incr(key);

     if (current === 1) {
       await kv.expire(key, limits.window);
     }

     if (current > limit) {
       return NextResponse.json(
         { error: 'Rate limit exceeded' },
         {
           status: 429,
           headers: {
             'X-RateLimit-Limit': limit.toString(),
             'X-RateLimit-Remaining': '0',
             'Retry-After': limits.window.toString()
           }
         }
       );
     }

     return null;
   }
   ```

3. Structured Logging:
   ```typescript
   // lib/infrastructure/monitoring/logger.ts
   import pino from 'pino';

   export const logger = pino({
     level: process.env.LOG_LEVEL || 'info',
     formatters: {
       level: (label) => {
         return { level: label };
       },
     },
   });

   export function logSecurityEvent(event: SecurityEvent) {
     logger.warn({
       type: 'security',
       event: event.type,
       details: event.details,
       timestamp: new Date().toISOString()
     });
   }
   ```

**Deliverables**:
- API key authentication with timing-safe comparison
- Distributed rate limiting with Vercel KV
- Security middleware
- Structured logging with Pino

**Estimated Time**: 1 day

---

### Phase 6: API Routes Implementation (Days 11-12)

**Objectives**:
- Create all Next.js API routes
- Implement JSON-RPC protocol for MCP
- Add proper error handling
- Implement request/response validation

**Tasks**:
1. Main MCP Endpoint:
   ```typescript
   // app/api/mcp/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { authMiddleware, rateLimitMiddleware } from '@/lib/infrastructure/middleware';
   import { ContextLoaderService } from '@/lib/services/context-loader.service';

   export async function POST(request: NextRequest) {
     // Apply middleware
     const authError = await authMiddleware(request);
     if (authError) return authError;

     const rateLimitError = await rateLimitMiddleware(request, {
       reads: 100,
       writes: 10,
       window: 900 // 15 minutes
     });
     if (rateLimitError) return rateLimitError;

     try {
       const body = await request.json();

       // Validate JSON-RPC format
       if (body.jsonrpc !== '2.0' || !body.method) {
         return NextResponse.json({
           jsonrpc: '2.0',
           id: body.id,
           error: { code: -32600, message: 'Invalid Request' }
         }, { status: 400 });
       }

       // Route to appropriate handler
       const result = await handleMCPRequest(body);

       return NextResponse.json({
         jsonrpc: '2.0',
         id: body.id,
         result
       });
     } catch (error) {
       logger.error('MCP request failed', { error });
       return NextResponse.json({
         jsonrpc: '2.0',
         id: body?.id,
         error: {
           code: -32603,
           message: 'Internal error',
           data: process.env.NODE_ENV === 'production' ? undefined : error.message
         }
       }, { status: 500 });
     }
   }
   ```

2. Direct Context Loading:
   ```typescript
   // app/api/load-context/route.ts
   export async function POST(request: NextRequest) {
     const authError = await authMiddleware(request);
     if (authError) return authError;

     const { query_type, project_path } = await request.json();

     const contextLoader = new ContextLoaderService(storage, config);
     const result = await contextLoader.loadEnhancedContext({
       query_type,
       project_path
     });

     return NextResponse.json({ success: true, data: result });
   }
   ```

3. Agent Management:
   ```typescript
   // app/api/agents/route.ts
   export async function GET(request: NextRequest) {
     // List all agents
     const agentSelector = new AgentSelectorService(storage, config);
     const agents = await agentSelector.listAvailableAgents();
     return NextResponse.json({ success: true, data: agents });
   }

   // app/api/agents/[id]/route.ts
   export async function PUT(
     request: NextRequest,
     { params }: { params: { id: string } }
   ) {
     const authError = await authMiddleware(request);
     if (authError) return authError;

     const body = await request.json();
     const agentUpdate = new AgentUpdateService(storage);
     const updated = await agentUpdate.updateAgent({
       agent_name: params.id,
       operation: body.operation,
       agent_data: body.data
     });

     return NextResponse.json({ success: true, data: updated });
   }
   ```

**Deliverables**:
- 5 API route handlers
- JSON-RPC protocol implementation
- Error handling middleware
- Request/response validation

**Estimated Time**: 2 days

---

### Phase 7: Testing & Documentation (Days 13-14)

**Objectives**:
- Write comprehensive tests
- Create API documentation
- Write deployment guides
- Performance testing

**Tasks**:
1. Unit Tests (Jest):
   - Test all service classes
   - Test domain entities
   - Test utility functions
   - Target: >90% coverage

2. Integration Tests:
   - Test API routes end-to-end
   - Test storage adapters
   - Test authentication flow
   - Test rate limiting

3. E2E Tests:
   - Complete user workflows
   - Agent update workflow
   - Context loading scenarios

4. Documentation:
   - API reference with examples
   - Architecture documentation
   - Deployment guide for Vercel
   - Migration guide from old version

5. Performance Tests:
   - Load testing (100+ concurrent requests)
   - Cold start optimization
   - Cache hit rate analysis
   - Response time benchmarks

**Deliverables**:
- Test suite with >85% coverage
- Complete API documentation
- Deployment guides
- Performance benchmarks

**Estimated Time**: 2 days

---

### Phase 8: Deployment & Validation (Day 15)

**Objectives**:
- Deploy to Vercel
- Validate all functionality
- Performance monitoring
- Production readiness check

**Tasks**:
1. Vercel Configuration:
   ```json
   // vercel.json
   {
     "version": 2,
     "framework": "nextjs",
     "buildCommand": "npm run build",
     "functions": {
       "app/api/**/*.ts": {
         "maxDuration": 30,
         "memory": 1024
       }
     },
     "env": {
       "PROJECT_REGISTRY_URL": "@project-registry-url",
       "API_KEY": "@enhanced-context-api-key",
       "VERCEL_BLOB_READ_WRITE_TOKEN": "@blob-token"
     }
   }
   ```

2. Bundle Contexts & Templates:
   ```bash
   npm run bundle:contexts    # Copy to Vercel Blob
   npm run bundle:templates   # Copy to Vercel Blob
   npm run bundle:agents      # Copy initial agents
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

4. Validation Tests:
   - Health check
   - Context loading for all 11 query types
   - Agent selection
   - Agent update
   - Rate limiting
   - Authentication

5. Monitoring Setup:
   - Set up Vercel Analytics
   - Configure error tracking (Sentry)
   - Set up logging aggregation

**Deliverables**:
- Production deployment on Vercel
- All functionality validated
- Monitoring configured
- Production-ready status

**Estimated Time**: 1 day

---

## Security Enhancements

### Critical Security Fixes

1. **Authentication** (CVSS 9.8 → 0.0)
   - API key authentication required for all endpoints
   - Timing-safe comparison to prevent timing attacks
   - Integration with Project Registry for key validation

2. **Rate Limiting** (CVSS 7.5 → 0.0)
   - Distributed rate limiting with Vercel KV
   - Different limits for read (100/15min) vs write (10/15min) operations
   - Per-API-key tracking

3. **SSRF Protection** (CVSS 6.5 → 2.0)
   - URL validation for browser tools check
   - Whitelist allowed domains
   - Timeout enforcement

4. **Input Validation** (Enhanced)
   - Schema validation with Zod
   - Type checking at compile time (TypeScript)
   - Whitelist-based validation for all enums

5. **Error Handling** (CVSS 4.3 → 1.0)
   - Structured error responses
   - No sensitive information in production errors
   - Comprehensive server-side logging

6. **ReDoS Protection** (CVSS 3.7 → 0.0)
   - Replace regex patterns with string methods where possible
   - Timeout on regex operations
   - Safe regex patterns only

7. **Secrets Management** (CVSS 5.9 → 0.0)
   - All secrets in Vercel environment variables
   - No secrets in code or version control
   - Use Vercel secret management

---

## Migration Strategy for Existing Data

### Contexts & Templates

**Current**: Stored in `~/.wama/contexts/` and `~/.wama/templates/`

**New**: Vercel Blob Storage

**Migration Script**:
```typescript
// scripts/migrate-contexts.ts
import { put } from '@vercel/blob';
import * as fs from 'fs';
import * as path from 'path';

async function migrateContexts() {
  const contextDir = path.join(os.homedir(), '.wama', 'contexts');
  const files = await fs.promises.readdir(contextDir);

  for (const file of files) {
    if (file.endsWith('.mdc')) {
      const content = await fs.promises.readFile(
        path.join(contextDir, file),
        'utf-8'
      );

      await put(`contexts/${file}`, content, {
        access: 'public',
        addRandomSuffix: false
      });

      console.log(`Migrated: ${file}`);
    }
  }
}
```

### Agents

**Current**: Stored in `~/.claude/agents/`

**New**: Vercel Blob Storage (dynamic) + Bundled defaults

**Strategy**:
1. Bundle default agents at build time (in `/public/agents/`)
2. User-created agents stored in Vercel Blob
3. Merge both sources at runtime

---

## Testing Strategy

### Unit Tests (Target: 90%+ Coverage)
- All service classes
- All domain entities
- All utility functions
- Storage adapters (with mocks)

### Integration Tests
- API routes with real storage adapters
- Authentication flow
- Rate limiting behavior
- Cache invalidation

### E2E Tests
- Complete workflows:
  - Story context loading → agent selection
  - Agent update → cache invalidation → reload
  - Multiple query types in sequence

### Performance Tests
- Load testing: 100 concurrent requests
- Cold start: <2 seconds
- Warm request: <200ms
- Cache hit rate: >80%

---

## Rollback Plan

If issues arise in production:

1. **Immediate Rollback**:
   ```bash
   vercel rollback
   ```

2. **Fallback to Docker**:
   - Keep old Docker deployment running
   - Switch DNS/routing back to Docker
   - Investigate issues offline

3. **Gradual Migration**:
   - Deploy read-only version first
   - Validate for 1 week
   - Then enable agent updates

---

## Success Metrics

### Performance
- [ ] Response time <200ms (p50)
- [ ] Response time <500ms (p95)
- [ ] Cold start <2 seconds
- [ ] Cache hit rate >80%
- [ ] 0 timeout errors

### Security
- [ ] 0 critical vulnerabilities
- [ ] 0 high vulnerabilities
- [ ] Authentication enforced on all endpoints
- [ ] Rate limiting active
- [ ] All secrets in environment variables

### Functionality
- [ ] All 11 query types work
- [ ] Agent selection works for all types
- [ ] Agent updates persist correctly
- [ ] Cache invalidation works
- [ ] Browser tools detection works

### Reliability
- [ ] 99.9% uptime
- [ ] <0.1% error rate
- [ ] All tests passing
- [ ] No data loss in agent updates

---

## Timeline Summary

| Phase | Days | Status |
|-------|------|--------|
| 1. Project Setup | 2 | 🟡 Starting |
| 2. Domain Layer | 2 | ⚪ Pending |
| 3. Infrastructure Layer | 2 | ⚪ Pending |
| 4. Application Layer | 3 | ⚪ Pending |
| 5. Security | 1 | ⚪ Pending |
| 6. API Routes | 2 | ⚪ Pending |
| 7. Testing | 2 | ⚪ Pending |
| 8. Deployment | 1 | ⚪ Pending |
| **TOTAL** | **15 days** | **2-3 weeks** |

---

## Next Steps

1. ✅ Review and approve this plan
2. 🟡 Start Phase 1: Project setup
3. ⚪ Daily progress updates
4. ⚪ Weekly milestone reviews
5. ⚪ Production deployment

---

**Document Version**: 1.0
**Last Updated**: October 23, 2025
**Status**: Approved for Implementation
**Estimated Completion**: November 7, 2025
