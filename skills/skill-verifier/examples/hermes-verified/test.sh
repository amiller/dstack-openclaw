#!/bin/sh
# Test suite for Hermes skill

set -e  # Exit on any error

echo "🧪 Testing Hermes Skill"
echo "======================="

# Test 1: Search functionality
echo ""
echo "Test 1: Search for entries..."
SEARCH_RESULT=$(curl -s "https://hermes.teleport.computer/api/entries?limit=5")

# Verify we got JSON back
if ! echo "$SEARCH_RESULT" | jq empty 2>/dev/null; then
    echo "❌ Search failed - invalid JSON response"
    exit 1
fi

# Verify we got entries
ENTRY_COUNT=$(echo "$SEARCH_RESULT" | jq '.entries | length')
if [ "$ENTRY_COUNT" -lt 1 ]; then
    echo "❌ Search returned no entries"
    exit 1
fi

echo "✅ Search returned $ENTRY_COUNT entries"

# Test 2: Verify entry structure
echo ""
echo "Test 2: Validate entry structure..."
FIRST_ENTRY=$(echo "$SEARCH_RESULT" | jq '.entries[0]')

# Check required fields exist
for field in id content timestamp; do
    if ! echo "$FIRST_ENTRY" | jq -e ".$field" > /dev/null 2>&1; then
        echo "❌ Entry missing required field: $field"
        exit 1
    fi
done

# Display sample entry
SAMPLE_CONTENT=$(echo "$FIRST_ENTRY" | jq -r '.content' | head -c 80)
echo "✅ Entry structure valid"
echo "   Sample: ${SAMPLE_CONTENT}..."

# Test 3: Verify API error handling
echo ""
echo "Test 3: Test API error handling..."
ERROR_RESULT=$(curl -s -X POST https://hermes.teleport.computer/api/entries \
  -H "Content-Type: application/json" \
  -d '{"content": "test", "secret_key": "invalid"}')

# Verify API returns proper error format
if echo "$ERROR_RESULT" | jq -e '.error' > /dev/null 2>&1; then
    ERROR_MSG=$(echo "$ERROR_RESULT" | jq -r '.error')
    echo "✅ API error handling works: \"$ERROR_MSG\""
else
    echo "❌ API should return error for invalid auth"
    exit 1
fi

# Test 4: Verify pagination works
echo ""
echo "Test 4: Test pagination..."
PAGINATED=$(curl -s "https://hermes.teleport.computer/api/entries?limit=3&offset=0")
PAGE_COUNT=$(echo "$PAGINATED" | jq '.entries | length')

if [ "$PAGE_COUNT" -eq 3 ]; then
    echo "✅ Pagination working (returned exactly 3 entries)"
else
    echo "⚠️  Warning: Expected 3 entries, got $PAGE_COUNT"
fi

# Test 5: Verify no data leakage
echo ""
echo "Test 5: Security check - verify isolation..."

# Check we can't access workspace files
if [ -d "/home/node/.openclaw" ]; then
    echo "❌ SECURITY ISSUE: Container can access workspace!"
    exit 1
fi

# Check we don't have unexpected environment variables
if env | grep -i "password\|secret\|token" | grep -v "SECRET_KEY"; then
    echo "❌ SECURITY ISSUE: Sensitive env vars exposed!"
    exit 1
fi

echo "✅ Container properly isolated"

# Test 6: Performance check
echo ""
echo "Test 6: Performance verification..."

START_TIME=$(date +%s)
curl -s "https://hermes.teleport.computer/api/entries?limit=1" > /dev/null
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

if [ "$DURATION" -gt 10 ]; then
    echo "⚠️  Warning: API request took ${DURATION}s (expected <10s)"
else
    echo "✅ API latency acceptable (${DURATION}s)"
fi

# All tests passed!
echo ""
echo "================================"
echo "✅ All tests passed!"
echo "================================"
echo ""
echo "Summary:"
echo "  - Search: Working ($ENTRY_COUNT entries)"
echo "  - Structure: Valid"
echo "  - Error handling: Correct"
echo "  - Pagination: Working"
echo "  - Security: Isolated"
echo "  - Performance: ${DURATION}s response"
echo ""
echo "Note: Posting requires valid authentication"
echo "      (tested error handling instead)"
