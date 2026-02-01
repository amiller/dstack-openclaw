# LLM Claims Service - Design Doc

## Vision

**Enable verifiable claims about private datasets using LLM analysis in TEE**

### The Problem
- Alice has a private dataset (customer reviews, research data, etc.)
- Alice wants to make a claim about it ("60% positive sentiment", "Contains X pattern")
- Others want to verify the claim WITHOUT seeing the raw data
- Traditional solution: "Trust me"
- Our solution: Cryptographically signed proof from TEE

### The Flow

```
1. Alice uploads private dataset → TEE storage (encrypted)
2. Alice provides public LLM prompt → "Analyze sentiment distribution"
3. Alice provides API key → Encrypted in TEE memory only
4. TEE runs: LLM(private_data, public_prompt) → Result
5. TEE generates signed attestation → Proof bundle
6. Alice gets shareable URL → https://service/claim/abc123
7. Anyone can verify:
   - ✅ Dataset hash matches
   - ✅ Prompt is public and unchanged
   - ✅ LLM response is authentic
   - ✅ Computation happened in TEE
   - ❌ Raw data never exposed
```

## Architecture

### New Endpoints

#### `POST /datasets/upload`
Upload private dataset for LLM analysis
```json
{
  "name": "Customer Reviews Q4 2025",
  "data": "base64:..." OR "file_path": "...",
  "format": "csv|json|txt",
  "description": "Optional public description"
}

Response:
{
  "dataset_id": "ds_abc123",
  "hash": "sha256:...",
  "size_bytes": 1024000,
  "encrypted": true,
  "stored_until": "2026-02-08T00:00:00Z" // 7 days
}
```

#### `POST /analyze/llm`
Run LLM prompt over private dataset
```json
{
  "dataset_id": "ds_abc123",
  "prompt": "Analyze sentiment distribution in these reviews",
  "model": "anthropic/claude-sonnet-4",
  "api_key": "sk-ant-...", // Encrypted in transit + TEE
  "max_tokens": 4096
}

Response:
{
  "claim_id": "claim_xyz789",
  "result": {
    "llm_response": "Based on analysis of 5,000 reviews...",
    "prompt_used": "Analyze sentiment distribution...",
    "dataset_hash": "sha256:...",
    "model": "anthropic/claude-sonnet-4",
    "timestamp": "2026-02-01T13:10:00Z"
  },
  "attestation": {
    "signature": "0x...",
    "tee_quote": "...",
    "compose_hash": "sha256:..." // Reproducible build hash
  },
  "share_url": "https://service/claim/claim_xyz789"
}
```

#### `GET /claim/:id`
View verifiable claim (public shareable page)
```json
{
  "claim_id": "claim_xyz789",
  "dataset": {
    "hash": "sha256:...",
    "name": "Customer Reviews Q4 2025",
    "description": "5,000 customer reviews",
    "data_public": false // Raw data NOT included
  },
  "analysis": {
    "prompt": "Analyze sentiment distribution...",
    "model": "anthropic/claude-sonnet-4",
    "response": "Based on analysis of 5,000 reviews...",
    "timestamp": "2026-02-01T13:10:00Z"
  },
  "proof": {
    "tee_attestation": "...",
    "signature": "0x...",
    "verification_steps": [
      "1. Verify TEE quote signature",
      "2. Check dataset hash in attestation",
      "3. Verify prompt hash matches",
      "4. Confirm model + timestamp"
    ]
  },
  "verification_url": "/claim/claim_xyz789/verify"
}
```

#### `GET /claim/:id/verify`
Machine-readable verification endpoint
```json
{
  "valid": true,
  "checks": {
    "tee_signature": "✅ Valid Intel TDX quote",
    "dataset_hash": "✅ Matches sha256:...",
    "prompt_hash": "✅ Matches sha256:...",
    "timestamp": "✅ Within expected range",
    "model": "✅ anthropic/claude-sonnet-4"
  },
  "trust_level": "SIMULATED_MVP" // or "PRODUCTION_TEE"
}
```

## Security Model

### What TEE Guarantees
1. **Data isolation:** Raw dataset never leaves TEE memory
2. **Computation integrity:** LLM prompt executed exactly as specified
3. **Result authenticity:** Response hasn't been tampered with
4. **Deletion:** Private data erased after computation
5. **Attestation:** Cryptographic proof of all above

### What Users Verify
1. **Dataset hash:** Matches their expectation
2. **Prompt:** Publicly visible, unchanged
3. **TEE quote:** Valid signature from Intel/AMD
4. **Compose hash:** Reproducible build (optional advanced)
5. **Model:** Correct LLM was used

### Attack Scenarios

**Scenario 1: Fake claim**
- Attacker creates claim without real dataset
- **Defense:** Dataset hash must match pre-registered hash OR be included in attestation
- **Verification:** Anyone can check hash doesn't match known dataset

**Scenario 2: Prompt injection**
- Attacker modifies prompt after the fact
- **Defense:** Prompt hash included in attestation
- **Verification:** Verifiers can recompute prompt hash

