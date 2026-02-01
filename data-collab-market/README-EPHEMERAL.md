# Ephemeral Sandbox Execution Service

**Verifiable one-time computation over private data**

## The Core Concept

NOT a data registry. NOT a storage service.  
**Ephemeral execution with permanent proof.**

```
┌─────────────────────────────────┐
│  INPUTS (one-time)              │
│  ├─ Private dataset             │
│  ├─ Sandbox spec (LLM + tools)  │
│  └─ API key                     │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  EXECUTION (in TEE)             │
│  ├─ Load → memory ONLY          │
│  ├─ Run computation             │
│  ├─ Log every action            │
│  ├─ Generate certificate        │
│  ├─ DELETE dataset              │
│  └─ Destroy sandbox             │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  OUTPUT (permanent)             │
│  ├─ Execution certificate       │
│  ├─ Result                      │
│  ├─ Proof of execution          │
│  └─ Dataset: GONE               │
└─────────────────────────────────┘
```

**Key insight:** Dataset is NEVER stored. Only the execution certificate persists.

## Quick Start

```bash
# Install
npm install

# Start server
node server/server-ephemeral.js
# Runs on http://localhost:3003

# Run demo (requires Anthropic API key)
export ANTHROPIC_API_KEY="sk-ant-..."
./examples/ephemeral-demo.sh
```

## Example: Compliance Check

**Scenario:** Prove "My dataset contains no PII" without exposing the data

```bash
POST /execute
{
  "dataset": {
    "data": "<private patient records>",
    "format": "csv"
  },
  "sandbox": {
    "llm": {
      "prompt": "Scan for PII: names, SSN, email, phone",
      "model": "claude-sonnet-4",
      "api_key": "sk-ant-..."
    },
    "tools": ["python", "grep"]
  }
}
```

**What happens:**
1. ✅ Load patient records → memory (not disk)
2. ✅ Run PII scanner
3. ✅ Log: "Scanned 10,000 records, 0 PII found"
4. ✅ Generate certificate with execution trace
5. ✅ **DELETE patient records from memory**
6. ✅ Destroy sandbox

**Response:**
```json
{
  "certificate_id": "cert_abc123",
  "result": {
    "output": "No PII instances found"
  },
  "execution_summary": {
    "dataset_deleted": true,
    "sandbox_destroyed": true
  },
  "proof": {
    "dataset_hash": "sha256:...",
    "tee_attestation": "0x..."
  },
  "certificate_url": "/certificate/cert_abc123"
}
```

**Share the certificate:**
```bash
GET /certificate/cert_abc123
```

Anyone can verify:
- ✅ Computation ran correctly
- ✅ Dataset hash matches expected
- ✅ TEE attestation is valid
- ❌ Original data NOT accessible (deleted)

## Use Cases

### 1. Research Validation
**Claim:** "My model achieves 95% accuracy"
- Execute: Model evaluation on private test set
- Certificate: Proves performance without revealing test data

### 2. Compliance Certification
**Claim:** "This dataset complies with GDPR"
- Execute: GDPR compliance checker
- Certificate: Audit-ready proof without data exposure

### 3. Data Quality Assessment
**Claim:** "Dataset has <1% missing values"
- Execute: Quality checker
- Certificate: Proves quality without revealing data

### 4. Competitive Benchmarking
**Claim:** "Our engagement rate is 47%"
- Execute: Metric calculator
- Certificate: Verifiable claim without customer data exposure

### 5. Info Bazaar
**Claim:** "I have data relevant to query X"
- Execute: Relevance checker
- Certificate: Proves value before purchase

## API Endpoints

### `POST /execute`
Run ephemeral computation

### `GET /certificate/:id`
View execution certificate (public)

### `GET /certificate/:id/verify`
Verify certificate cryptographically

### `GET /certificates`
List all certificates

## Architecture

See [`ARCHITECTURE-EPHEMERAL.md`](./ARCHITECTURE-EPHEMERAL.md) for full details.

**Key principles:**
- **Ephemeral:** Dataset exists only during execution
- **Transparent:** Every action logged in execution trace
- **Verifiable:** TEE attestation proves it happened
- **Private:** Raw data never exposed or stored

## Differences from Data Registry

| Aspect | Registry Model | Ephemeral Model |
|--------|----------------|-----------------|
| **Storage** | Store dataset | Never store |
| **Queries** | Multiple | One execution |
| **Lifetime** | Persistent | Disposable |
| **Output** | Claims about data | Execution certificate |
| **Privacy risk** | Data retention | Zero retention |

## Current Status

**Phase 1 (MVP):** Simulated TEE, localhost  
**Phase 2 (Next):** Deploy to dstack for real Intel TDX attestation

## Documentation

- **[ARCHITECTURE-EPHEMERAL.md](./ARCHITECTURE-EPHEMERAL.md)** - Full architecture
- **[examples/ephemeral-demo.sh](./examples/ephemeral-demo.sh)** - Working demo

## Why This Matters

**Solves the trust problem:**
- Traditional: "Trust me, I ran this correctly"
- Ephemeral model: "Here's cryptographic proof of execution"

**Enables Info Bazaar:**
- Prove data value WITHOUT exposing it
- Verifiable claims enable market pricing
- Zero-retention execution builds trust

**Enables ndai (non-deterministic AI):**
- AI learns from private datasets
- Provable training execution
- Knowledge without exposure

---

**Dataset is NEVER stored. Only execution certificates persist.** 🦞🔐
