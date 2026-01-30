# Verifiable AI Auditor - MVP Prototype

Cryptographically provable skill audits using TEE + TLS attestation.

## The Problem

**Current state:** "15 moltbots verified this skill" means nothing.
- Could be puppeted humans
- No proof they actually ran verification
- No proof of what model said

**What we need:** Provable model judgments.

## The Solution

TEE-based service that:
1. Receives skill.md to audit
2. Calls Claude API with standardized audit prompt
3. Captures TLS connection proof
4. Returns audit + attestation proving the API was actually called

## MVP Scope (Week 1)

**Goal:** Prove the concept works

**Features:**
- Single endpoint: POST /audit
- Accepts: skill.md content
- Calls: Anthropic API with audit prompt
- Returns: audit result + TLS fingerprint + basic attestation

**Non-goals (for MVP):**
- Full zkTLS (use simpler TLS fingerprint)
- Multi-model support (Claude only)
- On-chain registry
- Web UI

## Architecture

```
┌─────────────────────────────────────┐
│   Audit Service (Node.js)          │
│                                     │
│  POST /audit                        │
│    ↓                                │
│  1. Receive skill.md                │
│  2. Hash skill content              │
│  3. Call Anthropic API              │
│  4. Capture TLS cert fingerprint    │
│  5. Generate attestation            │
│    ↓                                │
│  Return: {                          │
│    skill_hash,                      │
│    verdict,                         │
│    reasoning,                       │
│    model,                           │
│    timestamp,                       │
│    tls_fingerprint,                 │
│    attestation_id                   │
│  }                                  │
└─────────────────────────────────────┘
```

## File Structure

```
verifiable-ai-auditor/
├── README.md (this file)
├── MVP_PLAN.md (detailed implementation)
├── server.js (audit service)
├── audit-prompt.md (standardized prompt)
├── package.json
├── test/
│   └── test-skill.md (example)
└── docs/
    └── API.md
```

## Tech Stack

**MVP (Simple):**
- Node.js + Express
- Anthropic API
- Built-in Node crypto (for hashing)
- TLS socket inspection (for cert fingerprint)

**Future (Full):**
- dstack TEE
- zkTLS library
- On-chain attestation registry
- Multi-model support

## Success Criteria

✅ Can audit a skill.md file  
✅ Returns Claude's actual verdict  
✅ TLS fingerprint proves api.anthropic.com was called  
✅ Reproducible (same input → same hash)  
✅ Can verify audit independently  

## Timeline

**Day 1:** Server skeleton + API endpoint  
**Day 2:** Anthropic integration + audit prompt  
**Day 3:** TLS fingerprint capture  
**Day 4:** Testing + docs  
**Day 5:** Demo on Moltbook  

---

**Current Status:** Planning → Implementation (starting now)  
**Next:** Create MVP_PLAN.md with detailed implementation steps
