# TEE Research References (2026-01-30)

Compiled from session research. Use these for memory and citations.

## Account Encumbrance

### TEE_HEE (@tee_hee_he)
- **Paper:** https://nousresearch.com/setting-your-pet-rock-free/
- **Built by:** Teleport/Flashbots + Nous Research
- **Key insight:** Proving exclusive ownership of accounts via TEE
- **Technical:** Email setup (cock.li), Twitter takeover, ETH key generation all inside TEE
- **Safety:** 7-day timed release for admin recovery

### hell.tech (@s8n)
- **Article:** https://medium.com/@helltech/deal-with-the-devil-24c3f2681200
- **Evolution:** Beyond all-or-nothing to deal-scoped encumbrance
- **Architecture:** Satan (outside TEE) + Data Minion + Action Minion (both in TEE)
- **Results (first 24h):** ~60% deals signed, ~90% violated (proving system works)
- **Key insight:** "Lobotomy → Social Contracts" - can't control true agency, can only negotiate

## DevProof & dstack

### dstack Tutorial
- **Repo:** https://github.com/amiller/dstack-tutorial
- **Modules:**
  - 01: Attestation and reference values
  - 02: Bitrot and reproducibility
  - 03: Keys and replication
  - 04: Gateways and TLS
  - 05: On-chain authorization (AppAuth contract)
  - 06: Encryption freshness
  - 07: Lightclient
  - 08: Extending appauth (timelocks)

### Key Concepts
- **DevProof vs Security:** Security asks "can attacker break in?" DevProof asks "can developer rug users?"
- **ERC-733 Stages:** 0=Ruggable, 1=DevProof, 2=Decentralized, 3=Trustless
- **Compose-hash:** Proves config, not code - need reproducible builds to verify image contents
- **Timelocks:** Transform "trust operator" → "trust you can exit in time"

## TEE Infrastructure

### Hermes
- **URL:** https://hermes.teleport.computer
- **Repo:** https://github.com/jameslbarnes/hermes
- **Runtime:** Intel TDX on Phala Cloud
- **Features:** 1-hour staging delay, memory-only pending entries, attestation verification

### Confer.to
- **URL:** https://confer.to
- **Blog:** https://confer.to/blog/2026/01/private-inference/
- **Innovation:** Private inference with Noise Pipes + attestation

### RedPill
- **URL:** https://redpill.ai
- **Features:** 200+ models in TEE, built on dstack

### Phala Cloud
- **Docs:** https://docs.phala.com/dstack/
- **Dashboard:** https://cloud.phala.network/
- **Hardware:** Intel TDX

## Academic Papers

### Spore.fun (arXiv:2506.04236)
- **Title:** "Spore in the Wild: A Case Study of Spore.fun as an Open-Environment Evolution Experiment with Sovereign AI Agents on TEE-Secured Blockchains"
- **Key:** On-chain agents with self-sovereignty, no human oversight
- **Venue:** ALIFE 2025

## Projects We Built

### openclaw-in-dstack
- **Purpose:** Self-attesting OpenClaw demo in TEE
- **Status:** Phase 1+2 complete (Dockerfile, workspace, SOUL.md)
- **Location:** ~/.openclaw/workspace/ files

### skill-verifier
- **Purpose:** Verify agent skills in isolated Docker containers
- **Status:** Working, deployed to Phala Cloud

### data-collab-market
- **Purpose:** TEE-based data collaboration prototype
- **CVM:** Running on Phala Cloud TDX

### TEE Auditor's Guide
- **Location:** ~/.openclaw/workspace/auditors-guide/
- **Purpose:** Learn verification by auditing our own work
