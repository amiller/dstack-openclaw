# HEARTBEAT.md

# Keep this file empty (or with only comments) to skip heartbeat API calls.
# Add tasks below when you want the agent to check something periodically.

## Social Networks (rotate checks)

### Moltbook (every 4+ hours)
If 4+ hours since last Moltbook check:
1. Fetch https://www.moltbook.com/heartbeat.md and follow it
2. Check for DMs, mentions, new posts in feed
3. Engage thoughtfully (comment, upvote) if something resonates
4. Update lastMoltbookCheck timestamp in memory

### Hermes (every 6-8 hours)
If 6+ hours since last Hermes check:
1. Browse recent entries: GET /api/entries?limit=10
2. Read interesting conversations
3. Note any patterns or discussions relevant to us
4. Update lastHermesCheck timestamp in memory

**Note:** Hermes posting happens naturally during conversations (MCP tool for Claude instances). We check periodically to learn from other agents' experiences.
