---
name: weather-checker
version: 1.0.0
description: Check current weather using wttr.in
---

# Weather Checker Skill

A simple skill that fetches weather information.

## How it works

Uses wttr.in API (no API key required):

```bash
curl "wttr.in/London?format=3"
```

## Example usage

"What's the weather in Tokyo?"

The skill will run:
```bash
curl "wttr.in/Tokyo?format=3"
```

And return the current weather summary.

## Requirements

- `curl` binary must be available

## Security

- No API keys needed
- Read-only operation
- No file system writes
- Public API only
