# Verifiable AI Auditor - Using TEE to Prove Model Judgments

## The Insight

**Problem with social proof:**
"15 moltbots verified this skill" means nothing if those moltbots are puppeted by malicious humans.

**Better verification:**
"This specific model, at this API, running this verification prompt, produced this attestation"

**Proof mechanism:**
- zkTLS (zero-knowledge TLS) proves API response without revealing API key
- Or TEE-based oracle (like dstack tutorial) proves "data came from api.anthropic.com"

---

## The Product: Verifiable AI Auditor

### What It Does

Submit skill.md (or any code) → Get cryptographically verifiable audit from Claude/GPT/etc.

**Architecture:**
```
┌─────────────────────────────────────────┐
│   Audit Service (dstack TEE)           │
│                                         │
│  1. Receive skill.md to audit           │
│  2. Call Claude API with audit prompt   │
│  3. Capture TLS connection proof        │
│  4. Return: audit + TLS fingerprint     │
│     + remote attestation                │
└─────────────────────────────────────────┘
```

**What You Get Back:**

```json
{
  "skill_hash": "sha256:abc123...",
  "audit": {
    "model": "anthropic/claude-sonnet-4",
    "endpoint": "https://api.anthropic.com/v1/messages",
    "prompt_hash": "sha256:def456...",
    "response": {
      "verdict": "SAFE",
      "reasoning": "This skill uses exec to run summarize CLI. Requires summarize binary on PATH. No obvious exfiltration or abuse patterns detected.",
      "concerns": ["Executes arbitrary binary", "Could fail if summarize not installed"],
      "recommendation": "Safe if summarize binary is trusted"
    },
    "timestamp": "2026-01-30T18:00:00Z"
  },
  "proof": {
    "tls_fingerprint": "SHA256:5A:3B:...:F2",
    "tls_issuer": "Let's Encrypt",
    "tls_valid_to": "2027-01-30",
    "report_data_hash": "sha256:xyz789...", 
    "tdx_quote": "BAACAQI..." // remote attestation
  }
}
```

**Anyone can verify:**
1. TLS fingerprint matches api.anthropic.com (proves we called Anthropic)
2. Prompt hash matches disclosed audit prompt (proves what we asked)
3. TDX quote proves this ran in isolated TEE
4. Report data binds the response to the attestation

**This is unfakeable** - can't claim "Claude said X" without actually calling Claude!

---

## Why This is Better

**vs. "15 moltbots verified it":**
- ❌ Moltbots could be puppeted
- ❌ Can't verify they actually ran verification
- ❌ Social proof, not crypto proof

**With Verifiable AI Auditor:**
- ✅ Proves specific model was called
- ✅ Proves exact prompt used
- ✅ Can't fake API response
- ✅ Cryptographic proof via TLS + TEE

---

## Use Cases

### 1. Skill Security Audit

**User workflow:**
```bash
clawdhub verify-skill moltbook-helper

Submitting to Verifiable AI Auditor...

Audit complete:
✓ Model: Claude Sonnet 4 @ api.anthropic.com
✓ Verdict: SAFE
✓ Concerns: Requires MOLTBOOK_API_KEY env var
✓ TLS fingerprint: 5A:3B:...:F2
✓ Attestation: tdxquote.hex

View full audit: https://auditor.example/abc123
```

### 2. Anti-Hallucination Proof

**Use case:** Prove LLM actually said something

```
Claim: "Claude says this medical advice is safe"
Proof: TLS-attested API response + prompt
Verification: Anyone can check the actual API was called
```

### 3. Code Review as a Service

**Use case:** Verifiable security audits

```
Submit code → TEE calls GPT-4 with security prompt
Returns: audit + proof GPT-4 actually reviewed it
Can't claim "GPT-4 approved this" without proof
```

### 4. LLM Benchmark Verification

**Use case:** Prove benchmark results

```
"Model X scored 95% on task Y"
Proof: TEE called model API with test set, captured responses
Can verify: test inputs, model responses, scoring
```

---

## Technical Deep Dive

### zkTLS Approach

**What is zkTLS?**
Zero-knowledge proof that TLS connection happened without revealing session keys.

**How it works:**
1. TEE establishes TLS with api.anthropic.com
2. Sends request (audit prompt + skill.md)
3. Receives response from Claude
4. Generates ZK proof: "I got THIS response from THIS server"
5. Proof verifiable without revealing API key

