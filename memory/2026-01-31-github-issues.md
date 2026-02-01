# GitHub Issues Created - 2026-01-31

## Context
Andrew asked for GitHub issues to track:
1. GitHub Actions CI for simulator testing
2. Reproducible builds release process documentation

Reference: https://github.com/Account-Link/xordi-release-process

## Issues Created

### Issue #2: GitHub Actions CI: Automated Simulator Testing
**URL:** https://github.com/amiller/dstack-openclaw/issues/2

**Scope:**
- Build both Docker images (openclaw-dstack + dstack-proxy)
- Run dstack simulator
- Automated domain separation testing:
  - Genesis domain enforcement (correct hash accepted, forged rejected)
  - Agent domain flexibility (arbitrary attestations)
  - Security boundaries (read-only genesis, no direct socket access)
- GitHub Actions summary with test results

**Success Criteria:**
- CI runs on every push
- All tests pass
- Complete in < 10 minutes
- Images tagged with commit SHA

### Issue #3: Document Reproducible Builds Release Process
**URL:** https://github.com/amiller/dstack-openclaw/issues/3

**Documents to Create:**
1. **RELEASE-CHECKLIST.md** - Prescriptive deployment steps
   - Pre-release (commit SHA, CI pass)
   - Build (tag with SHA, push to ghcr.io, record digests)
   - Deploy (Phala Cloud, record App ID)
   - Verify (Trust Center, attestations, genesis hash)
   - Document (GitHub Release with proof)

2. **VERIFICATION-REPORT.md** - Template for auditors
   - Chain of trust verification steps
   - Source → Docker image (reproducible builds)
   - Docker image → TEE (attestation)
   - Genesis log → attestation (domain enforcement)
   - Security properties proven
   - Trust boundaries documented

3. **docker-compose-phala.yaml** - Production config
   - Public ghcr.io images
   - Pinned SHA tags (not :latest)
   - Version metadata

4. **Release announcement template** - What we prove
   - Source transparency
   - Build reproducibility
   - Genesis immutability
   - Hardware isolation

**Success Criteria:**
- Reproducible builds verified across machines
- Every deployment has GitHub Release
- Auditors can follow clear verification steps
- Complete audit trail: commit → image → attestation

## Reference Patterns from Xordi

Adapted from xordi-release-process:
- Base on-chain KMS for transparency logging
- Docker images tagged with commit SHA
- Trust Center verification mandatory
- GitHub Actions automates build + test
- Manual deploy trigger (not automatic)
- Full chain of trust documentation

## Next Steps

1. Implement simulator test script (Issue #2)
2. Create GitHub Actions workflow (Issue #2)
3. Document release checklist (Issue #3)
4. Test reproducible builds (Issue #3)
5. Create first release with full proof (Issue #3)

---

**Key Quote from Andrew (via xordi-release-process):**
> "It is about making a transparency log, which we're just not making right now"

These issues address that gap for openclaw-in-dstack.
