#!/bin/bash
# Project Registry MCP Helper
# No authentication required
# Usage: ./project_registry.sh <json_file>

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Load environment (for optional URL override)
if [ -f "$PROJECT_ROOT/.env" ]; then
    source <(grep -E '^PROJECT_REGISTRY_URL=' "$PROJECT_ROOT/.env" 2>/dev/null || true)
fi

MCP_URL="${PROJECT_REGISTRY_URL:-https://project-registry-henna.vercel.app/api/mcp}"

JSON_FILE="$1"

if [ -z "$JSON_FILE" ] || [ ! -f "$JSON_FILE" ]; then
    echo "Usage: $0 <json_file>"
    echo "Example: $0 requests/enhanced_context/get_started.json"
    exit 1
fi

curl -s -X POST "$MCP_URL" \
    -H "Content-Type: application/json" \
    -d @"$JSON_FILE" | jq .
