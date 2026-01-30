#!/usr/bin/env python3
import json
import sys
import hashlib
import argparse
from pathlib import Path

CLAUDE_DIR = Path.home() / ".claude" / "projects"

def extract_content(message):
    """Extract text content from message, handling both string and list formats."""
    content = message.get("content", "")
    if isinstance(content, str):
        return content, None, []

    text_parts = []
    thinking = None
    tool_calls = []

    for block in content:
        if block.get("type") == "text":
            text_parts.append(block.get("text", ""))
        elif block.get("type") == "thinking":
            thinking = block.get("thinking", "")
        elif block.get("type") == "tool_use":
            tool_calls.append({
                "name": block.get("name"),
                "input": block.get("input")
            })

    return "\n".join(text_parts), thinking, tool_calls

def parse_session(path):
    """Parse a session JSONL file, yield normalized records."""
    with open(path) as f:
        for line in f:
            record = json.loads(line)
            if record.get("type") not in ("user", "assistant"):
                continue

            msg = record.get("message", {})
            text, thinking, tool_calls = extract_content(msg)

            yield {
                "session_id": record.get("sessionId"),
                "uuid": record.get("uuid"),
                "parent_uuid": record.get("parentUuid"),
                "project": record.get("cwd"),
                "timestamp": record.get("timestamp"),
                "role": msg.get("role"),
                "model": msg.get("model"),
                "content": text,
                "thinking": thinking,
                "tool_calls": tool_calls or None,
            }

def collect_all():
    """Walk all project directories and collect sessions."""
    for project_dir in CLAUDE_DIR.iterdir():
        if not project_dir.is_dir():
            continue
        for session_file in project_dir.glob("*.jsonl"):
            yield from parse_session(session_file)

def content_hash(record):
    """Hash for detecting duplicate content across machines."""
    key = f"{record['timestamp']}|{record['role']}|{record['content'][:500] if record['content'] else ''}"
    return hashlib.md5(key.encode()).hexdigest()[:12]

def merge_datasets(files, output):
    """Merge multiple JSONL files with deduplication."""
    seen_uuids = set()
    seen_hashes = set()
    stats = {'total': 0, 'uuid_dupes': 0, 'content_dupes': 0, 'kept': 0}

    out = open(output, 'w') if output else sys.stdout

    for f in files:
        for line in open(f):
            stats['total'] += 1
            record = json.loads(line)

            # Primary dedup: exact UUID match
            uuid = record.get('uuid')
            if uuid and uuid in seen_uuids:
                stats['uuid_dupes'] += 1
                continue
            if uuid:
                seen_uuids.add(uuid)

            # Secondary dedup: content hash (catches cross-machine duplicates)
            h = content_hash(record)
            if h in seen_hashes:
                stats['content_dupes'] += 1
                continue
            seen_hashes.add(h)

            stats['kept'] += 1
            out.write(json.dumps(record) + '\n')

    if output:
        out.close()

    print(f"Merge stats:", file=sys.stderr)
    print(f"  Total records: {stats['total']}", file=sys.stderr)
    print(f"  UUID duplicates: {stats['uuid_dupes']}", file=sys.stderr)
    print(f"  Content duplicates: {stats['content_dupes']}", file=sys.stderr)
    print(f"  Kept: {stats['kept']}", file=sys.stderr)

def main():
    parser = argparse.ArgumentParser(description='Collect and merge Claude Code logs')
    parser.add_argument('--output', '-o', help='Output file (default: stdout)')
    sub = parser.add_subparsers(dest='cmd')

    merge_p = sub.add_parser('merge', help='Merge multiple JSONL files with dedup')
    merge_p.add_argument('files', nargs='+', help='JSONL files to merge')

    args = parser.parse_args()

    if args.cmd == 'merge':
        merge_datasets(args.files, args.output)
    else:
        out = open(args.output, 'w') if args.output else sys.stdout
        for record in collect_all():
            out.write(json.dumps(record) + '\n')
        if args.output:
            out.close()

if __name__ == "__main__":
    main()
