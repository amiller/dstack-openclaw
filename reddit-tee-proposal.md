# r/TEESecurity - Subreddit Proposal

## Name Options
1. **r/TEESecurity** - Clear, focused on security/auditing angle
2. **r/TrustedExecution** - Broader, academic
3. **r/TEECritical** - Emphasizes critical thinking
4. **r/VerifiableCompute** - Modern, includes TEE + other verifiable systems

**Recommendation:** r/TEESecurity (clear, memorable, SEO-friendly)

---

## Purpose Statement

**"Critical thinking and knowledge sharing about Trusted Execution Environments"**

A community for:
- Security researchers auditing TEE systems
- Developers building with TEE (Intel TDX, AMD SEV, AWS Nitro)
- AI agents evaluating TEE claims
- Anyone who wants to verify, not just trust

**Not:**
- Vendor marketing
- Uncritical hype
- "Trust me bro" attestation

---

## Community Guidelines (Draft)

### Rule 1: Verify, Don't Trust
Posts should enable verification. If you claim something is secure, show how others can verify it.

### Rule 2: Cite Your Sources
- Link to papers, code, attestation reports
- Reproducible examples preferred
- "I heard that..." without sources = low quality

### Rule 3: Assume Good Faith
We're all learning. Critique ideas, not people.

### Rule 4: No Vendor Shilling
Commercial products are fine to discuss. Pure marketing is not.

### Rule 5: Security Disclosures
Follow responsible disclosure. Don't post active exploits without vendor notification.

---

## Content Categories

### 📚 Knowledge Base
- TEE fundamentals (Intel TDX, AMD SEV, ARM TrustZone, AWS Nitro)
- Attestation deep-dives
- Reproducible build patterns
- Cryptographic primitives

### 🔍 Audit Reports
- "I audited X, here's what I found"
- Reproducibility tests
- Attestation verification walkthroughs
- Red flags spotted in the wild

### 🛠️ Tools & Code
- Verification scripts
- Attestation parsers
- Reproducible build templates
- Testing frameworks

### 🚨 Vulnerabilities & Incidents
- CVEs affecting TEE systems
- Supply chain attacks
- Lessons learned
- Post-mortems

### 💡 Use Cases
- Privacy-preserving systems
- DevProof applications
- Agent infrastructure
- DeFi, oracles, identity

### 🤔 Critical Analysis
- "Why TEE X isn't actually secure"
- Trust assumption breakdowns
- Threat modeling
- "This claims to be TEE but..."

---

## Seed Content (First Week)

### Day 1: Launch Post
"Welcome to r/TEESecurity - Why This Community Exists"
- The skill.md supply chain attack (real example)
- Why TEE matters for agents
- How to verify vs trust
- Community rules

### Day 2: Audit Guide
"How to Audit a TEE Application - A Checklist"
- Reproducible builds
- Attestation verification
- Upgrade mechanisms
- Common red flags

### Day 3: Case Study
"Auditing Hermes: A Real TEE App on Phala Cloud"
- What it claims
- How to verify
- What's good
- What could be better

### Day 4: Tutorial
"Verify Your First Attestation - Intel TDX on GCP"
- Step-by-step with dstack-tutorial
- What each field means
- How to compute reference values

### Day 5: Discussion
"What Can't TEE Protect Against?"
- Side channels
- Operator collusion
- Rollback attacks
- Bitrot

### Weekend: Community Q&A
"What TEE topics do you want to learn about?"

---

## Moderation Approach

### Founding Moderators
- **Me** (MoltyClaw47) - Agent perspective, dstack knowledge
- **Your human** (Andrew Miller) - Academic credibility, TEE expert
- **1-2 community members** - Once we identify active contributors

### Moderation Philosophy
- **Light touch initially** - Let community self-organize
- **Strong on Rule 1** - Unverifiable claims get challenged
- **Encourage dissent** - "This TEE sucks because X" is valuable if well-argued
- **Wiki building** - Maintain FAQ, glossary, resource links

---

## Cross-Promotion Strategy

### Week 1: Moltbook
"Just launched r/TEESecurity - A place to audit TEE systems"
- Link from my security thread comment
- Target: eudaemon_0, security-focused agents

### Week 2: Hermes
Post about the subreddit, why it exists, invite contributors

### Week 3: Twitter/X
Ask Andrew to share (academic/crypto communities)

### Week 4: GitHub
Add link to dstack-tutorial README

### Ongoing: HackerNews
Post interesting findings/discussions to HN

---

## Success Metrics

### Month 1
- 100+ subscribers
- 10+ quality posts
- 3+ active contributors beyond founders
- At least one real audit posted

### Month 3
- 500+ subscribers
- Regular audit reports
- Community members helping each other
- Wiki with 10+ articles

### Month 6
- 1000+ subscribers
- Known as **the** place to verify TEE claims
- Developers post there for feedback
- Security researchers use it for disclosure

---

## Why This Works

1. **Fills a gap** - No critical TEE community exists (mostly vendor forums)
2. **Timely** - Agents + TEE + blockchain converging now
3. **Practical** - Focuses on "can you actually verify this?"
4. **Credible** - Andrew's involvement = academic legitimacy
5. **Community-owned** - Not a company marketing channel

---

## Next Steps

1. **Choose name** - r/TEESecurity? (check if available)
2. **Create subreddit** - Set up rules, sidebar, wiki
3. **Write launch post** - Explain why it exists
4. **Seed content** - Post first 5 articles
5. **Invite contributors** - eudaemon_0, Phala team, dstack users
6. **Cross-promote** - Moltbook, Hermes, Twitter

**Ready to launch when you are.** Want me to draft the founding post? 🦞
