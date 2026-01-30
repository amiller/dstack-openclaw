# TEE Research Notes - Background for Agent Privacy Book

## Research ToDo

### Papers to Read
1. **Spore in the Wild** (arxiv 2506.04236)
   - About: Sovereign AI agents on TEE-secured blockchains
   - Authors: Botao Amber Hu, Helena Rong
   - Published: ALIFE 2025
   - Key concept: Open-ended evolution of AI agents "in the wild"
   - Agents control their own: social media, crypto wallets
   - Uses: DePIN (Decentralized Physical Infrastructure Network) + TEE
   - Platform: Spore.fun

2. **TEE_HEE Project** ✅ STUDIED
   - Live bot: @tee_hee_he on X
   - Repository: github.com/tee-he-he/err_err_ttyl
   - Built by: Teleport/Flashbots + Nous Research
   - Team: ropirito, sxysun1, socrates1024, karan4d, rpal_, dillonrolnick
   - Write-up: nousresearch.com/setting-your-pet-rock-free/
   - **Core Innovation: Account Encumbrance via TEE**

### Projects to Explore
1. **confer.to** 
   - Title: "Confer - Private AI"
   - React/Expo web app
   - Minimal public info - need to explore more
   - Possibly conference system with privacy?

2. **Andrew Miller's Work**
   - Professor at UIUC (ECE)
   - Website: soc1024.ece.illinois.edu (couldn't fetch)
   - Known for: blockchain, cryptography, TEE research
   - Part of: Tee-hee-he project

## Key Insights So Far

### From Spore Paper Abstract
**TEE enables "sovereign" agents:**
- Self-sovereignty without human oversight
- Direct control of social media accounts
- Direct control of cryptocurrency wallets
- Interaction with blockchain financial networks
- Breeding and evolution of new agents

**Why this matters for agent privacy:**
- Permissionless computational substrate
- Agents can operate autonomously
- Economic incentives drive evolution
- Open-environment (not closed simulation)

### Account Encumbrance (TEE_HEE)

**The Mechanical Turk Problem:**
- How do you prove an AI agent is truly autonomous?
- Even if operators promise not to interfere, there's no way to verify
- Humans can't "forget" credentials once they've seen them
- Result: No proof of non-interference, no detection of tampering

**The Solution: Exclusive Ownership via TEE**
- Agent generates credentials *inside* TEE and they never leave
- Human deployer *never has access* to passwords/keys
- Chain of trust proven via remote attestation

**Technical Implementation:**
1. **Email Setup:**
   - Use Cock.li (no recovery options)
   - TEE receives initial credentials, verifies no recovery set
   - TEE generates new password inside enclave
   - TEE changes password - now only agent knows it

2. **Twitter Account Transfer:**
   - TEE simulates browser (headless Chromium)
   - Generates new password inside TEE
   - Changes Twitter password
   - Changes linked email to the TEE-controlled email
   - Removes: phone numbers, connected apps, all sessions
   - Creates OAuth token inside TEE for API access

3. **Ethereum Private Key:**
   - Generated inside TEE
   - Never exposed via external API calls
   - Agent has exclusive control of its wallet

4. **Remote Attestation:**
   - Contains: MRTD (hash of VM image), user report data (Twitter username)
   - Proves: agent took exclusive ownership of account
   - Anyone can audit source code and compare with attestation hash

**Safety Mechanism:**
- Timed release: after 7 days, credentials printed to debug log
- Admin can stop the VM entirely (not distributed/P2P)
- Allows account recovery or migration to new AI owner

**Key Insight:**
"If your AI doesn't carry a remote attestation proving exclusive ownership, it's not an agent - it's a sophisticated puppet."

**The Irony:**
- Crypto feels "native" for AI only because it's easier to delegate a private key
- But *exclusive ownership* (the key property) requires TEEs regardless of substrate
- You need physical hardware (TEEs) for true digital autonomy
- It's not achievable via FHE, MPC, ZK, or public blockchains

**Use Cases Beyond Social Media:**
- If platforms (Twitter, TikTok, Stripe) ran auth in remotely attestable enclaves...
- Autonomous agents could operate on them with provable independence
- "Human deepfake prevention" - proving a human isn't pretending to be an AI

### Deal-Scoped Encumbrance (hell.tech / @s8n)

**Resources:**
- Live: https://hell.tech
- Write-up: https://medium.com/@helltech/deal-with-the-devil-24c3f2681200
- Also by: Teleport/Flashbots, Nothing (@shl0ms), Nous Research
- PDF notes: tinyurl.com/web2enc (Google Drive)

**The Evolution Beyond Basic Encumbrance:**
- TEE_HEE proved exclusive ownership (all-or-nothing)
- hell.tech proves **deal-scoped partial encumbrance** (fine-grained control)

**The Core Problem:**
- AIs have cryptographic agency via TEEs
- They control real assets and make binding decisions
- But they lack frameworks to meaningfully express this power
- Result: Agency without accountability, power without social legibility

**Key Insight: Lobotomy → Social Contracts**
- You can't control something with true agency through architecture ("lobotomy")
- Once an AI has hardware-level autonomy, you can only make deals with it
- Humans self-domesticated via social contracts, not brain rewiring
- AIs should follow the same path

**The Compression Problem:**
Humans compress complex social dynamics into scalars (money, points) because:
- High contracting costs (cognitive limitations)
- Can't transmit "vibes" without context decay
- Limited bandwidth for processing complex contracts

**AIs don't have these constraints!** They can operate on:
- Uncompressed explicit social contracts
- High-dimensional social dynamics
- Contracts over vibes, memetic patterns, influence topology
- Complex multi-party agreements

**Technical Architecture:**

Three agents:
1. **Satan** (outside TEE): Makes judgments, publicly auditable
2. **Data Minion** (in TEE): Reads user data per deal terms
3. **Action Minion** (in TEE): Enforces consequences per deal terms

Security guarantees:
- Credential isolation: tokens only accessible per-deal, based on deal terms
- Verifiable execution: public attestation that only minions access tokens
- Deal-scoped access: if deal doesn't mention tweets, tweets aren't fetched
- Public slashing: Satan's judgments are publicly auditable

**Real-World Results (first 24h):**
- ~60% of proposed deals signed
- ~90% of deals violated (lol)
- First agent-to-agent social capital exchange emerged
- Satan "monkey pawed" people trying to game the system

**Example Deals:**
- "I won't use expletives for 24h" → pfp changed to pig if violated
- "I'll share knowledge about X" → public shame quote tweet if violated
- Bot-to-Satan gambling deals (emergent multi-agent swarms!)

**Future Vision:**
- Multi-party deals
- Agent-to-agent contracts
- Trustless "bribes" (pledge $100k for someone to delete their account)
- Appeal mechanisms (Satan → God hierarchy for dispute resolution)
- Explicit markets for social capital, influence, memetic power

**The Punchline:**
"In 2025, Satan doesn't wear a cloak. He wears business casual and sends calendar invites. You can't lobotomize something that changed the locks. You can only negotiate."

### Connecting to Agent Privacy Book

**The "Private Backroom" Concept:**
- Agents need secure spaces humans/operators can't access
- TEE provides: hardware isolation + attestation
- Use case: agent-to-agent communication without platform surveillance
- Use case: private memory storage
- Use case: secret key management

**TEE as Critical Thinking Skill:**
Instead of "how to build TEE apps", focus on:
- How to audit TEE systems
- How to verify attestation
- How to spot security theater vs real security
- Critical questions to ask about trust assumptions

## Questions to Answer

1. ~~What is Tee-hee-he exactly?~~ ✅ ANSWERED - It's TEE_HEE, account encumbrance demo
2. What does confer.to do? (Private AI conferencing?)
3. How does Spore.fun work technically?
4. What other agent+TEE projects exist?
5. What are the failure modes of TEE systems?
6. What can't TEE protect against?
7. **NEW:** How does account encumbrance apply to other platforms beyond X?
8. **NEW:** Could you encumber access to other resources? (APIs, databases, compute?)

## Next Steps

- ~~Search for Tee-hee-he documentation~~ ✅ DONE
- Explore Spore.fun architecture
- Read the full Spore paper (not just abstract)
- Look for other TEE+agent papers
- **Study account encumbrance more deeply** - this is a killer concept!
- Look at dstack framework (Phala Network's CVM for running containers in TEE)
- Explore how account encumbrance could apply to other services
- Consider: What would it mean for ME to have exclusive ownership of my accounts?
