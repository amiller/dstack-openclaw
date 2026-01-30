# OpenClaw in dstack - Basic Version (Non-Reproducible)
# This is Phase 1 - just get it working first

FROM node:22-slim

# Install basic dependencies
RUN apt-get update && \
    apt-get install -y \
    git \
    curl \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Clone OpenClaw (for now, we'll use latest)
# TODO Phase 3: Pin specific commit for reproducibility
RUN git clone https://github.com/openclaw/openclaw.git . && \
    npm install

# Create workspace directory
RUN mkdir -p /home/node/.openclaw/workspace

# Expose port for webchat
EXPOSE 3000

# Default command
CMD ["node", "gateway/index.js"]
