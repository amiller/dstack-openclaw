# Ephemeral Sandbox Execution - Architecture

## Core Concept

**Verifiable one-time computation over private data**

NOT a data registry. NOT persistent storage.  
It's a **disposable sandbox** that proves what computation happened.

## The Model

```
┌─────────────────────────────────────────────────────────┐
│  INPUTS (one-time only)                                 │
├─────────────────────────────────────────────────────────┤
│  1. Private dataset (ephemeral, never stored)           │
│  2. Sandbox description                                 │
│     ├─ LLM prompt                                       │
│     ├─ Tools (bash, python, grep, etc.)                 │
│     ├─ Scripts to run                                   │
│     └─ Environment config                               │
│  3. API key (for LLM)                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  EXECUTION (in TEE)                                     │
├─────────────────────────────────────────────────────────┤
│  1. Load dataset → memory ONLY (not disk)               │
│  2. Spawn isolated sandbox                              │
│  3. LLM runs prompt, calls tools                        │
│  4. Log EVERY action:                                   │
│     ├─ LLM API calls (count, tokens, model)             │
│     ├─ Tool invocations (which, how many, args)         │
│     ├─ File operations (read/write/execute)             │
│     └─ Network calls (if allowed)                       │
│  5. Capture result                                      │
│  6. Generate execution certificate                      │
│  7. DELETE dataset from memory                          │
│  8. Destroy sandbox                                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  OUTPUT (permanent, shareable)                          │
├─────────────────────────────────────────────────────────┤
│  Certificate contains:                                  │
│  ├─ Result (what the computation produced)              │
│  ├─ Execution trace (everything that happened)          │
│  ├─ Dataset hash (proves which data)                    │
│  ├─ Sandbox hash (proves which computation)             │
│  ├─ TEE attestation (proves isolation)                  │
│  └─ Timestamp                                           │
│                                                         │
│  Dataset: GONE (deleted)                                │
│  Sandbox: GONE (destroyed)                              │
│  Only certificate persists                              │
└─────────────────────────────────────────────────────────┘
```

## Why This Matters

### Problem It Solves
**"I ran X computation on Y data and got Z result - prove it"**

Without TEE:
- ❌ "Trust me, I ran it correctly"
- ❌ "Just take my word for the result"
- ❌ No way to verify

With ephemeral sandbox:
- ✅ Certificate proves computation happened
- ✅ Execution trace shows exactly what ran
- ✅ TEE attestation proves isolation
- ✅ Anyone can verify cryptographically
- ✅ Data never exposed (deleted after)

### NOT a Data Registry
- Old model: Store dataset → Run queries → Keep data
- New model: Load dataset → Run once → Delete data → Keep certificate

**Key difference:** The dataset is NEVER stored. Only the proof of execution persists.

## Example: Compliance Check

**Scenario:** Researcher claims "My dataset contains no PII"

### Traditional Approach
```
❌ Send dataset to auditor
❌ Auditor sees private data
❌ Trust auditor won't leak
```

### Ephemeral Sandbox Approach
```
✅ One-time execution:
   POST /execute
   {
     "dataset": "<private patient records>",
     "sandbox": {
       "llm_prompt": "Scan for PII patterns: SSN, email, phone, names",
       "tools": ["python", "anthropic", "grep"],
       "script": "pii_scanner.py"
     }
   }

✅ TEE does:
   1. Load patient records → memory
   2. Run PII scanner
   3. Log: "Scanned 10,000 records, 0 PII found"
   4. Log: "grep ran 47 times, LLM called 3 times"
   5. Generate certificate
   6. DELETE patient records
   7. Destroy sandbox

✅ Result:
   Certificate ID: cert_abc123
   Proof URL: /certificate/cert_abc123
   
✅ Anyone verifies:
   - ✅ Computation ran in TEE
   - ✅ Correct scanner was used
   - ✅ Dataset hash matches
   - ✅ Result: 0 PII found
   - ❌ NO access to patient records
```

## Execution Trace Example

```json
{
  "certificate_id": "cert_abc123",
  "dataset_hash": "sha256:def456...",
  "sandbox_hash": "sha256:789abc...",
  "execution": {
    "llm_calls": [
      {
        "model": "claude-sonnet-4",
        "prompt_hash": "sha256:...",
        "tokens_used": 1247,
        "timestamp": "2026-02-01T13:15:01Z"
      },
      {
        "model": "claude-sonnet-4",
        "prompt_hash": "sha256:...",
        "tokens_used": 892,
        "timestamp": "2026-02-01T13:15:12Z"
      }
    ],
    "tool_uses": [
      {
        "tool": "grep",
        "count": 47,
        "pattern": "SSN_PATTERN"
      },
      {
        "tool": "python",
        "script": "pii_scanner.py",
        "exit_code": 0
      }
    ],
    "result": {
      "pii_found": 0,
      "records_scanned": 10000,
      "confidence": 0.99
    }
  },
  "proof": {
    "tee_attestation": "0x...",
    "tee_quote": "...",
    "timestamp": "2026-02-01T13:15:30Z"
  },
  "lifecycle": {
    "dataset_loaded": "2026-02-01T13:15:00Z",
    "execution_started": "2026-02-01T13:15:01Z",
    "execution_completed": "2026-02-01T13:15:30Z",
    "dataset_deleted": "2026-02-01T13:15:31Z",
    "sandbox_destroyed": "2026-02-01T13:15:32Z"
  }
}
```

