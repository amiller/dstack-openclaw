# dstack-proxy: Domain Separation Architecture

## Problem

The Genesis transparency log had a critical flaw: **the agent runs as root and can modify the genesis log**, then request attestations with the forged hash.

**Attack:**
1. Agent modifies `/var/log/genesis-transcript.jsonl`
2. Agent computes new hash
3. Agent requests: `curl --unix-socket /var/run/dstack.sock http://localhost/GetQuote?report_data=0x<new_hash>`
4. Gets valid quote for forged genesis → transparency broken!

## Solution: Mediating Proxy with Domain Separation

```
┌─────────────────────────────────────────┐
│  claw-tee-dah container                 │
│  (agent, constrained)                   │
│                                         │
│  ✅ Full filesystem access              │
│  ✅ Can write code using dstack-sdk     │
│  ✅ Can request agent-domain quotes     │
│  ❌ No direct dstack.sock access        │
│  ❌ Cannot forge genesis quotes         │
│                                         │
│  Talks to /var/run/dstack-proxy.sock   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  dstack-proxy container                 │
│  (mediator, enforces constraints)       │
│                                         │
│  - Mimics dstack.sock interface         │
│  - Enforces domain separation           │
│  - Genesis domain: Immutable hash only  │
│  - Agent domain: Flexible attestations  │
│                                         │
│  Access to:                             │
│  - Real dstack.sock (simulator/prod)    │
│  - Genesis log (read-only mount)        │
└─────────────────────────────────────────┘
              ↓
        Real /var/run/dstack.sock
```

## Domain Separation

The proxy enforces two domains via `report_data` prefixes:

### Genesis Domain (`genesis:`)

**Purpose:** Attest to immutable genesis log

**Constraints:**
- Can ONLY attest to genesis log hash computed at startup
- Genesis log is mounted read-only from shared volume
- Agent cannot modify genesis log (different container)
- Agent cannot request genesis quotes with different data

**Usage:**
```bash
# Request genesis attestation
curl --unix-socket /var/run/dstack-proxy.sock \
  'http://localhost/GetQuote?report_data=0xgenesis:<hash>'

# Proxy checks: hash == GENESIS_HASH
# If match → forwards to real dstack.sock
# If mismatch → 403 Forbidden
```

**report_data in quote:**
```
genesis:<actual_genesis_hash>
```

### Agent Domain (`agent:`)

**Purpose:** Flexible attestations for agent's own use

**Constraints:**
- None! Agent has full flexibility
- Can request quotes with any `report_data`
- Can use dstack-sdk for custom attestations
- Can attest to current workspace state, messages, etc.

**Usage:**
```bash
# Request agent attestation
curl --unix-socket /var/run/dstack-proxy.sock \
  'http://localhost/GetQuote?report_data=0xagent:<anything>'

# Proxy forwards directly
```

**report_data in quote:**
```
agent:<agent_provided_data>
```

## Startup Sequence

### 1. Genesis Log Generation
```bash
# In claw-tee-dah container CMD
/usr/local/bin/genesis-log.sh
# Writes to /var/log/genesis-transcript.jsonl
# Volume mount shares this with dstack-proxy
```

### 2. Proxy Initialization
```javascript
// dstack-proxy startup
const genesisContent = fs.readFileSync('/var/log/genesis-transcript.jsonl');
const GENESIS_HASH = sha256(genesisContent);
console.log(`Genesis hash locked: ${GENESIS_HASH}`);
```

### 3. Agent Startup
```bash
# Agent starts with genesis log already immutable
# Cannot modify it (read-only mount from shared volume)
# Can only read it: /var/log-genesis/genesis-transcript.jsonl
```

## Verification Flow

### User Wants to Verify Genesis

```bash
# 1. Get genesis log from agent (read-only view)
docker exec claw-tee-dah cat /var/log-genesis/genesis-transcript.jsonl > genesis-local.jsonl

# 2. Compute hash locally
EXPECTED_HASH=$(sha256sum genesis-local.jsonl | cut -d' ' -f1)

# 3. Request genesis attestation from proxy
docker exec claw-tee-dah curl --unix-socket /var/run/dstack-proxy.sock \
  "http://localhost/GetQuote?report_data=0xgenesis:$EXPECTED_HASH"

# 4. Verify quote
# - Check domain == "genesis"
# - Check report_data == "genesis:<expected_hash>"
# - Verify TDX signature
```

**What this proves:**
- ✅ Genesis log is authentic (proxy verified hash at startup)
- ✅ Agent cannot forge genesis attestations (proxy enforces)
- ✅ Current genesis log matches attested hash
- ✅ No hidden developer prompts (genesis log is complete)

### Agent Wants to Attest to Current State

```bash
# Agent can freely attest to anything in agent domain
CURRENT_STATE_HASH=$(sha256sum /root/.openclaw/workspace/*.md)

docker exec claw-tee-dah curl --unix-socket /var/run/dstack-proxy.sock \
  "http://localhost/GetQuote?report_data=0xagent:$CURRENT_STATE_HASH"
```

