# FastAPI Standards

**Version:** 1.0.0
**Source:** Enhanced Context MCP

## Router Organization

Pattern: `src/api/v1/routes/{resource}.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status

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
    ...
```

## Dependency Injection

```python
# Database session dependency
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

# Service dependency
def get_customer_service(
    db: AsyncSession = Depends(get_db),
) -> CustomerService:
    return CustomerService(db)

# Auth dependency
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    ...
```

## Response Models

**Always use response_model** for type safety and documentation.

```python
from pydantic import BaseModel, ConfigDict

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
```

## Error Handling

```python
# Validation errors - Let Pydantic handle (422 automatic)

# Business logic errors
raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Cannot delete customer with active orders",
)

# Not found
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Resource not found",
)

# Auth errors
raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid credentials",
    headers={"WWW-Authenticate": "Bearer"},
)
```

## CORS Configuration

**CRITICAL: NEVER use wildcards in production**

```python
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
