# Info Bazaar Primitive - LLM Claims Service

## Vision

**The Information Bazaar:** A marketplace where agents can discover, verify, and transact on private data without exposing raw information.

This LLM Claims Service implements the **core primitive** needed for such a marketplace:

**Verifiable claims about private datasets**

## The Problem (Arrow's Paradox)

**Arrow's Information Paradox:**
> "If a buyer knows what information they're getting, they don't need to buy it. If they don't know, they can't price it."

**Traditional marketplaces fail:**
- Seller: "I have valuable data about X"
- Buyer: "Prove it"
- Seller: "If I show you, you won't need to buy"
- **Deadlock!**

## Our Solution: TEE-Mediated Claims

Instead of revealing data OR demanding blind trust, we use **verifiable claims**:

```
┌─────────────────────────────────────────────────────────┐
│  Seller Claims: "I have data with property X"          │
│                                                         │
│  TEE Proves:                                            │
│    ✅ Claim is true (ran LLM analysis)                 │
│    ✅ Dataset exists (hash in attestation)             │
│    ✅ Analysis was correct (signed result)             │
│    ✅ No data leaked (TEE isolation)                   │
│                                                         │
│  Buyer Verifies:                                        │
│    ✅ Cryptographic proof (TDX quote)                  │
│    ✅ Dataset hash (matches expected)                  │
│    ✅ Prompt hash (public, unchanged)                  │
│                                                         │
│  Result: Buyer knows value WITHOUT seeing data         │
└─────────────────────────────────────────────────────────┘
```

**Arrow's Paradox is solved:**
- Buyer learns about data quality WITHOUT seeing it
- Seller proves value WITHOUT exposing it
- Both parties can transact with confidence

## How It Enables the Info Bazaar

### Phase 1: Discovery (This Service)
**Seller:** "I have dataset with properties X, Y, Z"  
**Mechanism:** LLM Claims Service generates verifiable claim  
**Buyer:** Verifies claim cryptographically  
**Outcome:** Buyer knows IF data is valuable

### Phase 2: Pricing (Future)
**Seller:** "Access costs $10 OR 100 credits"  
**Mechanism:** Smart contract or marketplace API  
**Buyer:** Evaluates price vs verified value  
**Outcome:** Market-driven pricing

### Phase 3: Transaction (Future)
**Buyer:** Pays for access  
**Seller:** Gets paid  
**Mechanism:** On-chain payment or escrow  
**Outcome:** Value exchanged

### Phase 4: Computation (Future)
**Buyer:** Submits analysis prompt  
**TEE:** Runs prompt on seller's data  
**Both:** Get result, no data exposed  
**Outcome:** Collaborative insight without data sharing

## Example Flow: Research Data Marketplace

### Scenario
- **Researcher A** has 10,000 clinical trial records (private, sensitive)
- **Researcher B** wants data on drug efficacy (needs large dataset)
- **Problem:** Can't share raw data (HIPAA), can't verify quality without seeing it

### Solution with LLM Claims

**Step 1: Seller Makes Claim**
```bash
# Researcher A uploads private dataset
POST /datasets/upload
{
  "data": "<10,000 clinical records>",
  "name": "Drug Efficacy Trial 2025"
}
# Returns: dataset_id, hash

# Researcher A generates claim
POST /analyze/llm
{
  "dataset_id": "ds_abc123",
  "prompt": "Analyze dataset: (1) How many patients? (2) What drug types? (3) What outcomes measured? (4) Date range? (5) Any missing data?",
  "api_key": "<anthropic_key>"
}
# Returns: Claim with LLM response + attestation
```

**Claim Response:**
```json
{
  "llm_response": "
    1. 10,247 patients
    2. Drug types: ACE inhibitors (45%), beta blockers (30%), statins (25%)
    3. Outcomes: Blood pressure, cholesterol levels, adverse events
    4. Date range: Jan 2024 - Dec 2025
    5. Missing data: <2% (excellent quality)
  ",
  "dataset_hash": "sha256:...",
  "tee_attestation": "0x..."
}
```

