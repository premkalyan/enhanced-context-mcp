# Vercel Dependency Management

## Important: Vercel Build Behavior

Vercel production builds **ONLY install `dependencies`**, not `devDependencies`. This is different from local development where both are installed.

## Correct Package Placement

### ✅ In `dependencies` (Production Build Required)

All packages needed for **building and running** the application:

**Framework & Runtime:**
- `next`
- `react`
- `react-dom`

**Application Code:**
- `axios`
- `js-yaml`
- `zod`
- `pino` & `pino-pretty`
- `@vercel/blob`
- `@vercel/kv`

**Build-Time Tools (MUST be in dependencies for Vercel):**
- `typescript` - TypeScript compiler
- `postcss` - CSS processing
- `tailwindcss` - CSS framework
- `autoprefixer` - PostCSS plugin

**Type Definitions (MUST be in dependencies for Vercel):**
- `@types/node`
- `@types/react`
- `@types/react-dom`
- `@types/js-yaml`

### ✅ In `devDependencies` (Local Development & Testing Only)

Packages **only** needed for local development, testing, or linting:

**Linting:**
- `eslint`
- `eslint-config-next`

**Testing:**
- `jest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@types/jest`

## Why This Matters

### Local Development
```bash
npm install
# Installs BOTH dependencies AND devDependencies
# Everything works fine
```

### Vercel Production Build
```bash
npm install --production
# Only installs dependencies
# Ignores devDependencies for performance
```

## Common Mistakes

### ❌ WRONG: Build tools in devDependencies
```json
{
  "devDependencies": {
    "typescript": "^5",        // ❌ Build fails on Vercel
    "tailwindcss": "^3.4.1",   // ❌ Build fails on Vercel
    "@types/node": "^20"       // ❌ Build fails on Vercel
  }
}
```

**Result**:
- ✅ Works locally (npm install gets everything)
- ❌ Fails on Vercel ("Cannot find module 'typescript'")

### ✅ CORRECT: Build tools in dependencies
```json
{
  "dependencies": {
    "typescript": "^5",        // ✅ Available during build
    "tailwindcss": "^3.4.1",   // ✅ Available during build
    "@types/node": "^20"       // ✅ Available during build
  },
  "devDependencies": {
    "jest": "^29.7.0",         // ✅ Only for local testing
    "eslint": "^8"             // ✅ Only for local linting
  }
}
```

**Result**:
- ✅ Works locally
- ✅ Works on Vercel

## Rule of Thumb

**Ask yourself: "Is this needed to BUILD or RUN the app in production?"**

- **YES** → `dependencies`
  - Examples: TypeScript compiler, PostCSS, Tailwind, type definitions

- **NO** (only for dev/test) → `devDependencies`
  - Examples: Jest, ESLint, testing libraries

## Our Configuration

### Current `dependencies`:
```json
{
  "axios": "^1.12.2",
  "next": "14.2.33",
  "react": "^18",
  "react-dom": "^18",
  "@vercel/blob": "^0.27.0",
  "@vercel/kv": "^3.0.0",
  "js-yaml": "^4.1.0",
  "pino": "^9.6.0",
  "pino-pretty": "^12.0.0",
  "zod": "^3.23.8",
  "postcss": "^8",
  "tailwindcss": "^3.4.1",
  "autoprefixer": "^10.4.20",
  "typescript": "^5",
  "@types/node": "^20",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  "@types/js-yaml": "^4.0.9"
}
```

### Current `devDependencies`:
```json
{
  "eslint": "^8",
  "eslint-config-next": "14.2.33",
  "jest": "^29.7.0",
  "@testing-library/react": "^16.1.0",
  "@testing-library/jest-dom": "^6.6.3",
  "@types/jest": "^29.5.14"
}
```

## Debugging Dependency Issues

If Vercel build fails with "Cannot find module X":

1. Check if X is in `devDependencies`
2. If YES, move it to `dependencies`
3. Commit and push
4. Vercel will rebuild automatically

## References

- Vercel Docs: https://vercel.com/docs/deployments/configure-a-build#install-command
- Next.js Deployment: https://nextjs.org/docs/deployment
