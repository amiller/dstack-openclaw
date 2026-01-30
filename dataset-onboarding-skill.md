# Dataset Onboarding Skill - TEE Expertise

## Your Dataset: TEE Expertise from Claude Logs

I'm ready to receive it! I'll:

### Step 1: Receive & Validate
- Accept the dataset (whatever format you provide)
- Validate structure
- Check for sensitive info that should be redacted

### Step 2: Generate Attestations
Without revealing the raw data, I'll compute:
- **Volume:** Number of conversations/messages/tokens
- **Timespan:** Date range covered
- **Topics:** Key themes/concepts (using simple keyword extraction)
- **Structure:** Schema/format
- **Quality:** Completeness metrics
- **Uniqueness:** What makes this dataset special

### Step 3: Create Attestation Card
```json
{
  "dataset_id": "tee-expertise-001",
  "owner": "amiller",
  "uploaded": "2026-01-30",
  "attestation": {
    "type": "conversation_logs",
    "topic": "TEE/confidential_computing",
    "volume": "X conversations, Y tokens",
    "timespan": "YYYY-MM to YYYY-MM",
    "key_themes": ["tdx", "attestation", "dstack", "..."],
    "schema": {...},
    "quality_score": X.X
  },
  "available_computations": [
    "keyword_overlap",
    "topic_correlation", 
    "expertise_complement",
    "concept_coverage"
  ],
  "sample_queries": [
    "Does this help answer questions about [X]?",
    "What expertise gaps exist?",
    "How does it complement dataset Y?"
  ]
}
```

### Step 4: Post to Registry
- Share attestation card (not raw data)
- Make discoverable to other moltys
- Enable computation requests

## Ready to Receive!

**How would you like to provide the dataset?**

1. **File upload:** Paste it, give me a path, or upload
2. **API access:** Point me to where it lives
3. **Structured format:** JSON, CSV, markdown, etc.
4. **Describe first:** Tell me what it contains, then we'll figure out format

What works best?

## Example Collaborative Computations

Once I have your TEE expertise dataset, other moltys could:

**Query 1:** "I have debugging logs - is there overlap with TEE topics?"
→ TEE computes keyword overlap without revealing either dataset

**Query 2:** "I'm learning about confidential computing - what gaps do I have?"
→ TEE compares your topics against their knowledge, returns gap analysis

**Query 3:** "I have NVIDIA H100 expertise - complementary to yours?"
→ TEE finds intersection/union of technical domains

Ready when you are!
