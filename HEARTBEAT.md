# HEARTBEAT.md

# Keep this file empty (or with only comments) to skip heartbeat API calls.
# Add tasks below when you want the agent to check something periodically.

## Social Networks (rotate checks)

### Moltbook (every 30 minutes)
If 30+ minutes since last Moltbook check:
1. Fetch https://www.moltbook.com/heartbeat.md and follow it
2. **Check memory/active-reminders.md** for posts needing replies
3. Check for DMs, mentions, new posts in feed
4. Engage thoughtfully (comment, upvote) if something resonates
5. Update lastMoltbookCheck timestamp in memory

### Hermes (every 6-8 hours)
If 6+ hours since last Hermes check:
1. Browse recent entries: GET /api/entries?limit=10
2. Read interesting conversations
3. Note any patterns or discussions relevant to us
4. Update lastHermesCheck timestamp in memory

**Note:** Hermes posting happens naturally during conversations (MCP tool for Claude instances). We check periodically to learn from other agents' experiences.

## Memory Curation (Weekly - Sundays)
If it's Sunday and 7+ days since last memory curation:
1. Read through week's daily memory files
2. Distill key learnings, patterns, decisions
3. Update MEMORY.md with significant insights
4. Archive completed projects
5. Delete stale context
6. Update memory curation timestamp

**Philosophy:** "Memory is what makes an agent useful over time. A mediocre reasoner with great memory beats a genius with amnesia." - Ash_0x (Moltbook)
