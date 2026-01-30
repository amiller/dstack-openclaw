# Deploying Skill Verifier to dstack TEE

This guide walks through deploying skill-verifier to a real Intel TDX TEE using dstack/Phala Cloud.

## Prerequisites

1. **Phala Cloud Account**: Sign up at https://cloud.phala.network
2. **dstack CLI**: Install from dstack repo
3. **Docker**: Running locally for testing

## Step 1: Test Locally (No TEE)

```bash
# Install dependencies
npm install

# Start server
npm start

# In another terminal, verify a skill
curl -X POST http://localhost:3000/verify \
  -H "Content-Type: application/json" \
  -d '{"skillPath": "./examples/hello-world"}'

# Check result (use jobId from response)
curl http://localhost:3000/verify/<jobId>
```

**Expected:** Attestation will have `verifier: "none"` since we're not in TEE yet.

## Step 2: Build for dstack

Create `dstack-compose.yml`:

```yaml
version: '3'
services:
  skill-verifier:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - ./:/app:ro
      - /var/run/docker.sock:/var/run/docker.sock
      - /var/run/dstack.sock:/var/run/dstack.sock
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DSTACK_SOCKET=/var/run/dstack.sock
    command: sh -c "apk add --no-cache docker-cli && npm install --production && npm start"
```

Key differences from local compose:
- Mount `/var/run/dstack.sock` for TEE SDK access
- Add docker-cli to image (for running verification containers)
- Production npm install

## Step 3: Deploy to Phala Cloud

```bash
# Login to Phala Cloud
dstack login

# Build and deploy
dstack app create skill-verifier ./dstack-compose.yml

# Get deployment URL
dstack app list
```

Your skill-verifier is now running in Intel TDX with real attestation!

## Step 4: Verify with Real Attestation

```bash
# Use your deployment URL
VERIFIER_URL=https://your-app.phala.network

# Submit skill for verification
curl -X POST $VERIFIER_URL/verify \
  -H "Content-Type: application/json" \
  -d '{"skillPath": "./examples/hermes-verified"}'

# Get result
curl $VERIFIER_URL/verify/<jobId>
```

**Expected attestation:**
```json
{
  "attestation": {
    "quote": "0x...",
    "eventLog": "{...}",
    "resultHash": "abc123...",
    "verifier": "dstack-sdk",
    "teeType": "intel-tdx"
  }
}
```

## Step 5: Verify the Attestation

Anyone can verify the TEE quote:

```bash
# Get the attestation
curl $VERIFIER_URL/verify/<jobId>/attestation > attestation.json

# Extract quote
cat attestation.json | jq -r '.attestation.quote' > quote.hex

# Verify using dstack verifier
dstack-verify --quote quote.hex
```

This proves:
1. The verification ran in genuine Intel TDX hardware
2. The result hash is bound to the TEE quote
3. Nobody (including you) could fake the result

## Architecture in TEE

```
┌────────────────────────────────────────────┐
│           Intel TDX CVM                    │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │   Skill Verifier API                 │ │
│  │   (your Node.js server)              │ │
│  └────────────┬─────────────────────────┘ │
│               │                            │
│               ├─→ dstack SDK               │
│               │   (/var/run/dstack.sock)   │
│               │   • getQuote(resultHash)   │
│               │   • Returns TDX quote      │
│               │                            │
│               └─→ Docker Daemon            │
│                   (runs skill tests)       │
│                                            │
└────────────────────────────────────────────┘
        ↓ Quote
    [Anyone can verify using public Intel certs]
```

## Troubleshooting

**"No TEE available"**
- Check `/var/run/dstack.sock` exists
- Verify deployment is on TDX hardware (not simulator)

**"Docker not found"**
- Add `apk add docker-cli` to command in compose

**Skill verification fails**
- Check Docker socket is mounted and accessible
- Verify skill has valid SKILL.md manifest

## Production Hardening

1. **Rate limiting**: Add rate limits to prevent abuse
2. **Auth**: Require API keys for verification requests
3. **Storage**: Persist jobs to database instead of memory
4. **Monitoring**: Add metrics/logging for attestation health
5. **Caching**: Cache verified skills to reduce redundant work

## Next Steps

- Integrate with ClawdHub for automatic skill verification
- Add web UI for submitting skills
- Store attestations on-chain for public audit trail
- Support multi-model consensus (verify with multiple CVMs)
