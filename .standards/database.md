# Database Standards (SQLAlchemy/Alembic)

**Version:** 1.0.0
**Source:** Enhanced Context MCP

## Model Base

**CRITICAL:** Define naming convention for constraints - enables proper Alembic migrations.

```python
from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

NAMING_CONVENTION = {
    "ix": "ix_%(table_name)s_%(column_0_name)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)
```

## Mixins

```python
class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

class UUIDMixin:
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
```

## Model Pattern

```python
class Customer(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "customers"

    # Required fields
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    # Optional fields
    api_key_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # Relationships
    templates: Mapped[list["Template"]] = relationship(
        back_populates="customer",
        cascade="all, delete-orphan"
    )
```

## Alembic Migrations

**Naming:** `YYYYMMDD_HHMM_description.py`

Example: `20241214_1030_add_customer_api_key.py`

```python
def upgrade() -> None:
    op.add_column("customers", sa.Column("api_key_hash", sa.String(64)))

def downgrade() -> None:
    op.drop_column("customers", "api_key_hash")
```

**Rule:** Always include downgrade for rollback capability.

## Connection Pooling

**CRITICAL:** Always use connection pooling in async applications.

```python
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import AsyncAdaptedQueuePool

engine = create_async_engine(
    settings.database_url,
    poolclass=AsyncAdaptedQueuePool,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=True,
)
```

## Raw SQL

**Rule:** ALWAYS use `text()` wrapper for raw SQL.

```python
from sqlalchemy import text

# Good
await conn.execute(text("SELECT 1"))

# Bad - SQLAlchemy 2.0 will warn/error
await conn.execute("SELECT 1")
```
