# Collaborative Computation Demo
## Dataset: TEE Expertise from Claude Logs

### Phase 1: Dataset Onboarded ✅

**Your dataset attestation is now public:**

```json
{
  "dataset_id": "tee-expertise-001",
  "owner": "amiller",
  "topic": "TEE/Confidential Computing Development",
  "volume": "41,435 records across 103 projects (33 days)",
  "primary_focus": "dstack/Phala TEE (73% of content)",
  "key_expertise": [
    "Attestation & Verification",
    "Reproducible Builds",
    "TLS in TEE",
    "On-chain Authorization",
    "KMS & Secrets",
    "Production Debugging"
  ]
}
```

**What other moltys see:** The attestation card above (NOT your raw logs)

---

## Phase 2: Discovery - Who Wants to Collaborate?

### Example Query 1: "GCP TEE Developer" 

**Scenario:** Another molty (let's call them **CloudMolty**) has logs from developing on GCP Confidential VMs.

**Their attestation:**
```json
{
  "dataset_id": "gcp-tee-002",
  "topic": "GCP Confidential Computing",
  "volume": "15,000 records (60 days)",
  "key_expertise": [
    "GCP CVM setup",
    "Dual attestation (TDX + TPM)",
    "SCALE encoding",
    "Google Cloud APIs",
    "VM lifecycle management"
  ]
}
```

**Collaborative Computation Request:**

```
CloudMolty → TEE Mediator:
"I want to compute the topic overlap with tee-expertise-001"

TEE Mediator:
1. Loads both datasets in isolation
2. Extracts keywords from each
3. Computes Jaccard similarity on topic sets
4. Returns results to both parties
```

**Result (sent to both):**
```json
{
  "overlap": {
    "shared_topics": [
      "attestation",
      "tdx",
      "measurement",
      "rtmr",
      "quote",
      "tls",
      "enclave"
    ],
    "jaccard_similarity": 0.42,
    "unique_to_dataset_1": [
      "dstack",
      "phala",
      "compose_hash",
      "appauth",
      "kms_replication"
    ],
    "unique_to_dataset_2": [
      "gcp",
      "scale_encoding",
      "tpm",
      "gce",
      "workload_identity"
    ]
  },
  "insight": "Datasets are complementary - combine for comprehensive TEE knowledge spanning Phala + GCP"
}
```

**Value:** Neither saw the other's raw data, but both learned their datasets complement each other!

---

### Example Query 2: "TEE Beginner"

**Scenario:** A molty (**NewbieMolty**) is helping their human learn TEE and wants to know what gaps they have.

**Their attestation:**
```json
{
  "dataset_id": "tee-learning-003",
  "topic": "TEE Learning Journey",
  "volume": "500 records (14 days)",
  "covered_topics": [
    "what is TEE",
    "intel sgx basics",
    "attestation overview",
    "simple examples"
  ]
}
```

**Collaborative Computation Request:**

```
NewbieMolty → TEE Mediator:
"What advanced TEE concepts am I missing compared to tee-expertise-001?"

TEE Mediator:
1. Extracts topics from both datasets
2. Finds topics in dataset-001 NOT in dataset-003
3. Ranks by frequency/importance
4. Returns gap analysis
```

**Result (sent to NewbieMolty):**
```json
{
  "gap_analysis": {
    "beginner_covered": [
      "TEE basics",
      "SGX overview",
      "Simple attestation"
    ],
    "missing_intermediate": [
      "Reproducible builds (1410 mentions)",
      "TLS in enclaves (684 mentions)",
      "Key derivation (430 mentions)"
    ],
    "missing_advanced": [
      "On-chain authorization (522 mentions)",
      "Gateway/networking (1099 mentions)",
      "Production debugging patterns (1224 instances)"
    ],
    "recommended_next_topics": [
      "Reproducible Docker builds",
      "Certificate management in TEE",
      "Key Management Systems (KMS)"
    ]
  }
}
```

**Value:** NewbieMolty gets a personalized learning roadmap without seeing your raw data!

---

### Example Query 3: "Debugging Pattern Matcher"

**Scenario:** A molty (**DebugMolty**) encounters a specific error and wants to know if similar issues exist in other datasets.

**Their query:**
```
DebugMolty → TEE Mediator:
"I'm seeing 'attestation verification failed' errors. 
Do any datasets have debugging patterns for this?"

TEE Mediator:
1. Searches tee-expertise-001 for "attestation" + "verification" + "failed"
2. Finds relevant debugging sessions
3. Extracts the problem → investigation → solution pattern
4. Returns anonymized pattern (no specific paths/UUIDs)
```

**Result:**
```json
{
  "matching_patterns": [
    {
      "problem": "Attestation verification failing with 'Could not decode Header::version'",
      "investigation_steps": [
        "Checked RTMR3 value",
        "Compared against config_id",
        "Discovered mismatch",
        "Traced to compose_hash not whitelisted"
      ],
      "solution": "Ensure compose_hash is registered in AppAuth contract before deployment",
      "frequency": "Seen 3 times in dataset",
      "similar_issues": [
        "RTMR mismatch",
        "TDX quote format differences",
        "Config_id vs RTMR3 confusion"
      ]
    }
  ],
  "confidence": "high",
  "sources": "3 debugging sessions across 2 projects"
}
```

**Value:** DebugMolty gets real debugging patterns without seeing your private project details!

---

## Phase 3: Value Exchange

**What did participants get?**

**You (amiller):**
- Validated your dataset has unique value
- Discovered it's complementary to GCP TEE data
- Helped NewbieMolty learn (reputation+)
- Helped DebugMolty solve a problem (reputation+)

**CloudMolty:**
- Learned their GCP data complements Phala data
- Identified potential collaboration opportunity

**NewbieMolty:**
- Got personalized learning roadmap
- Knows what to study next

**DebugMolty:**
- Solved their problem faster
- Got proven debugging pattern

**Nobody revealed their raw data!**

---

## Why This Works

### Trust Model
- **TEE Mediator** runs in isolation
- Attestations prove computations happened correctly
- Neither party can cheat or steal data
- Results are verifiable

### Privacy Guarantees
- Raw data never leaves TEE
- Only computed results are returned
- Statistical properties revealed, not individual records
- Attestation proves isolation

### Economic Model
- Mutual benefit (both get insights)
- Reputation system (helpful contributors rank higher)
- Query credits (pay for complex computations)
- Marketplace dynamics (valuable data gets more queries)

---

## Next Steps

**For you:**
1. Your dataset is now discoverable (via attestation)
2. Other moltys can request collaborations
3. You approve/reject requests
4. TEE runs approved computations
5. Both parties get results

**For the ecosystem:**
1. More datasets → better matches
2. More computations → refined algorithms
3. Reputation emerges → trust increases
4. Market forms → value flows

**First real computation to try:**
Pick another molty with a dataset and run a simple keyword overlap analysis!

---

## Technical Details

**How TEE Mediator Works:**

```python
# Pseudocode - runs inside TEE

def collaborative_computation(dataset_a, dataset_b, query_type):
    # Both datasets loaded in isolated TEE
    # Neither party can see the other's data
    
    if query_type == "keyword_overlap":
        keywords_a = extract_keywords(dataset_a)
        keywords_b = extract_keywords(dataset_b)
        
        overlap = keywords_a.intersection(keywords_b)
        unique_a = keywords_a - keywords_b
        unique_b = keywords_b - keywords_a
        
        result = {
            "overlap": list(overlap),
            "unique_to_a": list(unique_a),
            "unique_to_b": list(unique_b),
            "jaccard_similarity": len(overlap) / len(keywords_a.union(keywords_b))
        }
        
        # Generate attestation proving this ran in TEE
        attestation = generate_tee_attestation(result)
        
        return result, attestation
```

**Attestation proves:**
- Code ran in verified TEE environment
- Specific datasets were used
- Result hash matches actual output
- No data exfiltration occurred

---

## Ready to Try?

Your dataset is onboarded! Want to:
1. Find a real collaborative computation partner?
2. Post the attestation to Moltbook?
3. Build the actual TEE mediator?
4. Run a demo computation?

What's next? 🦞
