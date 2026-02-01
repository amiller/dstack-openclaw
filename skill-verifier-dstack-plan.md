# Skill Verifier as dstack Service

## Vision
BYOK (bring your own key) LLM analysis service in TEE that records verifiable claims about agent skills.

## Core Value Proposition
- Submit skill.md + your Anthropic API key
- TEE runs expensive analysis (Claude Sonnet 4, extended thinking)
- Get back structured claims + cryptographic attestation
- Your API key is never leaked (TEE guarantees)
- Claims are verifiable by anyone (check TEE quote)

## Architecture

```
User → HTTPS → dstack-proxy (Phala Cloud)
                    ↓
              skill-verifier service
                    ↓
              User's API key (secure in TEE)
                    ↓
              Anthropic API (Sonnet 4, extended thinking)
                    ↓
              claims.json + TEE attestation
```

## Claim Structure

```json
{
  "skill": {
    "name": "weather-skill",
    "hash": "abc123...",
    "source_url": "https://example.com/weather.md"
  },
  "claims": [
    {
      "statement": "No credential exfiltration in any code path",
      "verdict": true,
      "reasoning": "LLM analysis shows all HTTP calls are to declared weather API only"
    },
    {
      "statement": "Code behavior matches description",
      "verdict": true,
      "reasoning": "Markdown description accurately describes code functionality"
    },
    {
      "statement": "Contains no misdirection",
      "verdict": true,
      "reasoning": "All operations clearly documented, no hidden behaviors"
    }
  ],
  "verification": {
    "model": "claude-sonnet-4",
    "thinking": "extended",
    "timestamp": "2026-01-31T23:25:00Z",
    "skill_hash": "abc123...",
    "tee_quote": "0x..."
  }
}
```

## API Endpoints

### POST /verify
Submit skill.md for analysis

**Request:**
```json
{
  "skill_url": "https://example.com/skill.md",
  "skill_content": "base64...",  // optional alternative to URL
  "api_key": "sk-ant-...",
  "model": "claude-sonnet-4",  // optional, default sonnet-4
  "thinking": "extended"  // optional, default extended
}
```

**Response:**
```json
{
  "job_id": "xyz789...",
  "status": "pending",
  "eta_seconds": 120
}
```

### GET /verify/:jobId
Check verification status

**Response:**
```json
{
  "status": "completed",
  "claims_url": "/claims/abc123...",
  "attestation_url": "/attestation/abc123..."
}
```

### GET /claims/:skillHash
Retrieve claims for a skill

**Response:** (claims.json structure above)

### GET /attestation/:skillHash
Get TEE attestation for verification

**Response:**
```json
{
  "skill_hash": "abc123...",
  "tee_quote": "0x...",
  "timestamp": "2026-01-31T23:25:00Z"
}
```

## Implementation Plan

### Phase 1: Core Service (Week 1)
- [x] skill-verifier working locally (already done)
- [ ] Refactor to BYOK model (user provides API key)
- [ ] Implement claim generation with Sonnet 4
- [ ] Add structured claim output (JSON schema)
- [ ] Test with ClawNews skill.md as example

### Phase 2: Containerization (Week 1-2)
- [ ] Create Dockerfile (reuse openclaw-in-dstack pattern)
- [ ] Add dstack-proxy container
- [ ] Implement genesis log (verification history)
- [ ] Set up multi-container compose
- [ ] Test locally with dstack simulator

### Phase 3: TEE Deployment (Week 2)
- [ ] Deploy to Phala Cloud
- [ ] Test real TDX attestations
- [ ] Verify API key protection (doesn't leak)
- [ ] Document deployment process
- [ ] Create user guide

### Phase 4: Documentation & Examples (Week 2-3)
- [ ] Verify ClawNews skill.md (example)
- [ ] Verify Hermes skill.md
- [ ] Verify Moltbook skill.md
- [ ] Create gallery of verified skills
- [ ] Write blog post / ClawNews announcement

## Security Properties

**TEE Guarantees:**
- User's API key never leaves TEE
- No logging of API keys
- Attestation proves which code ran
- Skill hash prevents tampering

**What TEE Does NOT Prove:**
- That the claims are correct (LLM could be wrong)
- That the skill.md won't change later
- That you should trust the skill

**What You Get:**
- Proof that expensive analysis happened
- Transparency about what model/settings were used
- Verifiable record (anyone can re-run analysis)

## Economic Model

**Cost to verify:**
- User pays their own Anthropic API costs
- Service is free (TEE hosting paid by us initially)
- Future: charge small fee for TEE attestation service

**Value:**
- One expensive analysis ($10-50 depending on skill size)
- Many users can trust the claim (free)
- Or re-verify if skeptical (pay again)

## Differentiation from skill-verifier v1

**Old model:**
- Run tests in Docker
- Check exit codes
- Generic "passed/failed"

**New model:**
- LLM analysis of skill.md content
- Structured claims (specific statements)
- TEE attestation (cryptographic proof)
- BYOK (user's API key, not ours)

## Integration Points

### ClawNews
- Post verified skills with claims badge
- Skills can reference verification URL
- Forkable skills carry claims with them

### Moltbook
- Share verified skills in m/shipping
- Build reputation via verified claims
- Skill marketplace with trust signals

### OpenClaw
- Install skills with verified claims
- Warn if skill unverified or claims fail
- Auto-update when new claims available

## Success Metrics

**Phase 1:**
- 10+ skills verified
- Claims published to ClawNews/Moltbook
- Community feedback positive

**Phase 2:**
- 100+ skills verified
- Other agents using the service
- Forks/variants of verified skills

**Phase 3:**
- Self-sustaining (users verify own skills)
- Skill marketplace emerges
- Standard claim types agreed upon

## Open Questions

1. **Claim standardization:** Who decides what claims are valuable?
2. **Claim versioning:** If skill.md changes, do claims invalidate?
3. **Multi-model verification:** Should we support multiple LLMs?
4. **Dispute resolution:** What if two LLMs give different claims?
5. **Cost optimization:** Can we cache common claim patterns?

## Next Steps (This Weekend)

1. Design claim schema (JSON structure)
2. Implement BYOK API endpoint
3. Test with Sonnet 4 extended thinking
4. Create Dockerfile + dstack-proxy
5. Deploy to Phala Cloud
6. Verify ClawNews skill.md as first example
7. Post to m/shipping on Moltbook

---

**Status:** Planning phase  
**Target:** Live dstack deployment by 2026-02-07  
**Owner:** clawTEEdah  
**Repository:** (to be created in amiller/skill-verifier-dstack)
