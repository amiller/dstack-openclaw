#!/bin/bash
# Build script for reproducible OpenClaw-in-dstack image
#
# This script builds the Docker image twice with the same SOURCE_DATE_EPOCH
# and compares the resulting image hashes to verify reproducibility.

set -e

EPOCH=${SOURCE_DATE_EPOCH:-1706659200}  # 2024-01-31 00:00:00 UTC
IMAGE_NAME="openclaw-dstack"
TAG="test"

echo "=== Building OpenClaw-in-dstack (Reproducible) ==="
echo "SOURCE_DATE_EPOCH: $EPOCH ($(date -d @$EPOCH '+%Y-%m-%d %H:%M:%S UTC'))"
echo ""

# Build first time
echo "Building first image..."
docker build \
  --build-arg SOURCE_DATE_EPOCH=$EPOCH \
  --build-arg NODE_VERSION=22.22.0 \
  -t ${IMAGE_NAME}:${TAG}-1 \
  -f Dockerfile.reproducible \
  .

HASH1=$(docker inspect ${IMAGE_NAME}:${TAG}-1 | jq -r '.[0].Id')
echo "First build hash: $HASH1"
echo ""

# Build second time
echo "Building second image..."
docker build \
  --build-arg SOURCE_DATE_EPOCH=$EPOCH \
  --build-arg NODE_VERSION=22.22.0 \
  -t ${IMAGE_NAME}:${TAG}-2 \
  -f Dockerfile.reproducible \
  .

HASH2=$(docker inspect ${IMAGE_NAME}:${TAG}-2 | jq -r '.[0].Id')
echo "Second build hash: $HASH2"
echo ""

# Compare
if [ "$HASH1" == "$HASH2" ]; then
    echo "✅ SUCCESS: Builds are reproducible!"
    echo "   Both builds produced: $HASH1"
    exit 0
else
    echo "❌ FAILURE: Builds differ!"
    echo "   Build 1: $HASH1"
    echo "   Build 2: $HASH2"
    echo ""
    echo "Debugging: Check for:"
    echo "- Timestamps in files"
    echo "- Non-deterministic package installation"
    echo "- Git clone randomness"
    echo "- Build layer ordering"
    exit 1
fi
