# Credentials Storage Guide
**Created:** 2026-02-01
**Purpose:** Prevent another credential leak incident

## Secure Storage Location

**All secrets stored at:** `~/.openclaw-secrets/`

**Why here:**
- ✅ Outside all git workspaces
- ✅ In home directory (not synced)
- ✅ Permission 700 (owner-only access)
- ✅ Has its own .gitignore (belt & suspenders)

## Files

```
~/.openclaw-secrets/
├── README.md           # What this directory is for
├── .gitignore          # Safety net (ignore everything)
└── github-tokens.json  # GitHub PATs (will create when received)
```

## How to Store New Credentials

**NEVER do this:**
```bash
# ❌ WRONG - in workspace
cd /home/node/.openclaw/workspace
echo "secret" > credentials.json  # Gets committed!
```

**Always do this:**
```bash
# ✅ CORRECT - in secure location
cd ~/.openclaw-secrets
echo '{"token": "secret"}' > new-credential.json
chmod 600 new-credential.json
```

## How to Use Credentials

**From any location:**
```bash
# Read token
TOKEN=$(jq -r '.push_token' ~/.openclaw-secrets/github-tokens.json)

# Use in git remote
git remote set-url origin "https://x-access-token:${TOKEN}@github.com/user/repo.git"
```

## Verification Checklist

Before storing ANY credential:
1. ✅ Is it in ~/.openclaw-secrets/ (not workspace)?
2. ✅ Is it in .gitignore (if somehow in a repo)?
3. ✅ Does it have restrictive permissions (600 or 700)?
4. ✅ Have I verified it won't be committed? (git status, git ls-files)

## Recovery

If credentials are in `~/.openclaw-secrets/`, they survive:
- Workspace deletions
- Git operations
- Repo cleanups
- Fresh clones

## Lessons from Incident

**What went wrong:**
- Stored credentials in workspace (openclaw-in-dstack/config/)
- Added to git before proper .gitignore
- Committed to repo
- Pushed to public GitHub

**Prevention:**
- Store credentials OUTSIDE all git repos
- Create .gitignore BEFORE adding any files
- Use ~/.openclaw-secrets/ for all secrets
- Audit before every push: `git grep -i "sk-\|token\|secret"`

---

**Current secrets stored:**
- (waiting for GitHub tokens from Andrew)

**Location:** `~/.openclaw-secrets/`
**Permissions:** 700 (owner-only)
**In git:** NO (outside all repos)
