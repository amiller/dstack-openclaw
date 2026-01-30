---
name: hello-world
version: 1.0.0
description: Minimal example skill
runtime: alpine:latest
test_command: ["sh", "-c", "echo 'Hello from skill!' && exit 0"]
---

# Hello World Skill

The simplest possible skill. Just prints a message and exits successfully.

## Usage

```bash
curl -X POST http://localhost:3000/verify \
  -H "Content-Type: application/json" \
  -d '{"skillPath": "./examples/hello-world"}'
```

Expected result: `passed: true`
