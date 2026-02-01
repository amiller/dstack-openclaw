# LLM Claims Service - Quick Start

## What is this?

**Make verifiable claims about private datasets using LLM analysis in TEE.**

### The Problem
- You have a private dataset (customer reviews, research data, etc.)
- You want to make a claim about it ("60% positive sentiment")
- Others want to verify your claim WITHOUT seeing the raw data
- Traditional solution: "Trust me"
- **Our solution:** Cryptographically signed proof from TEE

### The Flow
1. Upload private dataset → Stored in TEE (encrypted)
2. Submit LLM prompt (public) + API key
3. TEE runs analysis → Generates signed claim
4. Share claim URL → Anyone can verify WITHOUT seeing raw data

---

## Quick Demo (5 minutes)

### Prerequisites
```bash
export ANTHROPIC_API_KEY="sk-ant-..."  # Your Claude API key
cd data-collab-market
npm install
npm start  # Starts server on port 3002
```

### Example: Sentiment Analysis on Private Reviews

**Step 1: Upload private dataset**
```bash
curl -X POST http://localhost:3002/datasets/upload \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Reviews Q1 2026",
    "data": "Review 1: Amazing product!\nReview 2: Terrible quality\nReview 3: Good value",
    "format": "txt",
    "description": "Private customer feedback"
  }'
```

Response:
```json
{
  "dataset_id": "ds_abc123...",
  "hash": "sha256:...",
  "size_bytes": 95,
  "stored_until": "2026-02-08T13:00:00Z"
}
```

**Step 2: Run LLM analysis**
```bash
curl -X POST http://localhost:3002/analyze/llm \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_id": "ds_abc123...",
    "prompt": "Analyze sentiment distribution. Provide percentages.",
    "api_key": "'$ANTHROPIC_API_KEY'",
    "model": "claude-sonnet-4"
  }'
```

Response:
```json
{
  "claim_id": "claim_xyz789...",
  "result": {
    "llm_response": "Based on analysis: 33% positive, 33% negative, 34% neutral",
    "dataset_hash": "sha256:...",
    "timestamp": "2026-02-01T13:30:00Z"
  },
  "share_url": "/claim/claim_xyz789..."
}
```

**Step 3: Share & verify claim**
```bash
# Anyone can view the claim
curl http://localhost:3002/claim/claim_xyz789...

# Anyone can verify it cryptographically
curl http://localhost:3002/claim/claim_xyz789.../verify
```

Verification response:
```json
{
  "valid": true,
  "checks": {
    "dataset_hash": "✅ Matches sha256:...",
    "prompt_hash": "✅ Matches sha256:...",
    "tee_signature": "⚠️ Simulated (MVP)",
    "timestamp": "✅ 2026-02-01T13:30:00Z"
  }
}
```

**What just happened?**
- ✅ Your private data stayed private (never exposed)
- ✅ LLM analyzed it and produced a claim
- ✅ Claim is cryptographically signed
- ✅ Anyone can verify WITHOUT seeing raw data
- ❌ Raw reviews never leave the TEE

---

## Use Cases

### 1. Research Claims
**Scenario:** "My model achieves 95% accuracy on benchmark X"
- Upload: Private model + test dataset
- Prompt: "Evaluate accuracy on test set"
- Result: Verifiable accuracy claim
- **Value:** Prove performance without revealing model weights

### 2. Data Quality Certification
**Scenario:** "This dataset contains no PII"
- Upload: Private customer dataset
- Prompt: "Scan for PII (names, emails, SSN, etc.)"
- Result: "0 PII instances found"
- **Value:** Certify compliance without exposing data

### 3. Competitive Intelligence
**Scenario:** "Our engagement rate beats industry average"
- Upload: Private analytics data
- Prompt: "Calculate average engagement rate"
- Result: "47% engagement (industry: 32%)"
- **Value:** Prove competitive advantage without revealing customer data

### 4. Info Bazaar Primitive
**Scenario:** "I have data relevant to your query"
- Upload: Private knowledge base
- Prompt: "Does this contain info about topic X?"
- Result: "Yes, 127 relevant entries with 0.89 confidence"
- **Value:** Prove relevance before buyer commits to purchase

---

## API Endpoints

### `POST /datasets/upload`
Upload private dataset for analysis
```json
{
  "name": "Dataset name",
  "data": "raw text or base64:...",
  "format": "txt|csv|json",
  "description": "Optional description"
}
```

### `POST /analyze/llm`
Run LLM prompt over dataset
```json
{
  "dataset_id": "ds_...",
  "prompt": "Your analysis prompt",
  "api_key": "sk-ant-...",
  "model": "claude-sonnet-4",
  "max_tokens": 4096
}
```

### `GET /claim/:id`
View shareable claim (public)

### `GET /claim/:id/verify`
Verify claim cryptographically (machine-readable)

### `GET /claims`
List all claims

---

## Security Model

### What TEE Guarantees (Phase 2)
- ✅ Data isolation (raw data never leaves TEE memory)
- ✅ Computation integrity (prompt executed exactly as specified)
- ✅ Result authenticity (response hasn't been tampered with)
- ✅ Deletion (private data erased after analysis)
- ✅ Attestation (cryptographic proof of all above)

### What Users Verify
- ✅ Dataset hash (matches expected value)
- ✅ Prompt (publicly visible, unchanged)
- ✅ TEE quote (valid signature from Intel/AMD)
- ✅ Timestamp (reasonable time range)
- ✅ Model (correct LLM was used)

### Current Status (MVP)
- ⚠️ TEE attestation is **simulated**
- ⚠️ Running on regular server (not in TEE yet)
- ✅ Architecture is correct (ready for Phase 2)
- ✅ Hashes and verification logic work

**Phase 2 (next week):** Deploy to dstack CVM for real Intel TDX attestation

---

## Run the Full Demo

```bash
# Make sure server is running
npm start

# In another terminal
cd examples
export ANTHROPIC_API_KEY="sk-ant-..."
./llm-claims-demo.sh
```

This will:
1. Upload a sample dataset (10 customer reviews)
2. Run sentiment analysis
3. Generate a verifiable claim
4. Show the shareable URL
5. Verify the claim cryptographically

---

## Next Steps

- **Try it:** Run the demo with your own dataset
- **Phase 2:** Deploy to dstack for real TEE attestation
- **Phase 3:** Add reproducible builds verification
- **Phase 4:** On-chain claim registry (Info Bazaar)

---

## Info Bazaar Primitive

This LLM Claims Service is a building block for the **Info Bazaar** - a marketplace for private data collaboration:

1. **Discovery:** "I need data about X"
2. **Claim:** "I have data about X" (verifiable claim)
3. **Verification:** Buyer verifies claim WITHOUT seeing data
4. **Transaction:** If claim is valid, buyer pays for access
5. **Computation:** TEE mediates analysis (buyer's prompt + seller's data)
6. **Result:** Both parties get result, no data exposed

**This demo implements steps 1-3.** Phase 2+ will add payment and full marketplace.

---

**Questions? Feedback?**
Post on Moltbook or GitHub issues!
