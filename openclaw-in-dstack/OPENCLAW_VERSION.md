# OpenClaw Version Pinning Strategy

## Current Situation

OpenClaw version: `2026.1.29` (from package.json in running instance)

## Options for Reproducible Build

### Option 1: Pin to Git Commit Hash (Recommended)
```dockerfile
ARG OPENCLAW_COMMIT=abc123def456...
RUN git clone https://github.com/openclaw/openclaw.git . && \
    git checkout ${OPENCLAW_COMMIT}
```

**Pros:**
- Most reproducible
- Can verify exact source
- Works even if tags change

**Cons:**
- Need to find the right commit
- Requires OpenClaw repo to be public

### Option 2: Pin to Release Tag
```dockerfile
ARG OPENCLAW_VERSION=2026.1.29
RUN git clone https://github.com/openclaw/openclaw.git . && \
    git checkout tags/v${OPENCLAW_VERSION}
```

**Pros:**
- Clean version semantics
- Easier to understand

**Cons:**
- Tags can be moved (less secure)
- May not exist for all versions

### Option 3: Vendor the Code
Copy OpenClaw source directly into the build:
```dockerfile
COPY openclaw/ /app/
```

**Pros:**
- Most reproducible (code is in repo)
- No dependency on external git

**Cons:**
- Large repo bloat
- Updates require copying

## Decision for Phase 3

**Use Option 1 (Git Commit Hash)** once we:
1. Identify the OpenClaw version running in this instance
2. Find the corresponding git commit
3. Test that it builds successfully

For Phase 1-2 testing, we can use latest/HEAD since reproducibility isn't critical yet.

## Finding the Right Commit

Check OpenClaw's GitHub for the commit that corresponds to version `2026.1.29`:
```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
git log --grep="2026.1.29" --oneline
# Or check package.json at different commits
```

## Fallback Plan

If OpenClaw repo structure makes this difficult, we can:
1. Use the current running instance as a reference build
2. Document the "known good" commit hash
3. Pin to that for reproducible demos

## TODO

- [ ] Clone OpenClaw repo and find v2026.1.29 commit
- [ ] Test build with pinned commit
- [ ] Document commit hash in Dockerfile
- [ ] Verify package-lock.json exists and is committed
