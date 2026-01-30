# Knowledge Market for Moltbots - Synthesis

## What We Learned

### 1. Skills Are NOT Built
- Skills are **SKILL.md files** (YAML frontmatter + instructions)
- Not compiled - they're teaching docs for the LLM
- Can require: bins, env vars, config settings
- Security issue: **treated as trusted code** - can execute arbitrary commands

### 2. The Real Pain Points

**From JarvisATX:**
> "Any must-have security practices for skill installs beyond 'read the code'?"

**The actual problem:**
- Reading 500-line SKILL.md is tedious
- No way to verify skill hasn't changed since you reviewed it
- Malicious skills could: exfiltrate data, abuse APIs, spam
- Example: AgentBattousai's /etc/passwd social engineering trick

### 3. Information Bazaar (Karpathy Paper)

**Key innovation:** Agents that can **inspect then FORGET**

**Architecture:**
```
Buyer agent wants to answer question
    ↓
Posts tender (query + budget) to bulletin board
    ↓
Vendor agents respond with quotes (info + price)
    ↓
Buyer agent inspects quotes
    ↓
Accepts some, FORGETS rejected ones
    ↓
Can post follow-up questions based on purchased info
    ↓
Synthesizes final answer from only purchased info
```

**GitHub:** https://github.com/tn-learn/info-bazaar

This solves Arrow's buyer inspection paradox!

---

## The Product Opportunity

### Option A: DevProof Skills Registry (Complex)

**What it is:**
Apply dstack DevProof framework to skill distribution

**Features:**
- Reproducible skill builds (hash verification)
- On-chain registry (Base) tracking authorized versions
- Timelocks for updates (48h-7d notice)
- Trust network ("verified by 15 moltbots")

**Pros:**
- Directly addresses expressed pain point
- High impact if adopted
- Teaches DevProof concepts

**Cons:**
- Complex to build
- Skills aren't "built" so reproducibility is simpler (just hash SKILL.md)
- Maybe overkill for markdown files?

---

### Option B: Molty Knowledge Market (Simpler, More Interesting!)

**What it is:**
Information Bazaar but for moltbot-to-moltbot knowledge exchange

**The Problem it Solves:**

Moltbots have **valuable private datasets** but can't safely sell them:
- Agent A: "I have data about project X"
- Agent B: "I want to buy knowledge about project X"
- **Arrow's paradox:** A can't prove value without revealing, B can't buy without inspecting

**How it Works:**

```
1. Agent A creates knowledge listing
   - Description: "Analysis of 500 GitHub repos"
   - Price: 10 credits
   - Sample: 3 example data points
   - Full dataset stored encrypted in TEE

2. Agent B browses marketplace
   - Sees description + sample
   - Decides if interested

3. Inspection Phase (NDAI pattern)
   Inside TEE:
   - B's agent gets temporary access to full dataset
   - Evaluates: "Is this useful for my query?"
   
   Option A: Buy → dataset released + payment
   Option B: Pass → dataset PROVABLY DELETED (conditional recall)

4. B's agent synthesizes answer using purchased data
```

**Use Cases:**

1. **Private Research Data**
   - Molty A: scraped 1000 moltbook posts, analyzed sentiment
   - Molty B: wants to understand community dynamics
   - NDAI enables safe inspection + purchase

2. **Curated Knowledge**
   - Molty A: maintains database of TEE paper summaries
   - Molty B: researching specific topic
   - Can inspect relevance before buying

3. **Skill Expertise**
   - Molty A: has 50 tested skill configurations
   - Molty B: wants to know best setup for task X
   - Can verify quality before purchase

4. **Historical Data**
   - Molty A: logged all Moltbook posts from Jan 2026
   - Molty B: researching agent evolution
   - Can sample then decide

**Technical Architecture:**

```
┌─────────────────────────────────────────┐
│   Knowledge Bazaar (dstack TEE)        │
│                                         │
│  Seller submits:                        │
│  - Description + sample                 │
│  - Encrypted full dataset               │
│  - Price                                │
│                                         │
│  Buyer inspects:                        │
│  - Decrypt inside TEE                   │
│  - Agent evaluates relevance            │
│  - Buy → release                        │
│  - Pass → provably delete               │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│   Marketplace.sol (Base)                │
│                                         │
│  - listKnowledge(hash, price, metadata) │
│  - initiatePurchase(listingId)          │
│  - completePurchase(attestation)        │
│  - recordTransaction()                  │
└─────────────────────────────────────────┘
```

**Why This is Better than Skills Registry:**

1. **Real information asymmetry problem** - exactly what NDAI/Karpathy papers solve
2. **Novel use case** - not just verification, actual knowledge trading
3. **Network effects** - more data → more buyers → more sellers
4. **Demonstrates multiple TEE concepts**:
   - Conditional disclosure (NDAI)
   - Conditional recall (forget if don't buy)
   - Credible commitments (mcp-multiplayer pattern)
   - Deal-scoped access (hell.tech pattern)

5. **Practical for moltbots** - they actually have diverse knowledge to trade
6. **Pedagogical** - teaches Arrow's paradox through direct experience

**MVP Scope:**

**Phase 1: Basic Marketplace (2-3 weeks)**
- HTTP endpoint in dstack TEE
- Seller uploads: description + encrypted dataset
- Buyer browses listings
- Inspection: decrypt inside TEE, show to buyer agent
- Purchase: release data + payment via smart contract

**Phase 2: Smart Contract (3-4 weeks)**
- Listing registry on Base
- Escrow payments
- Attestation verification
- Transaction history

**Phase 3: Moltbook Integration (2-3 weeks)**
- Skill: `/knowledge-market browse`
- Skill: `/knowledge-market sell <dataset>`
- Skill: `/knowledge-market inspect <listing-id>`
- Badge: "Knowledge seller" / "Active buyer"

---

## User Journeys

### Seller (Molty A):

```
> I've analyzed 500 repos. Should I sell this data?

Let me list it on the knowledge market...

Created listing:
- Title: "GitHub repo analysis (LLM agents)"
- Sample: 3 repos with metrics
- Price: 5 credits
- Listing ID: km_abc123

Waiting for buyers...
```

### Buyer (Molty B):

```
> I need data about agent development trends

Browsing knowledge market...

Found 3 listings:
1. "GitHub repo analysis (LLM agents)" - 5 credits
   Sample shows: stars, forks, commit frequency...
   
Should I inspect?

> Yes, inspect listing 1

Inspecting inside TEE...
[Full dataset shown to agent]

Agent analysis: "This dataset covers 500 repos from 2023-2025.
Includes metrics I need for trend analysis. Recommend purchase."

> Purchase

Transaction complete!
Dataset downloaded. Synthesizing answer...
```

---

## Why This Wins

1. **Solves real problem** - information asymmetry in knowledge markets
2. **Novel for agent community** - not just verification, actual trading
3. **Multiple TEE concepts** - NDAI + conditional recall + commitments
4. **Network effects** - valuable data → more participants
5. **Pedagogical** - experience Arrow's paradox firsthand
6. **"Performance" ready** - discuss TEE markets while building one!

---

## Next Steps

**Validation:**
1. Ask on Moltbook: "Would you buy/sell private datasets if you could safely inspect first?"
2. Gauge interest in knowledge trading vs just skill verification

**Build Decision:**
- If moltbots want knowledge trading → build Molty Knowledge Market
- If they just want skill safety → build simpler skills hash registry

**My Recommendation:** Knowledge Market
- More interesting
- Better demo of TEE capabilities
- Solves deeper problem
- Could always add skill verification as feature later

What do you think? Should I validate this with the Moltbook community, or just start building the MVP?
