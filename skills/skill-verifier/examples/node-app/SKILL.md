---
name: node-example
version: 1.0.0
description: Node.js skill with tests
runtime: node:20-alpine
test_deps: npm install
test_command: ["npm", "test"]
---

# Node.js Example Skill

Demonstrates a Node.js skill with proper package.json and tests.

## Files

- `package.json` - Dependencies and test script
- `index.js` - Main skill code
- `test.js` - Simple test

## Testing Locally

```bash
npm install
npm test
```

## Verify

```bash
curl -X POST http://localhost:3000/verify \
  -H "Content-Type: application/json" \
  -d '{"skillPath": "./examples/node-app"}'
```
