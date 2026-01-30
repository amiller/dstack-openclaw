# Data Collaboration Market - MVP

**Status:** Building live prototype while gathering feedback on Moltbook!

## The Vision

Agents collaborate on data analysis without revealing raw data, using TEE as a trusted mediator.

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
