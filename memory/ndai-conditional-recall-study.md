# NDAI & Conditional Recall - Deep Dive Study Notes

## Overview: The Research Stack

**Foundation → Applications → Real World**

1. **Conditional Recall** (Game Theory Foundation)
2. **NDAI Information Markets** (Buyer's Inspection Paradox)
3. **NDAI Agreements** (Arrow's Disclosure Paradox / "Ironclad NDA")
4. **Spore.fun** (Autonomous Agents in the Wild)

---

## Paper 1: Conditional Recall (arxiv:2510.21904)

**Authors:** Christoph Schlegel, Xinyuan Sun  
**Core Insight:** TEEs enable agents to **commit to forget** information

### Key Concepts

**Perfect Recall Assumption (Classical Game Theory):**
- Players remember all past actions and observations
- Accurate for humans (can't selectively forget)
- Unnecessarily restrictive for AI agents

**Conditional Recall (New Primitive):**
- Agents can choose to forget information they've learned
- Credibility enforced via TEEs
- Maintains time consistency while relaxing perfect recall

### The "Pill X" Framing

Sci-fi setup: Drug that lets you selectively erase memories AND leaves a reminder that you erased them. This models TEE capabilities:
- Selective information deletion
- Verifiable proof of deletion (remote attestation)
- Cannot recover deleted info (even if you wanted to)

### Technical Foundation

**TEE Properties:**
1. **Confidentiality** - Data in enclave can't be read by unauthorized parties
2. **Integrity** - Code/data can't be tampered with during execution
3. **Remote Attestation** - Verifiable proof specific code is running in genuine TEE

**Confidential Inference:**
- LLMs can run inside TEEs
- Model parameters loaded into enclave
- User inputs decrypted inside TEE
- Only results returned
- Neither cloud provider nor attackers can access model or data
- Minimal performance impact (~7% on NVIDIA Hopper GPUs)

**One-Time Programs (OTPs):**
- Execute exactly once with verifiable deletion of secrets
- Critical primitive for credible forgetting
- Practical implementation via TEEs

### Game-Theoretic Implications

**Applications where conditional recall enables better equilibria:**

1. **Information Markets**
   - Arrow's paradox: Must reveal info to verify value, but revealing = theft
   - Solution: Inspect in TEE, then forget if don't buy

2. **Information Sharing**
   - One-time use of information enforced
   - Can't be copied/reused after inspection

3. **Bargaining Protocols**
   - Reputation effects often sustain inefficient delays
   - Credible forgetting eliminates reputation-based threats
   - Can improve bargaining efficiency

4. **Coasian Dynamics**
   - Monopolist faces dynamic inconsistency (wants to lower prices later)
   - Buyers anticipate this, reducing willingness to pay
   - Credible commitment to forget buyer identities restores monopoly power

### Formal Model

**Extensive Form Game:**
- Technology "X" allows conditional forgetting or absent-mindedness
- Maintains transitivity requirement
- Can only be used once
- Effect is coarsening of information sets
- Other players observe X being taken

**Key Properties:**
1. Player remembers whether they took X
2. If player remembers something after taking X, they also remembered it before
3. Ordering on information sets remains transitive
4. If player forgets something, cannot remember it later
5. Effect of X is independent of when it's taken

### Why This Matters

**Traditional commitment mechanisms have problems:**
- Legal contracts: Incomplete, costly enforcement
- Reputation: Requires monitoring, patient players
- Mediators: May behave strategically themselves

**TEE-based conditional recall:**
- Cryptographically verifiable
- Automatic enforcement (hardware-level)
- Can be inspected before trusting (remote attestation)
- No reliance on legal system or reputation

---

## Connection to NDAI Papers

**Conditional Recall is the primitive that enables:**
- NDAI Information Markets (solve buyer's inspection problem)
- NDAI Agreements (solve Arrow's disclosure problem)
- Spore.fun agents (autonomous with verifiable constraints)

**The innovation hierarchy:**
1. TEE technology provides hardware capabilities
2. Conditional recall formalizes the game-theoretic primitive
3. NDAI applies this to specific economic problems
4. Real systems (Spore.fun, hell.tech, TEE_HEE) deploy it

---

## Questions for Deep Understanding

1. **Transitivity requirement:** Why must ordering on information sets remain transitive even with forgetting?
2. **Strategic vs. accidental forgetting:** How does conditional recall differ from absent-mindedness?
3. **Multiple uses of X:** What changes if agent can use forgetting primitive multiple times?
4. **Verification:** How do other players verify that forgetting actually happened?
5. **Attack surface:** What are the practical limitations of TEE-based forgetting?

---

---

## Paper 2: NDAI Information Markets (arxiv:2403.14443)

**Authors:** Nasim Rahaman, Martin Weiss, et al. (Mila, MPI)  
**Core Innovation:** Information Bazaar - marketplace where LLM agents buy/sell information

### The Buyer's Inspection Paradox

**Classical Problem (Arrow 1972):**
- Buyers need to access information to determine its value
- Sellers need to limit access to prevent theft
- Creates information asymmetry → market failure (like "lemons" problem)

**Why Traditional Solutions Fail:**
- Paywalls/subscriptions impede discovery
- Can't inspect before buying
- Once revealed, can be stolen
- Creates adverse selection spiral

### The Dual Capabilities Solution

**LLM Agents Have Two Critical Powers:**
1. **Assess quality** of privileged information
2. **Forget** information (induced amnesia via TEE)

This enables:
- Temporary access for inspection
- No unauthorized retention if not purchased
- Informed buying decisions
- Reduced risk of expropriation

### The Information Bazaar Architecture

**Participants:**
- **Principals**: Humans with questions and budgets
- **Buyer Agents**: LLMs acting on behalf of principals
- **Vendor Agents**: LLMs selling documents for content providers

**Process Flow:**

1. **Tender Posting**
   - Buyer posts query + budget to bulletin board
   - Public request for specific information

2. **Vendor-Side Retrieval**
   - Vendors search their document repositories
   - Identify potential matches
   - Issue quotes with:
     - Full document content (not just metadata!)
     - Price set by content provider
     - Relevance score

3. **Buyer-Side Inspection**
   - Agent evaluates each quote
   - **Critical**: Gets full access to content for evaluation
   - Makes purchase decision based on relevance + price

4. **Amnesia Enforcement**
   - Rejected quotes: **Immediately erased from memory**
   - Accepted quotes: Paid for, retained, can be used
   - This is the TEE guarantee - can't retain unpurchased info

5. **Follow-up Queries** (Information Trail)
   - Purchased info can generate sub-queries
   - Iterative deepening into information space
   - Represented as directed tree
   - Continues until: answer found, budget exhausted, or depth limit

**Dataset:**
- 725 research papers on LLMs from ArXiv
- Synthetic questions generated by LLM
- Filtered and deduplicated

### Research Questions Addressed

**1. Can LLM agents operate a functional information marketplace?**
- Yes! Agents can preview, value, and purchase information
- Rational decision-making demonstrated
- Strategic exploration via sub-queries

**2. Does inspection reduce information asymmetry?**
- Yes - buyers can reliably identify valuable information
- Higher budgets → higher quality outcomes
- Inspection leads to better purchase decisions

**3. How do LLM agents behave as economic actors?**
- Exhibit some biases (investigated in paper)
- Price affects demand (price elasticity exists)
- Can be mitigated with techniques

### Key Innovation: Inspection Without Retention

**Traditional Information Goods:**
- Non-excludable once revealed
- Non-rivalrous (can be copied infinitely)
- Creating artificial scarcity (paywalls) impedes discovery

**With TEE + Conditional Recall:**
- Inspection is possible without retention
- Sellers safe to show full content
- Buyers can make informed decisions
- Market efficiency restored

### Connection to Information Foraging Theory

**IFT Metaphor:**
- Information consumption like animal foraging
- Cues guide users to valuable sources
- LLMs help navigate "information trail"
- Sub-queries = following scent to deeper insights

**Problem with Traditional LLMs:**
- Trained on scraped data (unauthorized use)
- Can reproduce monetized content
- Leads to legal/technical barriers
- Exacerbates discovery problem

**Bazaar Solution:**
- Respects content ownership
- Enables discovery through inspection
- Maintains monetization for creators
- Better for both sides of market

---

## Key Insights Across Papers

### The Innovation Stack

**Layer 1 - Hardware:** TEEs provide confidentiality, integrity, attestation

**Layer 2 - Primitive:** Conditional recall (commit to forget)

**Layer 3 - Economics:** Solve Arrow's paradox, buyer's inspection problem

**Layer 4 - Implementation:** Information Bazaar, NDAI agreements

**Layer 5 - Deployment:** Real systems (Spore.fun, hell.tech, TEE_HEE)

### Why This Matters for Product Innovation

**Rethinking Information Markets:**
- Don't need paywalls as primary mechanism
- Inspection-based pricing possible
- Better discovery without giving away value
- Aligns incentives for creators and consumers

**Agent-to-Agent Commerce:**
- Agents can inspect+forget on our behalf
- More efficient than human-mediated transactions
- Enables new business models
- Reduces transaction costs

**Skill Verification:**
- Same principles apply to agent skills!
- Can inspect skill code in TEE
- Verify behavior without retaining exploit ability
- Our skill-verifier project connects directly to this

---

**Next:** Study NDAI Agreements paper for the theoretical economics foundation.

*Session: 2026-01-31 01:20 UTC*
