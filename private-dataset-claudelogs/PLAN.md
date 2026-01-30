# Claude Code Log Collector

## Data Sources Found

### 1. Session Logs (`~/.claude/projects/`) — 222MB, 307 sessions
Main conversation data. Each project directory contains JSONL session files.

**Path structure:**
```
~/.claude/projects/<project-path-with-dashes>/<session-uuid>.jsonl
```

**JSONL record types:**
- `type: "user"` — user messages with `message.content`
- `type: "assistant"` — claude responses with `message.content[]` (text, thinking, tool_use blocks)
- `type: "file-history-snapshot"` — file state tracking

**Key fields per record:**
- `uuid`, `parentUuid` — message threading
- `sessionId` — session identifier
- `cwd` — working directory (real path, not dasherized)
- `timestamp` — ISO timestamp
- `message.role`, `message.content`
- `message.model` — on assistant messages

### 2. Prompt History (`~/.claude/history.jsonl`) — 600KB
Simple index of all user prompts across sessions.

**Fields:**
- `display` — prompt text
- `timestamp` — unix ms
- `project` — project path

### 3. Debug Logs (`~/.claude/debug/`) — 48MB
Text files by session UUID. Lower priority—verbose debug output.

---

## Tool Design

### Collect
```bash
python3 collect.py -o dataset.jsonl
```

Parse all session files, emit normalized records:
```json
{
  "session_id": "uuid",
  "project": "/home/amiller/projects/foo",
  "timestamp": "2026-01-21T00:06:51Z",
  "role": "user|assistant",
  "content": "text or list",
  "model": "claude-opus-4-5-20251101",
  "thinking": "...",
  "tool_calls": [...]
}
```

### Merge (Multi-Machine)
```bash
python3 collect.py -o merged.jsonl merge dataset1.jsonl dataset2.jsonl
```

Deduplication:
- Primary: exact UUID match
- Secondary: content hash (timestamp + role + content[:500])

---

## Current Dataset Stats

**Merged from 2 machines (laptop + remote)**

| Metric | Value |
|--------|-------|
| Total Records | 41,435 |
| Unique Sessions | 122 |
| Unique Projects | 103 |
| Date Range | 2025-12-20 to 2026-01-22 |
| Size | 27 MB |

### By Category

| Category | Projects | Records | % |
|----------|----------|---------|---|
| TEE/Dstack | 57 | 30,158 | 73% |
| Crypto/ZK | 23 | 7,405 | 18% |
| Other | 12 | 3,872 | 9% |

### Top Projects

| Project | Records | Focus |
|---------|---------|-------|
| xordi-dev-deployment | 4,656 | Production TEE deployment |
| dstack-tutorial | 1,960 | Tutorial development |
| xordi-tokscope | 1,903 | Playwright in TEE |
| 01-attestation-and-reference-values | 1,691 | Attestation verification |
| 04-gateways-and-tls | 1,336 | TLS/Let's Encrypt |
| dstack-examples | 1,264 | Official examples |
| watchy | 1,337 | E-paper smartwatch |
| githubgame | 1,177 | GitHub game |

### Content Quality

| Metric | Count |
|--------|-------|
| Substantive explanations (>500 chars) | 1,140 |
| Debug/troubleshooting content | 1,224 |
| User questions | 455 |
| Code examples | 692 |
| **Total RAG-ready text** | **2.7 MB** |

---

## Existing Tools Comparison

### claude-collector (hanzoai)
`pip install claude-collector`

- Keeps raw JSONL format (all original fields)
- Includes all record types: user, assistant, progress, system
- Output: 188MB for same data

### Our collect.py
- Normalizes/flattens records
- Only user/assistant messages
- Extracts content, thinking, tool_calls into top-level fields
- Supports multi-file merge with dedup
- Output: 27MB (7x smaller)

---

## Completed

- [x] `collect.py` — walks `~/.claude/projects/`, outputs normalized JSONL
- [x] `collect.py merge` — merges multiple JSONL files with dedup
- [x] `dataset.jsonl` — 41,435 records from 2 machines, 27MB
- [x] `DATASET_SUMMARY.md` — detailed breakdown and analysis
- [x] `eval_qa.py` — Q&A evaluation harness with retrieval testing

## Next Steps

1. Build TEE-sandboxed Q&A demo
2. Design privacy-preserving content transformation
3. Implement semantic search (embeddings)
4. Exploit parentUuid for context threading
