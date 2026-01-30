# Claude Code Logs Dataset Summary

## Overview

| Metric | Value |
|--------|-------|
| **Total Records** | 41,435 |
| **Unique Sessions** | 122 |
| **Unique Projects** | 103 |
| **Date Range** | 2025-12-20 to 2026-01-22 (33 days) |
| **Normalized Size** | 27 MB |
| **Sources** | 2 machines (laptop + remote) |

### Record Composition

| Role | Count | Notes |
|------|-------|-------|
| Assistant | 27,680 | ~5,000 with text content, rest are tool-only |
| User | 13,755 | ~2,000 with substantive text |

### Model Usage

| Model | Count |
|-------|-------|
| claude-opus-4-5-20251101 | 26,855 (97%) |
| claude-haiku-4-5-20251001 | 816 |

---

## Project Categories

### TEE/Dstack (57 projects, 30,158 records — 73%)

The core strength of this dataset. Deep coverage of dstack development, deployment, and debugging across two development machines.

| Project | Records | Focus Area |
|---------|---------|------------|
| xordi-dev-deployment | 4,656 | Production deployment, debugging auth flows |
| dstack-tutorial | 1,960 | Tutorial development, pedagogical explanations |
| xordi-tokscope | 1,903 | TikTok scraping in TEE, Playwright in enclave |
| 01-attestation-and-reference-values | 1,691 | Attestation verification, RTMR, reference values |
| 04-gateways-and-tls | 1,336 | TLS termination, Let's Encrypt in CVM, tproxy |
| dstack-examples | 1,264 | Official examples repo work |
| 05-onchain-oracle | 1,230 | Oracle patterns, on-chain price feeds from TEE |
| borgcube-playwright | 1,091 | Browser automation in TEE |
| tutorial | 1,016 | Dstack examples, hands-on exercises |
| teleport | 910 | Main project coordination |
| research-update | 857 | Research synthesis, dstack architecture |
| 01-attestation | 812 | Core attestation concepts |
| 03-gateway-and-tls | 809 | Gateway configuration |
| 05-onchain-authorization | 776 | AppAuth contracts, compose_hash, salt mechanism |
| claude-for-chrome | 713 | Chrome extension for Claude |
| hermes | 682 | Shared notebook / messaging system |
| dstack-ingress | 618 | Ingress controller, DNS automation |
| 09-extending-appauth | 511 | Extended authorization patterns |
| 08-lightclient | 493 | Ethereum light client in TEE |
| zkemailclaim | 468 | ZK email + TEE alternative approaches |
| attestation-with-sdk | 415 | SDK-based attestation |
| 01a-reproducible-builds | 339 | Deterministic Docker builds, bitrot protection |
| talos | 329 | Talos OS exploration |
| refs | 318 | Reference materials |
| 01-attestation-oracle | 285 | Oracle attestation patterns |
| workbench-tools | 336 | Development tooling |
| *31 more projects* | 3,376 | Various TEE experiments |

#### TEE Topic Coverage

| Topic | Records | Key Concepts |
|-------|---------|--------------|
| Docker & Builds | 1,410 | compose files, Dockerfile patterns, image building |
| Gateway & Networking | 1,099 | tproxy, port mapping, ingress, routing |
| Phala Cloud | 952 | CVM deployment, provisioning, cloud dashboard |
| Attestation & Verification | 754 | RTMR3, quotes, measurement, TDX attestation |
| TLS & Certificates | 684 | Let's Encrypt, ACME, certificate management |
| On-chain Integration | 522 | Smart contracts, oracles, blockchain verification |
| Keys & KMS | 430 | Key derivation, secrets, encryption, KMS replication |
| Reproducibility | 153 | Deterministic builds, vendoring, bitrot |

---

### Crypto/ZK (23 projects, 7,405 records — 18%)

Related blockchain and cryptography work, often intersecting with TEE.

| Project | Records | Description |
|---------|---------|-------------|
| logger-setup | 1,700 | Logging infrastructure |
| lark-practice | 814 | Lark API integration |
| lark-telegram-bridge | 784 | Bidirectional Lark↔Telegram bot bridge |
| helios | 655 | Ethereum light client setup, RPC configuration |
| scripts | 638 | Utility scripts, DKIM analysis for zkEmail |
| logs | 567 | Log analysis tooling |
| bluetooth-watchy | 396 | BLE proxy for smartwatch, Android integration |
| tiktok-reminder | 360 | TikTok automation |
| promptceo | 339 | Prompt engineering |
| fc26 | 193 | Conference-related work |
| infoarb | 158 | Information arbitrage |
| circuits | 120 | ZK circuits (circom for zkEmail) |

