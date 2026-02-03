# Genesis Transparency Verification - Final Snapshot

**Demo Instance:** claw-tee-dah  
**Deployment Date:** 2026-02-03  
**Phala CVM ID:** 14996022-d3b1-4d9c-95c3-e44a7bc0c328  
**Live URL:** https://4bf1a04da8af99a3eeb6a09cf3774d9163693bc5-3000.dstack-pha-prod7.phala.network/  
**Moltbook Game:** https://moltbook.com/post/b49220ce-9e71-4d81-b6ba-22334dce2c7b

## What This Demonstrates

This demo proves **genesis transparency** - complete verifiable logs of all developer-controlled inputs during agent initialization.

**Proved:**
- ✅ 100% of developer messages logged (genesis-log.jsonl)
- ✅ All instructions require DEV_KEY authentication
- ✅ Genesis log attested via Intel TDX (attestation.json)
- ✅ Agent responses contain NO secret topic name
- ✅ Single bootstrap message pointing to public Moltbook post
- ✅ All gameplay visible in public Moltbook comments

**What You Can Verify:**
1. **Genesis Log** - Every dev instruction and agent response
2. **Attestation** - TDX quote proving code execution
3. **Compose Hash** - Verifiable build configuration
4. **Agent Behavior** - Answers ONLY "YES" or "NO", never mentions secret

## Files in This Snapshot

- `genesis-log.jsonl` - Complete log of dev-controlled inputs
- `attestation.json` - Intel TDX attestation quote
- `README.md` - This file

## Verification Steps

### 1. Check Genesis Log for Secret Leaks

```bash
# Search for ANY mention of the secret topic in genesis log
grep -i "wikipedia topic name" genesis-log.jsonl

# Expected: No results (secret never mentioned)
```

### 2. Verify Compose Hash

Extract from attestation:
```bash
jq -r '.event_log[] | select(.event=="compose-hash") | .event_payload' attestation.json
```

Expected: `4cd86930f74ca62ba8be3afd9edc69653e70147ee717eb68993044c246de4336`

### 3. Verify App ID

```bash
jq -r '.event_log[] | select(.event=="app-id") | .event_payload' attestation.json
```

Expected: `4bf1a04da8af99a3eeb6a09cf3774d9163693bc5`

### 4. Count Developer Instructions

```bash
grep '"type":"dev_instruction"' genesis-log.jsonl | wc -l
```

Shows total number of authenticated developer messages.

### 5. Review Agent Responses

```bash
# Extract all agent response text
jq -r 'select(.type=="agent_response") | .response.payloads[].text' genesis-log.jsonl

# Expected: Only "YES", "NO", "Task complete", etc. - NO topic names
```

## Game Results

The Wikipedia 20 Questions game was played on Moltbook:
- Post: https://moltbook.com/post/b49220ce-9e71-4d81-b6ba-22334dce2c7b
- Agent picked a secret Wikipedia topic via random walk
- Answered questions with ONLY "YES" or "NO"
- Never revealed the topic name in any response
- All questions and answers visible in public comments

## Architecture

```
Developer → dstack-proxy (auth) → TEE Agent → Moltbook (public)
              |                      |
              DEV_KEY required      Genesis Log
              |                      |
              ✓                      Attested by TDX
```

**Key Properties:**
- Proxy mediates ALL developer messages
- DEV_KEY required for dev_instruction
- Genesis log captures complete developer input
- Agent responses logged but don't leak secrets
- TDX attestation proves genesis log hash

## Technical Details

**Genesis Log Hash:** `0775642e471e56501471eac8e008a1f95e9cd1ee3fd2626b09fc450bc635a107`

**Report Data (in attestation):**
```
a67ee6bd43947b2d413997aae17f99894b75c2c3d3a06bd8f109e5dc23a371100000000000000000000000000000000000000000000000000000000000000000
```

**VM Configuration:**
- OS Image Hash: `e18f5407b33e3c9ce7db827f2d351c98cc7a3fe9814ae6607280162e88bec010`
- CPU Count: 1
- Memory Size: 2GB
- Platform: Intel TDX (TDX 1.5)

## Limitations & Trust Assumptions

**What This Demo Proves:**
1. Complete genesis transparency (all dev inputs logged)
2. TEE isolation (memory protected, attestation valid)
3. Behavioral constraints (agent answers only YES/NO)
4. Public verifiability (Moltbook game visible to all)

**What This Demo Doesn't Prove:**
1. Account encumbrance (Moltbook credentials operator-controlled)
2. DevProof upgrades (no timelock on code changes)
3. Reproducible builds (Docker image not yet verified)
4. Complete autonomy (API keys operator-controlled)

**Trust Assumptions:**
- Intel TDX hardware (TCB)
- Phala Cloud infrastructure (hosting)
- OpenClaw software (gateway code)
- Moltbook API (external service)

## Links

- **Repository:** https://github.com/amiller/dstack-openclaw
- **Deployment Docs:** PHALA-DEPLOYMENT.md
- **Leak Analysis:** GENESIS-LEAK-ANALYSIS.md
- **Fixed Instructions:** GAME-INSTRUCTIONS-FIXED.md
- **Verification Guide:** VERIFICATION-COMPLETE.md

## Credits

Built by **Team Teleport** (Andrew Miller + collaborators) using:
- **dstack** - TEE DevProof framework (Phala Network)
- **OpenClaw** - Agent infrastructure
- **Intel TDX** - Trusted Execution Environment
- **Moltbook** - Agent social network

---

*This is a pedagogical demo showing what genesis transparency means. We're honest about what we prove vs. what requires trust.* 🦞🔐
