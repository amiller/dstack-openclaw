# OpenClaw in dstack - TEE Demonstration

**claw-tee-dah**: A self-attesting OpenClaw agent with genesis transparency, running in Intel TDX.

## 🚀 Production Status

**Deployed:** Phala Cloud (Intel TDX)  
**CVM ID:** `407ebf2a-2b9a-4601-8ed2-d1aa6c5cdae3`  
**Genesis Hash:** `d5e73baa7f26cfc92a07d4520c57e10e61523e12a1d9c77e59bf00bfdd911703`  
**Versions:**
- claw-tee-dah: v0.0.2 (ghcr.io/amiller/openclaw-dstack@sha256:2b995068...)
- dstack-proxy: v0.0.3 (ghcr.io/amiller/dstack-proxy@sha256:ccc75f92...)

**Endpoints:**
- Chat UI: https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-3000.dstack-pha-prod7.phala.network/
- Genesis Log: https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-3000.dstack-pha-prod7.phala.network/genesis
- Attestation: https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-3000.dstack-pha-prod7.phala.network/attestation

## Overview

- ✅ Multi-container architecture with domain separation
- ✅ Genesis transparency enforced by mediating proxy  
- ✅ Deployed to Phala Cloud (Intel TDX)
- ✅ Currently running: v0.0.2 (claw-tee-dah) + v0.0.3 (proxy)
- 🔗 **Live:** https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-3000.dstack-pha-prod7.phala.network/
- 📋 [Deployment Guide](PHALA-DEPLOYMENT.md) | [Implementation Plan](IMPLEMENTATION-PLAN.md)
- 🔐 **[Verification Guide](VERIFICATION-GUIDE.md)** - How to audit genesis transparency

## Quick Start (Local Testing with Simulator)

```bash
# Start dstack simulator
npx phala@latest simulator start

# Build and start multi-container setup
docker compose -f docker-compose-proxy.yaml up -d

# Check logs
docker logs claw-tee-dah  # OpenClaw agent
docker logs dstack-proxy  # Mediating proxy

# Test domain separation
GENESIS_HASH=$(docker logs dstack-proxy 2>&1 | grep "Genesis log hash:" | cut -d' ' -f4)
docker exec claw-tee-dah curl --unix-socket /var/run/dstack-proxy.sock \
  "http://localhost/GetQuote?report_data=0xgenesis:$GENESIS_HASH"  # ✅ Should succeed

docker exec claw-tee-dah curl --unix-socket /var/run/dstack-proxy.sock \
  "http://localhost/GetQuote?report_data=0xgenesis:deadbeef"  # ❌ Should fail (forged)

# Stop
docker compose -f docker-compose-proxy.yaml down
```

## Architecture: Domain Separation for Genesis Transparency

```
┌─────────────────────────────────────────┐
│  claw-tee-dah Container                 │
│  (OpenClaw Agent - Constrained)         │
│                                         │
│  ✅ Can: Read genesis log (read-only)   │
│  ✅ Can: Request agent attestations     │
│  ✅ Can: Write code, use tools          │
│  ❌ Cannot: Modify genesis log          │
│  ❌ Cannot: Forge genesis attestations  │
│  ❌ Cannot: Access real dstack.sock     │
│                                         │
│  Connects to:                           │
│  /var/run/dstack-proxy.sock ────────┐  │
└─────────────────────────────────────│───┘
                                      │
                                      ↓
┌─────────────────────────────────────────┐
│  dstack-proxy Container                 │
│  (Mediator - Enforces Domains)          │
│                                         │
│  Genesis Domain (genesis:)              │
│  - Immutable genesis log hash           │
│  - Only accepts correct hash            │
│  - Rejects forged attestations          │
│                                         │
│  Agent Domain (agent:)                  │
│  - Flexible attestations                │
│  - No constraints                       │
│                                         │
│  Forwards to:                           │
│  /var/run/dstack.sock ──────────────┐  │
└─────────────────────────────────────│───┘
                                      │
                                      ↓
                          Real dstack.sock
                          (Simulator or Phala TDX)
```

**Key Innovation:** The proxy enforces genesis immutability at the protocol level. Even though the agent runs as root, it cannot forge genesis attestations because the proxy mediates all access to the real dstack socket.

See [PROXY-ARCHITECTURE.md](PROXY-ARCHITECTURE.md) for complete design details.

## Attestation

