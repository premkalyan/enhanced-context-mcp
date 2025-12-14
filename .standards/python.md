# Python Backend Standards

**Version:** 1.0.0
**Source:** Enhanced Context MCP

## Environment

- **Minimum Version:** Python 3.12+
- **Virtual Environment:** venv or poetry
- **Package Manager:** pip or poetry

## Import Ordering

Use `isort` with these groups in order:

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

## Type Hints

**Required everywhere** - functions, methods, class attributes.

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

## Async Patterns

**CRITICAL: Never block the event loop in async functions**

```python
# Good - Async I/O operations
async def fetch_data() -> dict[str, Any]:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()

# Bad - Blocking call in async function
async def fetch_data() -> dict[str, Any]:
    response = requests.get(url)  # BLOCKS EVENT LOOP!
    return response.json()

# Workaround for CPU-bound sync code
async def cpu_intensive_task(data: bytes) -> bytes:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, process_data, data)
```

## Error Handling

Use specific exceptions, log server-side, return sanitized messages to clients.

```python
class CustomerNotFoundError(Exception):
    """Raised when customer is not found."""
    def __init__(self, customer_id: UUID):
        self.customer_id = customer_id
        super().__init__(f"Customer {customer_id} not found")

# In route handler
try:
    customer = await get_customer(customer_id)
except CustomerNotFoundError as e:
    logger.warning(f"Customer lookup failed: {e}")
    raise HTTPException(status_code=404, detail="Customer not found")
```

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Modules | snake_case | `customer_service.py` |
| Classes | PascalCase | `CustomerService` |
| Functions | snake_case | `get_customer_by_id` |
| Variables | snake_case | `customer_name` |
| Constants | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Private | _prefix | `_internal_method` |
| Type aliases | PascalCase | `CustomerDict = dict[str, Any]` |
