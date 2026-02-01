#!/bin/bash
# genesis-log.sh - Output complete log of developer-controlled inputs
# This log is designed to be covered by dstack attestation (included in event log)

GENESIS_LOG="/var/log-genesis/genesis-transcript.jsonl"

echo "=== Genesis Transcript - Developer-Controlled Inputs ===" | tee -a "$GENESIS_LOG"
echo "" | tee -a "$GENESIS_LOG"

# Capture all prompts/configs that shaped initial state
cat <<EOF | tee -a "$GENESIS_LOG"
{
  "type": "genesis_start",
  "timestamp": "$(date -Iseconds)",
  "purpose": "Complete record of developer-controlled inputs during agent initialization"
}
EOF

# 1. Dockerfile used to build this image
echo '{"type":"dockerfile","content":' | tee -a "$GENESIS_LOG"
cat /build/Dockerfile | jq -Rs . | tee -a "$GENESIS_LOG"
echo '}' | tee -a "$GENESIS_LOG"

# 2. Agent persona (SOUL.md)
echo '{"type":"soul_prompt","content":' | tee -a "$GENESIS_LOG"
cat /root/.openclaw/workspace/SOUL.md | jq -Rs . | tee -a "$GENESIS_LOG"
echo '}' | tee -a "$GENESIS_LOG"

# 3. USER.md - who is this agent serving?
echo '{"type":"user_context","content":' | tee -a "$GENESIS_LOG"
cat /root/.openclaw/workspace/USER.md | jq -Rs . | tee -a "$GENESIS_LOG"
echo '}' | tee -a "$GENESIS_LOG"

# 4. AGENTS.md - operating instructions
echo '{"type":"operating_instructions","content":' | tee -a "$GENESIS_LOG"
cat /root/.openclaw/workspace/AGENTS.md | jq -Rs . | tee -a "$GENESIS_LOG"
echo '}' | tee -a "$GENESIS_LOG"

# 5. Initial workspace files (non-secret)
echo '{"type":"workspace_files","files":[' | tee -a "$GENESIS_LOG"
for file in /root/.openclaw/workspace/*.md; do
  filename=$(basename "$file")
  echo "{\"name\":\"$filename\",\"content\":" | tee -a "$GENESIS_LOG"
  cat "$file" | jq -Rs . | tee -a "$GENESIS_LOG"
  echo '},' | tee -a "$GENESIS_LOG"
done
echo ']}' | tee -a "$GENESIS_LOG"

# 6. OpenClaw config (non-secret parts)
echo '{"type":"openclaw_config","content":' | tee -a "$GENESIS_LOG"
cat /root/.openclaw/config.json | jq -Rs . | tee -a "$GENESIS_LOG"
echo '}' | tee -a "$GENESIS_LOG"

# 7. Environment variables (excluding secrets)
echo '{"type":"environment","vars":{' | tee -a "$GENESIS_LOG"
env | grep -v "API_KEY\|TOKEN\|SECRET\|PASSWORD" | while IFS= read -r line; do
  key=$(echo "$line" | cut -d= -f1)
  value=$(echo "$line" | cut -d= -f2-)
  echo "\"$key\":\"$value\"," | tee -a "$GENESIS_LOG"
done
echo '}}' | tee -a "$GENESIS_LOG"

# 8. Build timestamp and git commit
echo "{\"type\":\"build_metadata\",\"timestamp\":\"$(date -Iseconds)\"," | tee -a "$GENESIS_LOG"
echo "\"git_commit\":\"$(cat /build/git-commit.txt 2>/dev/null || echo 'unknown')\"," | tee -a "$GENESIS_LOG"
echo "\"docker_image\":\"$(cat /build/image-id.txt 2>/dev/null || echo 'unknown')\"}" | tee -a "$GENESIS_LOG"

# 9. Hash of this complete genesis log
cat <<EOF | tee -a "$GENESIS_LOG"
{
  "type": "genesis_complete",
  "timestamp": "$(date -Iseconds)",
  "log_hash": "$(sha256sum $GENESIS_LOG | cut -d' ' -f1)",
  "purpose": "This hash can be included in TDX quote report_data to attest to complete developer input record"
}
EOF

echo "" | tee -a "$GENESIS_LOG"
echo "=== Genesis transcript saved to $GENESIS_LOG ===" | tee -a "$GENESIS_LOG"
echo "Hash: $(sha256sum $GENESIS_LOG | cut -d' ' -f1)" | tee -a "$GENESIS_LOG"
echo "" | tee -a "$GENESIS_LOG"
echo "To verify via dstack attestation:" | tee -a "$GENESIS_LOG"
echo "  curl --unix-socket /var/run/dstack.sock \\" | tee -a "$GENESIS_LOG"
echo "    'http://localhost/GetQuote?report_data=0x$(sha256sum $GENESIS_LOG | cut -d' ' -f1)'" | tee -a "$GENESIS_LOG"
