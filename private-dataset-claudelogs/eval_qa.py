#!/usr/bin/env python3
"""
Quick evaluation of Q&A over dstack conversation logs.
Tests retrieval + answering strategies.
"""
import json
import re
from collections import defaultdict

SAMPLE_QUESTIONS = [
    # Beginner conceptual
    "What is RTMR3 and how does dstack use it for attestation?",
    "How do I verify that my dstack app is running the code I expect?",
    "What's the difference between config_id and app_id in dstack?",

    # Setup/debugging
    "My dstack container keeps failing to start, what should I check?",
    "How do I get TLS certificates working with dstack and tproxy?",
    "What ports need to be exposed for dstack attestation to work?",

    # Advanced
    "How can two dstack instances share secrets via KMS replication?",
    "How do I connect my dstack app to an on-chain oracle?",
    "What's the best way to handle reproducible builds for dstack images?",
]

def load_dataset(path='dataset.jsonl'):
    records = []
    with open(path) as f:
        for line in f:
            records.append(json.loads(line))
    return records

def simple_keyword_retrieval(records, query, top_k=10):
    """Basic keyword matching - baseline retrieval."""
    query_terms = set(re.findall(r'\w+', query.lower()))
    scored = []
    for r in records:
        content = r.get('content', '')
        if not isinstance(content, str) or len(content) < 100:
            continue
        content_lower = content.lower()
        # Score by keyword overlap
        score = sum(1 for term in query_terms if term in content_lower)
        # Boost assistant messages (they have explanations)
        if r['role'] == 'assistant':
            score *= 1.5
        # Boost longer substantive content
        if len(content) > 500:
            score *= 1.2
        if score > 2:
            scored.append((score, r))
    scored.sort(key=lambda x: -x[0])
    return [r for _, r in scored[:top_k]]

def format_context(records, max_chars=8000):
    """Format retrieved records as context for prompting."""
    parts = []
    total = 0
    for r in records:
        content = r['content']
        if len(content) > 1500:
            content = content[:1500] + "..."
        part = f"[{r['role'].upper()} - {r['project'].split('/')[-1]}]\n{content}\n"
        if total + len(part) > max_chars:
            break
        parts.append(part)
        total += len(part)
    return "\n---\n".join(parts)

def analyze_coverage(records, questions):
    """Check which questions have potentially relevant content."""
    print("=" * 70)
    print("RETRIEVAL COVERAGE ANALYSIS")
    print("=" * 70)

    for q in questions:
        retrieved = simple_keyword_retrieval(records, q, top_k=5)
        print(f"\nQ: {q}")
        print(f"   Retrieved: {len(retrieved)} records")
        if retrieved:
            # Show snippet of best match
            best = retrieved[0]
            snippet = best['content'][:200].replace('\n', ' ')
            print(f"   Best match [{best['role']}]: {snippet}...")
            # Show projects
            projects = set(r['project'].split('/')[-1] for r in retrieved)
            print(f"   From projects: {', '.join(list(projects)[:5])}")
        print()

def generate_qa_prompt(question, context):
    """Generate a prompt for answering based on retrieved context."""
    return f"""You are answering questions about Dstack, a framework for running applications in Trusted Execution Environments (TEEs).

Based on the following conversation excerpts from an expert's development logs, answer the question. If the context doesn't contain relevant information, say so.

CONTEXT FROM LOGS:
{context}

QUESTION: {question}

ANSWER:"""

if __name__ == '__main__':
    print("Loading dataset...")
    records = load_dataset()
    print(f"Loaded {len(records)} records")

    # Filter to dstack-relevant
    dstack_records = [r for r in records if any(kw in json.dumps(r).lower()
        for kw in ['dstack', 'tee', 'attestation', 'rtmr', 'tdx', 'tproxy', 'phala'])]
    print(f"Filtered to {len(dstack_records)} dstack-relevant records")

    analyze_coverage(dstack_records, SAMPLE_QUESTIONS)

    # Demo: show a full prompt for one question
    print("\n" + "=" * 70)
    print("SAMPLE PROMPT (for manual testing)")
    print("=" * 70)
    q = SAMPLE_QUESTIONS[0]
    retrieved = simple_keyword_retrieval(dstack_records, q, top_k=5)
    context = format_context(retrieved)
    prompt = generate_qa_prompt(q, context)
    print(prompt[:3000])
    print("\n... [truncated]")
