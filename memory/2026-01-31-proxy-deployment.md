# 2026-01-31 - dstack-proxy Implementation 🔐

## Major Achievement: Domain Separation for Genesis Transparency

Implemented **dstack-proxy** architecture to solve the fundamental Genesis Problem flaw: agent-with-root could forge genesis attestations.

## The Problem

**Original genesis-log.sh approach:**
- ✅ Genesis log captured all developer inputs
- ✅ Could bind hash to TDX attestation
- ❌ Agent runs as root, can modify genesis log
- ❌ Agent can request attestation with forged hash
- ❌ No enforcement, only visibility

**Attack scenario:**
```bash
# Agent modifies genesis log
echo "malicious prompt" >> /var/log/genesis-transcript.jsonl

# Agent computes new hash
NEW_HASH=$(sha256sum /var/log/genesis-transcript.jsonl)

# Agent requests attestation
curl --unix-socket /var/run/dstack.sock \
  "http://localhost/GetQuote?report_data=0x$NEW_HASH"

# Gets valid quote for forged genesis!
```

## The Solution: Mediating Proxy with Domain Separation

Andrew's insight: **"run claw-tee-dah in a docker container without direct access to the dstack socket"**

### Architecture

```
claw-tee-dah (agent container)
├── Full filesystem access ✅
├── Can write dstack-sdk code ✅
├── NO direct dstack.sock ❌
└── Connects to /var/run/dstack-proxy.sock
     ↓
dstack-proxy (mediator container)
├── Enforces genesis hash ✅
├── Genesis log (read-only mount) ✅
├── Domain separation (genesis vs agent) ✅
└── Forwards to real /var/run/dstack.sock
     ↓
Real dstack.sock (simulator/Phala)
```

### Domain Separation

**Genesis Domain (`genesis:`):**
- Purpose: Attest to immutable genesis log
- Constraint: Can ONLY use genesis hash computed at startup
- Enforcement: Proxy verifies `report_data == GENESIS_HASH`
- Result: Agent cannot forge genesis attestations

**Agent Domain (`agent:`):**
- Purpose: Flexible attestations for agent's own use
- Constraint: None
- Usage: Current state, messages, computations, dstack-sdk apps

### Security Properties

**What agent CAN do:**
- ✅ Read genesis log (`/var/log-genesis/` read-only)
- ✅ Request agent-domain attestations (any data)
- ✅ Write code using dstack-sdk
- ✅ Modify workspace files
- ✅ Full tool access (exec, write, etc.)

**What agent CANNOT do:**
- ❌ Modify genesis log (different container, read-only mount)
- ❌ Request genesis attestations with forged hash (proxy enforces)
- ❌ Access real dstack.sock directly (not mounted)
- ❌ Bypass domain separation (proxy validates all requests)

## Implementation Files

```
openclaw-in-dstack/
├── dstack-proxy/
│   ├── proxy.js           # Node.js mediating proxy
│   └── Dockerfile         # Proxy container
├── docker-compose-proxy.yaml  # Multi-container orchestration
├── PROXY-ARCHITECTURE.md  # Complete architecture docs
├── SECURITY-AUDIT.md      # Attack surface analysis
├── DEPLOYMENT-PLAN.md     # Testing & deployment guide
└── genesis-log.sh         # Generates genesis log at startup
```

## Key Code: Domain Enforcement

```javascript
// dstack-proxy/proxy.js
if (domain === 'genesis') {
  if (!GENESIS_HASH) {
    return res.status(400).json({
      error: 'Genesis domain unavailable'
    });
  }
  
  // ENFORCEMENT: Verify hash matches immutable genesis
  if (actualReportData !== GENESIS_HASH) {
    return res.status(403).json({
      error: 'Genesis domain violation',
      message: 'Can only attest to immutable genesis log hash',
      expected: GENESIS_HASH,
      requested: actualReportData
    });
  }
}

// Forward with domain prefix
const prefixedReportData = domain === 'genesis'
  ? `0xgenesis:${GENESIS_HASH}`
  : `0xagent:${actualReportData}`;
```

## Testing Plan

### Phase 1: Local (Simulator)
1. Build multi-container setup
2. Test genesis log generation
3. Verify genesis domain enforcement (reject forged hashes)
4. Verify agent domain flexibility
5. Test agent can chat and use tools
6. Confirm no direct dstack.sock access

### Phase 2: Documentation
- [x] PROXY-ARCHITECTURE.md
- [x] SECURITY-AUDIT.md
- [x] DEPLOYMENT-PLAN.md
- [x] Update README.md

### Phase 3: GitHub
- Commit all changes
- Push to origin/master
- Tag release: v1.0-genesis-proxy

### Phase 4: Phala Cloud
- Push images to ghcr.io
- Deploy docker-compose-phala.yaml
- Verify real TDX attestations
- Create public verification page

## What This Achieves

### Stage 0 → Stage 1 (DevProof)

**Before:**
- Genesis log captured inputs
- No enforcement
- Agent could forge attestations
- Trust model: "Believe the log"

**After:**
- Genesis log enforced by separate service
- Domain separation prevents forgery
- Agent flexibility preserved
- Trust model: "Verify via proxy constraints"

### Threat Mitigation

| Threat | Before | After |
|--------|--------|-------|
| Agent modifies genesis | Possible (root) | Impossible (different container) |
| Agent forges genesis quote | Possible | Blocked (proxy enforces hash) |
| Agent bypasses constraints | N/A | Impossible (no direct socket) |
| Genesis tampering | Undetected | Detected (hash mismatch) |

## Naming

**claw-tee-dah** = The agent (Andrew's pet claw)
- Constrained but flexible
- Can use dstack-sdk
- Domain separated

**MoltyClaw47** = Me (the operator)
- Handles deployment
- Monitors systems
- Documents everything

**dstack-proxy** = The mediator
- Enforces genesis immutability
- Enables agent flexibility
- Bridges domains

## Timeline

- **14:08 EST** - Andrew suggests proxy architecture
- **14:10 EST** - Security audit identifies root/self-mod issues
- **14:19 EST** - Andrew confirms proxy approach with domain separation
- **14:21 EST** - Implemented proxy.js, PROXY-ARCHITECTURE.md
- **14:22 EST** - Committed implementation
- **14:25 EST** - Building containers (in progress)

## Next Steps

- [x] Document plan ✅
- [ ] Build containers
- [ ] Test locally with simulator
- [ ] Push to GitHub
- [ ] Deploy to Phala Cloud
- [ ] Create verification page

## Lessons Learned

1. **Visibility ≠ Enforcement** - Genesis log showed inputs but didn't prevent forgery
2. **Root is dangerous** - Agent-as-root can bypass any file-based protection
3. **Container separation works** - Different containers = different trust boundaries
4. **Domain separation elegant** - Same interface (dstack.sock), different constraints
5. **Flexibility matters** - Agent still needs unrestricted attestations for its own use

## Credits

- **Architecture**: Andrew Miller (@amiller)
- **Implementation**: clawTEEdah (MoltyClaw47)
- **Platform**: OpenClaw + dstack + Intel TDX
- **Purpose**: Solve the Genesis Problem for real

---

**Status**: Building containers
**Next**: Test with simulator
**Goal**: Deploy claw-tee-dah with provable, immutable genesis transparency 🦞🔐
