# Engineering Standards Specification

**Version:** 1.0.0
**Last Updated:** 2024-12-14
**Category:** Specifications (Enhanced Context MCP)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Distribution Model](#2-distribution-model)
3. [Directory Structure](#3-directory-structure)
4. [Python Backend Standards](#4-python-backend-standards)
5. [FastAPI Standards](#5-fastapi-standards)
6. [Database Standards](#6-database-standards)
7. [Testing Standards](#7-testing-standards)
8. [Frontend Standards](#8-frontend-standards)
9. [Security Standards](#9-security-standards)
10. [Code Quality Standards](#10-code-quality-standards)
11. [Lessons Learned Integration](#11-lessons-learned-integration)
12. [Enhanced Context MCP Integration](#12-enhanced-context-mcp-integration)

---

## 1. Overview

### 1.1 Purpose

This specification defines engineering standards, coding conventions, and best practices for all projects within the VISHKAR ecosystem. These standards ensure:

- **Consistency** - All team members (human and LLM) follow the same patterns
- **Quality** - Established best practices reduce bugs and technical debt
- **Onboarding** - New team members can quickly understand conventions
- **Efficiency** - Code reviews are faster when standards are clear
- **Learning** - Mistakes are captured and prevented from recurring

### 1.2 Scope

These standards apply to:

| Stack Layer | Technologies |
|-------------|--------------|
| Backend | Python 3.12+, FastAPI 0.115+, SQLAlchemy 2.0+ |
| Frontend | Next.js 14/15, React 18+, TypeScript 5+ |
| Database | PostgreSQL 16+, pgvector, Alembic |
| Testing | pytest, pytest-asyncio, Jest, Playwright |
| Infrastructure | Docker, Redis, Kubernetes |

### 1.3 Principles

1. **Explicit over Implicit** - Be clear about intentions
2. **Simple over Complex** - Prefer straightforward solutions
3. **Consistent over Creative** - Follow established patterns
4. **Secure by Default** - Security is not optional
5. **Test Everything** - Untested code is broken code

---

## 2. Distribution Model

### 2.1 Fetch and Store Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Enhanced Context MCP                         │
│         get_engineering_standards(section?)                     │
│              Returns: Base templates + Guidelines               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Project Initialization
┌─────────────────────────────────────────────────────────────────┐
│                     Project Git Repository                       │
│  .standards/                                                     │
│    ├── README.md              # Overview and customizations      │
│    ├── python.md              # Python conventions               │
│    ├── fastapi.md             # FastAPI patterns                 │
│    ├── database.md            # SQLAlchemy/Alembic standards     │
│    ├── testing.md             # Test structure and patterns      │
│    ├── frontend.md            # Next.js/React standards          │
│    ├── security.md            # Security checklist               │
│    ├── code_quality.md        # Quality guidelines               │
│    └── lessons_learned.json   # Project-specific learnings       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Team Modifications
┌─────────────────────────────────────────────────────────────────┐
│  Team modifies .standards/ files as needed                       │
│  Commits to Git → Version controlled                             │
│  LLM reads from .standards/ during development                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Initialization Command

When initializing a new project, fetch standards from Enhanced Context MCP:

```bash
# Fetch and create .standards/ directory
curl -X POST https://enhanced-context-mcp.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get_engineering_standards",
      "arguments": {"format": "files"}
    },
    "id": 1
  }'
```

### 2.3 LLM Usage Pattern

When working on a project, the LLM should:

1. Check if `.standards/` directory exists
2. Read relevant standard files before implementation
3. Follow conventions defined in standards
4. Update `lessons_learned.json` when issues are found

---

## 3. Directory Structure

### 3.1 Backend Project Structure (Python/FastAPI)

```
project-root/
├── backend/
│   ├── src/                      # Application source code
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI application entry
│   │   ├── api/                  # API layer
│   │   │   ├── __init__.py
│   │   │   └── v1/               # Versioned API
│   │   │       ├── __init__.py
│   │   │       ├── routes/       # Route handlers
│   │   │       │   ├── __init__.py
│   │   │       │   ├── health.py
│   │   │       │   ├── customers.py
│   │   │       │   └── ...
│   │   │       └── dependencies/ # Route dependencies
│   │   ├── core/                 # Core configuration
│   │   │   ├── __init__.py
│   │   │   ├── config.py         # Settings management
│   │   │   ├── database.py       # Database connection
│   │   │   └── security.py       # Auth utilities
│   │   ├── models/               # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── base.py           # Base model class
│   │   │   ├── customer.py
│   │   │   └── ...
│   │   ├── schemas/              # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── customer.py
│   │   │   └── ...
│   │   ├── services/             # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── customer_service.py
│   │   │   └── ...
│   │   └── utils/                # Utility functions
│   │       ├── __init__.py
│   │       └── ...
│   ├── tests/                    # Test suite
│   │   ├── __init__.py
│   │   ├── conftest.py           # Shared fixtures
│   │   ├── unit/                 # Unit tests
│   │   │   ├── __init__.py
│   │   │   ├── test_services/
│   │   │   └── test_utils/
│   │   ├── integration/          # Integration tests
│   │   │   ├── __init__.py
│   │   │   └── test_api/
│   │   └── e2e/                  # End-to-end tests
│   ├── alembic/                  # Database migrations
│   │   ├── versions/
│   │   ├── env.py
│   │   └── alembic.ini
│   ├── requirements.txt          # Production dependencies
│   ├── requirements-dev.txt      # Development dependencies
│   ├── pytest.ini                # pytest configuration
│   └── pyproject.toml            # Project metadata
├── docker/                       # Docker configuration
│   ├── docker-compose.yml
│   └── ...
├── .standards/                   # Engineering standards
│   └── ...
├── .reviews/                     # Review findings
│   ├── findings/
│   └── lessons_learned.json
└── docs/                         # Documentation
```

### 3.2 Frontend Project Structure (Next.js 14/15)

```
frontend/
├── src/
│   ├── app/                      # App Router (Next.js 13+)
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   ├── globals.css           # Global styles
│   │   ├── (auth)/               # Route group: auth pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── dashboard/            # Dashboard routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   └── api/                  # API routes
│   │       └── ...
│   ├── components/               # React components
│   │   ├── ui/                   # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   ├── features/             # Feature-specific components
│   │   │   ├── dashboard/
│   │   │   └── auth/
│   │   └── layouts/              # Layout components
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── lib/                      # Utility libraries
│   │   ├── api.ts                # API client
│   │   ├── auth.ts               # Auth utilities
│   │   └── utils.ts              # General utilities
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useFetch.ts
│   ├── types/                    # TypeScript types
│   │   ├── api.ts
│   │   └── models.ts
│   └── styles/                   # CSS/styling
│       └── ...
├── public/                       # Static assets
├── tests/                        # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```

---

## 4. Python Backend Standards

### 4.1 Python Version & Environment

```yaml
minimum_version: "3.12"
virtual_environment: "venv"  # or poetry
package_manager: "pip"       # or poetry
```

### 4.2 Import Ordering

Use `isort` with the following groups:

```python
# 1. Standard library
import asyncio
import logging
from datetime import datetime
from typing import Any, Optional

# 2. Third-party packages
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

# 3. Local application
from src.core.config import settings
from src.models.customer import Customer
```

### 4.3 Type Hints

**Required everywhere:**

```python
# Good
def calculate_total(items: list[Item], tax_rate: float) -> Decimal:
    ...

async def get_customer(customer_id: UUID) -> Customer | None:
    ...

# Bad - No type hints
def calculate_total(items, tax_rate):
    ...
```

### 4.4 Async/Sync Patterns

```python
# CRITICAL: Never block the event loop in async functions

# Good - Async I/O operations
async def fetch_data() -> dict[str, Any]:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()

# Bad - Blocking call in async function
async def fetch_data() -> dict[str, Any]:
    response = requests.get(url)  # BLOCKS EVENT LOOP!
    return response.json()

# If you must use sync code, use run_in_executor
async def cpu_intensive_task(data: bytes) -> bytes:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, process_data, data)
```

### 4.5 Error Handling

```python
# Use specific exceptions
class CustomerNotFoundError(Exception):
    """Raised when customer is not found."""
    def __init__(self, customer_id: UUID):
        self.customer_id = customer_id
        super().__init__(f"Customer {customer_id} not found")

# Log errors server-side, return sanitized messages to clients
try:
    customer = await get_customer(customer_id)
except CustomerNotFoundError as e:
    logger.warning(f"Customer lookup failed: {e}")
    raise HTTPException(status_code=404, detail="Customer not found")
except Exception as e:
    logger.exception(f"Unexpected error: {e}")
    raise HTTPException(status_code=500, detail="Internal error")
```

### 4.6 Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Modules | snake_case | `customer_service.py` |
| Classes | PascalCase | `CustomerService` |
| Functions | snake_case | `get_customer_by_id` |
| Variables | snake_case | `customer_name` |
| Constants | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Private | _prefix | `_internal_method` |
| Type aliases | PascalCase | `CustomerDict = dict[str, Any]` |

---

## 5. FastAPI Standards

### 5.1 Router Organization

```python
# src/api/v1/routes/customers.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.schemas.customer import CustomerCreate, CustomerResponse
from src.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Get Customer",
    description="Retrieve a customer by their unique identifier.",
    responses={
        404: {"description": "Customer not found"},
    },
)
async def get_customer(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> CustomerResponse:
    """Get customer by ID."""
    service = CustomerService(db)
    customer = await service.get_by_id(customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )
    return customer
```

### 5.2 Dependency Injection

```python
# Dependencies should be reusable and testable
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

# Database session dependency
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Service dependency (with caching)
def get_customer_service(
    db: AsyncSession = Depends(get_db),
) -> CustomerService:
    return CustomerService(db)

# Auth dependency
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    # Validate token and return user
    ...
```

### 5.3 Response Models

```python
# Always use response_model for type safety and documentation
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID


class CustomerBase(BaseModel):
    """Base customer schema."""
    name: str
    email: str


class CustomerCreate(CustomerBase):
    """Schema for creating a customer."""
    pass


class CustomerResponse(CustomerBase):
    """Schema for customer responses."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class CustomerListResponse(BaseModel):
    """Paginated list response."""
    items: list[CustomerResponse]
    total: int
    page: int
    page_size: int
```

### 5.4 Error Handling Pattern

```python
# Use FastAPI's HTTPException for API errors
from fastapi import HTTPException, status

# For validation errors, let Pydantic handle it (422 automatic)

# For business logic errors
raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Cannot delete customer with active orders",
)

# For not found
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Resource not found",
)

# For auth errors
raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid credentials",
    headers={"WWW-Authenticate": "Bearer"},
)
```

### 5.5 CORS Configuration

```python
# NEVER use wildcards in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # Explicit list
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Type",
        "Authorization",
        "X-API-Key",
        "X-Request-ID",
    ],
)
```

---

## 6. Database Standards

### 6.1 SQLAlchemy Model Base

```python
# src/models/base.py
from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import MetaData, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# CRITICAL: Define naming convention for constraints
# This enables proper migrations with Alembic
NAMING_CONVENTION = {
    "ix": "ix_%(table_name)s_%(column_0_name)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    """Base class for all models."""

    metadata = MetaData(naming_convention=NAMING_CONVENTION)


class TimestampMixin:
    """Mixin for created_at and updated_at timestamps."""

    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class UUIDMixin:
    """Mixin for UUID primary key."""

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )
```

### 6.2 Model Definition Pattern

```python
# src/models/customer.py
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDMixin, TimestampMixin


class Customer(Base, UUIDMixin, TimestampMixin):
    """Customer model."""

    __tablename__ = "customers"

    # Required fields
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    # Optional fields with defaults
    is_active: Mapped[bool] = mapped_column(default=True)
    api_key_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # Relationships
    templates: Mapped[list["Template"]] = relationship(
        back_populates="customer",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Customer(id={self.id}, email={self.email})>"
```

### 6.3 Alembic Migration Standards

**Migration Naming:**
```
YYYYMMDD_HHMM_description.py
Example: 20241214_1030_add_customer_api_key.py
```

**Migration Template:**
```python
"""Add customer API key field.

Revision ID: abc123
Revises: def456
Create Date: 2024-12-14 10:30:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "abc123"
down_revision = "def456"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Apply migration."""
    op.add_column(
        "customers",
        sa.Column("api_key_hash", sa.String(64), nullable=True),
    )
    op.create_index(
        op.f("ix_customers_api_key_hash"),
        "customers",
        ["api_key_hash"],
    )


def downgrade() -> None:
    """Revert migration."""
    op.drop_index(op.f("ix_customers_api_key_hash"), table_name="customers")
    op.drop_column("customers", "api_key_hash")
```

### 6.4 Database Connection Pooling

```python
# CRITICAL: Always use connection pooling in async applications
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import AsyncAdaptedQueuePool

engine = create_async_engine(
    settings.database_url,
    poolclass=AsyncAdaptedQueuePool,
    pool_size=5,           # Base connections
    max_overflow=10,       # Additional connections
    pool_timeout=30,       # Wait timeout
    pool_recycle=1800,     # Recycle connections after 30 min
    pool_pre_ping=True,    # Verify connections before use
)
```

### 6.5 Raw SQL Safety

```python
from sqlalchemy import text

# ALWAYS use text() wrapper for raw SQL
async def init_db() -> None:
    async with engine.begin() as conn:
        # Good - text() wrapper
        await conn.execute(text("SELECT 1"))

        # Bad - raw string (SQLAlchemy 2.0 will warn/error)
        # await conn.execute("SELECT 1")
```

---

## 7. Testing Standards

### 7.1 Test Directory Structure

```
tests/
├── __init__.py
├── conftest.py              # Shared fixtures
├── unit/                    # Unit tests (no external deps)
│   ├── __init__.py
│   ├── conftest.py          # Unit-specific fixtures
│   ├── test_services/
│   │   ├── test_customer_service.py
│   │   └── test_job_service.py
│   └── test_utils/
│       └── test_validators.py
├── integration/             # Integration tests (with DB/Redis)
│   ├── __init__.py
│   ├── conftest.py          # Integration fixtures
│   └── test_api/
│       ├── test_health.py
│       └── test_customers.py
└── e2e/                     # End-to-end tests
    ├── __init__.py
    ├── conftest.py
    └── test_workflows/
        └── test_research_flow.py
```

### 7.2 Test Categorization

| Category | Markers | Dependencies | Speed |
|----------|---------|--------------|-------|
| Unit | `@pytest.mark.unit` | None (mocked) | Fast |
| Integration | `@pytest.mark.integration` | DB, Redis | Medium |
| E2E | `@pytest.mark.e2e` | Full stack | Slow |

### 7.3 pytest Configuration

```ini
# pytest.ini
[pytest]
testpaths = tests
asyncio_mode = auto
asyncio_default_fixture_loop_scope = function
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short --strict-markers
markers =
    unit: Unit tests (no external dependencies)
    integration: Integration tests (require database)
    e2e: End-to-end tests (require full stack)
    slow: Slow tests
filterwarnings =
    ignore::DeprecationWarning
```

### 7.4 Fixture Patterns

```python
# tests/conftest.py
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from src.main import app
from src.core.database import get_db


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    import asyncio
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP client for testing."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture
async def db_session(test_engine):
    """Database session for testing."""
    async_session = async_sessionmaker(test_engine, expire_on_commit=False)
    async with async_session() as session:
        yield session
        await session.rollback()
```

### 7.5 Test Naming Convention

```python
# Format: test_<what>_<condition>_<expected_result>

class TestCustomerService:
    """Tests for CustomerService."""

    async def test_get_customer_with_valid_id_returns_customer(self):
        """Should return customer when ID exists."""
        ...

    async def test_get_customer_with_invalid_id_returns_none(self):
        """Should return None when ID doesn't exist."""
        ...

    async def test_create_customer_with_duplicate_email_raises_error(self):
        """Should raise error when email already exists."""
        ...
```

### 7.6 Mocking Patterns

```python
from unittest.mock import AsyncMock, MagicMock, patch

# Mock async functions
@pytest.fixture
def mock_db_session():
    session = AsyncMock()
    session.execute = AsyncMock(return_value=MagicMock())
    return session

# Patch external services
@patch("src.services.external_api.fetch_data")
async def test_with_mocked_external_api(mock_fetch):
    mock_fetch.return_value = {"data": "mocked"}
    result = await service.process()
    assert result["data"] == "mocked"
```

---

## 8. Frontend Standards

### 8.1 Next.js App Router Conventions

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
```

### 8.2 Component Organization

```typescript
// src/components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### 8.3 Server vs Client Components

```typescript
// Server Component (default) - src/app/dashboard/page.tsx
// Can fetch data directly, no 'use client' directive
async function DashboardPage() {
  const data = await fetchDashboardData();
  return <Dashboard data={data} />;
}

// Client Component - src/components/features/Counter.tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### 8.4 API Client Pattern

```typescript
// src/lib/api.ts
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

### 8.5 TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 9. Security Standards

### 9.1 OWASP API Security Top 10 Checklist

| Risk | Mitigation | Implementation |
|------|------------|----------------|
| **API1: BOLA** | Object-level authorization | Check user owns resource before access |
| **API2: Broken Auth** | Strong authentication | OAuth 2.0 + JWT, MFA for sensitive ops |
| **API3: Object Property Level** | Input/output filtering | Pydantic schemas, explicit field selection |
| **API4: Unrestricted Resource** | Rate limiting | Redis-based rate limiter per user/IP |
| **API5: BFLA** | Function-level authorization | Role-based access control (RBAC) |
| **API6: Mass Assignment** | Explicit schemas | Separate Create/Update schemas |
| **API7: Security Misconfiguration** | Secure defaults | HTTPS, proper headers, no debug in prod |
| **API8: Injection** | Input validation | Parameterized queries, Pydantic validation |
| **API9: Improper Asset Management** | API inventory | Version all endpoints, deprecation policy |
| **API10: Unsafe Consumption** | Third-party validation | Validate all external API responses |

### 9.2 Authentication Pattern

```python
# OAuth2 + JWT Implementation
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await get_user_by_id(db, user_id)
    if user is None:
        raise credentials_exception
    return user
```

### 9.3 Input Validation

```python
from pydantic import BaseModel, field_validator, EmailStr
import re

class CustomerCreate(BaseModel):
    name: str
    email: EmailStr

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v) < 2 or len(v) > 255:
            raise ValueError('Name must be 2-255 characters')
        if not re.match(r'^[\w\s\-\.]+$', v):
            raise ValueError('Name contains invalid characters')
        return v.strip()
```

### 9.4 Secrets Management

```python
# NEVER hardcode secrets
# Use environment variables or secrets manager

# .env (never commit to git)
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/db
JWT_SECRET=your-256-bit-secret
API_KEY=your-api-key

# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    api_key: str

    model_config = SettingsConfigDict(env_file=".env")
```

### 9.5 Information Disclosure Prevention

```python
# Don't expose internal details in production
@router.get("/info")
async def service_info() -> dict[str, Any]:
    info = {
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": "production" if not settings.debug else "development",
    }

    # Only expose debug info in development
    if settings.debug:
        info["debug_info"] = {
            "database_host": settings.db_host,
            "llm_provider": settings.llm_provider,
        }

    return info

# Error responses - log details, return generic message
except Exception as e:
    logger.exception(f"Internal error: {e}")  # Log full details
    raise HTTPException(
        status_code=500,
        detail="An internal error occurred"  # Generic to client
    )
```

---

## 10. Code Quality Standards

### 10.1 SOLID Principles

| Principle | Description | Example |
|-----------|-------------|---------|
| **Single Responsibility** | One class = one job | `CustomerService` only handles customer logic |
| **Open/Closed** | Open for extension, closed for modification | Use abstract base classes |
| **Liskov Substitution** | Subtypes must be substitutable | Child classes don't break contracts |
| **Interface Segregation** | Many specific interfaces > one general | Separate `Reader` and `Writer` protocols |
| **Dependency Inversion** | Depend on abstractions | Inject dependencies via constructor |

### 10.2 DRY (Don't Repeat Yourself)

```python
# Bad - Duplicated version string
class HealthResponse(BaseModel):
    version: str = "1.0.0"  # Duplicated

class InfoResponse(BaseModel):
    version: str = "1.0.0"  # Duplicated

# Good - Single source of truth
# config.py
class Settings(BaseSettings):
    app_version: str = "1.0.0"

# Use settings.app_version everywhere
```

### 10.3 Code Documentation

```python
def calculate_embedding_chunks(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
) -> list[str]:
    """
    Split text into overlapping chunks for embedding.

    Args:
        text: The input text to chunk.
        chunk_size: Maximum tokens per chunk.
        overlap: Number of overlapping tokens between chunks.

    Returns:
        List of text chunks ready for embedding.

    Raises:
        ValueError: If chunk_size <= overlap.

    Example:
        >>> chunks = calculate_embedding_chunks("Long text...", 100, 10)
        >>> len(chunks)
        5
    """
    if chunk_size <= overlap:
        raise ValueError("chunk_size must be greater than overlap")
    ...
```

### 10.4 Linting Configuration

```toml
# pyproject.toml
[tool.ruff]
line-length = 88
target-version = "py312"
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "B",   # flake8-bugbear
    "C4",  # flake8-comprehensions
    "UP",  # pyupgrade
    "ARG", # flake8-unused-arguments
    "SIM", # flake8-simplify
]
ignore = [
    "E501",  # line too long (handled by formatter)
]

[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_ignores = true
```

---

## 11. Lessons Learned Integration

### 11.1 Storage Location

```
.reviews/
├── findings/                    # Per-task review findings
│   ├── V1-49_findings.json
│   └── V1-50_findings.json
└── lessons_learned.json         # Aggregated patterns
```

### 11.2 Lessons Learned Schema

```json
{
  "schema_version": "1.0.0",
  "last_updated": "2024-12-14T12:00:00Z",
  "lessons": [
    {
      "id": "LL-001",
      "category": "database",
      "severity": "critical",
      "pattern": "Using NullPool in async SQLAlchemy",
      "problem": "Creates new connection per request, poor performance",
      "solution": "Use AsyncAdaptedQueuePool with proper settings",
      "source_task": "V1-49",
      "date_added": "2024-12-14"
    },
    {
      "id": "LL-002",
      "category": "security",
      "severity": "high",
      "pattern": "Exposing error details in API responses",
      "problem": "Information disclosure vulnerability",
      "solution": "Log errors server-side, return generic messages to clients",
      "source_task": "V1-49",
      "date_added": "2024-12-14"
    }
  ]
}
```

### 11.3 LLM Usage Pattern

When the LLM starts working on a task:

1. Read `.reviews/lessons_learned.json`
2. Check if any lessons apply to current task
3. Avoid repeating documented mistakes
4. After review, add new lessons if discovered

---

## 12. Enhanced Context MCP Integration

### 12.1 New Tool: `get_engineering_standards`

```json
{
  "name": "get_engineering_standards",
  "description": "Retrieve engineering standards and best practices templates",
  "inputSchema": {
    "type": "object",
    "properties": {
      "section": {
        "type": "string",
        "enum": [
          "overview",
          "python",
          "fastapi",
          "database",
          "testing",
          "frontend",
          "security",
          "code_quality",
          "all"
        ],
        "description": "Specific section to retrieve"
      },
      "format": {
        "type": "string",
        "enum": ["markdown", "files", "json"],
        "default": "markdown",
        "description": "Output format"
      }
    }
  }
}
```

### 12.2 Integration with Existing Tools

| Tool | Integration |
|------|-------------|
| `get_sdlc_guidance` | References engineering standards in implementation steps |
| `list_vishkar_agents` | Agents use standards when reviewing code |
| `get_contextual_agent` | Returns relevant standard files with agent |

### 12.3 Project Registry Integration

When registering a project:

```json
{
  "projectId": "pulse-context-agent",
  "projectName": "PULSE Context Agent",
  "configs": {
    "standards": {
      "initialized": true,
      "version": "1.0.0",
      "customizations": [
        "testing.md"
      ]
    }
  }
}
```

---

## Summary

This specification provides comprehensive engineering standards that:

1. **Can be fetched** from Enhanced Context MCP via `get_engineering_standards`
2. **Are stored locally** in `.standards/` directory for team customization
3. **Version controlled** via Git - teams modify and commit changes
4. **Used by LLM** by reading local standards before implementation
5. **Capture learnings** in `.reviews/lessons_learned.json`

**Sources & References:**

- [FastAPI Best Practices - zhanymkanov](https://github.com/zhanymkanov/fastapi-best-practices)
- [FastAPI Official Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Naming Conventions - Alembic Docs](https://alembic.sqlalchemy.org/en/latest/naming.html)
- [pytest Good Practices](https://docs.pytest.org/en/7.1.x/explanation/goodpractices.html)
- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [OWASP API Security Project](https://owasp.org/www-project-api-security/)
- [OWASP API Security Top 10](https://owasp.org/API-Security/)
