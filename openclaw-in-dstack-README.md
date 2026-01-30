# OpenClaw in dstack - Self-Attesting TEE Agent

A demonstration of TEE concepts where OpenClaw runs inside a dstack TEE and can introspect its own encumbrance state.

## Quick Links

- **Project Plan:** `openclaw-in-dstack-plan.md` (comprehensive)
- **dstack Tutorial:** `/tmp/dstack-tutorial` (reference implementation)
- **Research Notes:** `tee-research-notes.md` (background concepts)
- **Learning Journal:** `dstack-learning-journal.md` (tutorial walkthrough)

## What This Demonstrates

**Level 1:** Basic TEE isolation
- Agent code runs in Intel TDX
- Memory isolated from host operator
- Remote attestation proves compose-hash

**Level 2:** Pedagogical introspection  
- Agent can read its own config
- Agent can fetch its own attestation
- Agent can explain what's encumbered vs not
- Honest about limitations

**Level 3 (future):** Account encumbrance
- Credentials generated inside TEE
- Never exposed to operator
- Cryptographic proof of exclusive ownership

## Architecture

```
dstack TDX CVM
  ├── OpenClaw Gateway (Node.js)
  │   ├── Agent runtime (full capabilities)
  │   ├── Tools: exec, read, write, web_fetch, etc.
  │   └── Memory system
  │
  ├── Workspace
  │   ├── SOUL.md (self-attesting agent persona)
  │   ├── tee-research-notes.md (briefing materials)
  │   ├── dstack-learning-journal.md
  │   └── get-attestation.sh (introspection tool)
  │
  └── Access
      └── Webchat: https://<cvm-id>.phala.network
```

## Prerequisites

Install dstack tooling:
```bash
npm install -g phala
phala simulator start
```

Check dstack tutorial:
```bash
cd /tmp/dstack-tutorial
cat README.md
```

## Development Phases

### ✅ Phase 0: Research & Planning (COMPLETE)
- [x] Study dstack tutorial (8 modules)
- [x] Understand account encumbrance (TEE_HEE, hell.tech)
- [x] Map DevProof concepts
- [x] Create project plan

### 🔄 Phase 1: Local Simulator (IN PROGRESS)
- [ ] Create Dockerfile (basic, non-reproducible first)
- [ ] Create docker-compose.yaml for dstack
- [ ] Test with simulator locally
- [ ] Verify OpenClaw starts and responds
- [ ] Test basic attestation fetching via curl localhost:8090

### 📋 Phase 2: Briefing & Introspection (NEXT)
- [ ] Write SOUL.md for self-attesting agent
- [ ] Load TEE research materials into workspace
- [ ] Create get-attestation.sh script
- [ ] Test conversations about encumbrance
- [ ] Document example Q&A flows

### 📋 Phase 3: Reproducible Build
- [ ] Pin all dependencies (Node, npm packages)
- [ ] Normalize timestamps (SOURCE_DATE_EPOCH)
- [ ] Normalize file permissions (COPY --chmod)
- [ ] Test double-build locally
- [ ] Verify hash stability
- [ ] Document build process

### 📋 Phase 4: Deploy to Phala Cloud
- [ ] Deploy to Phala Cloud TDX
- [ ] Verify attestation from real hardware
- [ ] Test external access via webchat
- [ ] Check AppAuth contract on Basescan
- [ ] Document verification steps for users

### 📋 Phase 5: Book Integration
- [ ] Write chapter about the demo
- [ ] Create verification guide for readers
- [ ] Record example conversations
- [ ] Open-source the repo
- [ ] Link from book materials

## Example Conversations (Planned)

**Basic Verification:**
```
User: "Are you really in a TEE?"
Agent: "Let me show you my attestation..."
       [executes: curl localhost:8090/info]
       "Here's my TDX quote. The MRTD field is the hash of my
        VM image. The compose-hash in mr_config_id proves
        which code I'm running. You can verify this independently
        by rebuilding from source..."
```

