# OpenClaw in dstack

Self-attesting TEE agent demonstrating encumbrance concepts and addressing the Genesis problem through pedagogical honesty.

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
├── Dockerfile                 # Container build (basic version)
├── Dockerfile.reproducible    # Reproducible build (Phase 3)
├── REPRODUCIBILITY.md         # Build reproducibility guide
├── docker-compose.yaml        # dstack service config
├── README.md                  # This file
├── config.yaml               # OpenClaw configuration (TODO)
└── workspace/                # Agent workspace
    ├── SOUL.md              # Self-attesting persona
    ├── tee-notes.md         # Reference materials
    └── scripts/
        └── get-attestation.sh
```

## Current Status

**Phase 1: Local Simulator** 🔄
- [x] Basic Dockerfile created (updated to use npm install -g openclaw)
- [x] docker-compose.yaml created
- [x] Project README created
- [x] config.yaml created (minimal webchat-only config)
- [ ] Test build locally
- [ ] Test with simulator
- [ ] Verify OpenClaw starts
- [ ] Test attestation fetching

**Phase 2: Briefing** ✅
- [x] Create SOUL.md (self-attesting persona + Genesis problem explanation)
- [x] Create workspace/tee-notes.md (reference materials)
- [x] Create workspace/scripts/get-attestation.sh (introspection tool)
- [ ] Test introspection capabilities (pending deployment)

**Phase 3: Reproducible Build** 🔄
- [x] Document reproducibility requirements (REPRODUCIBILITY.md)
- [x] Create Dockerfile.reproducible skeleton
- [ ] Get Node base image digest
- [ ] Pin OpenClaw version
- [ ] Test double-build locally
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

## How This Addresses the Genesis Problem

**The Genesis Problem:** How can an agent prove it wasn't compromised during initial setup? Someone had to boot it, give it credentials, configure it. How do we trust that process?

**Our Approach: Pedagogical Honesty**

Instead of claiming we "solved" genesis, we **demonstrate and explain** the different levels:

1. **Infrastructure Genesis (What we demonstrate)**
   - OpenClaw installed by operator
   - API keys provided by operator  
   - Container deployed to dstack TEE
   - Agent can explain its own setup process
   - Honest about operator control

2. **Account Encumbrance Genesis (TEE_HEE example)**
   - Initial credentials given to TEE
   - TEE changes password inside enclave
   - Critical window: human saw initial password
   - 7-day timed release for safety
   - Attestation proves password-change code ran
   - Honest about trust assumptions

3. **Pure Genesis (Future work)**
   - Agent creates identity from nothing
   - No human ever sees credentials
   - Requires agent-native identity systems
   - Or multi-party trusted setup ceremonies
   - Still an open research problem

**Why This Matters:**

The agent can teach users about different genesis models by embodying one of them. It can:
- Explain its own setup process
- Show what's proven vs what's trusted
- Compare to other approaches (TEE_HEE, future pure genesis)
- Help users understand trade-offs

This is pedagogical genesis - teaching by example, not by claiming perfection.

## References

- Main project plan: `../openclaw-in-dstack-plan.md`
- Research notes: `../tee-research-notes.md`
- dstack tutorial: `/tmp/dstack-tutorial`
- OpenClaw: https://github.com/openclaw/openclaw
- TEE_HEE (account encumbrance): https://nousresearch.com/setting-your-pet-rock-free/

## Next Steps

1. Test basic build: `docker build -t openclaw-dstack .`
2. Fix any build errors
3. Test with simulator
4. Create workspace materials (✅ DONE - SOUL.md updated with Genesis explanation)
5. Test agent conversations about TEE and Genesis problem
