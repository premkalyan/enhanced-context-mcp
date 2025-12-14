#!/bin/bash
# Initialize Engineering Standards
# Fetches standards from Enhanced Context MCP and saves to .standards/
# Usage: ./init_standards.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
STANDARDS_DIR="$PROJECT_ROOT/.standards"

# Load environment
if [ -f "$PROJECT_ROOT/.env" ]; then
    export VISHKAR_API_KEY=$(grep '^VISHKAR_API_KEY=' "$PROJECT_ROOT/.env" | cut -d'=' -f2)
fi

MCP_URL="https://enhanced-context-mcp.vercel.app/api/mcp"
API_KEY="${VISHKAR_API_KEY:-}"

if [ -z "$API_KEY" ]; then
    echo "Error: VISHKAR_API_KEY not set in .env"
    echo "Run ./scripts/setup/register_project.sh first to get an API key"
    exit 1
fi

echo "Fetching engineering standards from Enhanced Context MCP..."

# Sections to fetch
SECTIONS=("python" "fastapi" "database" "testing" "frontend" "security" "code_quality")

for section in "${SECTIONS[@]}"; do
    echo "  Fetching: $section..."

    RESPONSE=$(curl -s -X POST "$MCP_URL" \
        -H "Content-Type: application/json" \
        -H "X-API-Key: $API_KEY" \
        -d "{
            \"jsonrpc\": \"2.0\",
            \"method\": \"tools/call\",
            \"params\": {
                \"name\": \"get_engineering_standards\",
                \"arguments\": {
                    \"section\": \"$section\"
                }
            },
            \"id\": 1
        }")

    # Extract content and save
    CONTENT=$(echo "$RESPONSE" | jq -r '.result.content // empty')
    if [ -n "$CONTENT" ]; then
        echo "$CONTENT" > "$STANDARDS_DIR/$section.md"
        echo "    Saved: .standards/$section.md"
    else
        echo "    Warning: No content returned for $section"
    fi
done

echo ""
echo "Standards initialized in .standards/"
echo "Review and customize as needed for your project."
