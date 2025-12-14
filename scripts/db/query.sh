#!/bin/bash
# Database Query Script
# Usage: ./query.sh "SELECT * FROM table_name"

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Load environment
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -E '^POSTGRES_' "$PROJECT_ROOT/.env" | xargs)
fi

# Default values
HOST="${POSTGRES_HOST:-localhost}"
PORT="${POSTGRES_PORT:-5432}"
DB="${POSTGRES_DB:-postgres}"
USER="${POSTGRES_USER:-postgres}"
PASSWORD="${POSTGRES_PASSWORD:-}"

if [ -z "$1" ]; then
    echo "Usage: $0 \"SQL query\""
    echo "Example: $0 \"SELECT * FROM users LIMIT 5\""
    exit 1
fi

PGPASSWORD="$PASSWORD" psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -c "$1"
