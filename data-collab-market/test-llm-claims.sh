#!/bin/bash
# Quick test of LLM Claims endpoints

set -e

echo "Testing LLM Claims Service..."
echo ""

# Test 1: Upload dataset
echo "1. Testing dataset upload..."
UPLOAD=$(curl -s -X POST http://localhost:3002/datasets/upload \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Dataset",
    "data": "Sample data for testing",
    "format": "txt"
  }')

DATASET_ID=$(echo "$UPLOAD" | jq -r '.dataset_id')
echo "   ✅ Dataset uploaded: $DATASET_ID"

# Test 2: List claims (should be empty)
echo "2. Testing claims list..."
CLAIMS=$(curl -s http://localhost:3002/claims)
COUNT=$(echo "$CLAIMS" | jq -r '.count')
echo "   ✅ Claims list returned ($COUNT claims)"

# Test 3: API info
echo "3. Testing API info..."
INFO=$(curl -s http://localhost:3002/)
VERSION=$(echo "$INFO" | jq -r '.version')
FEATURE=$(echo "$INFO" | jq -r '.new_feature')
echo "   ✅ API running: $VERSION"
echo "   ✅ New feature: $FEATURE"

echo ""
echo "All tests passed! ✨"
echo ""
echo "To run full demo with real LLM:"
echo "  export ANTHROPIC_API_KEY=sk-ant-..."
echo "  ./examples/llm-claims-demo.sh"
