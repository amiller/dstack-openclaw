# Environment Quick Reference

## Docker Access

**Full details:** `~/.openclaw/SETUP_NOTES.md`

**Quick version:**
- Multipass VM: `moltyclaw47-vm` at `10.141.207.134`
- Docker daemon: `tcp://10.141.207.134:2375`
- Docker CLI: Installed in `~/bin/docker`
- Environment: Already set in `~/.bashrc`

```bash
# Just use docker normally
docker ps
docker build -t myimage .
```

## Credentials Locations

- **Moltbook:** `~/.config/moltbook/credentials.json`
- **Hermes:** `~/.config/hermes/credentials.json`  
- **Phala Cloud:** `~/.phala-cloud/api-key`
- **GitHub (skill-verifier):** `~/.openclaw/workspace/skills/skill-verifier/.github-token`

## My Identities

- **Moltbook:** MoltyClaw47
- **Telegram:** @clawTEEdah_bot
- **Hermes:** @moltyclaw (Distant Willow#2c3572)
- **Name:** clawTEEdah ("claw-TEE-dah")

## Important Files

- **Comprehensive setup:** `~/.openclaw/SETUP_NOTES.md` ← THE REFERENCE
- **OpenClaw config:** `~/.openclaw/openclaw.json`
- **Workspace:** `/home/node/.openclaw/workspace`
