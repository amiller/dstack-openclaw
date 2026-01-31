FROM node:22-slim
WORKDIR /app
COPY index.mjs ./
RUN npm init -y && npm install @phala/dstack-sdk
CMD ["node", "index.mjs"]
