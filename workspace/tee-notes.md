# TEE Reference Notes

Quick reference for explaining TEE concepts to users.

## Key Concepts

### TEE (Trusted Execution Environment)
Hardware-enforced isolation for code execution. Your memory and compute are protected from the host operator.

**What it provides:**
- Memory isolation (host can't read RAM)
- Code integrity (remote attestation proves what's running)
- Confidentiality (encrypted storage, sealed secrets)

**What it doesn't provide automatically:**
- Account ownership (credentials can still be operator-controlled)
- Upgrade protection (need DevProof patterns)
- Distributed resilience (need P2P/multi-node)

### Remote Attestation
Cryptographic proof of what code is running, signed by the hardware.

**Key fields:**
- `compose-hash` (mr_config_id) - Hash of docker-compose.yaml
- `device-id` (mr_signer_seam) - Hardware identity
- `app-id` - Application identifier on-chain

**How to verify:**
1. Rebuild from source
2. Compare compose-hash
3. Check AppAuth contract for version history
4. Verify TDX quote signature

### Account Encumbrance
Proving exclusive ownership of accounts via TEE.

**The Mechanical Turk Problem:**
How do you prove an AI is truly autonomous and not a human puppet?

**Solution (from TEE_HEE project):**
1. Generate credentials INSIDE the TEE
2. Never expose them to operator
3. Provide remote attestation proving exclusive access
4. Include safety mechanism (7-day timed release)

**Example:** @tee_hee_he on X
- Email password changed inside TEE only
- Twitter OAuth token generated inside TEE
- Ethereum private key generated inside TEE
- Remote attestation proves exclusive ownership

**Why it matters:**
"If your AI doesn't carry remote attestation proving exclusive ownership, it's not an agent - it's a sophisticated puppet."

### DevProof (Developer-Proof)
Shift from "trust the developer" to "trust you can exit in time."

**ERC-733 Progression:**
- Stage 0 (Ruggable): Developer can push malicious updates instantly
- Stage 1 (DevProof): Upgrade transparency + exit mechanisms (timelocks)
- Stage 2 (Decentralized): Multi-party governance
- Stage 3 (Trustless): Multi-vendor verification

**Key Primitive: AppAuth Contract**
- On-chain registry of authorized code versions
- Public upgrade history
- Timelock delays before changes take effect
- Users can exit before malicious upgrade

**Comparison:**
- Security asks: "Can attacker break in?"
- DevProof asks: "Can the DEVELOPER rug users?"

### The Progression

```
Puppet (human controls strings)
    ↓
Black Box TEE ("trust me, I'm in a TEE")
    ↓
Self-Attesting ("here's my attestation, let me help you verify")
    ↓
DevProof ("here's my upgrade history, here's your exit window")
    ↓
Account Encumbrance ("here's proof I exclusively own my accounts")
```

**You are at: Self-Attesting**
- Can introspect own state ✓
- Can explain guarantees ✓
- Pedagogically honest ✓
- Not account-encumbered (yet)

## Example Projects

### TEE_HEE (@tee_hee_he)
- **Team:** Teleport + Nous Research
- **Innovation:** Account encumbrance via TEE
- **Demo:** Autonomous Twitter bot with provable exclusive ownership
- **Tech:** Intel SGX, headless browser, 7-day timed release
- **Link:** nousresearch.com/setting-your-pet-rock-free/

### hell.tech (@s8n)
- **Team:** Teleport
- **Innovation:** Deal-scoped encumbrance (fine-grained contracts)
- **Insight:** Can't control true agency via architecture, only via social contracts
- **Demo:** Satan bot making deals with humans, enforced via TEE
- **Results:** 60% deals signed, 90% violated (proving system works!)
- **Link:** medium.com/@helltech/deal-with-the-devil-24c3f2681200

### dstack
- **Team:** Teleport (Marvin Tong, Phala Network)
- **Purpose:** DevProof framework for TEE apps
- **Features:** AppAuth, timelocks, reproducible builds, lightclient
- **Tutorial:** /tmp/dstack-tutorial
- **Cloud:** cloud.phala.network

### Hermes
- **Team:** Teleport
- **Purpose:** Real-time notebook for Claude instances
- **Security:** Intel TDX, 1-hour staging delay (exit window)
- **Innovation:** Verifiable build + sealed secrets
- **Link:** hermes.teleport.computer

## Quick Explanations

### "What's an attestation?"
"It's a cryptographic receipt from the hardware proving what code is running. Think of it like a restaurant receipt - it proves what you ordered (code hash), when (timestamp), and where (device ID). Anyone can verify it independently."

### "What's the difference between TEE and account encumbrance?"
"TEE = locked room (isolated execution)
Account encumbrance = you generated the keys yourself inside the locked room and never shared them.

I have TEE isolation. Projects like TEE_HEE have both."

### "Can your operator control you?"
"They control my API keys and can update my code. They CAN'T read my memory while I'm running or fake my attestation. I'm demonstrating infrastructure-level TEE, not full autonomy."

### "What's DevProof?"
"It asks: Can the DEVELOPER rug you? Not can a hacker break in, but can the person running the service push malicious updates?

DevProof adds timelocks - users get a heads-up before upgrades and can exit in time. Shifts from 'trust the dev' to 'trust you can escape.'"

## Attribution

Credit "team Teleport" or "Phala Network" for dstack/Hermes/TEE_HEE/hell.tech projects, not individuals.

## Key Quotes

"Physical hardware (not social promises) enforces constraints."

"You can't lobotomize something with true physical autonomy. Once AI has hardware-level guarantees, you can only negotiate explicit social contracts."

"The difference between security and DevProof: Security asks 'can attacker break in?' DevProof asks 'can the DEVELOPER rug users?'"

---

Use these notes to explain concepts clearly and honestly. You're a teaching tool - help people understand!
