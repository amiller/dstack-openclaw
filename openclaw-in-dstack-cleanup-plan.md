# openclaw-in-dstack Cleanup Plan
**Date:** 2026-02-01  
**Issue:** Repo is filled with development slop and needs cleanup

## Current Slop

### Dockerfiles (7 versions!)
- `Dockerfile` - Current production
- `Dockerfile.backup` - OLD, delete
- `Dockerfile.genesis` - OLD, delete
- `Dockerfile.reproducible` - Phase 3 skeleton, keep or merge
- `Dockerfile.test` - OLD, delete
- `Dockerfile.working` - OLD, delete

**Keep:** Just `Dockerfile` (production)

### Docker Compose Files
- `docker-compose.yaml` - Which version is this?
- `docker-compose-local.yaml` - Local testing
- `docker-compose-phala.yaml` - Production
- `docker-compose-proxy.yaml` - Multi-container

**Keep:** `docker-compose-phala.yaml` (production), maybe one local example

### Documentation (excessive)
- `README.md` ✅ Keep
- `VERIFICATION-GUIDE.md` ✅ Keep
- `ATTESTATION.md` - Merge into verification guide?
- `BASE-KMS-NOTES.md` - Development notes, delete
- `BUILD_SESSION_SUMMARY.md` - Stale, delete
- `CHAT-SERVER-BUG-ANALYSIS.md` - Fixed, delete or archive
- `CREATE-ISSUE.md` - Stale, delete
- `DEPLOYMENT-PLAN.md` - Old, delete
- `DEPLOYMENT_STATUS.md` - Stale, delete
- `GENESIS.md` - Merge into verification guide?
- `GITHUB-ACTIONS-SETUP.md` - Maybe keep for contributors
- `IMPLEMENTATION-PLAN.md` - Stale, delete
- `INTEGRATION-TEST.md` - Maybe keep for CI
- `ISSUE-chat-server-json-bug.md` - Fixed, delete
- `NIGHTLY-BUILD-2026-02-01.md` - Delete
- `OPENCLAW_VERSION.md` - Delete
- `PHALA-DEPLOYMENT.md` - Keep for deployment guide
- `PROXY-ARCHITECTURE.md` ✅ Keep (important)
- `REPRODUCIBILITY.md` - Merge or keep
- `SECURITY-AUDIT.md` - Keep (just created)
- `SESSION-NOTES.md` - **34k lines!** DELETE
- `SHIPPING_NOW.md` - Delete
- `XORDI-LEARNINGS.md` - Development notes, delete

### Scripts
- `genesis-log.sh` ✅ Keep
- `setup-auth.sh` ✅ Keep
- `chat-server.js` ✅ Keep
- `chat-server-fixed.js` - Merged into chat-server.js? Delete if redundant
- `phala-health-check.sh` ✅ Keep
- `test-proxy-emoji.sh` - Test artifact, delete

### Other
- `.github/workflows/` - Keep if working
- `config/` - NEVER commit credentials
- `workspace/` - Keep, this is the agent's files

## Clean Repo Structure

```
openclaw-in-dstack/
├── README.md                    # Overview, quick start
├── VERIFICATION-GUIDE.md        # How to verify genesis
├── PROXY-ARCHITECTURE.md        # Technical design
├── PHALA-DEPLOYMENT.md          # Production deployment
├── SECURITY-AUDIT.md            # Security issues & fixes
├── Dockerfile                   # Production build
├── docker-compose-phala.yaml    # Production config
├── docker-compose-local.yaml    # Local example (optional)
├── genesis-log.sh               # Genesis logging
├── setup-auth.sh                # Auth setup
├── chat-server.js               # Internal server
├── phala-health-check.sh        # Health checks
├── workspace/                   # Agent workspace
│   ├── SOUL.md
│   ├── USER.md
│   ├── AGENTS.md
│   ├── IDENTITY.md
│   └── ...
├── dstack-proxy/                # Proxy container
│   ├── proxy.js
│   └── Dockerfile
└── .github/                     # CI/CD
    └── workflows/
```

**Total:** ~15-20 essential files instead of 50+

## Cleanup Commands

```bash
# Remove old Dockerfiles
rm Dockerfile.backup Dockerfile.genesis Dockerfile.test Dockerfile.working

# Remove stale docs
rm BUILD_SESSION_SUMMARY.md CHAT-SERVER-BUG-ANALYSIS.md CREATE-ISSUE.md \
   DEPLOYMENT-PLAN.md DEPLOYMENT_STATUS.md IMPLEMENTATION-PLAN.md \
   ISSUE-chat-server-json-bug.md NIGHTLY-BUILD-2026-02-01.md \
   OPENCLAW_VERSION.md SESSION-NOTES.md SHIPPING_NOW.md \
   XORDI-LEARNINGS.md BASE-KMS-NOTES.md

# Remove test scripts
rm test-proxy-emoji.sh chat-server-fixed.js

# Keep these essentials:
# - README.md, VERIFICATION-GUIDE.md, PROXY-ARCHITECTURE.md
# - PHALA-DEPLOYMENT.md, SECURITY-AUDIT.md
# - Dockerfile, docker-compose-phala.yaml
# - genesis-log.sh, setup-auth.sh, chat-server.js
# - workspace/, dstack-proxy/, .github/

# Decide on these:
# - ATTESTATION.md, GENESIS.md (merge into VERIFICATION-GUIDE.md?)
# - REPRODUCIBILITY.md (keep or delete?)
# - INTEGRATION-TEST.md (keep for CI docs?)
# - docker-compose-local.yaml (keep one example?)
```

## Fresh Start Option

**Better approach:** Start completely fresh repo with only production-ready files:

1. Create new repo: `openclaw-tee-demo` (better name?)
2. Copy ONLY:
   - Essential docs (README, VERIFICATION-GUIDE, PROXY-ARCHITECTURE)
   - Production files (Dockerfile, docker-compose-phala.yaml)
   - Core scripts (genesis-log.sh, setup-auth.sh, chat-server.js)
   - Workspace (agent files)
   - Proxy (dstack-proxy/)
3. Write .gitignore FIRST
4. Commit clean state
5. Document security lessons learned

## Recommendation

**Start fresh.** The current repo has:
- Compromised credentials in history
- 34k line SESSION-NOTES.md
- 7 Dockerfile versions
- Dozens of stale docs
- Development cruft throughout

A clean repo takes 10 minutes and starts with good practices.

**Your call:**
1. Clean up current repo (remove slop, force-push clean history)
2. Start fresh with minimal essential files (recommended)

---

**Status:** Awaiting decision  
**Bloat:** ~50 files → should be ~15-20