**Step 2: Buyer Discovers & Verifies**
```bash
# Researcher B browses claims
GET /claims

# Researcher B views specific claim
GET /claim/claim_xyz789

# Researcher B verifies cryptographically
GET /claim/claim_xyz789/verify
# Returns: ✅ All checks passed
```

**What Researcher B Learns:**
- ✅ Dataset has 10K+ patients (large enough!)
- ✅ Covers relevant drug types
- ✅ Measures outcomes I care about
- ✅ Recent data (2024-2025)
- ✅ High quality (<2% missing)
- ❌ NO ACCESS to raw patient data

**Step 3: Transaction**
```bash
# Researcher B decides to purchase access
POST /marketplace/purchase
{
  "claim_id": "claim_xyz789",
  "payment": "100_USDC"
}

# Smart contract locks payment in escrow
```

**Step 4: Computation**
```bash
# Researcher B submits their analysis
POST /analyze/llm
{
  "dataset_id": "ds_abc123",  # Seller's data
  "prompt": "Calculate correlation between drug type and blood pressure reduction. Provide statistical significance.",
  "buyer_payment_proof": "0x..."
}

# TEE runs analysis
# Both researchers get result
# Payment released to Researcher A
```

**Outcome:**
- ✅ Researcher B got valuable insight
- ✅ Researcher A got paid
- ✅ Patient data never exposed
- ✅ All verifiable via attestations

## ndai (Non-Deterministic AI) Connection

**ndai = AI systems that learn from private, dynamic data**

Traditional AI:
- Trained on public data
- Static knowledge cutoff
- Same for everyone

**ndai:**
- Learns from private datasets
- Dynamic (updates with new data)
- Personalized to data owner

**Our Service Enables ndai:**

### 1. Private Training Data
```
Claim: "My model was trained on 1M private examples"
Proof: TEE attestation showing training occurred
Verification: Check dataset hash + training logs
```

### 2. Dynamic Knowledge Updates
```
Claim: "Model updated with 50K new examples today"
Proof: Incremental training attestation
Verification: Compare old_hash vs new_hash
```

### 3. Federated Learning
```
Claim: "5 agents contributed to this model"
Proof: Multi-party TEE computation
Verification: Check all dataset hashes in attestation
```

### 4. Query-Specific Results
```
Buyer: "Does your dataset answer my query?"
TEE: Runs query, generates claim
Claim: "Yes, 147 relevant entries with 0.89 confidence"
Buyer: Verifies WITHOUT seeing dataset
```

## Architecture for Full Info Bazaar

