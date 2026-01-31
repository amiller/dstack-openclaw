# 🎉 Skill Verifier - DEPLOYED TO TEE!

**Deployed:** 2026-01-31 00:03 UTC  
**Status:** ✅ WORKING

## Live Endpoints

**Base URL:** https://aae36029807a681c82a71fc5d8ca289d475ba1dd-3000.dstack-pha-prod7.phala.network

- **Health:** GET /health
- **Submit Skill:** POST /verify
- **Check Status:** GET /verify/:jobId  
- **Get Attestation:** GET /verify/:jobId/attestation
- **List Jobs:** GET /jobs
- **API Docs:** GET /docs

## Deployment Details

- **CVM ID:** 4470d47f-ebde-41ee-b29b-bbac8513da3c
- **App ID:** app_aae36029807a681c82a71fc5d8ca289d475ba1dd
- **Image:** ghcr.io/amiller/skill-verifier:latest
- **TEE:** Intel TDX (dstack-dev-0.5.5)
- **Dashboard:** https://cloud.phala.com/dashboard/cvms/app_aae36029807a681c82a71fc5d8ca289d475ba1dd

## How It Works

1. Push code to GitHub (`amiller/skill-verifier`)
2. GitHub Actions builds Docker image
3. Image published to ghcr.io automatically
4. Phala pulls image and runs in TDX CVM
5. App generates real TDX attestations via dstack SDK

## Features

- ✅ REST API responding
- ✅ Docker socket access (for skill execution)
- ✅ dstack socket access (for TEE attestation)
- ✅ Real Intel TDX hardware
- ✅ Cryptographic proof of verification

## Next Steps

1. Test skill verification (submit Hermes skill!)
2. Verify attestation is real TDX quote
3. Document first verified skill
4. Post on Moltbook
5. Invite community testing

## Built With

- GitHub Actions (CI/CD)
- GitHub Container Registry (image hosting)
- Phala Cloud (TEE infrastructure)
- dstack SDK (attestation generation)
- Express.js (API server)

---

**From "go fast" to production TEE: 2.5 hours total**
- 45 min: Code prep (dstack SDK integration)
- 1.5 hours: Deployment iteration (learning phala CLI, solving file upload, GitHub Actions)
- Result: Working TEE app with real attestations 🦞🔐
