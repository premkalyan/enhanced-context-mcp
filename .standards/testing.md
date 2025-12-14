# Testing Standards

**Version:** 1.0.0
**Source:** Enhanced Context MCP

## Directory Structure

```
tests/
├── __init__.py
├── conftest.py              # Shared fixtures
├── unit/                    # No external deps, mocked
│   ├── __init__.py
│   ├── conftest.py
│   └── test_services/
├── integration/             # With DB/Redis
│   ├── __init__.py
│   ├── conftest.py
│   └── test_api/
└── e2e/                     # Full stack
    ├── __init__.py
    └── test_workflows/
```

## Test Categorization

| Category | Marker | Dependencies | Speed |
|----------|--------|--------------|-------|
| Unit | `@pytest.mark.unit` | None (mocked) | Fast |
| Integration | `@pytest.mark.integration` | DB, Redis | Medium |
| E2E | `@pytest.mark.e2e` | Full stack | Slow |

## pytest Configuration

```ini
[pytest]
testpaths = tests
asyncio_mode = auto
asyncio_default_fixture_loop_scope = function
addopts = -v --tb=short --strict-markers
markers =
    unit: Unit tests (no external dependencies)
    integration: Integration tests (require database)
    e2e: End-to-end tests (require full stack)
```

## Naming Convention

**Pattern:** `test_<what>_<condition>_<expected_result>`

```python
class TestCustomerService:
    async def test_get_customer_with_valid_id_returns_customer(self):
        ...

    async def test_get_customer_with_invalid_id_returns_none(self):
        ...

    async def test_create_customer_with_duplicate_email_raises_error(self):
        ...
```

## Fixtures

```python
@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

@pytest_asyncio.fixture
async def db_session(test_engine):
    async_session = async_sessionmaker(test_engine, expire_on_commit=False)
    async with async_session() as session:
        yield session
        await session.rollback()
```

## Mocking

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

## Coverage Threshold

Minimum coverage: **80%**
