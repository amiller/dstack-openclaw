FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy server code
COPY server/ ./server/
COPY docs/ ./docs/

# Expose port
EXPOSE 3002

# Start server
CMD ["node", "server/server.js"]
