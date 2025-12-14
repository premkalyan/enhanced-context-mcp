#!/bin/bash
# Project Registration Helper
# Usage: ./register_project.sh <project_id> <project_name> <jira_key> <confluence_space>

set -e

PROJECT_REGISTRY_URL="https://project-registry-henna.vercel.app/api/projects/register"

PROJECT_ID="$1"
PROJECT_NAME="$2"
JIRA_KEY="$3"
CONFLUENCE_SPACE="$4"

if [ -z "$PROJECT_ID" ] || [ -z "$PROJECT_NAME" ]; then
    echo "Usage: $0 <project_id> <project_name> [jira_key] [confluence_space]"
    echo ""
    echo "Example:"
    echo "  $0 my-project \"My Project\" MYPROJ MYSPACE"
    echo ""
    echo "This will register your project and return an API key."
    exit 1
fi

# Build configs object
CONFIGS="{}"
if [ -n "$JIRA_KEY" ]; then
    CONFIGS=$(echo "$CONFIGS" | jq --arg key "$JIRA_KEY" '. + {jira: {projectKey: $key}}')
fi
if [ -n "$CONFLUENCE_SPACE" ]; then
    CONFIGS=$(echo "$CONFIGS" | jq --arg space "$CONFLUENCE_SPACE" '. + {confluence: {spaceKey: $space}}')
fi

# Register project
echo "Registering project: $PROJECT_NAME ($PROJECT_ID)..."
RESPONSE=$(curl -s -X POST "$PROJECT_REGISTRY_URL" \
    -H "Content-Type: application/json" \
    -d "{
        \"projectId\": \"$PROJECT_ID\",
        \"projectName\": \"$PROJECT_NAME\",
        \"configs\": $CONFIGS
    }")

echo "$RESPONSE" | jq .

# Extract API key if successful
API_KEY=$(echo "$RESPONSE" | jq -r '.apiKey // empty')
if [ -n "$API_KEY" ]; then
    echo ""
    echo "SUCCESS! Your API key: $API_KEY"
    echo ""
    echo "Add this to your .env file:"
    echo "VISHKAR_API_KEY=$API_KEY"
fi