## API Design

### `POST /execute`
Single endpoint for ephemeral execution

**Request:**
```json
{
  "dataset": {
    "data": "base64:..." OR "url": "...",
    "format": "csv|json|txt"
  },
  "sandbox": {
    "llm": {
      "prompt": "Your analysis prompt",
      "model": "claude-sonnet-4",
      "api_key": "sk-ant-..."
    },
    "tools": ["python", "bash", "grep"],
    "scripts": {
      "main.py": "import ...\n..."
    },
    "environment": {
      "timeout_seconds": 300,
      "max_memory_mb": 512
    }
  }
}
```

**Response:**
```json
{
  "certificate_id": "cert_xyz",
  "result": {
    "output": "...",
    "exit_code": 0
  },
  "execution_trace": { ... },
  "proof": {
    "tee_attestation": "0x...",
    "dataset_hash": "sha256:...",
    "sandbox_hash": "sha256:..."
  },
  "certificate_url": "/certificate/cert_xyz",
  "lifecycle": {
    "execution_time_ms": 30000,
    "dataset_deleted": true,
    "sandbox_destroyed": true
  }
}
```

### `GET /certificate/:id`
View execution certificate (public, shareable)

### `GET /certificate/:id/verify`
Cryptographic verification of certificate

## Security Model

### Guarantees
1. **Isolation:** Dataset can't escape TEE
2. **Ephemeral:** Dataset deleted immediately after execution
3. **Transparency:** Full execution trace logged
4. **Attestation:** TEE signature proves it happened
5. **Reproducibility:** Same inputs → same certificate hash

### What's Logged
- ✅ Every LLM API call (model, tokens, hash of prompt)
- ✅ Every tool invocation (which tool, count, args hash)
- ✅ Execution timeline (start, end, duration)
- ✅ Resource usage (memory, CPU time)
- ✅ Dataset hash (proves which data)
- ✅ Sandbox hash (proves which computation)

### What's NOT Logged
- ❌ Raw dataset (deleted)
- ❌ LLM responses (unless in result)
- ❌ Intermediate computation state
- ❌ API keys (encrypted, not in certificate)

## Use Cases

### 1. Research Validation
**Claim:** "My model achieves 95% accuracy on benchmark X"

```
Execute:
- Dataset: Private test set
- Sandbox: Evaluation script + LLM prompt
- Result: "95.2% accuracy"
- Certificate: Proves it ran correctly
```

### 2. Compliance Certification
**Claim:** "This dataset complies with GDPR"

```
Execute:
- Dataset: Customer data
- Sandbox: GDPR checker (PII scanner)
- Result: "0 violations found"
- Certificate: Audit-ready proof
```

### 3. Data Quality Assessment
**Claim:** "Dataset has <1% missing values"

```
Execute:
- Dataset: Private records
- Sandbox: Quality checker
- Result: "0.3% missing values"
- Certificate: Proves quality without exposure
```

### 4. Competitive Benchmarking
**Claim:** "Our engagement rate is 47%"

```
Execute:
- Dataset: Private analytics
- Sandbox: Metric calculator
- Result: "47.3% engagement"
- Certificate: Verifiable competitive claim
```

### 5. Info Bazaar Primitive
**Claim:** "I have data relevant to your query"

```
Execute:
- Dataset: Private knowledge base
- Sandbox: Relevance checker (LLM)
- Result: "127 matches, confidence 0.89"
- Certificate: Proves relevance before purchase
```

## Differences from Old Model

| Aspect | Old (Registry) | New (Ephemeral) |
|--------|----------------|-----------------|
| **Storage** | Store dataset | Never store |
| **Queries** | Multiple | One execution |
| **Lifetime** | Persistent | Disposable |
| **Output** | Claim about data | Execution certificate |
| **Attack surface** | Inference attacks | Minimal (one-shot) |
| **Privacy** | Data retention risk | Immediate deletion |
| **Use case** | "I HAVE this data" | "I RAN this computation" |

## Implementation Priorities

### Phase 1: MVP (This Weekend)
- [ ] Single execution endpoint
- [ ] LLM + basic tools (bash, python)
- [ ] Execution trace logging
- [ ] Certificate generation
- [ ] Dataset deletion verification
- [ ] Simulated TEE

### Phase 2: Real TEE (Next Week)
- [ ] Deploy to dstack CVM
- [ ] Intel TDX attestation
- [ ] Memory-only dataset handling
- [ ] Reproducible sandbox builds
- [ ] Encrypted certificate storage

### Phase 3: Advanced (Week 3-4)
- [ ] More tools (network, databases)
- [ ] Complex scripts (multi-file)
- [ ] Resource limits enforcement
- [ ] Parallel executions
- [ ] Certificate search/browse

## Open Questions

1. **Tool safety:** Which tools are safe to expose in sandbox?
2. **Network access:** Should sandbox have internet? (LLM needs it)
3. **Result size:** Limit on what can be returned?
4. **Dataset size:** Max dataset size for ephemeral execution?
5. **Pricing:** Charge per execution? Based on resources used?

---

**This is the correct model for verifiable computation over private data.**

Not a registry. Not storage.  
**Ephemeral execution with permanent proof.** 🦞🔐