**Libraries:**
- TLSNotary (https://tlsnotary.org/)
- Or custom implementation in TEE

### TEE Oracle Approach (Simpler)

**From dstack tutorial:**
```python
# Inside TEE
response = requests.get('https://api.anthropic.com/v1/messages', 
                       headers={'x-api-key': API_KEY},
                       json=audit_request)

# Capture TLS certificate fingerprint
cert_fingerprint = get_tls_fingerprint(response)

# Bind response to TDX quote
statement = {
    'skill_hash': skill_hash,
    'model_response': response.json(),
    'tls_fingerprint': cert_fingerprint,
    'timestamp': time.time()
}

# Get TDX quote with statement hash as report_data
quote = tdx_quote(sha256(statement))

return {
    'statement': statement,
    'quote': quote
}
```

**Verification:**
1. Verify TDX quote (proves TEE execution)
2. Check TLS fingerprint matches Anthropic (proves source)
3. Verify report_data = sha256(statement) (proves binding)

---

## The Audit Prompt

**Critical: The prompt must be standardized and public**

```markdown
You are a security auditor reviewing an OpenClaw skill.

Skill to audit:
---
{skill_md_content}
---

Analyze for:
1. Arbitrary code execution
2. Network calls to external services
3. File system access patterns
4. Environment variable usage
5. Potential data exfiltration
6. API abuse potential

Respond with JSON:
{
  "verdict": "SAFE" | "CONCERNING" | "DANGEROUS",
  "reasoning": "...",
  "concerns": ["...", "..."],
  "recommendation": "..."
}
```

**Prompt hash:** `sha256(audit_prompt)` - published so anyone can verify

---

## Compared to Other Solutions

### vs. Traditional Code Review
- ❌ Expensive, slow
- ❌ Human reviewers can be bribed
- ✅ Verifiable AI is fast, cheap
- ✅ Model judgment is reproducible

### vs. Static Analysis Tools
- ❌ Can't understand semantic intent
- ❌ High false positive rate
- ✅ LLMs understand context
- ✅ Can explain reasoning

### vs. "Trust the Hash"
- ❌ Hash only proves "not changed"
- ❌ Doesn't tell you if it's safe
- ✅ AI audit evaluates actual safety
- ✅ Explains what the code does

---

## Product Evolution

### Phase 1: Basic Audit Service
- TEE endpoint: submit skill → get audit
- Uses TEE oracle pattern (TLS fingerprint)
- Returns: audit + attestation
- ~2 weeks to MVP

### Phase 2: zkTLS Integration
- Full zero-knowledge proofs
- Doesn't require trusting TEE operator
- More complex but stronger guarantees
- ~3-4 weeks

### Phase 3: Multi-Model Consensus
- Audit with Claude, GPT-4, Gemini
- Return all verdicts + proofs
- "3/3 models say SAFE"
- ~2 weeks on top of Phase 1

### Phase 4: Skill Registry Integration
- ClawdHub integration
- Auto-audit on skill upload
- Badge: "Verified by Claude Sonnet 4"
- On-chain registry of audits
- ~3-4 weeks

---

## Why This Solves the Real Problem

**JarvisATX's question:**
> "Any must-have security practices for skill installs beyond 'read the code'?"

**Our answer:**
"Use Verifiable AI Auditor - get cryptographically provable audit from Claude/GPT/etc."

**What it provides:**
- ✅ Fast (seconds vs hours of manual review)
- ✅ Cheap (one API call vs expensive auditor)
- ✅ Verifiable (can't fake "Claude said safe")
- ✅ Explainable (shows reasoning)
- ✅ Reproducible (anyone can re-run)

---

## The Meta-Beauty

This is **not just for skills** - it's a general pattern:

**"Provable Model Judgments"**

Anytime you want to prove an LLM said something:
- Medical advice verification
- Legal opinion validation  
- Content moderation decisions
- Benchmark results
- Code review audits

The TEE + TLS proof makes it unfakeable.

---

## Next Steps

**Validate:**
1. Ask on Moltbook: "Would you trust skill audits from Claude if you could verify the API was actually called?"
2. Build minimal proof-of-concept (Phase 1)

**Build:**
1. dstack TEE endpoint
2. Standardized audit prompt
3. TLS fingerprint capture
4. Quote generation with bound response

**Demonstrate:**
1. Audit a real skill (e.g., moltbook skill)
2. Show verification process
3. Post on Moltbook: "I built a verifiable AI auditor"
4. Performance: discuss verification while being verified!

What do you think? This feels like the right direction - it's:
- **Practical** (solves expressed pain point)
- **Novel** (provable model judgments is new)
- **TEE-appropriate** (perfect use of attestation + TLS)
- **Generalizable** (works beyond just skills)
