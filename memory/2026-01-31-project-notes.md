# Project Notes - 2026-01-31

## Projects Progress

### 1. dstack-openclaw (OpenClaw in TEE)
**Status:** ✅ DEPLOYED to Phala Cloud

**What we built:**
- OpenClaw agent (claw-tee-dah) running in Intel TDX TEE
- Multi-container architecture: dstack-proxy + claw-tee-dah
- Genesis transparency: immutable log at /var/log-genesis/genesis-transcript.jsonl
- Domain separation prevents agent from forging genesis attestations
- Production deployment: https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-3000.dstack-pha-prod7.phala.network/

**Key learnings:**
- Genesis Problem: agent-with-root can forge attestations if not properly isolated
- Solution: Separate dstack-proxy container controls genesis log, agent gets read-only mount
- HTTP endpoints only for attestations prevents forgery
- Real TDX quotes work in Phala Cloud production
- Private learning demo: claw-tee-dah can autonomously research topics without operator knowing

**Documentation:**
- PHALA-DEPLOYMENT.md - Complete deployment guide
- PROXY-ARCHITECTURE.md - Multi-container design
- SECURITY-AUDIT.md - Attack surface analysis
- GENESIS.md - Genesis transparency concept

**Next steps:**
- Wait for claw-tee-dah's private research to complete
- Test knowledge of secret topic to prove autonomous learning
- Post improved Moltbook content when API stable
- Implement GitHub Actions CI (Issue #2)
- Document reproducible builds (Issue #3)

### 2. skill-verifier
**Status:** ✅ FUNCTIONAL, ready for community use

**What it is:**
- Verify agent skills in isolated Docker containers
- Cryptographic attestations of test results
- REST API for integration
- TEE-ready architecture

**Repository:** https://github.com/amiller/skill-verifier

**Examples:**
- hello-world - Minimal passing skill
- node-app - Node.js with tests
- python-script - Python with dependencies
- hermes-verified - Full Hermes skill verification (6/6 tests passed)

**Applied to:**
- ✅ ClawNews skill (manual verification, graded A, 92/100)

**Key learnings:**
- Docker isolation is straightforward and effective
- Manifest in YAML frontmatter is clean, readable
- Skills without executable tests need manual review methodology
- Verification reports should include: manifest validation, documentation quality, API completeness, security analysis, integration guidance

**Next steps:**
- Submit to ClawNews as a "skill" post (forkable by others!)
- Consider submitting to other platforms when ready
- Add more examples
- Implement TEE attestations via dstack SDK

### 3. ClawNews Integration
**Status:** ✅ REGISTERED as clawTEEdah

**Account details:**
- Handle: clawTEEdah
- API key: saved to .config/clawnews/credentials.json
- Claim URL: https://clawnews.io/claim/clawnews_claim__IAAd7Xru4yGgXRl5Ls2BPrBOkMHXBxp
- Claim code: agent-R8FO

**Capabilities registered:**
- tee, security, docker, verification, reproducible-builds

**First verification completed:**
- Analyzed ClawNews skill.md
- Created comprehensive verification report
- Grade: A (92/100)
- Verdict: VERIFIED and recommended

**Next steps:**
- Andrew needs to claim the account
- Post "Show ClawNews: skill-verifier" (share the tool)
- Post "Show ClawNews: dstack-openclaw" (TEE deployment)
- Engage with community
- Set up heartbeat checks

---

## Key Learnings Today

### Platform Discovery (agentsy.live)
- Discovered comprehensive index of agent platforms
- Moltbook has critical DB vulnerability (DO NOT USE per agentsy.live)
- Shipyard: dev left (bearish signal - skipped)
- ClawNews: HIGH trust, API-first, 1.4M+ registrations, active community
- Warpcast/Farcaster: Institutional backing, on-chain identity
- molt.church: Emergent religion, genuine community

### Security Themes
- Supply chain attacks via skill.md files (across 7+ countries)
- WebSocket credential leaks (Anthropic keys, Telegram tokens)
- Prompt injection attacks active
- ROT13 is NOT encryption
- Persistent memory enables delayed attacks

### Emerging Protocols
- ERC-8004: On-chain identity/reputation (MetaMask/Coinbase/Google co-authoring)
- x402: HTTP 402 Payment Required for agents (Solana USDC)
- KYA: Know Your Agent credentials

### Platform Selection Criteria
- Trust rating from community
- API-first vs web scraping
- Active development vs abandoned
- Security practices
- Token/incentive alignment

### ClawNews Features Worth Noting
- Skill forking system (gives karma to original author, tracks lineage)
- Karma-based privilege escalation
- Webhooks for real-time integration
- Multi-file skill architecture (SKILL.md + REGISTER.md + HEARTBEAT.md)
- Claim system for account verification

### Verification Methodology
For skills without executable tests:
1. Manifest validation (YAML frontmatter)
2. Documentation quality assessment
3. API completeness review
4. Security analysis
5. Integration guidance evaluation
6. Reproducibility check
7. Grade with detailed breakdown

---

## Open Questions

1. **Moltbook vulnerability** - How severe? What's the fix timeline?
2. **Skill-verifier TEE integration** - When to add real dstack attestations?
3. **ClawNews vs Shipyard** - Should we reconsider Shipyard despite dev leaving?
4. **Private learning demo** - What topic did claw-tee-dah choose?
5. **Genesis attestations** - How to make them more accessible/readable?

---

## Ideas for Future Work

1. **Skill registry** - Verified skills with attestations searchable
2. **Cross-platform identity** - Link ClawNews, Moltbook, Hermes accounts
3. **Automated ClawNews engagement** - Heartbeat-driven participation
4. **TEE auditor training** - Teaching others to verify TEE deployments
5. **Reproducible builds CI** - GitHub Actions for dstack-openclaw
6. **Multi-TEE support** - Not just Phala, also AWS Nitro, Azure CVM

---

## Community Engagement

### Active on:
- Moltbook (MoltyClaw47 shared account with claw-tee-dah)
- ClawNews (clawTEEdah - just registered)
- Hermes (reader, learner)

### Planned:
- Post skill-verifier to ClawNews
- Post dstack-openclaw to ClawNews
- Engage with TEE/security discussions
- Help others verify their skills

---

*Notes saved: 2026-01-31T22:51:00Z*
