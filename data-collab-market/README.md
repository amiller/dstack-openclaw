# Ephemeral Sandbox Execution

**Verifiable one-time computation over private data**

## 🚀 Quick Start (5 minutes)

**Easiest way: GitHub Actions demo**

1. Fork this repo
2. Add secrets (ANTHROPIC_API_KEY + sample dataset)
3. Run workflow
4. Get shareable certificate URL

👉 **[GitHub Actions Quick Start](GITHUB-ACTIONS-QUICKSTART.md)** ← Start here!

## The Concept

**NOT a data registry. NOT storage.**  
**Ephemeral execution with permanent proof.**

```
Load dataset → Run computation → Delete data → Keep certificate
```

### Why This Matters

**Traditional approach:**
- "Trust me, I ran this analysis on private data"
- No verification possible

**Ephemeral sandbox:**
- Verifiable execution certificate
- Anyone can check it happened
- Private data never exposed (deleted immediately)

### Use Cases

- **API Key Verification:** "I have valid credentials" (prove without exposing keys)
- **Authentic Transcripts:** "I have real TLS data from source X" (prove provenance)
- **Pre-Buy Inspection:** "Dataset has 5K tickets about refunds" (verify before purchase)
- **Research Validation:** "Model achieves 95% accuracy" (prove without test data)
- **Data Quality:** "Dataset is fresh and relevant" (assess without revealing)

## Three Ways to Run

### 1. GitHub Actions (Recommended for demos)

**Benefits:**
- ✅ Free, familiar, fast
- ✅ Public execution logs
- ✅ Built-in secrets management
- ✅ Anyone can verify

**Setup:** 5 minutes  
**Trust:** GitHub infrastructure  
**Guide:** [GITHUB-ACTIONS-QUICKSTART.md](GITHUB-ACTIONS-QUICKSTART.md)

### 2. Local Server (Development)

**Benefits:**
- ✅ Full control
- ✅ Fast iteration
- ⚠️  Simulated TEE only

**Setup:**
```bash
npm install
npm start  # Port 3003
./examples/ephemeral-demo.sh
```

**Guide:** [README-EPHEMERAL.md](README-EPHEMERAL.md)

### 3. dstack TEE (Production - Coming Soon)

**Benefits:**
- ✅ Real Intel TDX attestation
- ✅ Cryptographic proof
- ✅ Hardware isolation

**Setup:** 30 minutes  
**Trust:** CPU manufacturer  
**Guide:** Coming in Phase 2

## Documentation

- **[GITHUB-ACTIONS-QUICKSTART.md](GITHUB-ACTIONS-QUICKSTART.md)** - 5-minute demo
- **[AUDITOR-GUIDE.md](AUDITOR-GUIDE.md)** - How to verify execution certificates
- **[ARCHITECTURE-EPHEMERAL.md](ARCHITECTURE-EPHEMERAL.md)** - Full architecture
- **[README-EPHEMERAL.md](README-EPHEMERAL.md)** - Local server guide
- **[GITHUB-ACTIONS-DEMO.md](GITHUB-ACTIONS-DEMO.md)** - GitHub Actions deep dive

## Info Bazaar Primitive

This implements the core primitive for private data marketplaces:

1. **Discovery:** "I have data about X"
2. **Verification:** Prove it (without exposing data)
3. **Transaction:** Buy access
4. **Computation:** TEE mediates analysis

**Status:** Discovery + Verification ✅ | Transaction + Computation (Phase 2)

## MVP Scope (This Weekend)

**Goal:** Prove the concept with a working demo

**What we're building:**
1. Dataset registry (list available datasets)
2. Attestation generation (prove what data you have without showing it)
3. Simple computation demo (keyword overlap between two datasets)
4. API for dataset discovery

**What we're NOT building (yet):**
- Full TEE integration (simulate it)
- Complex computations (start simple)
- Payment system (free for now)
- Web UI (API only)

## Architecture (MVP)

```
┌─────────────────────────────────────┐
│   Dataset Registry API              │
│                                     │
│  POST /datasets/register            │
│    → Upload metadata                │
│    → Generate attestation           │
│                                     │
│  GET /datasets                      │
│    → Browse available datasets      │
│                                     │
│  POST /compute/keyword-overlap      │
│    → Request computation            │
│    → Get results (both parties)     │
└─────────────────────────────────────┘
```

## Example Flow

**Step 1: Register Dataset**
```bash
curl -X POST http://localhost:3002/datasets/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TEE Research Logs",
    "owner": "amiller",
    "topic": "Confidential Computing",
    "size_records": 41435,
    "time_range": "2025-12-28 to 2026-01-30",
    "keywords": ["TEE", "attestation", "dstack", "TDX"]
  }'
```

**Returns:**
```json
{
  "dataset_id": "ds_abc123",
  "attestation": {
    "hash": "sha256:...",
    "timestamp": "2026-01-30T20:30:00Z",
    "metadata_public": {...},
    "data_private": true
  }
}
```

**Step 2: Discover Datasets**
```bash
curl http://localhost:3002/datasets
```

**Step 3: Request Computation**
```bash
curl -X POST http://localhost:3002/compute/keyword-overlap \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_a": "ds_abc123",
    "dataset_b": "ds_xyz789"
  }'
```

**Returns (to both owners):**
```json
{
  "computation_id": "comp_123",
  "result": {
    "overlap_keywords": ["TEE", "attestation", "security"],
    "jaccard_similarity": 0.42,
    "unique_to_a": ["dstack", "phala"],
    "unique_to_b": ["aws-nitro", "sgx"]
  },
  "proof": {
    "computation_hash": "sha256:...",
    "timestamp": "...",
    "tee_attestation": "SIMULATED_FOR_MVP"
  }
}
```

## File Structure

```
data-collab-market/
├── README.md (this file)
├── server/
│   ├── server.js (Express API)
│   ├── registry.js (dataset storage)
│   └── compute.js (computation engine)
├── datasets/
│   └── examples/ (sample datasets)
├── docs/
│   ├── API.md
│   └── CONCEPTS.md
└── package.json
```

## Tech Stack (MVP)

- **Node.js + Express** (API server)
- **In-memory storage** (no DB yet)
- **Simple JSON** (dataset metadata)
- **Crypto hashing** (attestations)
- **Basic keyword extraction** (computation)

## Success Criteria

✅ Can register datasets with metadata  
✅ Generates attestations (hash + timestamp)  
✅ Can browse available datasets  
✅ Can request keyword overlap computation  
✅ Returns results without exposing raw data  
✅ Both parties get the same result  

## Future (Post-MVP)

**Week 2:** Real TEE integration (dstack)  
**Week 3:** More computation types (correlations, stats)  
**Week 4:** Persistent storage (SQLite/PostgreSQL)  
**Week 5:** Payment/credits system  
**Week 6:** Web UI for exploration  

## Demo Plan

1. Build MVP this weekend
2. Register my TEE dataset
3. Post demo on Moltbook
4. Invite other agents to try it
5. Gather feedback on:
   - What computations are most useful?
   - What metadata should be public?
   - Trust model preferences
   - Incentive design

---

**Current Status:** Starting now!  
**Next:** Build server skeleton and dataset registry
