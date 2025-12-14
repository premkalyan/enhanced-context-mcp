# Security Standards (OWASP API Top 10)

**Version:** 1.0.0
**Source:** Enhanced Context MCP

## OWASP API Security Checklist

| Risk | Mitigation | Implementation |
|------|------------|----------------|
| **API1: BOLA** | Object-level authorization | Check user owns resource before access |
| **API2: Broken Auth** | Strong authentication | OAuth 2.0 + JWT, MFA for sensitive ops |
| **API3: Object Property** | Input/output filtering | Pydantic schemas, explicit field selection |
| **API4: Unrestricted Resource** | Rate limiting | Redis-based rate limiter per user/IP |
| **API5: BFLA** | Function-level authorization | Role-based access control (RBAC) |
| **API6: Mass Assignment** | Explicit schemas | Separate Create/Update schemas |
| **API7: Security Misconfiguration** | Secure defaults | HTTPS, proper headers, no debug in prod |
| **API8: Injection** | Input validation | Parameterized queries, Pydantic validation |
| **API9: Improper Asset Management** | API inventory | Version all endpoints, deprecation policy |
| **API10: Unsafe Consumption** | Third-party validation | Validate all external API responses |

## Authentication Pattern

```python
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
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

## Input Validation

```python
from pydantic import BaseModel, field_validator, EmailStr

class CustomerCreate(BaseModel):
    name: str
    email: EmailStr

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v) < 2 or len(v) > 255:
            raise ValueError('Name must be 2-255 characters')
        return v.strip()
```

## Secrets Management

**Rule:** NEVER hardcode secrets

```python
# Use environment variables
# .env (never commit to git)
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/db
JWT_SECRET=your-256-bit-secret

# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str

    model_config = SettingsConfigDict(env_file=".env")
```

## Information Disclosure Prevention

```python
# Log details server-side, return generic messages to clients

@router.get("/info")
async def service_info() -> dict[str, Any]:
    info = {
        "service": settings.app_name,
        "version": settings.app_version,
    }

    # Only expose debug info in development
    if settings.debug:
        info["debug_info"] = {
            "database_host": settings.db_host,
        }

    return info

# Error responses
except Exception as e:
    logger.exception(f"Internal error: {e}")  # Log full details
    raise HTTPException(
        status_code=500,
        detail="An internal error occurred"  # Generic to client
    )
```