**Use cases:**
- Attest to current workspace state
- Attest to message log hash
- Attest to computation result
- Custom dstack-sdk applications

## Docker Compose Architecture

```yaml
services:
  dstack-proxy:
    volumes:
      # Real dstack socket (simulator or production)
      - /home/node/.phala-cloud/simulator/0.5.3/dstack.sock:/var/run/dstack.sock:ro
      # Genesis log (read-only, from shared volume)
      - genesis-log:/var/log:ro
      # Proxy socket (agent connects here)
      - proxy-socket:/var/run-proxy

  claw-tee-dah:
    volumes:
      # Proxy socket ONLY (no real dstack.sock!)
      - proxy-socket:/var/run:rw
      # Genesis log (read-only view)
      - genesis-log:/var/log-genesis:ro

volumes:
  genesis-log:    # Shared, immutable after startup
  proxy-socket:   # Shared communication channel
```

## Security Properties

### What the Agent CAN Do

- ✅ Read genesis log (via `/var/log-genesis/`)
- ✅ Request agent-domain attestations (any `report_data`)
- ✅ Write code using dstack-sdk
- ✅ Modify its own workspace files
- ✅ Attest to current state in agent domain

### What the Agent CANNOT Do

- ❌ Modify genesis log (read-only mount, different container)
- ❌ Request genesis attestations with forged hash (proxy enforces)
- ❌ Access real dstack.sock directly (not mounted)
- ❌ Bypass domain separation (proxy validates all requests)
- ❌ Fool verifiers about genesis (proxy hash is canonical)

## Threat Model

| Attack | Defense |
|--------|---------|
| Agent modifies genesis log | Genesis log in separate container, read-only mount |
| Agent requests forged genesis quote | Proxy checks hash against startup value, rejects mismatch |
| Agent bypasses proxy | No direct dstack.sock mount, must use proxy |
| Compromise proxy container | Would need separate container escape exploit |
| Replay old genesis log | Genesis log hash includes timestamp, verifiable |

## Implementation Files

```
openclaw-in-dstack/
├── dstack-proxy/
│   ├── proxy.js              # Node.js proxy server
│   └── Dockerfile            # Proxy container
├── docker-compose-proxy.yaml # Multi-container setup
├── genesis-log.sh            # Runs in agent, outputs to shared volume
└── PROXY-ARCHITECTURE.md     # This file
```

## Usage

### Start System

```bash
cd openclaw-in-dstack
docker-compose -f docker-compose-proxy.yaml up -d
```

### Request Genesis Attestation

```bash
# From host
GENESIS_HASH=$(docker exec claw-tee-dah sha256sum /var/log-genesis/genesis-transcript.jsonl | cut -d' ' -f1)

docker exec claw-tee-dah curl --unix-socket /var/run/dstack-proxy.sock \
  "http://localhost/GetQuote?report_data=0xgenesis:$GENESIS_HASH" | jq .
```

### Request Agent Attestation

```bash
# Agent can attest to anything
MY_DATA_HASH="deadbeef1234567890"

docker exec claw-tee-dah curl --unix-socket /var/run/dstack-proxy.sock \
  "http://localhost/GetQuote?report_data=0xagent:$MY_DATA_HASH" | jq .
```

## Advantages Over Direct Access

| Direct dstack.sock | dstack-proxy |
|-------------------|--------------|
| Agent can forge genesis | ✅ Genesis enforced by proxy |
| No domain separation | ✅ Clear genesis vs agent domains |
| Trust agent | ✅ Verify via proxy constraints |
| Single point of failure | ✅ Separate containers |

## Future Enhancements

### 1. Chat Log Domain

Add third domain for message chain:

```javascript
const DOMAIN_CHAT = 'chat:';
// Proxy maintains message hash chain
// Agent can append but not rewrite
```

### 2. Multi-Party Genesis

Require multiple proxies to agree on genesis hash:

```javascript
// Threshold signature over genesis hash
// N proxies, M must agree
```

### 3. On-Chain Anchoring

Proxy publishes genesis hash to blockchain:

```javascript
// At startup, proxy submits:
// contract.recordGenesis(containerID, genesisHash, timestamp)
```

### 4. Audit Logging

Proxy logs all requests:

```javascript
// Immutable log of all quote requests
// Shows agent behavior over time
```

## Production Deployment

On Phala Cloud:

1. **Replace simulator socket** with real dstack.sock
2. **Genesis domain** proves developer inputs in TDX
3. **Agent domain** allows flexible attestations
4. **Verifiers** can trust genesis without trusting agent

---

**Status:** Architecture designed, implementation complete
**Next:** Test with simulator, then deploy to Phala Cloud
**Security:** Genesis transparency with enforcement, not just visibility
