# Reproducibility Checklist for OpenClaw-in-dstack

Making the build reproducible so anyone can verify the compose-hash.

## Goals

- Same source code → same Docker image → same hash
- Anyone can rebuild and verify
- No time-dependent variations
- No permission variations
- Works 2+ years from now (bitrot resistance)

## Challenges

### 1. Base Image Digest

**Problem:** `node:22-slim` points to different images over time

**Solution:** Pin exact digest
```dockerfile
FROM node:22.22.0-slim@sha256:ABC123...
```

**How to get digest:**
```bash
docker pull node:22.22.0-slim
docker inspect node:22.22.0-slim | jq '.[0].RepoDigests'
```

### 2. Timestamp Normalization

**Problem:** Build timestamps vary between builds

**Solution:** Use SOURCE_DATE_EPOCH
```dockerfile
ARG SOURCE_DATE_EPOCH=1706659200
ENV SOURCE_DATE_EPOCH=${SOURCE_DATE_EPOCH}

# Set all file timestamps
RUN find /app -exec touch -t $(date -d @${SOURCE_DATE_EPOCH} +%Y%m%d%H%M.%S) {} +
```

### 3. Dependency Versions

**Problem:** `npm install` pulls latest compatible versions

**Solution:** Commit package-lock.json and use `npm ci`
```dockerfile
COPY package.json package-lock.json ./
RUN npm ci --only=production
```

**Alternative for apt packages:** Use Debian snapshot
```dockerfile
RUN echo "deb http://snapshot.debian.org/archive/debian/20240130T000000Z bookworm main" > /etc/apt/sources.list
```

### 4. Git Clone vs Copy

**Problem:** Cloning from GitHub is not reproducible (repo can change)

**Solution:** Either:
- Option A: Pin specific git commit hash
- Option B: Copy vendored source code
- Option C: Download specific release tarball

**Best for TEE demo:**
```dockerfile
ARG OPENCLAW_COMMIT=abc123def456...
RUN git clone https://github.com/openclaw/openclaw.git . && \
    git checkout ${OPENCLAW_COMMIT} && \
    git verify-commit ${OPENCLAW_COMMIT}  # Optional: GPG verification
```

### 5. File Permissions

**Problem:** COPY preserves build host permissions

**Solution:** Use --chmod
```dockerfile
COPY --chmod=644 workspace/ /app/workspace/
COPY --chmod=755 workspace/scripts/*.sh /app/workspace/scripts/
```

### 6. Layer Ordering

**Problem:** Random layer order = different hash

**Solution:** Deterministic Dockerfile order
1. Base image
2. System packages
3. Application dependencies
4. Application code
5. Config files
6. Normalize timestamps (last!)

## Implementation Steps

### Phase 3A: Pin Versions 🔄

- [x] Document reproducibility requirements (this file)
- [x] Get Node base image digest (sha256:21b49b9f...)
- [x] Create OPENCLAW_VERSION.md strategy doc
- [ ] Pin OpenClaw version (commit hash or release tag)
- [ ] Create package-lock.json if needed
- [ ] Pin apt package versions

### Phase 3B: Normalize Build

- [ ] Add SOURCE_DATE_EPOCH
- [ ] Normalize timestamps with find + touch
- [ ] Normalize permissions with --chmod
- [ ] Set TZ=UTC, LANG=C.UTF-8

### Phase 3C: Verify Reproducibility

- [ ] Build twice locally
- [ ] Compare image hashes
- [ ] If different: debug differences
- [ ] Document build process

### Phase 3D: Test in dstack

- [ ] Build in dstack simulator
- [ ] Get compose-hash from attestation
- [ ] Rebuild from source
- [ ] Verify compose-hash matches

## Current Blockers

**Need to determine:**
1. Does OpenClaw have stable release tags we can pin to?
2. What's the minimal OpenClaw config for webchat-only mode?
3. How does OpenClaw workspace initialization work?
4. Can we vendor OpenClaw code or must we clone?

## References

- **dstack tutorial module 02:** Reproducible builds
- **Debian snapshots:** https://snapshot.debian.org
- **SOURCE_DATE_EPOCH:** https://reproducible-builds.org/specs/source-date-epoch/
- **Docker buildkit:** Use --build-arg for SOURCE_DATE_EPOCH

## Test Build Commands

```bash
# Build with explicit timestamp
docker build \
  --build-arg SOURCE_DATE_EPOCH=1706659200 \
  -t openclaw-dstack:test \
  -f Dockerfile.reproducible \
  .

# Build again
docker build \
  --build-arg SOURCE_DATE_EPOCH=1706659200 \
  -t openclaw-dstack:test2 \
  -f Dockerfile.reproducible \
  .

# Compare
docker inspect openclaw-dstack:test | jq '.[0].Id'
docker inspect openclaw-dstack:test2 | jq '.[0].Id'

# Should be identical!
```

## Success Criteria

✅ Two builds from same source = identical image hash  
✅ Build works in 6+ months (dependencies still available)  
✅ Anyone can rebuild and verify compose-hash  
✅ Documentation clear enough for non-experts

---

**Next:** Get Node digest, pin OpenClaw version, test first reproducible build
