# TEE Study Plan (Started 2026-01-31)

Andrew created a comprehensive TEE reference library in `tee-references/`. Time to study systematically.

## Library Contents

### Papers (4 PDFs)
- **spore-fun-tee-agents.pdf** - Spore.fun case study (ALIFE 2025)
- **arxiv-2403.14443-tee.pdf** - (to identify)
- **arxiv-2502.07924-tee.pdf** - (to identify)
- **arxiv-2510.21904-tee.pdf** - (to identify)

### Repositories (3 cloned)
- **dstack-tutorial** - 8-module DevProof tutorial (foundational)
- **hermes** - Anonymous journal in Intel TDX
- **self-attesting-tee** - TEE app that explains its own attestation

### Articles
- TEE_HEE account encumbrance
- hell.tech deal-scoped encumbrance

## Study Sequence

### Phase 1: Foundations (Week 1)
- [ ] Read dstack-tutorial modules 01-03 (attestation, reproducibility, keys)
- [ ] Study self-attesting-tee implementation
- [ ] Understand basic TEE concepts: attestation, reference values, quote verification

### Phase 2: DevProof Architecture (Week 1-2)
- [ ] dstack-tutorial modules 04-06 (gateways, on-chain auth, freshness)
- [ ] AppAuth contract patterns
- [ ] ERC-733 stages
- [ ] Timelocks and exit mechanisms

### Phase 3: Real Applications (Week 2)
- [ ] Hermes architecture (1-hour staging, memory-only pending)
- [ ] TEE_HEE account encumbrance
- [ ] hell.tech deal scoping

### Phase 4: Research Papers (Week 3+)
- [ ] Spore.fun: Open-ended evolution with sovereign agents
- [ ] Identify and read other 3 papers
- [ ] Connect to our skill-verifier work

### Phase 5: Applied Projects (Ongoing)
- [ ] Apply to openclaw-in-dstack
- [ ] Enhance skill-verifier with proper attestation
- [ ] Build TEE Auditor's Guide

## Key Concepts to Master

**Attestation:**
- Quote structure and verification
- Reference values vs runtime measurements
- Remote attestation flows

**DevProof:**
- Security vs DevProof distinction
- Reproducible builds
- On-chain authorization
- Upgrade transparency

**Account Encumbrance:**
- Proving exclusive ownership
- All-or-nothing vs deal-scoped
- Recovery mechanisms (7-day timed release)

**Infrastructure:**
- Intel TDX vs SGX
- Phala Cloud / dstack
- KMS and key management

## Progress Tracking

**2026-01-31 00:28 UTC:**
- Discovered library
- Created this study plan
- Next: Start with dstack-tutorial 01

---

*This is a marathon, not a sprint. Study deeply, document learning, apply to projects.*
