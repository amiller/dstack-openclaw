# GitHub Actions Demo - Quick Start

**Ephemeral execution using GitHub Actions infrastructure**

## Why GitHub Actions?

- ✅ **Already ephemeral** - Runners destroyed after each run
- ✅ **Secrets management** - Built-in private data storage
- ✅ **Public logs** - Anyone can verify execution
- ✅ **Free** - Unlimited minutes for public repos
- ✅ **Familiar** - Developers already know it

**Perfect MVP before dstack TEE!**

## 5-Minute Demo

### Step 1: Fork/Clone This Repo

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/data-collab-market
cd data-collab-market

# Or fork on GitHub
```

### Step 2: Add Secrets

**Go to repo Settings → Secrets and variables → Actions**

**Add these secrets:**

1. **ANTHROPIC_API_KEY**
   ```
   sk-ant-your-key-here
   ```

2. **PRIVATE_DATASET** (example customer reviews)
   ```
   Review 1: "Amazing product! Best purchase I've made this year. 5/5 stars!"
   Review 2: "Terrible quality. Broke after one week. Very disappointed. 1/5"
   Review 3: "Good value for money. Works as expected. 4/5"
   Review 4: "Outstanding customer service. They really care. 5/5"
   Review 5: "Okay product, nothing special. Average quality. 3/5"
   Review 6: "Loved it! Exceeded my expectations in every way. 5/5"
   Review 7: "Not worth the price. Found better alternatives. 2/5"
   Review 8: "Fantastic! Will definitely buy again and recommend. 5/5"
   Review 9: "Mediocre. Does the job but could be better. 3/5"
   Review 10: "Worst product ever. Complete waste of money. 1/5"
   ```

### Step 3: Run Workflow

**Option A: GitHub UI**
1. Go to **Actions** tab
2. Click **"Ephemeral Sandbox Execution"**
3. Click **"Run workflow"** button
4. Fill in:
   - **llm_prompt**: `Analyze sentiment distribution. Provide percentages for positive, neutral, negative. List common themes.`
   - **dataset_secret**: `PRIVATE_DATASET`
   - **model**: `claude-sonnet-4`
   - **tools**: `python,bash`
5. Click **"Run workflow"**

**Option B: GitHub CLI**
```bash
gh workflow run ephemeral-execution.yml \
  -f llm_prompt="Analyze sentiment distribution. Provide percentages for positive, neutral, negative." \
  -f dataset_secret="PRIVATE_DATASET" \
  -f model="claude-sonnet-4" \
  -f tools="python,bash"
```

### Step 4: View Certificate

**Wait 30-60 seconds, then:**

```bash
# List recent runs
gh run list --workflow=ephemeral-execution.yml

# View specific run
gh run view <RUN_ID>

# Or open in browser
gh run view <RUN_ID> --web
```

**Certificate URL:**
```
https://github.com/YOUR_USERNAME/data-collab-market/actions/runs/RUN_ID
```

### Step 5: Share & Verify

**Share the workflow run URL with anyone:**
```
Hey! I ran sentiment analysis on private customer reviews.
Certificate: https://github.com/.../actions/runs/12345678

You can verify:
✅ Analysis ran on dataset hash: abc123...
✅ Prompt used: "Analyze sentiment distribution..."
✅ Result: 60% positive, 30% neutral, 10% negative
❌ You CANNOT see the actual review text (deleted)
```

**They can verify:**
- ✅ Execution logs are public
- ✅ Result is authentic
- ✅ Dataset hash matches
- ✅ Timestamp is trustworthy
- ❌ Private data NOT exposed

## Example Use Cases

### 1. Research Validation

**Claim:** "My model achieves 95% accuracy on private test set"

**Workflow:**
```bash
gh workflow run ephemeral-execution.yml \
  -f llm_prompt="Evaluate model accuracy on this test set. Report overall accuracy, precision, recall." \
  -f dataset_secret="PRIVATE_TEST_SET"
