# Enhanced Context MCP Server v2.0.0

> Serverless Enhanced Context MCP Server with Project Registry Integration

## Overview

The Enhanced Context MCP Server provides intelligent context loading for AI agents, automatically selecting appropriate templates, contexts, and agent profiles based on query type. This is a complete TypeScript rewrite of the original server, designed for serverless deployment on Vercel.

## Features

- 🎯 **Automatic Agent Selection** - Intelligently selects the right VISHKAR agent based on query type
- 📝 **Template Loading** - Loads appropriate templates from VISHKAR repository
- 🔧 **Project-Specific Rules** - Supports project-specific configuration and rules
- 💾 **Vercel Blob Storage** - Scalable file storage for contexts and templates
- ⚡ **Vercel KV Caching** - Fast response times with Redis-backed caching
- 🔒 **Secure Authentication** - Integration with Project Registry for credential management
- 🚀 **Serverless Architecture** - Fully serverless deployment on Vercel

## Architecture

### Clean Architecture Layers

```
app/api/              # Presentation Layer (API Routes)
lib/
  ├── services/       # Application Layer (Business Logic)
  ├── domain/         # Domain Layer (Entities)
  ├── infrastructure/ # Infrastructure Layer (Storage, Auth, Monitoring)
  ├── utils/          # Utilities (Validation, Security)
  └── config/         # Configuration Management
```

### Storage Abstraction

The server uses a storage adapter pattern that switches between:
- **Development**: File system storage (`~/.wama`)
- **Production**: Vercel Blob storage with KV caching

## Available Tools

### 1. load_enhanced_context
Load global WAMA contexts, templates, and project-specific rules based on query type.

**Query Types:**
- `story` - User story and epic creation
- `testing` - Test planning and strategy
- `security` - Security reviews and audits
- `architecture` - Architecture design and documentation
- `pr-review` - Pull request reviews
- `browser-testing` - Browser automation testing
- `project-planning` - Project planning and management
- `story-breakdown` - Breaking down epics into stories
- `documentation` - Technical documentation
- `flow-diagrams` - Flow and sequence diagrams
- `infrastructure` - Infrastructure as code and cloud architecture

### 2. list_vishkar_agents
List all available VISHKAR agent profiles.

### 3. load_vishkar_agent
Load complete VISHKAR agent profile by ID.

### 4. validate_vishkar_agent_profile
Validate VISHKAR agent profile format and completeness.

### 5. refresh_agent_cache
Clear cached agent profiles and reload from storage.

### 6. update_agent
Update existing agent configurations with learning improvements.

## API Endpoints

### GET /api/health
Health check endpoint.

### POST /api/mcp
Main MCP endpoint for tool calls.

**Request:**
```json
{
  "tool": "load_enhanced_context",
  "arguments": {
    "query_type": "story",
    "project_path": "/optional/path/to/project"
  }
}
```

**Headers:**
```
X-API-Key: pk_your_api_key
Content-Type: application/json
```

### GET /api/mcp
List available tools.

## Development

### Prerequisites

- Node.js 20+
- npm
- Vercel account (for deployment)

### Local Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

The server will be available at http://localhost:3000

### Local Testing

For local development, the server uses the file system storage adapter which reads from `~/.wama`:

```
~/.wama/
├── contexts/      # Context files (.mdc)
├── templates/     # Template files (.md)
└── agents/        # Agent profile files (.md)
```

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Deployment

### Vercel Setup

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

### Environment Variables

Configure in Vercel Dashboard:

- `PROJECT_REGISTRY_URL` - URL of the Project Registry
- `BLOB_READ_WRITE_TOKEN` - Automatically provided by Vercel Blob
- `KV_REST_API_URL` - Automatically provided by Vercel KV
- `KV_REST_API_TOKEN` - Automatically provided by Vercel KV

### Vercel Blob Setup

1. Go to Vercel Dashboard → Your Project → Storage
2. Create a new Blob Store
3. Environment variables are automatically injected

### Vercel KV Setup

1. Go to Vercel Dashboard → Your Project → Storage
2. Create a new KV Store
3. Environment variables are automatically injected

## Integration with Project Registry

This server integrates with the [Project Registry](https://project-registry-henna.vercel.app) for centralized credential management:

1. Register your project in the Project Registry
2. Store any necessary credentials (encrypted with AES-256-GCM)
3. Use the provided API key in the `X-API-Key` header
4. The server validates credentials via the Project Registry

## Security

### Authentication
- API key authentication via `X-API-Key` header
- Integration with Project Registry for validation
- Timing-safe comparison for token validation

### Path Traversal Protection
- All file paths are validated before access
- No access to files outside allowed directories
- Normalized path resolution

### Storage Security
- Vercel Blob: Public read access, authenticated write
- Vercel KV: Encrypted at rest
- No sensitive data in client-side code

## Performance

- **Caching**: Agent profiles cached in Vercel KV (1 hour TTL)
- **Storage**: Vercel Blob with CDN edge caching
- **Cold Start**: < 500ms typical response time
- **Concurrent**: Handles 1000+ concurrent requests

## Migration from v1.0

This is a complete rewrite with:
- TypeScript throughout
- Clean architecture
- Serverless-first design
- Vercel Blob/KV storage
- Improved error handling
- Better testability

## License

MIT

## Support

For issues and feature requests, please use the GitHub issue tracker.
