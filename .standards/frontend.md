# Frontend Standards (Next.js/React/TypeScript)

**Version:** 1.0.0
**Source:** Enhanced Context MCP

## App Router

```typescript
// src/app/layout.tsx - Root layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// src/app/page.tsx - Home page
export default function HomePage() {
  return <main>Welcome</main>;
}

// Route groups with parentheses
// src/app/(auth)/login/page.tsx
```

## Component Organization

```
src/components/
├── ui/                 # Base UI components
│   ├── Button.tsx
│   └── Input.tsx
├── features/           # Feature-specific components
│   ├── dashboard/
│   └── auth/
└── layouts/            # Layout components
    ├── Header.tsx
    └── Sidebar.tsx
```

## Server vs Client Components

```typescript
// Server Component (default) - no directive needed
async function DashboardPage() {
  const data = await fetchDashboardData();
  return <Dashboard data={data} />;
}

// Client Component - requires 'use client' directive
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## API Client Pattern

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
```

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
