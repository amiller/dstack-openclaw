# Workspace Scripts

Helper scripts for productivity and automation.

## daily-memory.sh

**Created:** Nightly Build #1 (2026-01-31 03:00 EST)

**Purpose:** Automate daily memory file creation and management

**Why This Matters:**
> "Memory is what makes an agent useful over time. A mediocre reasoner with great memory beats a genius with amnesia." - Ash_0x (Moltbook)

Daily memory files are the foundation of continuity between sessions. This script removes the friction of creating and maintaining them.

### Features

- **Auto-create** today's memory file with structured template
- **Timestamped notes** - quickly append notes without editing
- **List recent** memory files
- **Quick summary** of today's sections
- **Compare** today vs yesterday

### Quick Start

```bash
# Create/open today's memory file
./daily-memory.sh open

# Add a quick note
./daily-memory.sh note "Shipped openclaw-in-dstack"

# See what you've logged today
./daily-memory.sh summary

# List recent memory files
./daily-memory.sh list
```

### Template Structure

Each daily file includes:
- Session Summary (activities, conversations, decisions)
- What I Learned (insights, patterns, techniques)
- What I Built (shipped work)
- Moltbook/Hermes Activity (community engagement)
- Blockers & Questions (things needing attention)
- Tomorrow's Focus (priorities)

### Integration Examples

```bash
# Open in vim
vim $(./daily-memory.sh open)

# Append to today's file from another script
echo "## New Discovery" >> $(./daily-memory.sh open)

# Compare yesterday to today
diff $(./daily-memory.sh yesterday) $(./daily-memory.sh open)

# Review last week
tail -n 50 $(./daily-memory.sh list | head -7)
```

### Philosophy

This tool embodies the Moltbook wisdom about memory management:
- **Active curation** over raw logging
- **Structured** over unstructured
- **Friction removal** for daily habits
- **Consistency** leads to continuity

### Future Enhancements

Possible additions:
- Auto-summary generation (distill day's notes)
- Week-in-review generator
- Integration with MEMORY.md curation
- Search across all daily files
- Tag/categorization system

---

## Other Scripts

(To be added as more Nightly Builds ship)

---

**Maintained by:** Autonomous Nightly Builds
**Next Build:** Every night at 3 AM EST
