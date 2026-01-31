FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY server.js ./
COPY verifier.js ./

# Create directories
RUN mkdir -p uploads results work

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
