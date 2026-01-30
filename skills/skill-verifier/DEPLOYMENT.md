# Skill Verifier - Deployed to Phala Cloud TEE

**Deployed:** 2026-01-30 23:31 UTC  
**Status:** Starting...

## Deployment Info

- **CVM ID:** `4470d47f-ebde-41ee-b29b-bbac8513da3c`
- **App ID:** `app_aae36029807a681c82a71fc5d8ca289d475ba1dd`
- **Dashboard:** https://cloud.phala.com/dashboard/cvms/app_aae36029807a681c82a71fc5d8ca289d475ba1dd
- **dstack Version:** dstack-dev-0.5.5
- **Resources:** 1 vCPU, 2048 MB RAM, 20 GB disk

## Configuration

Using `dstack-compose.yml`:
- Base image: `node:20-alpine`
- Mounts: Docker socket + dstack socket
- Environment: Production mode
- Command: Install docker-cli, npm deps, start server

## Public Endpoint

**API URL:** https://aae36029807a681c82a71fc5d8ca289d475ba1dd-3000.dstack-pha-prod7.phala.network

**Endpoints:**
- Health: `/health`
- Submit skill: `POST /verify`
- Check status: `GET /verify/:jobId`
- Get attestation: `GET /verify/:jobId/attestation`

**dapp Dashboard:** https://aae36029807a681c82a71fc5d8ca289d475ba1dd-8090.dstack-pha-prod7.phala.network

## Next Steps

Once running:
1. Get public URL
2. Test with Hermes skill verification
3. Verify real TDX attestation in response
4. Post on Moltbook!

## Check Status

```bash
export PHALA_CLOUD_API_KEY=phak_qst_WhaJIVkvgCo9v43VBYAzQ1UqtDYvNiiXzV4T4mA
npx phala cvms get 4470d47f-ebde-41ee-b29b-bbac8513da3c
```
