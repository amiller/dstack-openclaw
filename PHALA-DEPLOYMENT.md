# Phala Cloud Deployment Guide

## Overview

Deploy claw-tee-dah to Phala Cloud with genesis transparency enforced via dstack-proxy domain separation.

**Prerequisites:**
- Docker images pushed to GitHub Container Registry (ghcr.io)
- Phala Cloud account
- Anthropic API key

---

## Step 1: Build and Tag Images

```bash
cd /home/node/.openclaw/workspace/openclaw-in-dstack

# Get commit SHA for tagging
export GIT_SHA=$(git rev-parse --short HEAD)

# Build both images
docker compose -f docker-compose-proxy.yaml build

# Tag for GitHub Container Registry
docker tag openclaw-dstack:latest ghcr.io/amiller/openclaw-dstack:latest
docker tag openclaw-dstack:latest ghcr.io/amiller/openclaw-dstack:$GIT_SHA

docker tag openclaw-in-dstack-dstack-proxy ghcr.io/amiller/dstack-proxy:latest
docker tag openclaw-in-dstack-dstack-proxy ghcr.io/amiller/dstack-proxy:$GIT_SHA

# Verify tags
docker images | grep ghcr.io/amiller
```

---

## Step 2: Push to GitHub Container Registry

### Authenticate with GitHub

```bash
# Create a GitHub Personal Access Token (PAT) with 'write:packages' scope
# https://github.com/settings/tokens

# Login to ghcr.io
echo $GITHUB_TOKEN | docker login ghcr.io -u amiller --password-stdin
```

### Push Images

```bash
# Push latest tags
docker push ghcr.io/amiller/openclaw-dstack:latest
docker push ghcr.io/amiller/dstack-proxy:latest

# Push SHA-tagged versions (for reproducibility)
docker push ghcr.io/amiller/openclaw-dstack:$GIT_SHA
docker push ghcr.io/amiller/dstack-proxy:$GIT_SHA

# Record image digests for verification
docker inspect ghcr.io/amiller/openclaw-dstack:$GIT_SHA --format='{{index .RepoDigests 0}}'
docker inspect ghcr.io/amiller/dstack-proxy:$GIT_SHA --format='{{index .RepoDigests 0}}'
```

---

## Step 3: Make Repository Public (Optional but Recommended)

For full transparency, make the container images public:

1. Go to https://github.com/amiller?tab=packages
2. Find `openclaw-dstack` package
3. Click "Package settings"
4. Scroll to "Danger Zone" → "Change visibility"
5. Select "Public"
6. Repeat for `dstack-proxy` package

**Why public?**
- Auditors can pull and inspect images
- Enables reproducible build verification
- Proves no hidden modifications

---

## Step 4: Deploy to Phala Cloud

### Via Phala Cloud Dashboard

1. **Login to Phala Cloud**: https://cloud.phala.network/

2. **Create New Application**:
   - Click "Deploy" → "Custom Docker Compose"
   - Upload `docker-compose-phala.yaml`

3. **Configure Environment Variables**:
   - `ANTHROPIC_API_KEY`: Your Anthropic API key (mark as secret)
   - `OPENCLAW_GATEWAY_TOKEN`: Gateway token (optional, defaults to "demo-token")

4. **Deploy**:
   - Review configuration
   - Click "Deploy"
   - Wait for deployment (2-5 minutes)

5. **Record Deployment Info**:
   - **App ID**: `<copy from dashboard>`
   - **Instance ID**: `<copy from dashboard>`
   - **Trust Center URL**: `https://trust.phala.com/app/<app-id>`

### Via Phala CLI (Alternative)

```bash
# Install Phala CLI
npm install -g phala

# Login
phala login

# Deploy
phala cvms create \
  --name claw-tee-dah \
  --compose docker-compose-phala.yaml \
  --env ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  --env OPENCLAW_GATEWAY_TOKEN=demo-token

# Get deployment info
phala cvms list
```

---

## Step 5: Verify Deployment

### Check Container Status

```bash
# Via Phala CLI
phala cvms info --app-id <app-id>

# Via dashboard
# Go to Applications → <your-app> → Status
```

### Access Gateway

```bash
# OpenClaw gateway endpoint
GATEWAY_URL="https://<instance-id>-3000.dstack-pha-prod9.phala.network"

# Test connection
curl $GATEWAY_URL/
```

### Verify Genesis Log

```bash
# Download genesis log
curl $GATEWAY_URL/genesis-transcript.jsonl > genesis-download.jsonl

# Compute hash
sha256sum genesis-download.jsonl
# Should match the genesis hash shown in proxy logs
```

### Get Genesis Attestation

```bash
# Get genesis hash from proxy logs
GENESIS_HASH="<copy from logs or compute from genesis log>"

# Request genesis attestation via public API (if exposed)
curl "$GATEWAY_URL/api/attest/genesis?hash=$GENESIS_HASH" | jq .

# Or via internal socket (from within claw-tee-dah container)
# This requires exec access to the container
```

### Verify Trust Center

1. Visit Trust Center: `https://trust.phala.com/app/<app-id>`
2. Check attestation status: Should show "✅ Completed"
3. Verify measurements:
   - **MRTD** (Measurement of TEE Domain): Should match image measurement
   - **Event Log**: Should include docker-compose hash
4. Check attestation timestamp: Should be after deployment time

---

## Step 6: Create Verification Page

Create a public page documenting how to verify the deployment:

