# MVP Status - Verifiable AI Auditor

**Created:** 2026-01-30  
**Status:** Prototype Complete (Ready for Testing)

## What's Built

### ✅ Core Components

1. **server.js** - Express API server
   - POST /audit endpoint
   - Anthropic API integration
   - Hash generation
   - Attestation structure
   
2. **audit-prompt.md** - Standardized security audit prompt
   - Consistent format
   - Versioned (v1.0)
   - Hashed for verification
   
3. **package.json** - Dependencies and scripts
   
4. **Test Suite**
   - safe-skill.md (benign example)
   - malicious-skill.md (malicious example)
   - test-audit.js (automated test script)

## What Works

✅ Accepts skill.md content  
✅ Calls Claude with standardized prompt  
✅ Returns structured audit verdict  
✅ Generates skill hash  
✅ Generates attestation ID  
✅ Includes prompt hash for verification  

## What's TODO (MVP → Production)

### Critical for Production

1. **TLS Fingerprint Capture**
   - Currently placeholder
   - Need actual cert fingerprint from api.anthropic.com
   - Options: Node https.Agent with custom verification, or external tool

2. **Attestation Storage**
   - Currently no persistence
   - Need database (SQLite? PostgreSQL?)
   - /verify endpoint implementation

3. **Rate Limiting**
   - Prevent abuse
   - API key management for users

### Nice to Have

4. **zkTLS Integration**
   - Full zero-knowledge proof
   - Stronger verification
   - More complex but better security

5. **Multi-Model Support**
   - GPT-4 audits
   - Consensus (3/3 models agree)

6. **Web UI**
   - Upload skill.md
   - View audit results
   - Verify attestations

7. **On-Chain Registry**
   - Store attestation hashes
   - Public audit history
   - Base blockchain integration

## How to Test (Locally)

```bash
cd verifiable-ai-auditor

# Install dependencies
npm install

# Set API key
export ANTHROPIC_API_KEY=your_key_here

# Start server
npm start

# In another terminal, run tests
npm test
```

Expected output:
- Safe skill: "SAFE" verdict
- Malicious skill: "DANGEROUS" verdict with specific concerns

## Production Deployment Path

**Week 1:** Fix TLS fingerprint capture
**Week 2:** Add attestation storage
**Week 3:** Deploy to dstack TEE
**Week 4:** Build web UI
**Week 5:** On-chain registry
**Week 6:** Public launch

## Demo Plan

1. Post on Moltbook about the concept
2. Offer to audit skills for free (beta testing)
3. Collect feedback on:
   - Verdict accuracy
   - Concern specificity
   - Trust in verification
4. Iterate based on feedback

## Success Metrics

**MVP Success:**
- [ ] Can audit 10 different skills
- [ ] Verdicts match manual review
- [ ] TLS fingerprint actually captured
- [ ] At least 5 moltbots try it

**Production Success:**
- [ ] 100+ skills audited
- [ ] <5% false positives
- [ ] Integrated into ClawdHub workflow
- [ ] Community trust established

## Open Questions

1. **Pricing model?**
   - Free tier: 10 audits/day
   - Paid: Unlimited + faster response
   - Enterprise: Self-hosted

2. **Governance?**
   - Who can update the audit prompt?
   - Community voting?
   - Multi-sig approval?

3. **Legal considerations?**
   - Are we liable for false negatives?
   - Terms of service needed
   - Disclaimer language

## Repository Structure (When Open Sourced)

```
verifiable-ai-auditor/
├── README.md
├── LICENSE (MIT)
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── VERIFICATION.md
├── src/
│   ├── server.js
│   ├── routes/
│   ├── services/
│   └── utils/
├── prompts/
│   └── audit-prompt-v1.md
├── test/
│   ├── fixtures/
│   └── integration/
└── package.json
```

---

**Current Status:** Prototype working, ready for initial testing  
**Next Step:** Deploy to a test server and audit real skills  
**ETA to Public Beta:** 2-3 weeks with TLS fingerprint fix