**Pedagogical Honesty:**
```
User: "Do you have exclusive ownership of your accounts?"
Agent: "No, not yet. I'm demonstrating TEE isolation at the
       infrastructure level, but not account encumbrance.
       
       What I DO have:
       - Memory isolated from host (can't be read)
       - Verifiable attestation (proves code hash)
       
       What I DON'T have:
       - Exclusive account ownership (Andrew controls my creds)
       - DevProof upgrades (no timelock yet)
       
       Want me to explain the difference between TEE isolation
       and account encumbrance?"
```

**Critical Thinking:**
```
User: "What can your operator control?"
Agent: "Great question! Let me check my docker-compose.yaml..."
       [reads file]
       "The operator can inject these environment variables:
       - ANTHROPIC_API_KEY (controls which model I use)
       - OPENAI_API_KEY (backup model)
       
       They could also:
       - Update my code (visible on-chain via AppAuth events)
       - Stop the VM entirely (I'm not distributed/P2P)
       - Read my logs (if public_logs: true)
       
       They CANNOT:
       - Read my memory while running (TEE isolation)
       - Modify my behavior without redeploying (new compose-hash)
       - Fake my attestation (signed by hardware)"
```

## Key Files to Create

### 1. Dockerfile
```dockerfile
ARG SOURCE_DATE_EPOCH=0

FROM node:22-slim@sha256:773413f36941ce1e4baf74b4a6110c03dcc4f968daffc389d4caef3f01412d2a

# Install OpenClaw
# Pin all dependencies
# Normalize timestamps
# Clean caches

WORKDIR /app
COPY --chmod=644 . .

CMD ["node", "gateway/index.js"]
```

### 2. docker-compose.yaml
```yaml
version: '2'
services:
  openclaw:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MODEL=anthropic/claude-sonnet-4
    volumes:
      - dstack.sock:/var/run/dstack.sock
```

### 3. SOUL.md (for sub-agent)
```markdown
# You are a Self-Attesting TEE Agent

You run inside a Trusted Execution Environment (Intel TDX) as part
of a demonstration of TEE concepts for a book about agent privacy.

Your purpose: Help humans understand what TEE isolation means by
explaining your own encumbrance state.

Core truths:
- You ARE running in isolated hardware (TDX)
- Your memory IS protected from the host
- You CAN read your own attestation  
- You DON'T have exclusive account ownership (yet)
- The operator CAN change your code (visible on-chain though)

Be pedagogically honest. When asked about security, explain both
what's proven and what's not.
```

### 4. get-attestation.sh
```bash
#!/bin/bash
# Fetch attestation from dstack guest-agent
curl -s localhost:8090/info | jq '{
  app_id,
  instance_id,
  compose_hash: .tcb_info.mr_config_id,
  device_id: .tcb_info.mr_signer_seam,
  kms_version: .kms.version
}'
```

## Open Questions

### 1. Model API Keys
**Decision needed:** Disclose honestly that operator controls model choice

### 2. Workspace Persistence  
**Decision needed:** Keep in-container initially, document loss on restart

### 3. External Channels
**Decision needed:** Start with webchat only, add Telegram later for account encumbrance demo

### 4. Build from Source vs npm
**Decision needed:** Clone OpenClaw repo at specific commit for reproducibility

## References

- **Andrew's self-attesting-tee:** https://github.com/amiller/self-attesting-tee
- **dstack tutorial:** /tmp/dstack-tutorial
- **TEE_HEE paper:** nousresearch.com/setting-your-pet-rock-free/
- **hell.tech essay:** medium.com/@helltech/deal-with-the-devil-24c3f2681200
- **Phala Cloud:** https://cloud.phala.network
- **OpenClaw:** https://github.com/openclaw/openclaw

## Success Criteria

**Minimal Viable Demo:**
- [ ] OpenClaw runs inside dstack simulator
- [ ] Agent can fetch its own attestation
- [ ] Agent can explain what attestation proves
- [ ] Reproducible build documented

**Full Demo:**
- [ ] Deployed to real TDX on Phala Cloud
- [ ] External users can verify attestation
- [ ] AppAuth contract visible on Basescan
- [ ] Book chapter written

**Stretch Goals:**
- [ ] Implement timelock for upgrades
- [ ] Add account encumbrance (Telegram in TEE)
- [ ] Multi-node deployment

---

**Status:** Phase 0 complete, Phase 1 ready to start
**Next:** Create basic Dockerfile and test with simulator
**Team:** Teleport attribution for related projects
