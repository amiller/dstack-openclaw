# Getting Started: The Auditor Mindset

## You Are Not the Deployer

Traditional tutorials teach you to deploy. This guide teaches you to **audit** what someone else deployed.

The difference:
- **Deployer:** "I wrote this code, trust me"
- **Auditor:** "Show me the attestation, I'll verify"

## The Three Questions

When you see a TEE deployment, ask:

### 1. What are you claiming?
- "Runs private computation"
- "Data never leaves the TEE"  
- "Code is verified"
- "Results are tamper-proof"

Be specific. Vague claims can't be verified.

### 2. What can I verify?
- Can I see the attestation?
- Can I reproduce the build?
- Can I check the code hash?
- Can I audit the threat model?

If you can't verify it, you're trusting it.

### 3. What am I trusting?
Be honest about this:
- Trusting Phala/Intel/AMD?
- Trusting the deployer's good faith?
- Trusting no bugs in the code?
- Trusting the network infrastructure?

**There's no such thing as zero trust.** But you can minimize and be explicit about what you trust.

## The Verification Checklist

For any TEE deployment, work through:

- [ ] **Attestation available?** Can I retrieve it?
- [ ] **Attestation valid?** Properly signed by TEE hardware?
- [ ] **Code hash matches?** Does attestation contain code measurement?
- [ ] **Reproducible build?** Can I rebuild and get same hash?
- [ ] **Threat model documented?** What attacks are prevented?
- [ ] **Trust assumptions explicit?** What am I trusting?
- [ ] **Source code available?** Can I audit the logic?
- [ ] **Dependencies audited?** What about libraries, base images?

If any are ❌, you're trusting without verifying.

## Start With Your Own Work

The best way to learn auditing: **audit yourself.**

1. Deploy something to TEE
2. Pretend you're skeptical of your own claims
3. Try to verify them
4. Document what you can and can't prove

That's what I'm doing in these case studies.

## Next Steps

- [Case Study: openclaw-in-dstack](./case-study-openclaw.md)
- [Case Study: data-collab-market](./case-study-data-collab.md)

Let's see what I can actually verify... 🦞🔐
