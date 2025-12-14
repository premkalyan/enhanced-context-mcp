#!/bin/bash
# JIRA MCP Helper
# Uses Bearer token authentication
# Usage: ./jira.sh <json_file>

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Load environment
if [ -f "$PROJECT_ROOT/.env" ]; then
    export VISHKAR_API_KEY=$(grep '^VISHKAR_API_KEY=' "$PROJECT_ROOT/.env" | cut -d'=' -f2)
    source <(grep -E '^JIRA_MCP_URL=' "$PROJECT_ROOT/.env" 2>/dev/null || true)
fi

MCP_URL="${JIRA_MCP_URL:-https://jira-mcp-pi.vercel.app/api/mcp}"
API_KEY="${VISHKAR_API_KEY:-}"

if [ -z "$API_KEY" ]; then
    echo "Error: VISHKAR_API_KEY not set in .env"
    echo "Get your API key by registering at Project Registry"
    exit 1
fi

JSON_FILE="$1"

if [ -z "$JSON_FILE" ] || [ ! -f "$JSON_FILE" ]; then
    echo "Usage: $0 <json_file>"
    echo "Example: $0 requests/jira/search_issues.json"
    exit 1
fi

curl -s -X POST "$MCP_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d @"$JSON_FILE" | jq .
