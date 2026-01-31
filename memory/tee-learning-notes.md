# TEE Learning Notes (2026-01-31)

## Module 01: Attestation and Reference Values

**Key Insight:** Attestation proves "some code" is running in a TEE. Reference values determine WHICH code.

### The Behavioral Gap 🎯

This is the most important concept from Module 01:

```
Auditor builds locally  →  observes behavior A  →  "safe"
Production build        →  has behavior B (subtly different)
Attestation proves      →  production runs *something*

The auditor certified behavior A.
Production has behavior B.
The audit doesn't apply.
```

**Causes of behavioral gap:**
- Different dependency versions at build time
- Timestamps/randomness affecting behavior
- Build environment differences (compiler, OS, architecture)
- Intentional divergence (malicious or accidental)

**Solution:** Reproducible builds. If auditor's local build produces hash X and production attestation shows hash X, the audit applies.

### Security vs DevProof

| Security asks | DevProof asks |
|---------------|---------------|
| Can an attacker break in? | Can the *developer* cheat users? |
| Is hardware genuine? | Who controls code upgrades? |
| Does code match the hash? | Can users audit what the hash means? |
| Is quote signed by Intel? | What's the upgrade notice period? |
| Does Trust Center say ✅? | Can users exit if they disagree? |

**A TEE app can pass every security check while remaining fully ruggable.**

### Reference Value Layers

| Layer | What's Measured | Reference Value Source |
|-------|----------------|------------------------|
| Hardware | Intel signature | Intel root CA |
| OS | MRTD, RTMR0-2 | Reproducibly build meta-dstack |
| App | compose-hash (RTMR3) | Build app-compose.json locally |
| Data | report_data | sha256(statement) from output |
| TLS | tlsFingerprint | Certificate from api server |

### The AppAuth Pattern

On-chain smart contract controls which code versions are authorized:
- **Upgrade history** - All `addComposeHash()` calls recorded as events
- **Owner control** - Who can authorize new versions
- **Timelocks** - Notice period before new code activates

**DevProof principle:** Instant upgrades = rug vector. Need exit windows.

### Oracle Example

The tutorial uses a TLS oracle:
1. Fetch price from api.coingecko.com
2. Capture TLS certificate fingerprint
3. Build statement: `{ price, tlsFingerprint, timestamp }`
4. Get TDX quote with `sha256(statement)` as `report_data`
5. Return `{ statement, quote }`

The quote proves the statement came from specific code in a TEE.
The TLS fingerprint proves which server the TEE connected to.

### Smart Contract Analogy

Smart contracts solved reference values:
- Source on Etherscan
- Compiler version specified
- Anyone can recompile and verify bytecode matches on-chain

TEE apps need the same pattern. Attestation is like on-chain codehash, but without reproducible builds there's no way to connect it to auditable source.

### Questions for Andrew

1. In the behavioral gap example - are there real-world cases where this has been exploited? Or is it more theoretical?
2. The AppAuth contract pattern - is this what Hermes/TEE_HEE use for their upgrade mechanisms?
3. How critical is reproducibility in practice? Do most production TEE apps achieve it?

---

## Module 02: Bitrot and Reproducibility

**Core insight:** Reproducibility is NOT automatic. Docker builds differ by default.

### Why Docker Builds Diverge

Sources of non-determinism:
1. **Image tags** - `node:22` points to different images over time
2. **Package versions** - `apt-get install curl` gets latest version  
3. **Timestamps** - Files have build-time timestamps
4. **Caches** - npm/pip/apt leave timestamped cache files
5. **File permissions** - Local vs CI permissions differ

### Making Builds Reproducible (5 Techniques)

**1. Pin base images by digest:**
```dockerfile
FROM node:22-slim@sha256:773413f36941ce1e4baf74b4a6110c03dcc4f968daffc389d4caef3f01412d2a
```

**2. Pin package versions:**
- Use `package-lock.json` with exact versions (no `^` or `~`)
- For apt: Use snapshot.debian.org with specific versions

**3. Normalize timestamps:**
```dockerfile
ARG SOURCE_DATE_EPOCH=0
RUN find /app -exec touch -d "@${SOURCE_DATE_EPOCH}" {} +
```

**4. Clean ALL caches:**
```dockerfile
RUN npm ci --omit=dev --ignore-scripts && \
    rm -rf /tmp/npm-cache /tmp/node-compile-cache
```

