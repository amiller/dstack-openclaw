#!/bin/bash
# Demo: Ephemeral Sandbox Execution
# One-time verifiable computation over private data

set -e

BASE_URL="http://localhost:3003"

echo "🦞 Ephemeral Sandbox Execution Demo"
echo "===================================="
echo ""
echo "Key Concept: Dataset is NEVER stored"
echo "  1. Load dataset → memory"
echo "  2. Run computation"
echo "  3. DELETE dataset"
echo "  4. Keep certificate only"
echo ""

# Check if API key is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "❌ Error: ANTHROPIC_API_KEY environment variable not set"
  echo "   Export your API key: export ANTHROPIC_API_KEY=sk-ant-..."
  exit 1
fi

# Example: Compliance check on private patient data
echo "📋 Scenario: HIPAA Compliance Check"
echo "   We have private patient records"
echo "   We want to prove: 'No PII exposed'"
echo "   We DON'T want to store the records"
echo ""

PRIVATE_DATASET=$(cat <<EOF
Patient Record 1: John Doe, Age 45, Diagnosis: Hypertension, Treatment: ACE inhibitor
Patient Record 2: Jane Smith, Age 32, Diagnosis: Diabetes, Treatment: Metformin
Patient Record 3: Bob Johnson, Age 67, Diagnosis: Arthritis, Treatment: NSAIDs
Patient Record 4: Alice Williams, Age 28, Diagnosis: Asthma, Treatment: Inhaler
Patient Record 5: Charlie Brown, Age 54, Diagnosis: High cholesterol, Treatment: Statin
EOF
)

echo "🔒 Private dataset prepared (5 patient records)"
echo "   ❌ This data will NEVER be stored"
echo "   ✅ Only the execution certificate will persist"
echo ""

echo "🚀 Step 1: Execute sandbox (one-time)"
echo "   Prompt: 'Check for exposed PII (names, ages, diagnoses)'"
echo ""

EXECUTION=$(curl -s -X POST "$BASE_URL/execute" \
  -H "Content-Type: application/json" \
  -d "{
    \"dataset\": {
      \"data\": $(echo "$PRIVATE_DATASET" | jq -Rs .),
      \"format\": \"txt\"
    },
    \"sandbox\": {
      \"llm\": {
        \"prompt\": \"Analyze this medical dataset for HIPAA compliance. List any PII that should be redacted (names, specific ages, diagnoses). Count total records. Assess if data is properly anonymized.\",
        \"model\": \"claude-sonnet-4\",
        \"api_key\": \"$ANTHROPIC_API_KEY\"
      },
      \"tools\": [\"python\", \"grep\"],
      \"environment\": {
        \"timeout_seconds\": 60
      }
    }
  }")

echo "$EXECUTION" | jq '.'

CERT_ID=$(echo "$EXECUTION" | jq -r '.certificate_id')
DATASET_DELETED=$(echo "$EXECUTION" | jq -r '.execution_summary.dataset_deleted')

echo ""
echo "✅ Execution complete!"
echo "   Certificate ID: $CERT_ID"
echo "   Dataset deleted: $DATASET_DELETED"
echo ""

# Step 2: View certificate
echo "📜 Step 2: View execution certificate"
echo ""

CERTIFICATE=$(curl -s "$BASE_URL/certificate/$CERT_ID")
echo "$CERTIFICATE" | jq '{
  id, 
  dataset_hash, 
  execution: {
    duration_ms: .execution.duration_ms,
    llm_calls: (.execution.llm_calls | length),
    events_logged: (.execution.full_trace | length)
  },
  result: .result.output,
  lifecycle: .lifecycle
}'

echo ""
echo "✅ Certificate retrieved!"
echo "   ❌ Original dataset: DELETED (not accessible)"
echo "   ✅ Certificate: PERMANENT (publicly verifiable)"
echo ""

# Step 3: Verify certificate
echo "🔍 Step 3: Verify certificate cryptographically"
echo ""

VERIFICATION=$(curl -s "$BASE_URL/certificate/$CERT_ID/verify")
echo "$VERIFICATION" | jq '{
  valid,
  checks,
  execution_summary,
  lifecycle
}'

echo ""
echo "===================================="
echo "🎉 Demo Complete!"
echo ""
echo "📊 What just happened:"
echo "   1. ✅ Loaded private patient records → memory"
echo "   2. ✅ Ran HIPAA compliance check (LLM analysis)"
echo "   3. ✅ Logged every action (execution trace)"
echo "   4. ✅ Generated certificate with proof"
echo "   5. ✅ DELETED patient records from memory"
echo "   6. ✅ Destroyed sandbox"
echo ""
echo "🔐 Privacy guarantees:"
echo "   ❌ Patient records: GONE (never stored)"
echo "   ✅ Execution proof: PERMANENT"
echo "   ✅ Anyone can verify certificate"
echo "   ❌ Nobody can access original data"
echo ""
echo "🔗 Share this certificate:"
echo "   $BASE_URL/certificate/$CERT_ID"
echo ""
echo "✨ This is the ephemeral execution model:"
echo "   - No data storage"
echo "   - One-time computation"
echo "   - Permanent proof"
echo "   - Zero data retention risk"
echo ""
