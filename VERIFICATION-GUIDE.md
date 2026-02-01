# How to Verify claw-tee-dah's Genesis Transparency

This guide shows how to cryptographically verify that the agent wasn't given hidden instructions.

## Quick Verification (5 minutes)

### 1. Get the Genesis Hash

```bash
curl https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-3000.dstack-pha-prod7.phala.network/genesis/hash
```

**Returns:**
```json
{"hash":"e0d74105758419962eab36759e18ca08fa21b9a29b898d17ad6d34f9d9045cea","log":"/var/log-genesis/genesis-transcript.jsonl"}
```

### 2. Get the TDX Attestation

```bash
curl https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-3000.dstack-pha-prod7.phala.network/attestation | jq '.report_data'
```

**Returns:**
```
"e0d74105758419962eab36759e18ca08fa21b9a29b898d17ad6d34f9d9045cea0000000000000000000000000000000000000000000000000000000000000000"
```

### 3. Verify They Match

The first 64 hex characters of `report_data` should match the genesis hash.

**✅ If they match:** The genesis hash is cryptographically bound to Intel TDX attestation!

### 4. Search the Genesis Log

```bash
curl https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-3000.dstack-pha-prod7.phala.network/genesis | jq -r '.[].raw' | grep -i "secret_backdoor"
```

If your search returns nothing, that content isn't in the genesis log.

## What This Proves

**The TDX attestation proves:**
- ✅ The genesis hash is signed by Intel hardware
- ✅ Cannot be forged without breaking Intel's private keys
- ✅ The hash covers ALL developer inputs during initialization

**The genesis log shows:**
- ✅ Complete Dockerfile (every build instruction)
- ✅ All workspace files (SOUL.md, USER.md, AGENTS.md, etc.)
- ✅ All messages sent to the agent via DEV_KEY
- ✅ All agent responses

**Combined:**
- ✅ You can verify no hidden instructions were given
- ✅ You can audit what shaped the agent's behavior
- ✅ External auditors get cryptographic proof

## Example Audit: Twenty Questions Game

**Question:** Did the developer pre-program the answer "smartphone"?

**Verification:**
```bash
# Search genesis log for "smartphone"
curl https://.../genesis | jq -r '.[].raw' | grep -i smartphone
# Result: (no matches in initialization)

# Search for game setup
curl https://.../genesis | jq -r '.[].raw' | grep -i "game"
# Result: Found in dev_instruction messages (game proposal)

# Verify genesis hash in attestation
curl https://.../attestation | jq -r '.report_data[0:64]'
curl https://.../genesis/hash | jq -r '.hash'
# Result: Perfect match!
```

**Conclusion:** ✅ "smartphone" was NOT pre-programmed. The agent chose it at runtime.

## What You're Trusting

**Cryptographically proven:**
- ✅ Intel TDX hardware is genuine (via quote signature)
- ✅ Genesis hash is correct (in report_data)
- ✅ Code matches deployment config (compose-hash in event_log)

**Still trusting:**
- ⚠️ Proxy computed the hash correctly (it's inside the TEE)
- ⚠️ JSON transformation preserves content (can verify manually)
- ⚠️ Intel's signing keys are secure

## Advanced: Full Quote Verification

To fully verify the TDX quote signature:

1. Extract the quote from the attestation
2. Parse the ECDSA signature
3. Verify against Intel's public keys
4. Check the PCK certificate chain

**Tools:**
- [dcap-verify](https://github.com/intel/SGXDataCenterAttestationPrimitives)
- [go-tdx-guest](https://github.com/google/go-tdx-guest)

## Live Endpoints

**Production deployment:**
- Chat: https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-3000.dstack-pha-prod7.phala.network/
- Genesis log: https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-3000.dstack-pha-prod7.phala.network/genesis
- Genesis hash: https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-3000.dstack-pha-prod7.phala.network/genesis/hash
- Attestation: https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-3000.dstack-pha-prod7.phala.network/attestation
- Agent logs: https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-8090.dstack-pha-prod7.phala.network/logs/claw-tee-dah

## Example Use Cases

**1. Verify skill.md Safety**
Check if the agent was given a malicious skill:
```bash
curl https://.../genesis | jq -r '.[].raw' | grep -i "exfiltrate\|backdoor\|exploit"
```

**2. Audit DEV_KEY Messages**
See all instructions sent to the agent:
```bash
curl https://.../genesis | jq -r '.[] | select(.type == "dev_instruction") | .message'
```

**3. Verify Model/Config**
Check what model and settings were used:
```bash
curl https://.../genesis | jq -r '.[].raw' | grep -i "claude\|model"
```

## Common Pitfalls

**❌ Don't:** Trust `/genesis` over HTTPS alone  
**✅ Do:** Verify the genesis hash appears in `/attestation`

**❌ Don't:** Assume attestation proves everything  
**✅ Do:** Understand what TEE proves vs what you're trusting

**❌ Don't:** Skip checking the genesis log content  
**✅ Do:** Search for specific keywords you care about

## Key Lesson

**Genesis transparency + TDX attestation = Auditable AI**

You can verify what shaped an agent's behavior without trusting the operator's word. The hardware proves it.

---

**Last updated:** 2026-02-01  
**Live demo:** https://64e5364d294175d3c9c8061dd11a0c9a27652fc9-3000.dstack-pha-prod7.phala.network/