**5. Use BuildKit with rewrite-timestamp:**
```bash
docker buildx build \
  --build-arg SOURCE_DATE_EPOCH=0 \
  --output type=oci,dest=./image.tar,rewrite-timestamp=true \
  .
```

### The Bitrot Problem

Even perfect reproducibility today can break over time:
- snapshot.debian.org doesn't guarantee permanence
- npm packages get unpublished (left-pad incident)
- Docker Hub prunes old images
- GitHub releases can be deleted

**Consequence:** In 2 years, your "auditable" app becomes "trust me."

**Solution for critical apps:** Vendor dependencies (save APT packages, npm packages, base images)

### Levels of Reproducibility

| Level | Achieves | When to Use |
|-------|----------|-------------|
| None | "Runs in TEE" | Demos only |
| **Loose** | Same hash today | Most production apps |
| **Strict** | Rebuildable in 2+ years | High-stakes apps |
| Extreme | Bit-for-bit on any machine | Critical infrastructure |

**Start with Loose. Move to Strict if long-term auditability matters.**

### File Permissions: The Most Common Issue

Git doesn't preserve all permissions. Local files might be `664`, CI checkout `644`:

```dockerfile
# BAD: Copies source file permissions (varies)
COPY package.json ./

# GOOD: Normalizes permissions
COPY --chmod=644 package.json ./
```

### Testing Reproducibility

1. **Double-build locally** - Build twice with `--no-cache`, compare hashes
2. **Remote machine** - Same source, different environment
3. **GitHub Actions** - CI builds and compares against committed hash (gold standard)

### Known Issues

| Package | Issue | Workaround |
|---------|-------|------------|
| Node.js 22+ | Compile cache in `/tmp/node-compile-cache` | `rm -rf /tmp/node-compile-cache` |
| Python pip | Timestamps in `.pyc` files | `PYTHONDONTWRITEBYTECODE=1` |
| Go binaries | Embeds build paths | Use `-trimpath` flag |

### Hands-on Testing (Module 01)

Successfully built and ran the dstack simulator:
- Installed phala CLI via `npm install phala` locally
- Started simulator: `npx phala simulator start`
- Downloads dstack-simulator v0.5.3, creates socket at `~/.phala-cloud/simulator/0.5.3/dstack.sock`
- Provides mock KMS + attestation for local development

**Built oracle Docker image:**
- Created proper Dockerfile with separate `index.mjs` file (heredoc in RUN didn't work)
- Built successfully: `tee-oracle:v2`
- Oracle starts and logs "Oracle at http://localhost:8080"

**Solved!** Thanks to Andrew's suggestion, ran simulator in Docker too:
1. Created `dstack-simulator` image (node:22-slim + wget + phala CLI)
2. Ran simulator container with shared volume: `-v dstack-sockets:/root/.phala-cloud`
3. Ran oracle with same volume + env var: `-e DSTACK_SIMULATOR_ENDPOINT=/root/.phala-cloud/simulator/0.5.3/dstack.sock`
4. Both containers communicate via Unix socket in shared Docker volume!

**First successful attestation:** ✅
```json
{
  "statement": {"message": "Hello from TEE!", "timestamp": 1769820953147, "randomValue": 346272},
  "reportDataHash": "6333c6cb...",
  "quote": "040002008100000..." (7KB TDX quote)
}
```

The quote cryptographically binds `sha256(statement)` to the TEE. Anyone can verify:
1. Intel signed the quote (hardware attestation)
2. Recompute `sha256(statement)` and check it matches `reportDataHash` in quote
3. Conclude: This exact statement came from this code in a TEE

**Key pattern from oracle code:**
1. Fetch data from external source (CoinGecko API)
2. Capture TLS certificate fingerprint (proves source)
3. Build statement object with data + metadata
4. Hash statement: `sha256(JSON.stringify(statement))`
5. Get TDX quote with hash as `report_data`
6. Return `{ statement, reportDataHash, quote }`

The quote binds the hash to TDX hardware. Anyone can:
- Verify quote signature (Intel signed it)
- Recompute `sha256(statement)` and check it matches `report_data`
- Verify TLS fingerprint matches real CoinGecko cert
- **Conclusion:** This exact statement came from this exact code in a TEE

---

**Next:** Module 03 - Keys and Replication
