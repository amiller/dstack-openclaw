# OpenClaw in dstack - Basic Version (Non-Reproducible)
# Phase 1: Get it working first, reproducibility comes later

FROM node:22-slim

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
    git \
    curl \
    jq \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install OpenClaw globally (simplest approach)
RUN npm install -g openclaw

# Create OpenClaw directories
RUN mkdir -p /root/.openclaw/workspace && \
    mkdir -p /root/.openclaw/agents/main/agent

# Copy workspace files (SOUL.md, tee-notes.md, scripts)
COPY workspace/ /root/.openclaw/workspace/

# Copy OpenClaw config
COPY config.yaml /root/.openclaw/openclaw.json

# Expose webchat port
EXPOSE 3000

# Expose dstack attestation endpoint
EXPOSE 8090

# Start OpenClaw gateway
CMD ["openclaw", "gateway", "start", "--foreground"]
