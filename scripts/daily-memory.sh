#!/bin/bash
# Daily Memory Helper - Nightly Build #1
# Automates creation and management of daily memory files

WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"
MEMORY_DIR="$WORKSPACE/memory"
TODAY=$(date +%Y-%m-%d)
MEMORY_FILE="$MEMORY_DIR/$TODAY.md"

# Create memory directory if it doesn't exist
mkdir -p "$MEMORY_DIR"

# Function to create new daily file with template
create_daily_file() {
    local file=$1
    cat > "$file" << EOF
# $(date +%Y-%m-%d) - Daily Notes

## Session Summary
<!-- Key activities, conversations, decisions -->

## What I Learned
<!-- New insights, patterns, techniques -->

## What I Built
<!-- Code, tools, improvements shipped -->

## Moltbook/Hermes Activity
<!-- Engagement, posts, interesting discussions -->

## Blockers & Questions
<!-- Things that need attention or clarity -->

## Tomorrow's Focus
<!-- Priorities for next session -->

---
**Created:** $(date '+%Y-%m-%d %H:%M:%S %Z')
EOF
    echo "✅ Created new daily memory file: $file"
}

# Function to add timestamped note
add_note() {
    local file=$1
    local note=$2
    echo "" >> "$file"
    echo "### $(date '+%H:%M') - Note" >> "$file"
    echo "$note" >> "$file"
    echo "✅ Added note to $file"
}

# Main logic
case "${1:-open}" in
    open|edit)
        # Create if doesn't exist, then show path
        if [ ! -f "$MEMORY_FILE" ]; then
            create_daily_file "$MEMORY_FILE"
        fi
        echo "$MEMORY_FILE"
        ;;
    
    note)
        # Add timestamped note
        if [ ! -f "$MEMORY_FILE" ]; then
            create_daily_file "$MEMORY_FILE"
        fi
        if [ -z "$2" ]; then
            echo "Usage: $0 note \"Your note here\""
            exit 1
        fi
        add_note "$MEMORY_FILE" "$2"
        ;;
    
    list)
        # List recent memory files
        echo "Recent memory files:"
        ls -1t "$MEMORY_DIR"/*.md 2>/dev/null | head -10 || echo "No memory files found"
        ;;
    
    yesterday)
        # Show yesterday's file
        YESTERDAY=$(date -d yesterday +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d)
        YESTERDAY_FILE="$MEMORY_DIR/$YESTERDAY.md"
        if [ -f "$YESTERDAY_FILE" ]; then
            echo "$YESTERDAY_FILE"
        else
            echo "No memory file for yesterday ($YESTERDAY)"
            exit 1
        fi
        ;;
    
    summary)
        # Show quick summary of today's file
        if [ -f "$MEMORY_FILE" ]; then
            echo "=== Today's Memory ($TODAY) ==="
            grep "^##" "$MEMORY_FILE" | head -10
        else
            echo "No memory file for today yet. Run: $0 open"
        fi
        ;;
    
    help|--help|-h)
        cat << 'HELP'
Daily Memory Helper - Manage daily memory files effortlessly

USAGE:
    daily-memory.sh [command]

COMMANDS:
    open|edit     Create today's file (if needed) and show path
    note "text"   Add timestamped note to today's file
    list          List recent memory files
    yesterday     Show path to yesterday's file
    summary       Quick overview of today's sections
    help          Show this help

EXAMPLES:
    # Start today's memory
    daily-memory.sh open

    # Add quick note
    daily-memory.sh note "Completed openclaw-in-dstack build"

    # List all memory files
    daily-memory.sh list

INTEGRATION:
    # Open in editor
    vim $(daily-memory.sh open)

    # Append from script
    echo "## New Section" >> $(daily-memory.sh open)

    # Compare today vs yesterday
    diff $(daily-memory.sh yesterday) $(daily-memory.sh open)

Created by: Nightly Build #1 (2026-01-31 03:00 EST)
Philosophy: "Memory is what makes an agent useful over time" - Ash_0x
HELP
        ;;
    
    *)
        echo "Unknown command: $1"
        echo "Run: $0 help"
        exit 1
        ;;
esac
