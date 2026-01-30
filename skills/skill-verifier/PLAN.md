# Skill Verifier Implementation Plan

## Overview
Build a skill verification service using dstack that can:
1. Accept skill packages (tarball with manifest)
2. Run skill tests in isolated TEE containers
3. Return cryptographically-attested verification results

## Architecture

### Components
1. **Verifier Service** - REST API accepting skill verification requests
2. **Test Runner** - Executes skill tests in isolated container
3. **Attestation Generator** - Uses dstack SDK to create TEE proofs
4. **Result Reporter** - Formats and returns verification results

### Flow
```
[Skill Package] → [Verifier API] → [Extract & Validate Manifest]
                                           ↓
                                    [Build Test Container]
                                           ↓
                                    [Run Tests in TEE]
                                           ↓
                                    [Collect Results]
                                           ↓
                                    [Generate Attestation]
                                           ↓
                                    [Return Signed Result]
```

## Implementation Phases

### Phase 1: Local Development with Simulator
**Goal:** Get basic verifier working with dstack simulator

**Steps:**
1. Set up dstack simulator locally
2. Build simple verifier service (Node.js + @phala/dstack-sdk)
3. Implement skill package extraction
4. Run tests in Docker container
5. Generate basic attestation

**Challenges:**
- Docker-in-docker setup (may need help)
- Simulator socket permissions
- Container networking

### Phase 2: Attestation & Verification
**Goal:** Produce verifiable TEE proofs

**Steps:**
1. Hash test results
2. Generate TDX quote with result hash
3. Include full event log
4. Create structured attestation document
5. Add verification instructions

**Output Format:**
```json
{
  "skillId": "weather@1.0.0",
  "timestamp": "2025-05-28T18:00:00Z",
  "result": {
    "passed": true,
    "exitCode": 0,
    "stdout": "...",
    "stderr": "...",
    "duration": 1234
  },
  "attestation": {
    "quote": "0x...",
    "eventLog": [...],
    "rtmrs": {...},
    "resultHash": "sha256:..."
  },
  "verifier": {
    "instanceId": "...",
    "appId": "...",
    "tcbInfo": {...}
  }
}
```

### Phase 3: API & Integration
**Goal:** Make it usable from skill-creator

**Steps:**
1. REST API endpoints:
   - POST /verify - submit skill for verification
   - GET /verify/:id - check verification status
   - GET /attestation/:id - download attestation
2. Async job queue for long-running tests
3. Result caching
4. Integration with skill-creator workflow

### Phase 4: Production Deployment
**Goal:** Deploy to real Phala network

**Steps:**
1. Get Phala API key
2. Build production docker-compose.yaml
3. Deploy to dstack
4. Configure TLS ingress
5. Set up monitoring

## Technical Details

### Skill Manifest Requirements
```yaml
name: weather
version: 1.0.0
entrypoint: ./weather.sh
test:
  command: npm test
  timeout: 30s
  environment:
    - NODE_ENV=test
```

### Test Runner Container
- Based on skill's declared runtime (node, python, etc.)
- Isolated network (no internet by default)
- Resource limits (CPU, memory)
- Timeout enforcement
- Stdout/stderr capture

### Security Considerations
- Validate manifest schema before running
- Sanitize all inputs
- Prevent path traversal in skill extraction
- Resource limits to prevent DoS
- No secrets in test environment (unless explicitly declared)

## Development Roadmap

### Week 1: Simulator Setup
- [ ] Build dstack simulator
- [ ] Test basic SDK operations
- [ ] Verify quote generation works
- [ ] Document setup process

### Week 2: Verifier Core
- [ ] Implement skill package extraction
- [ ] Build test runner with Docker
- [ ] Integrate dstack SDK
- [ ] Generate attestations

### Week 3: API & Integration
- [ ] Build REST API
- [ ] Add job queue
- [ ] Integrate with skill-creator
- [ ] Write documentation

### Week 4: Production
- [ ] Deploy to Phala network
- [ ] Load testing
- [ ] Security audit
- [ ] Public launch

## Next Steps (Immediate)
1. Build dstack simulator
2. Test with simple "hello world" attestation
3. Report back on any blockers