```

**Certificate proves:**
- ✅ Test set hash: abc123...
- ✅ Accuracy: 95.2%
- ❌ Test cases NOT revealed

### 2. API Key Verification

**Claim:** "I have a valid Anthropic API key with $50 credit"

**Workflow:**
```bash
gh workflow run ephemeral-execution.yml \
  -f llm_prompt="Test this API key by making a small request. Report if valid and check credit balance." \
  -f dataset_secret="ANTHROPIC_API_KEY"
```

**Certificate proves:**
- ✅ API key hash: def456...
- ✅ Key is valid, credit: $52.34
- ❌ Actual API key NOT revealed

### 3. Dataset Pre-Buy Inspection

**Claim:** "My dataset has 5,000 support tickets about refunds"

**Workflow:**
```bash
gh workflow run ephemeral-execution.yml \
  -f llm_prompt="Analyze this dataset: How many tickets? What percentage mention refunds? What are common themes?" \
  -f dataset_secret="SUPPORT_TICKETS"
```

**Certificate proves:**
- ✅ Dataset hash: ghi789...
- ✅ Analysis: "4,987 tickets, 73% mention refunds, themes: shipping delays, product defects"
- ❌ Actual tickets NOT revealed

**Buyer decision:** Data looks valuable → Proceed with purchase

## Advanced: Fetch Dataset from Private URL

Instead of storing data in GitHub Secrets, fetch from a private URL:

**Add secrets:**
```
DATASET_URL=https://private-storage.com/data.csv
DATASET_TOKEN=secret_access_token
```

**Modify workflow to fetch:**
```yaml
- name: Fetch dataset from private URL
  run: |
    curl -H "Authorization: Bearer ${{ secrets.DATASET_TOKEN }}" \
      ${{ secrets.DATASET_URL }} > dataset.txt
    
    HASH=$(sha256sum dataset.txt | cut -d' ' -f1)
    echo "dataset_hash=$HASH" >> $GITHUB_OUTPUT
```

**Benefits:**
- ✅ No size limit (GitHub Secrets max 64KB)
- ✅ Can revoke access token
- ✅ Keep data in your infrastructure

## Comparison: GitHub Actions vs dstack TEE

| Aspect | GitHub Actions | dstack TEE |
|--------|----------------|------------|
| **Setup** | 5 minutes | 30 minutes |
| **Cost** | Free (public repos) | ~$0.50/hour |
| **Trust** | GitHub infrastructure | Intel TDX hardware |
| **Attestation** | Workflow run URL | Cryptographic signature |
| **Auditability** | Public logs | TDX quote + logs |
| **Good for** | MVP, demos, low-stakes | Production, high-stakes |

**Use GitHub Actions for:**
- ✅ Demos and prototypes
- ✅ Low-stakes claims
- ✅ Quick iteration
- ✅ Community projects

**Use dstack TEE for:**
- ✅ Production systems
- ✅ High-value data
- ✅ Regulatory compliance
- ✅ Cryptographic proof requirements

## FAQ

**Q: Can repo admins see the dataset secret?**  
A: Yes - repo admins can access secrets. For stronger privacy, use private URL method and revocable tokens.

**Q: Are execution logs permanent?**  
A: Yes - GitHub preserves workflow logs. They're tamper-proof.

**Q: Can I run this on private repos?**  
A: Yes, but you get limited free minutes. Public repos get unlimited.

**Q: What if LLM leaks dataset in response?**  
A: That's a prompt engineering problem. Be specific: "Analyze but don't quote raw data."

**Q: How is this different from just running locally?**  
A: Local: "Trust me, I ran it"  
GitHub: "Here's public proof from GitHub infrastructure"

## Next Steps

1. **Try the demo** (5 minutes)
2. **Share your certificate** on Moltbook
3. **Get feedback** on the concept
4. **Migrate to dstack** for real TEE attestation

---

**GitHub Actions = Ephemeral execution with public verifiability**

Perfect bridge between localhost demo and production TEE! 🦞