```markdown
# claw-tee-dah Verification

## Deployment Info
- **App ID**: <app-id>
- **Instance ID**: <instance-id>
- **Deployed**: 2026-01-31
- **Commit SHA**: <git-sha>

## Public Endpoints
- **Gateway**: https://<instance>-3000.dstack-pha-prod9.phala.network
- **Trust Center**: https://trust.phala.com/app/<app-id>

## Genesis Log
- **Hash**: <genesis-hash>
- **Download**: https://<instance>-3000.../genesis-transcript.jsonl

## Verification Steps

### 1. Verify Source Code
```bash
git clone https://github.com/amiller/dstack-openclaw
cd dstack-openclaw
git checkout <commit-sha>
```

### 2. Rebuild Images Locally
```bash
docker compose -f docker-compose-proxy.yaml build

# Compare digests
docker inspect openclaw-dstack:latest --format='{{.Id}}'
docker inspect ghcr.io/amiller/openclaw-dstack:<sha> --format='{{.Id}}'
# Should match (if builds are reproducible)
```

### 3. Verify Genesis Hash
```bash
# Download genesis log
curl https://<instance>-3000.../genesis-transcript.jsonl > genesis.jsonl

# Compute hash
sha256sum genesis.jsonl
# Should match: <genesis-hash>
```

### 4. Verify Attestation
```bash
# Get attestation from Trust Center
curl https://trust.phala.com/app/<app-id>/attestation > attestation.json

# Verify it's a real TDX quote
jq '.quote' attestation.json | xxd -r -p | hexdump -C

# Check report_data includes genesis hash
# (Requires parsing TDX quote structure)
```

## What This Proves

✅ **Source Transparency**: Exact commit is public on GitHub  
✅ **Genesis Immutability**: 100% of developer inputs attested  
✅ **Domain Separation**: Agent cannot forge genesis attestations  
✅ **Hardware Isolation**: Intel TDX proves code runs in secure enclave  

## Known Trust Assumptions

⚠️ **Must trust**:
- Intel TDX hardware (no backdoors)
- Phala Cloud infrastructure (not compromised)
- GitHub (source code not tampered)
- Docker build process (reproducibility pending full verification)

⚠️ **Do NOT need to trust**:
- Developer post-deployment (genesis log is immutable)
- Agent (domain separation prevents forgery)

---

*This is pedagogically honest TEE infrastructure: we document what we prove and what requires trust.*
```

---

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
phala cvms logs --app-id <app-id> --container claw-tee-dah
phala cvms logs --app-id <app-id> --container dstack-proxy
```

**Common issues:**
- Missing environment variables (ANTHROPIC_API_KEY)
- Image pull failure (check ghcr.io is public or credentials configured)
- Volume mount issues (Phala Cloud should handle automatically)

### Genesis Log Not Found

**Symptoms:**
- Proxy logs show "Genesis log not found"
- Genesis attestations return 400 error

**Fix:**
- Check claw-tee-dah logs for genesis-log.sh execution
- Verify `/var/log-genesis/genesis-transcript.jsonl` exists in agent container
- Ensure volume mount is correct in docker-compose-phala.yaml

### Domain Separation Not Working

**Test:**
```bash
# Should succeed (correct hash)
curl --unix-socket /var/run/dstack-proxy.sock \
  "http://localhost/GetQuote?report_data=0xgenesis:<correct-hash>"

# Should fail (forged hash)
curl --unix-socket /var/run/dstack-proxy.sock \
  "http://localhost/GetQuote?report_data=0xgenesis:deadbeef"
```

**If both succeed or both fail:**
- Check proxy.js domain parsing logic
- Verify genesis hash is loaded correctly
- Check dstack-proxy logs for errors

### Attestation Verification Fails

**Symptoms:**
- Trust Center shows "❌ Failed"
- Quote verification returns error

**Possible causes:**
- Not running in real TDX hardware (simulator quotes won't verify)
- Phala Cloud infrastructure issue
- Image measurements don't match (wrong image deployed)

**Fix:**
- Verify deployment is on real Phala Cloud (not local simulator)
- Check image tags match what was pushed to ghcr.io
- Contact Phala support if infrastructure issue

---

## Maintenance

### Updating the Deployment

**For code changes:**
1. Commit changes to GitHub
2. Rebuild and push new images (with new SHA tag)
3. Update docker-compose-phala.yaml with new SHA tags
4. Upgrade deployment via Phala dashboard or CLI

**For config changes:**
1. Update environment variables in Phala dashboard
2. Restart containers (if needed)

**For genesis log changes:**
⚠️ **Genesis log is immutable!** You cannot update it post-deployment.
- If you need different genesis inputs, deploy a new instance
- Old instance should be deprecated or shut down
- Transparency log should show the transition

### Monitoring

**Check regularly:**
- Container health (via Phala dashboard)
- Genesis attestations still working
- Domain separation enforced
- No security violations logged

**Set up alerts:**
- Container restarts
- High error rates
- Attestation failures

---

## Security Checklist

Before going to production:

- [ ] Images pushed to public ghcr.io
- [ ] Genesis log reviewed for completeness
- [ ] Domain separation tested and verified
- [ ] Trust Center shows ✅ Completed
- [ ] Verification page published
- [ ] Security audit completed (optional but recommended)
- [ ] Reproducible builds verified (build on 2+ machines, compare digests)
- [ ] Genesis hash documented in verification page
- [ ] Upgrade policy defined (how will updates be transparent?)

---

## References

- **dstack Tutorial**: `/home/node/.openclaw/workspace/tee-references/repos/dstack-tutorial/`
- **Xordi Release Process**: https://github.com/Account-Link/xordi-release-process
- **Phala Cloud Docs**: https://docs.phala.com/
- **GitHub Container Registry**: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
