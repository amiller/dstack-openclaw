# Skill Verifier

> Verify agent skills in isolated Docker containers with cryptographic attestations

Skill Verifier runs agent skill tests in isolated environments and generates verifiable attestations of the results. Built with Docker isolation and designed for TEE (Trusted Execution Environment) integration.

**📺 [See Live Demo](DEMO.md)** - Hermes skill fully verified with all tests passing!

## Live Example

```bash
✅ Hermes Skill Verified
   Duration: 2.2s | Tests: 6/6 passed | Security: Isolated
   Attestation: 0xfb41b44477e21bb3de59dfc1fc874191...
```

See [DEMO.md](DEMO.md) for full verification output.

## Features

- 🔒 **Isolated Execution** - Each skill runs in its own Docker container
- 🧪 **Language Agnostic** - Supports any runtime (Node, Python, Rust, etc.)
- 📊 **Detailed Results** - Captures stdout, stderr, exit codes, and timing
- 🔐 **Attestations** - Cryptographic proof of verification (TEE-ready)
- 🚀 **REST API** - Easy integration via HTTP
- 📦 **Simple Manifest** - Skills defined in SKILL.md frontmatter

## Quick Start

### Installation

```bash
npm install
```

### Start Server

```bash
export DOCKER_HOST=tcp://your-docker-host:2375  # or use local Docker socket
npm start
```

Server runs on `http://localhost:3000`

### Verify a Skill

```bash
# Submit for verification
curl -X POST http://localhost:3000/verify \
  -H "Content-Type: application/json" \
  -d '{"skillPath": "/path/to/skill"}'

# Response: {"jobId": "abc123...", "status": "pending", ...}

# Check status
curl http://localhost:3000/verify/abc123...

# Get attestation
curl http://localhost:3000/verify/abc123.../attestation
```

## Skill Format

Skills must include a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: my-skill
version: 1.0.0
description: Does something cool
runtime: node:20-alpine
test_command: ["npm", "test"]
test_deps: apk add --no-cache build-base
---

# My Skill

Documentation here...
```

### Required Fields

- `name` - Skill identifier
- `version` - Semantic version
- `description` - Brief description

### Optional Fields

- `runtime` - Docker base image (default: `alpine:latest`)
- `test_command` - Command to run tests (default: none)
- `test_deps` - Shell command to install test dependencies

## API Reference

### POST /verify

Submit a skill for verification.

**Request:**
```bash
# With file upload
curl -X POST http://localhost:3000/verify \
  -F "skill=@skill.tar.gz"

# With local path
curl -X POST http://localhost:3000/verify \
  -H "Content-Type: application/json" \
  -d '{"skillPath": "/path/to/skill"}'
```

**Response:**
```json
{
  "jobId": "abc123...",
  "status": "pending",
  "statusUrl": "/verify/abc123...",
  "message": "Verification job created"
}
```

### GET /verify/:jobId

Get verification status and results.

**Response:**
```json
{
  "jobId": "abc123...",
  "status": "completed",
  "createdAt": "2026-01-30T18:00:00.000Z",
  "startedAt": "2026-01-30T18:00:01.000Z",
  "completedAt": "2026-01-30T18:00:05.000Z",
  "result": {
    "skillId": "my-skill@1.0.0",
    "timestamp": "2026-01-30T18:00:05.000Z",
    "duration": 4000,
    "result": {
      "passed": true,
      "exitCode": 0,
      "stdout": "All tests passed!\n",
      "stderr": "",
      "duration": 3500
    },
    "attestation": {
      "quote": "0x...",
      "resultHash": "abc123...",
      "verifier": "skill-verifier/v0.1"
    },
    "manifest": {
      "name": "my-skill",
      "version": "1.0.0",
      "description": "Does something cool"
    }
  }
}
```

### GET /verify/:jobId/attestation

Get attestation only.

**Response:**
```json
{
  "jobId": "abc123...",
  "skillId": "my-skill@1.0.0",
  "timestamp": "2026-01-30T18:00:05.000Z",
  "passed": true,
  "attestation": {
    "quote": "0x...",
    "resultHash": "abc123...",
    "verifier": "skill-verifier/v0.1"
  }
}
```

### GET /jobs

List all verification jobs.

**Query Parameters:**
- `status` - Filter by status (`pending`, `running`, `completed`, `failed`)
- `limit` - Max results (default: 50)

**Response:**
```json
{
  "jobs": [
    {
      "id": "abc123...",
      "status": "completed",
      "createdAt": "2026-01-30T18:00:00.000Z",
      "completedAt": "2026-01-30T18:00:05.000Z",
      "skillId": "my-skill@1.0.0"
    }
  ],
  "total": 42
}
```

### DELETE /verify/:jobId

Delete a verification job.

### GET /health

Server health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-30T18:00:00.000Z",
  "jobs": {
    "total": 42,
    "pending": 2,
    "running": 1,
    "completed": 38,
    "failed": 1
  }
}
```

## CLI Usage

You can also use the verifier directly from the command line:

```bash
node verifier.js /path/to/skill
```

Results are saved to `work/skillname@version.json`.

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP POST /verify
       ▼
┌─────────────┐
│  API Server │ (Express)
└──────┬──────┘
       │ Create Job
       ▼
┌─────────────┐
│  Job Queue  │ (In-memory)
└──────┬──────┘
       │ Run Async
       ▼
┌─────────────┐
│  Verifier   │ (Node.js)
└──────┬──────┘
       │ Build & Run
       ▼
┌─────────────┐
│   Docker    │ (Isolated Container)
│   ┌─────┐   │
│   │Skill│   │
│   └─────┘   │
└──────┬──────┘
       │ Results
       ▼
┌─────────────┐
│ Attestation │ (Cryptographic Proof)
└─────────────┘
```

## Examples

See `/examples` for complete skill examples:
- `examples/hello-world` - Minimal passing skill
- `examples/node-app` - Node.js app with tests
- `examples/python-script` - Python with dependencies

## Development

### Run in Dev Mode

```bash
npm run dev  # Auto-restart on changes
```

### Environment Variables

- `PORT` - Server port (default: 3000)
- `DOCKER_HOST` - Docker daemon address (e.g., `tcp://host:2375`)

## Roadmap

- [ ] Real TEE attestations via dstack SDK
- [ ] Persistent job queue (Redis/SQLite)
- [ ] Webhook notifications
- [ ] Rate limiting
- [ ] Result caching
- [ ] Multi-step verification workflows
- [ ] Network isolation controls
- [ ] Resource limits (CPU/memory)

## License

MIT

## Contributing

Contributions welcome! This is an early prototype.
