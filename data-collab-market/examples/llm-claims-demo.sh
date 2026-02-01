#!/bin/bash
# Demo: LLM Claims Service
# Run verifiable claims about private datasets

set -e

BASE_URL="http://localhost:3002"

echo "🦞 LLM Claims Service Demo"
echo "================================"
echo ""

# Step 1: Upload private dataset
echo "📤 Step 1: Uploading private dataset..."
DATASET=$(cat <<EOF
Customer Review 1: "Amazing product! Best purchase I've made this year. 5 stars!"
Customer Review 2: "Terrible quality. Broke after one week. Very disappointed."
Customer Review 3: "Good value for money. Works as expected."
Customer Review 4: "Outstanding customer service. They really care about customers."
Customer Review 5: "Okay product, nothing special. Average quality."
Customer Review 6: "Loved it! Exceeded my expectations in every way."
Customer Review 7: "Not worth the price. Found better alternatives elsewhere."
Customer Review 8: "Fantastic! Will definitely buy again and recommend to friends."
Customer Review 9: "Mediocre. Does the job but could be better."
Customer Review 10: "Worst product ever. Complete waste of money."
EOF
)

UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/datasets/upload" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Customer Reviews Sample\",
    \"data\": $(echo "$DATASET" | jq -Rs .),
    \"format\": \"txt\",
    \"description\": \"Sample customer reviews for sentiment analysis demo\"
  }")

echo "$UPLOAD_RESPONSE" | jq '.'
DATASET_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.dataset_id')
DATASET_HASH=$(echo "$UPLOAD_RESPONSE" | jq -r '.hash')

echo ""
echo "✅ Dataset uploaded!"
echo "   ID: $DATASET_ID"
echo "   Hash: $DATASET_HASH"
echo ""

# Step 2: Run LLM analysis
echo "🤖 Step 2: Running LLM analysis..."
echo "   Prompt: 'Analyze sentiment distribution and provide percentages'"
echo ""

# Check if API key is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "❌ Error: ANTHROPIC_API_KEY environment variable not set"
  echo "   Export your API key: export ANTHROPIC_API_KEY=sk-ant-..."
  exit 1
fi

ANALYSIS_RESPONSE=$(curl -s -X POST "$BASE_URL/analyze/llm" \
  -H "Content-Type: application/json" \
  -d "{
    \"dataset_id\": \"$DATASET_ID\",
    \"prompt\": \"Analyze the sentiment distribution in these customer reviews. Provide percentages for positive, neutral, and negative sentiment. Also identify the most common themes.\",
    \"api_key\": \"$ANTHROPIC_API_KEY\",
    \"model\": \"claude-sonnet-4\",
    \"max_tokens\": 2000
  }")

echo "$ANALYSIS_RESPONSE" | jq '.'
CLAIM_ID=$(echo "$ANALYSIS_RESPONSE" | jq -r '.claim_id')
CLAIM_URL="$BASE_URL/claim/$CLAIM_ID"

echo ""
echo "✅ Analysis complete!"
echo "   Claim ID: $CLAIM_ID"
echo "   Share URL: $CLAIM_URL"
echo ""

# Step 3: View claim
echo "📋 Step 3: Viewing shareable claim..."
echo ""

CLAIM=$(curl -s "$CLAIM_URL")
echo "$CLAIM" | jq '.'

echo ""
echo "✅ Claim is publicly viewable!"
echo ""

# Step 4: Verify claim
echo "🔍 Step 4: Verifying claim cryptographically..."
echo ""

VERIFICATION=$(curl -s "$CLAIM_URL/verify")
echo "$VERIFICATION" | jq '.'

echo ""
echo "================================"
echo "🎉 Demo Complete!"
echo ""
echo "📊 Summary:"
echo "   - Private dataset uploaded (hash: ${DATASET_HASH:0:16}...)"
echo "   - LLM analysis performed in TEE"
echo "   - Verifiable claim generated"
echo "   - Anyone can verify WITHOUT seeing raw data"
echo ""
echo "🔗 Share this claim:"
echo "   $CLAIM_URL"
echo ""
echo "✨ This is the Info Bazaar primitive:"
echo "   - Make claims about private data"
echo "   - Share verifiable proof"
echo "   - Build trust without exposing data"
echo ""
