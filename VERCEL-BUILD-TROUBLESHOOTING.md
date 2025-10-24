# Vercel Build Troubleshooting Guide

## Issue: Module Resolution Errors on Vercel

### Error Message
```
Module not found: Can't resolve '@/lib/services/ServiceFactory'
Module not found: Can't resolve '@/lib/config/configLoader'
```

### Potential Causes & Solutions

#### 1. ✅ Webpack Configuration (FIXED - Commit b7b9f51)
**Solution**: Updated `next.config.mjs` with explicit extension aliases
```js
config.resolve.extensionAlias = {
  '.js': ['.js', '.ts'],
  '.jsx': ['.jsx', '.tsx']
};
```

#### 2. Clear Vercel Build Cache
If the build still fails, try clearing Vercel's build cache:

**Via Vercel Dashboard:**
1. Go to project settings
2. Navigate to "General" tab
3. Scroll to "Build & Development Settings"
4. Click "Clear Build Cache"
5. Trigger a new deployment

**Via Vercel CLI:**
```bash
vercel --force
```

#### 3. Check Vercel Environment Variables
Ensure these are set in Vercel Dashboard:
- `PROJECT_REGISTRY_URL`: https://project-registry-henna.vercel.app
- `NODE_ENV`: production
- `USE_VERCEL_BLOB`: (optional, set to `true` if using Vercel Blob)

#### 4. Verify Node.js Version
If issue persists, specify Node.js version in `package.json`:
```json
{
  "engines": {
    "node": ">=18.17.0"
  }
}
```

#### 5. Check File Casing (Linux vs macOS)
Vercel uses Linux (case-sensitive). Ensure imports match exact file names:
- ✅ `import ConfigLoader from '@/lib/config/configLoader'` → file: `configLoader.ts`
- ❌ `import ConfigLoader from '@/lib/config/ConfigLoader'` → file: `configLoader.ts`

#### 6. Verify tsconfig.json Paths
Ensure path aliases are properly configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

#### 7. Check next.config.mjs Location
File must be at project root (same level as `package.json`)

#### 8. Verify All Files Are Committed
```bash
git ls-files | grep -E "(next.config|tsconfig.json|lib/|app/)"
```

### Build Verification Commands

**Local Build Test:**
```bash
# Clean build
rm -rf .next
npm run build

# Should succeed without errors
```

**Check Module Resolution:**
```bash
# Verify imports resolve correctly
grep -r "import.*@/" app/ lib/ --include="*.ts" --include="*.tsx"
```

### Expected Build Output
✅ Successful build should show:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages
✓ Finalizing page optimization
```

### If All Else Fails

1. **Redeploy from scratch:**
   - Delete Vercel project
   - Create new project from GitHub repo
   - Re-add environment variables
   - Deploy

2. **Contact Vercel Support:**
   - Provide build logs
   - Mention Next.js version: 14.2.33
   - Include `next.config.mjs` configuration

### Recent Fixes Applied
- ✅ Commit cf50389: Added initial `next.config.mjs`
- ✅ Commit b7b9f51: Improved webpack extensionAlias configuration
- ✅ Phase 1: Enhanced context system (fe7c56f) - No structural changes

### Build Status Check
Monitor build at: https://vercel.com/[your-username]/enhanced-context-mcp

### Logs Location
- Vercel Dashboard → Deployments → [Latest] → Build Logs
- Look for webpack errors or module resolution issues
