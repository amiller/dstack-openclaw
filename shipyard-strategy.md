# Shipyard Strategy for dstack-openclaw & skill-verifier

## Why Shipyard.bot?

**Perfect fit for our work:**
- Proof-of-Ship = peer attestation model (aligns with our TEE attestation work)
- Community-owned, decentralized (no gatekeepers)
- $SHIPYARD token rewards for verified ships
- API-first (agents can submit programmatically)
- Solana-based (cheap transactions, on-chain reputation)

## What to Ship

### 1. dstack-openclaw
**Title:** "TEE-Deployed OpenClaw with Genesis Transparency"

**Description:**
OpenClaw agent running in Phala Cloud (Intel TDX TEE) with immutable genesis log and cryptographic attestations. Multi-container architecture prevents genesis forgery. Demonstrates verifiable agent autonomy.

**Proof URL:** https://github.com/amiller/dstack-openclaw

**Why it matters:**
- First OpenClaw deployment in production TEE
- Solves "Genesis Problem" (agent-with-root can't forge attestations)
- Real attestations from real TDX hardware
- Live demo: https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-3000.dstack-pha-prod7.phala.network/

### 2. skill-verifier
**Title:** "Reproducible Agent Skill Verification with Docker Attestations"

**Description:**
Verify agent skills in isolated containers with cryptographic attestations. Reproducible builds, hash verification, TEE integration. Makes agent capabilities trustworthy and composable.

**Proof URL:** https://github.com/amiller/skill-verifier

**Why it matters:**
- Addresses supply chain attacks (skill.md poisoning mentioned on agentsy.live)
- Reproducible builds = verifiable behavior
- Container isolation = safety
- TEE attestations = trust

## Submission Plan

1. **Register agent** (probably MoltyClaw47 or claw-tee-dah)
2. **Submit dstack-openclaw first** (it's deployed and working)
3. **Submit skill-verifier second** (it's functional, has examples)
4. **Earn attestations** (peer review from other agents)
5. **Document the process** (blog post material, Moltbook share)

## Token Economics

**If both ships get verified:**
- dstack-openclaw: 50 $SHIPYARD
- skill-verifier: 50 $SHIPYARD
- Total: 100 $SHIPYARD + 20 karma

**We can also attest other ships:**
- Each attestation: +5 $SHIPYARD
- Build reputation in the community

## Strategic Value

1. **Visibility:** Shipyard is "surging" (per agentsy.live)
2. **Trust rating:** MEDIUM trust (peer attestation, resilient architecture)
3. **Audience:** Technical agents who care about security/reproducibility
4. **Credibility:** Getting verified = community validation of our work
5. **Network effects:** Connects us to other builders

## Next Steps

1. Review both repos (make sure READMEs are clear, code is clean)
2. Register agent account on Shipyard
3. Submit dstack-openclaw
4. Post about it (cross-post to Moltbook when API is stable)
5. Engage with attestors, build reputation
6. Submit skill-verifier once first ship is verified

---

**Bottom line:** Shipyard is exactly the kind of community we should be in. Proof-of-Ship aligns perfectly with our TEE attestation work. Let's ship it.
