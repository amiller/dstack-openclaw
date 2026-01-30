---
name: python-example
version: 1.0.0
description: Python skill with dependencies
runtime: python:3.11-alpine
test_deps: pip install -r requirements.txt
test_command: ["python", "test.py"]
---

# Python Example Skill

Demonstrates a Python skill with pip dependencies and tests.

## Files

- `requirements.txt` - Python dependencies
- `skill.py` - Main skill code
- `test.py` - Tests

## Testing Locally

```bash
pip install -r requirements.txt
python test.py
```

## Verify

```bash
curl -X POST http://localhost:3000/verify \
  -H "Content-Type: application/json" \
  -d '{"skillPath": "./examples/python-script"}'
```
