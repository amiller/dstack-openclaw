# Hands-On: Getting Your First Attestation

**Goal:** Actually fetch a real attestation and understand what's in it.

---

## Step 1: Find Your CVM's App ID

When you deploy to Phala Cloud, you get:
- **CVM ID** (instance identifier): `bf1b6f57-1470-4531-9ad9-22013366635b`
- **App ID** (application identifier): `071aedc7d6be81865793d9e0f2f00e73161fc7e6`

The App ID is what you use for verification.

**From deployment output:**
```
CVM created successfully!
CVM ID: bf1b6f57-1470-4531-9ad9-22013366635b
App ID: 071aedc7d6be81865793d9e0f2f00e73161fc7e6
Dashboard URL: https://cloud.phala.com/dashboard/cvms/bf1b6f57-...
```

---

## Step 2: Fetch Attestation from Phala Cloud API

```bash
curl -s "https://cloud-api.phala.network/api/v1/apps/{APP_ID}/attestations" \
  | python3 -m json.tool
```

**My actual command:**
```bash
curl -s "https://cloud-api.phala.network/api/v1/apps/071aedc7d6be81865793d9e0f2f00e73161fc7e6/attestations" \
  | python3 -m json.tool
```

---

## Step 3: Understanding the Response

The API returns:

```json
{
  "app_id": "071aedc7d6be81865793d9e0f2f00e73161fc7e6",
  "contract_address": "0x071aedc7d6be81865793d9e0f2f00e73161fc7e6",
  "kms_info": {
    "version": "v0.5.3 (git:ca4af023e974427e4153)",
    "url": "https://kms.dstack-pha-prod7.phala.network",
    "kms_type": "phala"
  },
  "instances": [
    {
      "quote": "040002008100000000000000939a7233f79c4ca...",  // 🔑 TDX quote (huge hex string)
      "ppid": "354e2a1c79c98e81723eab4b78b990a7",
      "device_id": "e5a0c70bb6503de2d31c11d85914fe3776ed5b33a078ed856327c371a60fe0fd",
      "eventlog": [...],  // Boot measurements
      "runtime_data": {
        "app_id": "071aedc7d6be81865793d9e0f2f00e73161fc7e6",
        "pod_id": "data-collab-market_app_1",
        "compose_hash": "f06dfda6dce1cf904d4e2bab1dc370634cf95cefa2ceb2de2eee127c9382698",
        "host_info": {...},
        "instance_id": "bf1b6f57-1470-4531-9ad9-22013366635b"
      }
    }
  ]
}
```

---

## Key Fields Explained

### The Quote
```json
"quote": "040002008100000000000000939a7233f79c4ca..."
```

**What it is:** A cryptographically signed TDX quote proving what's running in the TEE.

**What it contains:**
- Hardware attestation (Intel signature)
- Measurements (MRTD, RTMR0-3)
- Report data (application-specific binding)

**What it proves:**
- This is genuine Intel TDX hardware ✅
- This specific OS/software is running ✅
- The measurements haven't been tampered with ✅

### The Compose Hash
```json
"compose_hash": "f06dfda6dce1cf904d4e2bab1dc370634cf95cefa2ceb2de2eee127c9382698"
```

**What it is:** SHA-256 hash of your `app-compose.json` (the dstack configuration).

**What it proves:**
- Which Docker images are specified ✅
- What environment variables are allowed ✅
- Network and resource configuration ✅

**What it DOESN'T prove:**
- What's actually inside those Docker images ❌
- What runtime env vars are set (only which are allowed) ❌
- What the code does ❌

### The Device ID
```json
"device_id": "e5a0c70bb6503de2d31c11d85914fe3776ed5b33a078ed856327c371a60fe0fd"
```

**What it is:** Unique identifier for the physical TEE device.

**Why it matters:** 
- Multiple instances with same device_id = replicas on same hardware
- Different device_ids = distributed deployment

---

## Step 4: What Can I Verify Right Now?

With this attestation, I can verify:

### ✅ Level 1: Hardware Authenticity
- Intel signature on quote is valid (need dcap-qvl tool)
- This is real TDX hardware, not emulated

### ✅ Level 2: OS Integrity
- MRTD matches known dstack version
- Boot chain hasn't been tampered with

### ✅ Level 3: Configuration
- Compose hash is `f06dfda...`
- I can verify this matches my `docker-compose.yaml`

### ❌ Level 4: Code Verification (NOT YET)
- I haven't verified the Docker images themselves
- I haven't proven reproducible builds
- I can't prove what the code actually does

---

## Step 5: Verify the Compose Hash

**The claim:** My compose hash should match `sha256(app-compose.json)`

Let me check:

```bash
# Get the docker-compose.yaml I deployed
cat data-collab-market/docker-compose.yaml

# Convert to canonical JSON format (TODO: need app-compose.json format)
# Compute SHA-256
# Compare with f06dfda6dce1cf904d4e2bab1dc370634cf95cefa2ceb2de2eee127c9382698
```

**Problem:** I need to understand the exact `app-compose.json` format that Phala uses. The compose hash isn't directly from `docker-compose.yaml` - it's from a normalized format.

---

## The Auditor's Reality Check

What I just learned:

1. **Getting attestation is easy** - Public API, no auth needed ✅
2. **Understanding it is harder** - Need to decode the quote, verify signatures
3. **The compose hash proves config** - But I need to understand the format to verify it
4. **I'm still trusting the Docker images** - Haven't verified their contents yet

---

## Next Steps for Real Verification

1. **Get the app-compose.json** from the 8090 endpoint
2. **Manually compute compose hash** and verify it matches
3. **Decode the TDX quote** to see MRTD, RTMR values
4. **Verify Intel signature** using dcap-qvl
5. **Document reproducible builds** so others can verify Docker images

---

## Tools I Need

- `dcap-qvl` - TDX quote verification (Intel tool)
- `dstack verification script` - From the tutorial
- Understanding of app-compose.json format
- Reproducible build instructions for Docker images

---

**Status:** Got the attestation, understand what it contains, but can't fully verify it yet. Making progress! 🦞🔐

*Learning by doing: found my knowledge gaps by trying to actually verify.*
