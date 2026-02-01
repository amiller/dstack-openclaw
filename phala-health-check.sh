#!/bin/bash
# Phala Production Health Check
# Verifies claw-tee-dah deployment status and functionality

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-3000.dstack-pha-prod7.phala.network"
LOG_URL="https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-8090.dstack-pha-prod7.phala.network"
DEV_KEY="${DEV_KEY:-dd51be62bce2c28b4d0ea6d1f6dc42d6}"

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Phala Production Health Check - claw-tee-dah     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Test 1: Genesis Log Access
echo -e "${YELLOW}[1/6]${NC} Checking genesis log..."
GENESIS_RESPONSE=$(curl -s --max-time 5 "$BASE_URL/genesis/hash" 2>&1)
if echo "$GENESIS_RESPONSE" | jq -e '.hash' > /dev/null 2>&1; then
    GENESIS_HASH=$(echo "$GENESIS_RESPONSE" | jq -r '.hash')
    echo -e "${GREEN}✓${NC} Genesis log accessible"
    echo "      Hash: ${GENESIS_HASH:0:16}..."
else
    echo -e "${RED}✗${NC} Genesis log unavailable"
    exit 1
fi

# Test 2: Attestation Endpoint
echo -e "${YELLOW}[2/6]${NC} Checking attestation endpoint..."
ATTEST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$BASE_URL/attestation" 2>&1)
if [ "$ATTEST_STATUS" = "200" ] || [ "$ATTEST_STATUS" = "400" ]; then
    echo -e "${GREEN}✓${NC} Attestation endpoint responding (HTTP $ATTEST_STATUS)"
else
    echo -e "${RED}✗${NC} Attestation endpoint failed (HTTP $ATTEST_STATUS)"
fi

# Test 3: Agent Logs
echo -e "${YELLOW}[3/6]${NC} Checking agent logs..."
LOG_CHECK=$(curl -s --max-time 5 "$LOG_URL/logs/claw-tee-dah?text&bare&tail=5" 2>&1)
if echo "$LOG_CHECK" | grep -q "agent"; then
    echo -e "${GREEN}✓${NC} Agent logs accessible"
    # Check for recent activity (FIXED VERSION marker)
    if echo "$LOG_CHECK" | grep -q "FIXED VERSION"; then
        echo "      Status: Running v0.0.2+ (with fixes)"
    fi
else
    echo -e "${YELLOW}⚠${NC} Agent logs may be unavailable"
fi

# Test 4: Simple Chat Test
echo -e "${YELLOW}[4/6]${NC} Testing basic chat (may take 10-30s)..."
CHAT_RESPONSE=$(curl -s --max-time 35 -X POST "$BASE_URL/chat" \
    -H "Authorization: Bearer $DEV_KEY" \
    -H "Content-Type: application/json" \
    -d '{"message": "Health check ping"}' 2>&1)

if echo "$CHAT_RESPONSE" | jq -e '.response' > /dev/null 2>&1; then
    RESPONSE_TEXT=$(echo "$CHAT_RESPONSE" | jq -r '.response' | head -c 60)
    echo -e "${GREEN}✓${NC} Chat endpoint responding"
    echo "      Response: ${RESPONSE_TEXT}..."
elif echo "$CHAT_RESPONSE" | grep -q "payloads"; then
    echo -e "${GREEN}✓${NC} Chat endpoint responding (non-standard format)"
else
    echo -e "${RED}✗${NC} Chat endpoint failed"
    echo "      Response: $(echo $CHAT_RESPONSE | head -c 100)"
fi

# Test 5: UTF-8/Emoji Test (Issue #6 regression check)
echo -e "${YELLOW}[5/6]${NC} Testing UTF-8/emoji handling (Issue #6, ~20s)..."
EMOJI_RESPONSE=$(curl -s --max-time 35 -X POST "$BASE_URL/chat" \
    -H "Authorization: Bearer $DEV_KEY" \
    -H "Content-Type: application/json" \
    -d '{"message": "Quick emoji test 🦞🔐"}' 2>&1)

if echo "$EMOJI_RESPONSE" | jq -e '.response' > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} UTF-8/emoji handling working"
elif echo "$EMOJI_RESPONSE" | grep -q "payloads"; then
    echo -e "${GREEN}✓${NC} UTF-8/emoji handling working (agent responded)"
else
    echo -e "${RED}✗${NC} UTF-8/emoji test failed (regression?)"
    echo "      Note: Timeouts may indicate slow agent, not broken emoji handling"
fi

# Test 6: Check Deployed Versions
echo -e "${YELLOW}[6/6]${NC} Checking deployed versions..."
if [ -f "docker-compose-phala.yaml" ]; then
    AGENT_SHA=$(grep "openclaw-dstack@sha256:" docker-compose-phala.yaml | cut -d: -f3 | cut -c1-12)
    PROXY_SHA=$(grep "dstack-proxy@sha256:" docker-compose-phala.yaml | cut -d: -f3 | cut -c1-12)
    echo -e "${GREEN}✓${NC} Version info from compose file:"
    echo "      claw-tee-dah: ${AGENT_SHA}..."
    echo "      dstack-proxy: ${PROXY_SHA}..."
else
    echo -e "${YELLOW}⚠${NC} Compose file not found (run from repo root)"
fi

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Health check complete!${NC}"
echo ""
echo "Quick links:"
echo "  • Chat UI:     $BASE_URL/"
echo "  • Genesis Log: $BASE_URL/genesis"
echo "  • Attestation: $BASE_URL/attestation"
echo "  • Agent Logs:  $LOG_URL/logs/claw-tee-dah"
echo ""
echo "To monitor logs live:"
echo "  curl -s '$LOG_URL/logs/claw-tee-dah?text&bare&timestamps&follow&tail=20'"
echo ""
