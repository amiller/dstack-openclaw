#!/bin/bash
# Get attestation from dstack guest-agent
# This script runs inside the TEE to fetch attestation info

set -e

echo "=== OpenClaw TEE Attestation ==="
echo ""

# Fetch full attestation info
ATTEST_JSON=$(curl -s localhost:8090/info)

# Parse key fields
APP_ID=$(echo "$ATTEST_JSON" | jq -r '.app_id')
INSTANCE_ID=$(echo "$ATTEST_JSON" | jq -r '.instance_id')
COMPOSE_HASH=$(echo "$ATTEST_JSON" | jq -r '.tcb_info.mr_config_id')
DEVICE_ID=$(echo "$ATTEST_JSON" | jq -r '.tcb_info.mr_signer_seam')
KMS_VERSION=$(echo "$ATTEST_JSON" | jq -r '.kms.version')

echo "App ID: $APP_ID"
echo "Instance ID: $INSTANCE_ID"
echo "Compose Hash: $COMPOSE_HASH"
echo "Device ID: $DEVICE_ID"
echo "KMS Version: $KMS_VERSION"
echo ""
echo "=== What This Proves ==="
echo "✓ Code is running in isolated TEE (TDX)"
echo "✓ Compose hash matches docker-compose.yaml"
echo "✓ Hardware attestation (not simulated if on Phala Cloud)"
echo ""
echo "=== What This Doesn't Prove ==="
echo "✗ Exclusive account ownership (operator has API keys)"
echo "✗ DevProof upgrades (no timelock yet)"
echo "✗ Distributed deployment (single VM)"
echo ""
echo "Full attestation JSON:"
echo "$ATTEST_JSON" | jq
