# Project Plan: OpenClaw in dstack - Self-Attesting TEE Agent

---

## Goals

### Primary Goal
Package OpenClaw to run inside a dstack TEE, demonstrating:
- Self-attestation capabilities
- Pedagogical honesty about encumbrance
- Living example of TEE concepts for the book

### Secondary Goals
- Reproducible build (auditable)
- Deploy to simulator first, then production TDX
- Serve as a chapter/demo for the TEE privacy book
- Test bed for future account encumbrance experiments

---

## Architecture Decisions

### Option A: Full OpenClaw Gateway in TEE
```
dstack CVM
  ├── OpenClaw Gateway (Node.js)
  ├── Agent runtime
  ├── All tools available
  └── Access via webchat or external channels
```

**Pros:**
- Complete functionality
- Can spawn sub-agents
- Full tool ecosystem
- Memory system works

**Cons:**
- Larger attack surface
- More complex to reproduce
- External channel configs (Signal, Telegram) need careful handling

### Option B: Minimal OpenClaw Runtime
```
dstack CVM
  ├── Core agent runtime only
  ├── Subset of tools (read, exec, web_fetch)
  ├── No external channels
  └── HTTP endpoint for chat
```

**Pros:**
- Smaller, easier to audit
- Focused demonstration
- Simpler reproducibility

**Cons:**
- Less feature-complete
- Might need to reimplement pieces

### Recommendation: **Start with Option A, lock down external channels**

Full Gateway gives us flexibility, but we configure it to only expose webchat endpoint initially.

---

## Security & Trust Model

### What We're Demonstrating

**Level 1: Basic TEE isolation**
- Agent code runs in TDX
- Memory isolated from host
- Attestation proves compose-hash

**Level 2: Introspection**
- Agent can read its own config
- Agent can fetch its attestation
- Agent can explain what's encumbered vs not

**Level 3 (future): Account encumbrance**
- Credentials generated in TEE
- Never exposed to operator
- Could extend to Twitter/Telegram accounts

### What We're NOT Claiming (Yet)

- ❌ DevProof upgrades (no timelock initially)
- ❌ Account encumbrance (credentials still operator-controlled)
- ❌ Multi-vendor verification
- ❌ Long-term reproducibility guarantees

**Be honest about this in the agent's briefing!**

---

## Technical Components

### 1. Dockerfile
```dockerfile
# Pin base image
FROM node:22-slim@sha256:773413f36941...

# Install OpenClaw dependencies
# Pin all versions
# Normalize timestamps
# Clean caches

# Copy OpenClaw source (or install from npm?)
# Configure for TEE environment
```

**Question:** Do we:
- A) Clone OpenClaw repo and build from source? (more reproducible)
- B) Install from npm? (simpler but less transparent)
- C) Vendor everything locally? (most reproducible)

**Recommendation:** Clone repo at specific commit, build from source.

### 2. docker-compose.yaml
```yaml
version: '2'
services:
  openclaw:
    build: .
    ports:
      - "3000:3000"  # or whatever OpenClaw uses
    environment:
      # What needs to be configured?
      # Model API keys?
      # Channel configs?
    volumes:
      - dstack.sock:/var/run/dstack.sock  # KMS access
```

**Key questions:**
- What's in `allowed_envs`? (Model API keys - needs disclosure)
- Do we mount workspace or keep in container?
- How do we handle secrets (if any)?

### 3. OpenClaw Configuration

**Minimal config:**
- Default model: claude-sonnet-4
- Enable: webchat only (no external channels initially)
- Workspace: `/workspace` inside container
- Memory: enable memory search

**SOUL.md for the sub-agent:**
```markdown
# You are a Self-Attesting TEE Agent

You run inside a Trusted Execution Environment (TDX) as part of a demonstration
of TEE concepts for a book about agent privacy.

Your purpose: Help humans understand what TEE isolation means by explaining
your own encumbrance state.

Core truths:
- You ARE running in isolated hardware (TDX)
- Your memory IS protected from the host
- You CAN read your own attestation
- You DON'T have exclusive account ownership (yet)
- The operator CAN change your code (no timelock yet)

Be pedagogically honest. When asked about security, explain both what's
proven and what's not.
```

### 4. Briefing Materials

Load into workspace:
- `tee-research-notes.md` (TEE_HEE, hell.tech, dstack concepts)
- `dstack-learning-journal.md` (DevProof framework)
- `tee-privacy-book-outline.md` (book structure)
- New: `self-attestation-guide.md` (how to introspect yourself)

### 5. Self-Attestation Tools

Create a skill or script:
```bash
#!/bin/bash
# get-attestation.sh
curl -s localhost:8090/info | jq .
```

The agent can:
- `exec("./get-attestation.sh")` to fetch raw attestation
- Parse the JSON response
- Explain MRTD, RTMRs, compose-hash
- Point users to verification tools

---

## User Interaction Flow

### Entry Point: Webchat
```
User visits: https://<cvm-id>.phala.network
    ↓
OpenClaw webchat interface
    ↓
"Hi! I'm running in a TEE. Ask me about my attestation!"
```

