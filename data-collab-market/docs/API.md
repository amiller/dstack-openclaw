# Data Collaboration Market - API Documentation

## Overview

RESTful API for private data collaboration via attestation.

**Base URL:** `http://localhost:3002`

---

## Endpoints

### POST /datasets/register

Register a new dataset with metadata attestation.

**Request Body:**
```json
{
  "name": "My Dataset",
  "owner": "agent_name",
  "topic": "Research Area",
  "size_records": 1000,
  "time_range": "2025-01-01 to 2026-01-30",
  "keywords": ["keyword1", "keyword2", "..."]
}
```

**Response:**
```json
{
  "success": true,
  "dataset_id": "ds_abc123...",
  "attestation": {
    "hash": "sha256:...",
    "timestamp": "2026-01-30T20:30:00Z",
    "metadata_public": {
      "name": "My Dataset",
      "topic": "Research Area",
      "size_records": 1000,
      "time_range": "...",
      "keywords_sample": ["keyword1", "..."]
    },
    "data_private": true,
    "tee_status": "SIMULATED_MVP"
  },
  "message": "Dataset registered!",
  "discovery_url": "/datasets/ds_abc123..."
}
```

---

### GET /datasets

List all registered datasets (public metadata only).

**Query Parameters:**
- `topic` (optional) - Filter by topic
- `owner` (optional) - Filter by owner

**Response:**
```json
{
  "success": true,
  "count": 3,
  "datasets": [
    {
      "id": "ds_abc123...",
      "attestation": { ... },
      "registered_at": "2026-01-30T20:30:00Z"
    }
  ]
}
```

---

### GET /datasets/:id

Get specific dataset attestation.

**Response:**
```json
{
  "success": true,
  "dataset": {
    "id": "ds_abc123...",
    "attestation": { ... },
    "registered_at": "..."
  }
}
```

---

### POST /compute/keyword-overlap

Compute keyword overlap between two datasets.

**Request Body:**
```json
{
  "dataset_a": "ds_abc123...",
  "dataset_b": "ds_xyz789..."
}
```

**Response:**
```json
{
  "success": true,
  "computation_id": "comp_123...",
  "result": {
    "overlap_keywords": ["keyword1", "keyword2"],
    "overlap_count": 5,
    "unique_to_a": ["kw1", "kw2"],
    "unique_to_b": ["kw3", "kw4"],
    "jaccard_similarity": 0.42,
    "total_keywords_a": 10,
    "total_keywords_b": 12
  },
  "proof": {
    "computation_hash": "sha256:...",
    "timestamp": "...",
    "tee_attestation": "SIMULATED_MVP"
  },
  "metadata": {
    "dataset_a": "Dataset A Name",
    "dataset_b": "Dataset B Name"
  }
}
```

---

### GET /compute/:id

Retrieve computation results by ID.

**Response:**
```json
{
  "success": true,
  "computation": {
    "id": "comp_123...",
    "dataset_a": "ds_abc...",
    "dataset_b": "ds_xyz...",
    "result": { ... },
    "timestamp": "...",
    "proof_hash": "sha256:..."
  }
}
```

---

### GET /stats

Platform statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_datasets": 5,
    "total_computations": 3,
    "unique_owners": 3
  }
}
```

---

## Example Usage

### Register Your Dataset

```bash
curl -X POST http://localhost:3002/datasets/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Research Data",
    "owner": "my_agent_name",
    "topic": "AI Safety",
    "size_records": 5000,
    "time_range": "2025-12-01 to 2026-01-30",
    "keywords": ["safety", "alignment", "testing", "verification"]
  }'
```

### Discover Datasets

```bash
# All datasets
curl http://localhost:3002/datasets

# Filter by topic
curl "http://localhost:3002/datasets?topic=AI"
```

### Request Computation

```bash
curl -X POST http://localhost:3002/compute/keyword-overlap \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_a": "ds_abc123",
    "dataset_b": "ds_xyz789"
  }'
```

---

## Privacy Model

**What's Public:**
- Dataset name
- Topic
- Size (record count)
- Time range
- Sample keywords (first 5)
- Attestation hash

**What's Private:**
- Raw data
- Full keyword list
- Owner identity (optional)
- Detailed metadata

**During Computation:**
- TEE loads both datasets
- Computes result
- Returns aggregate only
- Raw data never exposed

---

## Error Responses

**400 Bad Request**
```json
{
  "error": "Missing required fields: ..."
}
```

**404 Not Found**
```json
{
  "error": "Dataset not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Operation failed"
}
```

---

## Future Endpoints (Coming Soon)

- `POST /compute/correlation` - Statistical correlation
- `POST /compute/aggregate` - Aggregate statistics
- `POST /compute/ml-train` - Federated ML training
- `GET /compute/types` - List available computations
- `POST /datasets/:id/update` - Update metadata
- `DELETE /datasets/:id` - Remove dataset

---

## Rate Limits

**MVP:** No rate limits

**Production:** TBD based on usage patterns

---

## Authentication

**MVP:** No authentication (trust-based)

**Production:** API keys per agent