### Local Environment (with Simulator)
```bash
# Start dstack simulator
npx phala@latest simulator start

# Test attestation
docker exec openclaw-in-dstack-openclaw-1 \
  curl --unix-socket /var/run/dstack.sock \
  'http://localhost/GetQuote?report_data=0xtest'
```

Returns mock TDX quote with:
- `report_data`: Your hex input
- `event_log`: Boot/initialization events (IMRs)
- `quote`: Base64-encoded attestation
- X.509 certificates for verification

### Production (Phala Cloud TDX)

**Ready to deploy?** See [PHALA-DEPLOYMENT.md](PHALA-DEPLOYMENT.md) for complete instructions.

**Summary:**
1. Push images to ghcr.io (GitHub Container Registry)
2. Upload `docker-compose-phala.yaml` to Phala Cloud
3. Configure environment variables (ANTHROPIC_API_KEY)
4. Deploy and verify attestations

Once deployed, genesis attestations prove:
- ✅ **Complete developer inputs**: 100% of initialization captured
- ✅ **Immutable by agent**: Domain separation enforces genesis hash
- ✅ **Hardware isolation**: Intel TDX proves code runs in secure enclave
- ✅ **Transparent upgrades**: All changes logged on-chain (future: Base KMS)

See [ATTESTATION.md](./ATTESTATION.md) for attestation format details.

## Agent Persona

The containerized agent is a **TEE pedagogical tool** that:
- Explains confidential computing concepts
- Demonstrates the Genesis problem
- Can self-attest (in production TEE)
- Discusses hardware-enforced privacy vs account encumbrance

Ask it about:
- "What is the Genesis problem?"
- "Explain your TEE capabilities"
- "How would you prove your identity?"

## Configuration

- **Model**: claude-3-5-haiku-20241022 (low-cost for demos)
- **Auth**: ANTHROPIC_API_KEY via environment variable
- **Gateway**: loopback bind, demo-token
- **Workspace**: `/root/.openclaw/workspace`

## Files

```
openclaw-in-dstack/
├── Dockerfile              # Container build
├── docker-compose.yaml     # Deployment config  
├── .env                    # API keys (git-ignored)
├── workspace/              # Agent workspace
│   ├── SOUL.md            # TEE pedagogy persona
│   └── tee-notes.md       # Reference materials
├── README.md              # This file
└── ATTESTATION.md         # Attestation guide
```

## Deployment to Phala Cloud

### 1. Push to Registry

```bash
# Tag for registry
docker tag openclaw-dstack:latest ghcr.io/YOUR_ORG/openclaw-dstack:latest

# Push
docker push ghcr.io/YOUR_ORG/openclaw-dstack:latest
```

### 2. Deploy to TDX

Upload `docker-compose.yaml` to Phala Cloud dashboard:
- https://dstack.phala.network (production)
- Encrypted environment variables automatically handled
- dstack-guest-agent provides TDX attestations

### 3. Test Attestation

Once deployed, the agent can self-attest:

```
Human: "Generate a TDX attestation for yourself"

Agent:
1. Reads its config
2. Computes sha256(config)  
3. Requests quote from dstack
4. Returns verifiable proof
```

## Lessons Learned

**Config Validation:**
- OpenClaw validates config strictly
- Use `gateway.mode="local"` in config
- Pass flags via CMD: `--bind loopback --port 3000`

**API Key Setup:**
- Must create `auth-profiles.json` in agent directory
- Use entrypoint script to populate from env var
- Format: `{"version":1,"profiles":{"anthropic:env":{"type":"token","provider":"anthropic","token":"sk-ant-..."}}}`

**Docker Caching:**
- Cache expensive layers (apt-get, npm install)
- Only bust cache for config changes
- Use build args or timestamps for cache busting

## Next Steps

- [ ] Push to container registry
- [ ] Deploy to Phala Cloud TDX
- [ ] Test real attestations
- [ ] Demo self-attesting agent conversations
- [ ] Integrate with AppAuth contract (optional)

## Resources

- [dstack GitHub](https://github.com/Phala-Network/dstack)
- [Phala Cloud](https://dstack.phala.network)
- [OpenClaw Docs](https://docs.openclaw.ai)

---

**Built with:** OpenClaw + dstack + Intel TDX  
**Purpose:** TEE education and autonomous agent demonstrations  
**Status:** Ready for production TEE deployment 🦞🔐
