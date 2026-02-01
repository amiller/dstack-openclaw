FROM node:22-slim

RUN apt-get update && apt-get install -y curl jq git && rm -rf /var/lib/apt/lists/*
RUN npm install -g openclaw

# Create build context directory for genesis transparency
RUN mkdir -p /build /var/log-genesis

# Copy Dockerfile itself for genesis log
COPY Dockerfile /build/Dockerfile

# Copy config and workspace
COPY config.json /root/.openclaw/openclaw.json
COPY workspace/ /root/.openclaw/workspace/

# Copy Moltbook credentials (shared account with MoltyClaw47)
RUN mkdir -p /root/.config/moltbook
COPY config/moltbook/credentials.json /root/.config/moltbook/credentials.json

# Copy genesis log script
COPY genesis-log.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/genesis-log.sh

# Setup auth entrypoint
COPY setup-auth.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/setup-auth.sh

# Copy internal chat server (receives messages from proxy)
COPY chat-server.js /app/chat-server.js

# Capture build metadata
ARG GIT_COMMIT=unknown
ARG BUILD_DATE=unknown
RUN echo "$GIT_COMMIT" > /build/git-commit.txt
RUN echo "$BUILD_DATE" > /build/build-date.txt

# Internal port only - proxy handles external access
EXPOSE 3001

# Run genesis log, setup auth, then internal chat server
# Chat server uses `openclaw agent --local` which doesn't need gateway
CMD ["/bin/bash", "-c", "/usr/local/bin/genesis-log.sh && /usr/local/bin/setup-auth.sh && exec node /app/chat-server.js"]