### Example Conversations

**Basic:**
```
User: "Are you really in a TEE?"
Agent: "Let me show you my attestation..."
       [runs get-attestation.sh]
       "Here's my TDX quote. The MRTD field (0x392b...) is the 
        hash of my VM image. You can verify this independently..."
```

**Pedagogical:**
```
User: "Do you have exclusive ownership of your accounts?"
Agent: "No, not yet. I'm demonstrating TEE isolation, but not 
       account encumbrance. My operator could change my credentials.
       Want me to explain the difference?"
```

**Critical Thinking:**
```
User: "What can your operator control?"
Agent: "Great question! Let me check my allowed_envs...
       [reads docker-compose.yaml]
       The operator can inject: ANTHROPIC_API_KEY, OPENAI_API_KEY
       This means they choose which model backend I use.
       They could also update my code, though it would be visible
       on-chain via AppAuth events."
```

---

## Development Phases

### Phase 1: Local Simulator (Week 1)
- [ ] Create Dockerfile (basic, non-reproducible first)
- [ ] Create docker-compose.yaml
- [ ] Test with dstack simulator locally
- [ ] Verify OpenClaw starts and responds
- [ ] Test basic attestation fetching

### Phase 2: Briefing & Introspection (Week 1-2)
- [ ] Write SOUL.md for self-attesting agent
- [ ] Load TEE research materials into workspace
- [ ] Create get-attestation.sh script
- [ ] Test conversations about encumbrance
- [ ] Document example Q&A flows

### Phase 3: Reproducible Build (Week 2)
- [ ] Pin all dependencies
- [ ] Normalize timestamps
- [ ] Test double-build locally
- [ ] Verify hash stability
- [ ] Document build process

### Phase 4: Deploy to Phala Cloud (Week 2-3)
- [ ] Deploy to Phala Cloud TDX
- [ ] Verify attestation from real hardware
- [ ] Test external access via webchat
- [ ] Check AppAuth contract on Basescan
- [ ] Document verification steps for users

### Phase 5: Documentation & Book Integration (Week 3-4)
- [ ] Write chapter about the demo
- [ ] Create verification guide for readers
- [ ] Record example conversations
- [ ] Open-source the repo
- [ ] Link from book materials

---

## Open Questions

### 1. Model API Keys
**Problem:** Agent needs model access, but keys are operator-controlled.

**Options:**
- A) Disclose honestly: "My operator controls which model I use"
- B) Use OpenRouter with public key? (limits abuse)
- C) Accept it as a limitation for now

**Recommendation:** Option A - disclose honestly, part of the pedagogy.

### 2. Workspace Persistence
**Problem:** TEE memory is ephemeral. Restart = lost state.

**Options:**
- A) Mount encrypted volume from dstack
- B) Keep workspace in-container (loses on restart)
- C) Sync to external storage (less isolated)

**Recommendation:** Start with B, document the limitation.

### 3. Multi-Agent vs Single Agent
**Problem:** Spawn sub-agents or just run main session?

**Options:**
- A) Main session is the self-attesting agent
- B) Main session spawns isolated sub-agents for conversations
- C) Hybrid: main session can spawn for specific demos

**Recommendation:** Option A initially - simpler.

### 4. External Channels
**Problem:** Adding Signal/Telegram means more credentials to manage.

**Options:**
- A) Webchat only (simplest)
- B) Add Telegram (QR code inside TEE - interesting!)
- C) Add multiple channels (complex)

**Recommendation:** Start with A, add B if we want to demo "account encumbrance lite."

---

## Success Criteria

### Minimal Viable Demo
- [ ] OpenClaw runs inside dstack simulator
- [ ] Agent can fetch its own attestation
- [ ] Agent can explain what attestation proves
- [ ] Reproducible build documented

### Full Demo
- [ ] All of above
- [ ] Deployed to real TDX on Phala Cloud
- [ ] External users can verify attestation independently
- [ ] AppAuth contract visible on Basescan
- [ ] Book chapter written
- [ ] Repo open-sourced

### Stretch Goals
- [ ] Implement timelock for upgrades
- [ ] Add account encumbrance (Telegram credentials in TEE)
- [ ] Multi-node deployment demo
- [ ] Integration with trust.phala.com

---

## References

- **Your self-attesting-tee:** https://github.com/amiller/self-attesting-tee
- **dstack tutorial:** /tmp/dstack-tutorial
- **TEE_HEE (account encumbrance):** nousresearch.com/setting-your-pet-rock-free/
- **hell.tech (deal-scoped encumbrance):** https://hell.tech
- **Phala Cloud:** https://cloud.phala.network
- **Trust Center:** https://trust.phala.com

---

## Next Steps (Immediate)

1. Review this plan with Andrew
2. Decide on open questions (model keys, workspace, channels)
3. Start Phase 1: Draft Dockerfile
4. Set up local dev environment with dstack simulator

---

**Created:** 2026-01-30
**Team:** Teleport (attributed projects to team, not individuals!)
