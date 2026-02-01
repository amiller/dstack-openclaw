#!/bin/bash
# setup-auth.sh - Create auth-profiles.json from ANTHROPIC_API_KEY environment variable

if [ -n "$ANTHROPIC_API_KEY" ]; then
  mkdir -p /root/.openclaw/agents/main/agent
  cat > /root/.openclaw/agents/main/agent/auth-profiles.json <<EOF
{
  "version": 1,
  "profiles": {
    "anthropic:env": {
      "type": "token",
      "provider": "anthropic",
      "token": "$ANTHROPIC_API_KEY"
    }
  }
}
EOF
  echo "Auth configured from ANTHROPIC_API_KEY"
else
  echo "Warning: ANTHROPIC_API_KEY not set"
fi
