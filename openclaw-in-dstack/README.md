# OpenClaw in dstack

Self-attesting TEE agent demonstrating encumbrance concepts.

## Quick Start (Local Simulator)

### Prerequisites
```bash
# Install dstack tools
npm install -g phala
phala simulator start
```

### Build and Run
```bash
# Build the image
docker build -t openclaw-dstack .

# Run with simulator
phala simulator run openclaw-dstack

# Or use docker-compose
export ANTHROPIC_API_KEY=your_key_here
docker-compose up
```

### Test Attestation
```bash
# From inside container
curl localhost:8090/info | jq

# Get compose-hash
curl localhost:8090/info | jq -r '.tcb_info.mr_config_id'
```

## Project Structure

```
openclaw-in-dstack/
├── Dockerfile              # Container build (basic version)
├── docker-compose.yaml     # dstack service config
├── README.md              # This file
├── config.yaml            # OpenClaw configuration (TODO)
└── workspace/             # Agent workspace (TODO)
    ├── SOUL.md           # Self-attesting persona
    ├── tee-notes.md      # Reference materials
    └── scripts/
        └── get-attestation.sh
```

## Current Status

**Phase 1: Local Simulator** 🔄
- [x] Basic Dockerfile created
- [x] docker-compose.yaml created
- [x] Project README created
- [ ] Test build
- [ ] Test with simulator
- [ ] Verify OpenClaw starts
- [ ] Test attestation fetching

**Phase 2: Briefing** ✅
- [x] Create SOUL.md (self-attesting persona)
- [x] Create workspace/tee-notes.md (reference materials)
- [x] Create workspace/scripts/get-attestation.sh (introspection tool)
- [ ] Test introspection capabilities (pending deployment)

**Phase 3: Reproducible Build** 📋
- [ ] Pin all dependencies
- [ ] Normalize timestamps
- [ ] Verify hash stability

**Phase 4: Deploy** 📋
- [ ] Deploy to Phala Cloud
- [ ] Verify real TDX attestation

## Development Notes

### Non-Reproducible Elements (Phase 1)
- Using latest OpenClaw from git
- Not pinning npm package versions
- No timestamp normalization
- No permission normalization

### Operator Control (Being Honest)
The operator controls:
- Model API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY)
- Code updates (visible on-chain via AppAuth)
- VM lifecycle (start/stop)

The operator CANNOT:
- Read agent memory while running (TEE isolation)
- Modify behavior without redeployment (new compose-hash)
- Fake attestation (hardware-signed)

## References

- Main project plan: `../openclaw-in-dstack-plan.md`
- Research notes: `../tee-research-notes.md`
- dstack tutorial: `/tmp/dstack-tutorial`
- OpenClaw: https://github.com/openclaw/openclaw

## Next Steps

1. Test basic build: `docker build -t openclaw-dstack .`
2. Fix any build errors
3. Test with simulator
4. Create workspace materials
5. Test agent conversations about TEE