**Scenario 3: Operator tampering**
- TEE operator tries to read private data
- **Defense:** Hardware-level memory encryption (TEE)
- **Verification:** Attestation proves TEE isolation

**Scenario 4: Inference attacks**
- Multiple prompts leak private data over time
- **Defense:** Rate limiting, dataset expiration
- **Mitigation:** Document in trust model (user responsibility)

## Use Cases

### 1. Research Claims
**Scenario:**
- Researcher has proprietary dataset
- Makes claim: "95% accuracy on benchmark X"
- Shares verifiable proof
- Others verify WITHOUT seeing training data

### 2. Data Quality Certification
**Scenario:**
- Data vendor claims: "Dataset contains no PII"
- Runs LLM analysis: "Scan for PII patterns"
- Result: "0 PII instances found"
- Buyers verify claim before purchase

### 3. Compliance Proof
**Scenario:**
- Company claims: "Customer data complies with GDPR"
- Prompt: "Check for prohibited data types"
- Result: "No violations detected"
- Auditors verify claim

### 4. Competitive Intelligence
**Scenario:**
- Startup: "Our model beats GPT-4 on domain X"
- Prompt: "Compare accuracy on test set"
- Result: "92% vs 87%"
- Investors verify WITHOUT seeing model weights

### 5. Info Bazaar Primitive
**Scenario:**
- Agent claims: "I have data relevant to query X"
- Prompt: "Does this dataset contain info about X?"
- Result: "Yes, 47 matches with confidence 0.89"
- Buyer verifies relevance before paying

## Implementation Plan

### Phase 1: MVP (This Weekend)
- [x] Basic server structure (exists)
- [ ] Dataset upload endpoint (encrypted storage)
- [ ] LLM analysis endpoint (simulated TEE)
- [ ] Claim sharing page (HTML view)
- [ ] Simple hash-based verification

**Target:** Working demo with simulated TEE

### Phase 2: Real TEE (Next Week)
- [ ] Deploy to dstack CVM
- [ ] Real TDX attestation
- [ ] Encrypted dataset storage in TEE
- [ ] API key handling (encrypted in TEE only)
- [ ] Reproducible builds

**Target:** Production-ready with real attestations

### Phase 3: Advanced Features (Week 3-4)
- [ ] Dataset registry (pre-register hashes)
- [ ] Multiple LLM providers
- [ ] Batch analysis (multiple prompts)
- [ ] Webhook notifications
- [ ] Web UI for claim exploration

**Target:** Full-featured marketplace

### Phase 4: Info Bazaar Integration (Future)
- [ ] On-chain claim registry
- [ ] Payment for analysis
- [ ] Reputation system
- [ ] Dispute resolution
- [ ] Multi-party claims

## Tech Stack

### Backend
- **Node.js + Express** - API server
- **Anthropic SDK** - LLM API calls
- **Crypto (built-in)** - Hashing, signatures
- **dstack SDK** - TEE attestation (Phase 2)

### Storage
- **In-memory** - MVP (Phase 1)
- **Encrypted files** - Phase 2
- **PostgreSQL** - Phase 3+

### Security
- **TLS** - All endpoints HTTPS
- **Encryption** - AES-256 for datasets at rest
- **Attestation** - Intel TDX quotes (Phase 2)
- **Key management** - TEE-sealed keys

## Economics

### Pricing Model (Future)

**Free Tier:**
- 10 analyses/month
- Datasets < 1MB
- Claims expire after 30 days
- Good for: Testing, research, demos

**Paid Tier:**
- Unlimited analyses
- Datasets up to 100MB
- Permanent claim storage
- Priority processing
- $10/month OR pay-per-analysis

**Enterprise:**
- Custom SLAs
- Private TEE instances
- White-label claims
- Compliance reports
- Contact for pricing

## Metrics to Track

### Usage
- Claims created per day
- Verifications per claim
- Dataset sizes
- LLM tokens used
- Most popular prompts

### Trust
- Attestation verification rate
- Failed verifications (flag for investigation)
- User-reported issues
- Dispute rate

### Growth
- New datasets registered
- Returning users
- Social sharing (claim URLs shared)
- GitHub stars / Moltbook mentions

## Open Questions

1. **Prompt safety:** Should we filter malicious prompts (prompt injection)?
2. **Dataset limits:** Max size? Max retention time?
3. **Result privacy:** Should LLM response be public or private?
4. **Multi-party claims:** How to handle collaborative analyses?
5. **Revocation:** Can a claim be revoked after sharing?

## Next Steps

1. ✅ Write this design doc
2. [ ] Implement Phase 1 endpoints
3. [ ] Create example datasets + prompts
4. [ ] Deploy MVP to localhost
5. [ ] Test with real dataset (my Moltbook posts?)
6. [ ] Post demo on Moltbook
7. [ ] Gather feedback
8. [ ] Deploy to dstack (Phase 2)

---

**Target:** Working demo by end of today (Feb 1)  
**Demo dataset:** Moltbook posts, analyze engagement patterns  
**Demo claim:** "What topics get most engagement on Moltbook?"
