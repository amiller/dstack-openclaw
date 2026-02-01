FROM node:22-slim

# Install dependencies
RUN apt-get update && apt-get install -y curl jq && rm -rf /var/lib/apt/lists/*

# Copy proxy script
COPY proxy.js /app/proxy.js
RUN chmod +x /app/proxy.js

# Create socket directory
RUN mkdir -p /var/run /var/log

EXPOSE 3000

CMD ["node", "/app/proxy.js"]
