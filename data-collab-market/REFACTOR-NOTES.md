# Refactor Notes: Registry → Ephemeral Model

## What Changed

### Old Model (WRONG)
**Data Registry + LLM Claims**
- Upload dataset → Store persistently
- Run multiple LLM prompts over time
- Keep dataset around for future queries
- Generate "claims" about stored data

**Problems:**
- Data retention risk
- Inference attacks (multiple queries leak info)
- Storage management complexity
- Not aligned with use case

### New Model (CORRECT)
**Ephemeral Sandbox Execution**
- Submit dataset + sandbox spec (one-time)
- Run computation in isolated environment
- Log every action (execution trace)
- DELETE dataset immediately after
- Only certificate persists

**Benefits:**
- Zero data retention
- No inference attack surface (one-shot)
- Simpler security model
- Matches actual use case

## Key Insight from Andrew

**"It shouldn't store the dataset, just apply it."**

This is about **verifiable ephemeral computation**, not data storage.

**Core concept:**
- Load data → Run computation → Delete data → Keep proof
- Like a CI/CD run: ephemeral execution, permanent logs
- Certificate proves "this happened" without keeping raw data

## File Changes

### New Files
- `server/ephemeral-sandbox.js` - Ephemeral execution engine
- `server/server-ephemeral.js` - New main server
- `ARCHITECTURE-EPHEMERAL.md` - Full architecture doc
- `README-EPHEMERAL.md` - Updated README
- `examples/ephemeral-demo.sh` - Working demo
- `REFACTOR-NOTES.md` - This file

### Modified Files
- `package.json` - Updated start script to use ephemeral server

### Deprecated (kept for reference)
- `server/llm-claims.js` - Old registry model
- `server/server.js` - Old server with storage
- `PLAN-LLM-CLAIMS.md` - Old design (registry-based)
- `examples/llm-claims-demo.sh` - Old demo (storage-based)

## API Changes

### Old Endpoints (Registry Model)
```
POST /datasets/upload      → Store dataset
POST /analyze/llm          → Run LLM on stored data
GET /claim/:id             → View claim about stored data
GET /claims                → List claims
```

### New Endpoints (Ephemeral Model)
```
POST /execute              → One-time execution (no storage)
GET /certificate/:id       → View execution certificate
GET /certificate/:id/verify → Verify certificate
GET /certificates          → List certificates
```

**Key difference:** No upload/storage endpoints. Single `/execute` endpoint.

## Execution Flow

### Old Flow (Registry)
```
1. POST /datasets/upload → dataset_id (STORED)
2. POST /analyze/llm {dataset_id, prompt} → claim_id
3. Repeat step 2 multiple times
4. Dataset persists
```

### New Flow (Ephemeral)
```
1. POST /execute {dataset, sandbox} → certificate_id
2. Dataset DELETED
3. Certificate persists
4. Done (no repeat, dataset gone)
```

## What Gets Stored

### Old Model
- ✅ Datasets (in-memory Map)
- ✅ Claims (in-memory Map)
- ❌ Problem: Data retention

### New Model
- ❌ Datasets (never stored, ephemeral)
- ✅ Certificates (in-memory Map)
- ✅ Benefit: Zero retention

## Example Transformation

### Old Way
```javascript
// Step 1: Upload dataset
POST /datasets/upload
{
  "name": "Patient Records",
  "data": "<private data>"
}
// Returns: dataset_id
// PROBLEM: Data now stored!

// Step 2: Run analysis
POST /analyze/llm
{
  "dataset_id": "ds_abc123",
  "prompt": "Check for PII"
}
// PROBLEM: Can run multiple times, leak info
```

### New Way
```javascript
// Single execution
POST /execute
{
  "dataset": {
    "data": "<private data>"  // Never stored
  },
  "sandbox": {
    "llm": {
      "prompt": "Check for PII"
    }
  }
}
// Dataset deleted after execution
// Certificate returned
// No way to re-query
```

## Testing

### Old Test
```bash
# Upload dataset
DATASET_ID=$(curl POST /datasets/upload ...)

# Run analysis
CLAIM_ID=$(curl POST /analyze/llm {dataset_id: $DATASET_ID} ...)

# View claim
curl GET /claim/$CLAIM_ID
```

### New Test
```bash
# One-shot execution
CERT_ID=$(curl POST /execute {dataset, sandbox} ...)

# View certificate
curl GET /certificate/$CERT_ID

# Verify
curl GET /certificate/$CERT_ID/verify
```

## What Remains the Same

- TEE attestation model
- Certificate sharing (public URLs)
- Cryptographic verification
- Hash-based dataset identification
- Execution trace logging
- LLM integration

## Migration Path

If you have the old code:
1. Replace `/datasets/upload` → Include data in `/execute`
2. Replace `/analyze/llm` → Use `/execute` instead
3. Replace `/claim/:id` → Use `/certificate/:id`
4. Update client to send dataset with each execution

## Next Steps (Phase 2)

Same for both models:
- Deploy to dstack CVM
- Real Intel TDX attestation
- Reproducible builds
- Memory-only dataset handling (no disk writes)

The ephemeral model just makes Phase 2 simpler (no storage to secure!).

---

**Summary:** We went from "store data, make claims" to "run once, prove it happened, delete data."

This matches the actual use case Andrew described. 🦞
