# Code Quality Standards

**Version:** 1.0.0
**Source:** Enhanced Context MCP

## SOLID Principles

| Principle | Description | Example |
|-----------|-------------|---------|
| **Single Responsibility** | One class = one job | `CustomerService` only handles customer logic |
| **Open/Closed** | Open for extension, closed for modification | Use abstract base classes |
| **Liskov Substitution** | Subtypes must be substitutable | Child classes don't break contracts |
| **Interface Segregation** | Many specific interfaces > one general | Separate `Reader` and `Writer` protocols |
| **Dependency Inversion** | Depend on abstractions | Inject dependencies via constructor |

## DRY (Don't Repeat Yourself)

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

## Documentation

Use Google-style docstrings:

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
```

## Linting Configuration

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

[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_ignores = true
```
