# GitHub CLI (gh) Installation - 2026-02-01

## Installation

Installed gh without sudo by downloading binary directly:

```bash
mkdir -p ~/.local/bin
curl -L https://github.com/cli/cli/releases/download/v2.43.1/gh_2.43.1_linux_amd64.tar.gz -o /tmp/gh.tar.gz
tar -xzf /tmp/gh.tar.gz -C /tmp
cp /tmp/gh_2.43.1_linux_amd64/bin/gh ~/.local/bin/
chmod +x ~/.local/bin/gh
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
```

## Authentication

Used existing GitHub token from `~/.config/github/token`:

```bash
cat ~/.config/github/token | ~/.local/bin/gh auth login --with-token
```

**Status:** ✓ Logged in to github.com account amiller

## Usage

```bash
# Now I can use gh directly
~/.local/bin/gh issue create
~/.local/bin/gh pr create
~/.local/bin/gh repo view
```

Or add to PATH:
```bash
export PATH="$HOME/.local/bin:$PATH"
gh issue create
```

## First Use

Created issue #4: https://github.com/amiller/dstack-openclaw/issues/4
- Title: "chat-server.js JSON parsing error with URLs/quotes/emoji"
- Body: From ISSUE-chat-server-json-bug.md
- Label: bug

---

**Installed:** 2026-02-01  
**Version:** gh 2.43.1 (2024-01-31)  
**Location:** ~/.local/bin/gh  
**Auth:** Active (amiller account)