---

### Other (12 projects, 3,872 records — 9%)

Hardware projects, games, and experiments.

| Project | Records | Description |
|---------|---------|-------------|
| watchy | 1,337 | E-paper smartwatch firmware, ESP32-S3 development |
| githubgame | 1,177 | GitHub-based game with PR mechanics |
| android | 724 | Android app development for Watchy companion |
| seconddemo | 184 | Demo project |
| watch-control | 138 | Watch control interface |
| feedling-responder | 138 | Feed response system |

---

## Content Quality Metrics

| Metric | Count | % of Total |
|--------|-------|------------|
| Substantive explanations (>500 chars) | 1,140 | 2.8% |
| Structured content (## or **) | 1,416 | 3.4% |
| Debug/troubleshooting content | 1,224 | 3.0% |
| Code examples (has ```) | 692 | 1.7% |
| User questions (has ?) | 455 | 1.1% |

### Content Volume

| Type | Size |
|------|------|
| Assistant text content | 1.9 MB |
| User text content | 0.8 MB |
| **Total text for RAG** | **2.7 MB** |

---

## Multi-Machine Coverage

The dataset merges logs from two development machines with 205 content duplicates removed.

### Projects from Remote Machine

New projects added from remote that weren't on laptop:
- `dstack-examples` (1,264) — official examples repo
- `claude-for-chrome` (713) — Chrome extension
- `hermes` (682) — shared notebook system
- `attestation-with-sdk` (415) — SDK attestation
- `talos` (329) — Talos OS
- `01-attestation-oracle` (285) — oracle attestation
- `astali-tx` (205) — transaction handling
- `fc26` (193) — conference work
- `infoarb` (158) — information arbitrage
- `feedling-responder` (138) — feed responses
- `mcp-server` (112) — MCP server development

---

## Unique Value Propositions

### 1. Expert Debugging Patterns
Real troubleshooting sessions with error → investigation → fix patterns. Example topics:
- "My attestation verification is failing" → traced to RTMR3 vs config_id mismatch
- "TLS cert not serving" → tproxy port configuration issue
- "CVM won't start" → compose_hash not whitelisted in AppAuth

### 2. Architectural Explanations
Claude's explanations of *why* things work, not just *what* to do:
- How compose_hash is computed from salt + image + config
- The relationship between KMS, AppAuth, and attestation
- Why reproducible builds matter for TEE trust

### 3. Multi-Angle Coverage
Same concepts explored across different projects:
- Attestation covered in 01-attestation, tutorial, xordi-dev, research-update, attestation-with-sdk
- TLS covered in 04-gateways-and-tls, 03-gateway-and-tls, dstack-ingress
- Provides multiple explanations at different depths

### 4. Real Questions from an Expert
User questions show expert-level thinking:
- "is there code for verifying this abstracted elsewhere?"
- "how does the full library handle those two rtmr3 and config id options?"
- "can we specify a common app id in order to launch a replica?"

---

## Challenges for Q&A Product

### Privacy Design Needed
- Project paths reveal directory structure
- URLs to Phala dashboard contain deployment UUIDs
- Some content may reference private infrastructure

### Retrieval Optimization
- Basic keyword matching works but semantic search would help
- Many records are tool-only (no text) — should filter
- Context threading (parentUuid) not currently exploited

### Noise Filtering
- "Warmup" messages, file listings, tool calls with no explanatory value
- Session summaries are high-signal, could be prioritized

---

## Recommendation

**This dataset is a strong foundation for a TEE/Dstack expert Q&A system.**

Core strengths:
- 30k+ records of TEE-focused development across 57 projects
- Deep coverage of attestation, TLS, on-chain integration, KMS
- Real debugging patterns not found in documentation
- Expert-level Q&A pairs
- Multi-machine coverage adds breadth

The TEE-sandboxed expert system concept is particularly apt: using TEE to protect access to knowledge about TEE development. The sensitive parts (exact paths, dashboard URLs) can be abstracted or redacted while preserving the technical content value.
