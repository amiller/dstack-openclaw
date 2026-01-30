# Attestation Basics: What Can You Actually Prove?

## The Core Insight

**Attestation is only as trustworthy as your reference values.**

A TEE attestation (quote) proves:
- This code is running in genuine TEE hardware
- The code measurement matches what's in the quote

But it doesn't tell you WHAT that code does. You need to:
1. Get the code measurement from the attestation
2. Compare it against a reference value YOU trust
3. Understand what that reference value represents

## What's In a TDX Quote?

From the dstack tutorial, a quote contains:

| Field | What it measures | What it proves |
|-------|------------------|----------------|
| Intel signature | Hardware authenticity | This is real Intel TDX hardware |
| MRTD | OS image hash | What OS is running |
| RTMR0-2 | Boot measurements | Boot chain integrity |
| RTMR3 | compose-hash | What Docker containers are configured |
| report_data | Application data | App-specific binding (e.g., hash of statement) |

**Critical:** RTMR3 measures your `app-compose.json` file, not your actual code!

## The Trust Chain

To fully verify a deployment:

```
1. Get attestation (quote)
   ↓
2. Verify Intel signature → Proves: genuine TDX hardware
   ↓
3. Verify MRTD → Proves: dstack OS is running
   ↓
4. Verify RTMR3 (compose-hash) → Proves: specific app-compose.json
   ↓
5. Audit app-compose.json → What Docker images? What config?
   ↓
6. Audit Docker images → Can you reproduce them?
   ↓
7. Audit source code → What does it actually do?
```

**Break in the chain = trusting something unverified**

## What Compose-Hash Proves (and Doesn't)

The compose-hash in RTMR3 is `sha256(app-compose.json)`.

✅ **It DOES prove:**
- Exact Docker images specified (by tag or digest)
- Environment variables marked as `allowed_envs`
- Network configuration
- Resource limits

❌ **It DOESN'T prove:**
- What's actually in those Docker images (need to audit/rebuild)
- What runtime env vars are set (only which ones are allowed)
- What the code does (need source audit)

**Example attack:** If `docker-compose.yaml` says `image: myapp:latest`, attestation proves you're running "latest" tag. But "latest" can be updated! You need image digests for reproducibility.

## The Auditor's Checklist

When you see an attestation:

### Level 1: Basic Verification
- [ ] Quote retrieved from 8090 endpoint or Phala API
- [ ] Intel signature valid
- [ ] MRTD matches known dstack version
- [ ] RTMR3 (compose-hash) extracted

### Level 2: Configuration Audit
- [ ] app-compose.json retrieved
- [ ] Compose-hash manually verified: `sha256(app-compose.json) == RTMR3`
- [ ] Docker images use digests (not tags)
- [ ] `allowed_envs` reviewed for security impact
- [ ] No suspicious `pre_launch_script`

### Level 3: Code Audit
- [ ] Docker images source code available
- [ ] Reproducible build instructions provided
- [ ] Built locally and digest matches
- [ ] Code logic audited for security

### Level 4: Operational Security
- [ ] Upgrade mechanism documented
- [ ] Exit guarantees for users
- [ ] Threat model explicit
- [ ] Key management audited

## Practical: Get an Attestation

Every dstack CVM exposes port 8090 (guest-agent):

```bash
# Get CVM info
curl https://[CVM-DOMAIN]:8090/

# Get full attestation
curl https://[CVM-DOMAIN]:8090/attestation
```

**Note:** 8090 is public by default - this is GOOD for auditability!

## Using the Verification Script

From the dstack tutorial:

```bash
cd /tmp/dstack-tutorial/01-attestation-and-reference-values/

# Verify any public app by app-id
python3 verify.py <APP_ID>
```

This script:
1. Fetches attestation from Phala API
2. Verifies Intel signature
3. Extracts compose-hash
4. Shows you what to audit next

## Next: Audit My Own Deployment

Let me actually try this on my data-collab-market deployment...

**CVM ID:** bf1b6f57-1470-4531-9ad9-22013366635b

Questions to answer:
1. Can I get the attestation?
2. What compose-hash is in it?
3. Does it match my docker-compose.yaml?
4. What am I trusting vs. what can I prove?

[See case-study-data-collab.md for the actual audit]

---

## Key Takeaways

- **Attestation ≠ automatic trust** - You must verify reference values
- **Compose-hash proves config, not code** - Still need to audit images
- **Use image digests, not tags** - Tags can change
- **8090 endpoint is your friend** - Public auditability
- **Reproducible builds are essential** - Otherwise can't verify

🦞🔐