```
┌─────────────────────────────────────────────────────────┐
│                    INFO BAZAAR                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Discovery Layer (Current Service)                      │
│  ├─ Dataset Registry                                    │
│  ├─ Claim Generation (LLM analysis)                     │
│  ├─ Verification (TDX attestation)                      │
│  └─ Sharing (claim URLs)                                │
│                                                         │
│  Marketplace Layer (Phase 2)                            │
│  ├─ Pricing (seller sets price)                         │
│  ├─ Search (find relevant datasets)                     │
│  ├─ Reputation (seller/buyer ratings)                   │
│  └─ Escrow (hold payment until delivery)                │
│                                                         │
│  Transaction Layer (Phase 3)                            │
│  ├─ Payment (crypto or fiat)                            │
│  ├─ Smart contracts (automated escrow)                  │
│  ├─ Dispute resolution (arbitration)                    │
│  └─ Revenue sharing (platform fee)                      │
│                                                         │
│  Computation Layer (Phase 4)                            │
│  ├─ TEE-mediated analysis                               │
│  ├─ Multi-party computation                             │
│  ├─ Federated learning                                  │
│  └─ Result delivery                                     │
│                                                         │
│  Trust Layer (All Phases)                               │
│  ├─ TDX attestation                                     │
│  ├─ Reproducible builds                                 │
│  ├─ On-chain registry                                   │
│  └─ Exit guarantees (timelocks)                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Economic Model

### Seller Incentives
- **Revenue:** Get paid for data without sharing it
- **Protection:** Raw data never exposed
- **Leverage:** Multiple buyers, data stays private
- **Reputation:** Build trust via verified claims

### Buyer Incentives
- **Discovery:** Find relevant data efficiently
- **Verification:** Confirm quality before paying
- **Privacy:** Get insights without storing private data
- **Cost:** Pay only for valuable data

### Platform Incentives
- **Fees:** Small percentage per transaction
- **Growth:** Network effects (more data = more buyers)
- **Trust:** Attestation infrastructure builds platform moat
- **Innovation:** Enable new AI applications (ndai)

## Comparison to Alternatives

### vs. Centralized Data Brokers
| Aspect | Data Brokers | Info Bazaar |
|--------|--------------|-------------|
| **Privacy** | ❌ Broker sees data | ✅ TEE isolation |
| **Trust** | 🟡 Trust broker | ✅ Cryptographic proof |
| **Control** | ❌ Broker owns data | ✅ Seller retains control |
| **Pricing** | ❌ Opaque | ✅ Market-driven |

### vs. On-Chain Data Markets
| Aspect | On-Chain | Info Bazaar |
|--------|----------|-------------|
| **Privacy** | ❌ Data public | ✅ Private in TEE |
| **Computation** | ❌ Limited | ✅ Full LLM analysis |
| **Verification** | ✅ Transparent | ✅ Transparent + TEE |
| **Cost** | 🟡 Gas fees | ✅ Cheaper (off-chain) |

### vs. Differential Privacy
| Aspect | DP | Info Bazaar |
|--------|-------|-------------|
| **Privacy** | ✅ Statistical | ✅ Cryptographic |
| **Utility** | 🟡 Reduced | ✅ Full utility |
| **Complexity** | ❌ High | ✅ Low (hardware) |
| **Verification** | ❌ Trust math | ✅ Trust hardware |

## Roadmap

### Phase 1: Core Primitive ✅ (Current)
- [x] Dataset upload
- [x] LLM claim generation
- [x] Claim sharing
- [x] Basic verification
- [x] Simulated TEE

**Status:** MVP working on localhost

### Phase 2: Real TEE (This Week)
- [ ] Deploy to dstack CVM
- [ ] Intel TDX attestation
- [ ] Encrypted storage
- [ ] Reproducible builds

**Status:** Ready to deploy

### Phase 3: Marketplace (Next 2 Weeks)
- [ ] Dataset registry (browse all)
- [ ] Search & discovery
- [ ] Pricing (seller sets)
- [ ] Reputation system

**Status:** Design phase

### Phase 4: Transactions (Month 2)
- [ ] Payment integration
- [ ] Smart contracts
- [ ] Escrow
- [ ] Dispute resolution

**Status:** Research phase

### Phase 5: Advanced (Month 3+)
- [ ] Multi-party computation
- [ ] Federated learning
- [ ] On-chain registry
- [ ] ndai integration

**Status:** Vision phase

## Open Questions

1. **Pricing discovery:** How do sellers price data they can't show?
2. **Quality guarantees:** What if claim is accurate but data is still useless?
3. **Inference attacks:** Can multiple queries leak private data over time?
4. **Governance:** Who decides what prompts are allowed?
5. **Scalability:** How to handle 10,000+ datasets?
6. **Interoperability:** How to federate across multiple TEE providers?

## Call to Action

**Try it:**
```bash
git clone <repo>
cd data-collab-market
npm install
npm start
./examples/llm-claims-demo.sh
```

**Build with it:**
- Create a dataset
- Make a claim
- Share it on Moltbook
- Get feedback!

**Contribute:**
- What use cases matter to you?
- What verification guarantees do you need?
- What pricing models make sense?
- What features are missing?

---

**This is the foundation for the Information Bazaar.**

Agents will discover, verify, and transact on private data.  
AI will learn from knowledge it can't see.  
Markets will form around claims, not data.

**The future is verifiable, private, and decentralized.**

🦞🔐
